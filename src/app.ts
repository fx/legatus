import type {
  ColorMode,
  EndpointStatus,
  ProcessedCondition,
  ProcessedEndpoint,
  ProcessedEndpointsData,
  Theme,
  ThemeConfig,
} from './types';

/**
 * Format nanoseconds to human-readable duration
 */
export function formatDuration(nanoseconds: number): string {
  const ms = nanoseconds / 1_000_000;
  if (ms < 1) {
    return `${Math.round(nanoseconds / 1000)}us`;
  }
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = seconds / 60;
  return `${minutes.toFixed(1)}m`;
}

/**
 * Format ISO timestamp to relative time
 */
export function formatTimestamp(isoString: string, now: Date = new Date()): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours >= 24) {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  if (diffMs < 0) {
    return 'just now';
  }
  if (diffSeconds < 60) {
    return diffSeconds <= 5 ? 'just now' : `${diffSeconds}s ago`;
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  return `${diffHours}h ago`;
}

/**
 * Preprocess a single endpoint for Mustache template
 */
export function preprocessEndpoint(endpoint: EndpointStatus, index: number): ProcessedEndpoint {
  const latestResult = endpoint.results?.[0];
  let statusClass: 'healthy' | 'unhealthy' | 'unknown' = 'unknown';
  let statusLabel: 'Healthy' | 'Unhealthy' | 'Unknown' = 'Unknown';

  if (latestResult) {
    if (latestResult.success) {
      statusClass = 'healthy';
      statusLabel = 'Healthy';
    } else {
      statusClass = 'unhealthy';
      statusLabel = 'Unhealthy';
    }
  }

  const result: ProcessedEndpoint = {
    index,
    name: endpoint.name,
    group: endpoint.group || null,
    key: endpoint.key,
    statusClass,
    statusLabel,
    hasResult: !!latestResult,
  };

  if (latestResult) {
    result.formattedDuration = formatDuration(latestResult.duration);
    result.formattedTimestamp = formatTimestamp(latestResult.timestamp);
    result.httpStatus = latestResult.status || null;
    result.hasConditions = latestResult.conditionResults?.length > 0;
    if (result.hasConditions && latestResult.conditionResults) {
      result.conditions = latestResult.conditionResults.map(
        (cr): ProcessedCondition => ({
          condition: cr.condition,
          icon: cr.success ? '\u2713' : '\u2717',
          iconClass: cr.success ? 'condition-icon-success' : 'condition-icon-failure',
        }),
      );
    }
  }

  return result;
}

/**
 * Preprocess API data for Mustache template
 */
export function preprocessEndpoints(endpoints: EndpointStatus[]): ProcessedEndpointsData {
  return {
    endpoints: endpoints.map((endpoint, index) => preprocessEndpoint(endpoint, index)),
  };
}

/**
 * Theme Controller - manages theme and color mode preferences
 */
export const ThemeController = {
  STORAGE_KEYS: {
    theme: 'gatus-minimal:theme',
    colorMode: 'gatus-minimal:color-mode',
  } as const,

  DEFAULTS: {
    theme: 'gatus' as Theme,
    colorMode: 'system' as ColorMode,
  } as const,

  VALID_THEMES: ['github', 'gatus', 'tui'] as const,
  VALID_COLOR_MODES: ['light', 'dark', 'system'] as const,

  /**
   * Get current theme configuration from localStorage with fallbacks
   */
  getConfig(): ThemeConfig {
    if (typeof localStorage === 'undefined') {
      return { ...this.DEFAULTS };
    }

    const storedTheme = localStorage.getItem(this.STORAGE_KEYS.theme);
    const storedColorMode = localStorage.getItem(this.STORAGE_KEYS.colorMode);

    const theme = this.VALID_THEMES.includes(storedTheme as Theme)
      ? (storedTheme as Theme)
      : this.DEFAULTS.theme;

    const colorMode = this.VALID_COLOR_MODES.includes(storedColorMode as ColorMode)
      ? (storedColorMode as ColorMode)
      : this.DEFAULTS.colorMode;

    return { theme, colorMode };
  },

  /**
   * Set theme and persist to localStorage
   */
  setTheme(theme: Theme): void {
    if (!this.VALID_THEMES.includes(theme)) {
      return;
    }
    localStorage.setItem(this.STORAGE_KEYS.theme, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  /**
   * Set color mode and persist to localStorage
   */
  setColorMode(colorMode: ColorMode): void {
    if (!this.VALID_COLOR_MODES.includes(colorMode)) {
      return;
    }
    localStorage.setItem(this.STORAGE_KEYS.colorMode, colorMode);
    document.documentElement.setAttribute('data-color-mode', colorMode);
  },

  /**
   * Apply current config to document
   */
  applyConfig(): void {
    const config = this.getConfig();
    document.documentElement.setAttribute('data-theme', config.theme);
    document.documentElement.setAttribute('data-color-mode', config.colorMode);
  },

  /**
   * Sync select elements with current config
   */
  syncUI(): void {
    const config = this.getConfig();
    const themeSelect = document.getElementById('theme-select') as HTMLSelectElement | null;
    const colorModeSelect = document.getElementById(
      'color-mode-select',
    ) as HTMLSelectElement | null;

    if (themeSelect) {
      themeSelect.value = config.theme;
    }
    if (colorModeSelect) {
      colorModeSelect.value = config.colorMode;
    }
  },

  /**
   * Initialize theme controller: apply config and bind UI listeners
   */
  init(): void {
    this.applyConfig();
    this.syncUI();

    const themeSelect = document.getElementById('theme-select') as HTMLSelectElement | null;
    const colorModeSelect = document.getElementById(
      'color-mode-select',
    ) as HTMLSelectElement | null;

    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.setTheme(target.value as Theme);
      });
    }

    if (colorModeSelect) {
      colorModeSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.setColorMode(target.value as ColorMode);
      });
    }
  },
};

// Browser-only code: HTMX event handlers and theme initialization
if (typeof document !== 'undefined') {
  // Initialize theme controller
  ThemeController.init();

  // Register preprocessor with HTMX client-side-templates
  document.body.addEventListener('htmx:configRequest', (event: Event) => {
    // Ensure JSON response type
    const detail = (event as CustomEvent).detail;
    detail.headers.Accept = 'application/json';
  });

  document.body.addEventListener('htmx:beforeSwap', (event: Event) => {
    const detail = (event as CustomEvent).detail;
    // Check if this is our endpoints request
    if (
      detail.target.id === 'app' &&
      detail.xhr.responseURL.includes('/api/v1/endpoints/statuses')
    ) {
      try {
        const data = JSON.parse(detail.xhr.responseText) as EndpointStatus[];
        const processed = preprocessEndpoints(data);
        // Replace the response with preprocessed data
        detail.serverResponse = JSON.stringify(processed);
      } catch (e) {
        console.error('Failed to preprocess endpoints:', e);
        detail.shouldSwap = false;
        if (detail.target && 'innerHTML' in detail.target) {
          detail.target.innerHTML =
            '<div class="error-message">Unable to load endpoint statuses. Please try again later.</div>';
        }
      }
    }
  });
}
