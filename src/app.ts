import type {
  EndpointStatus,
  ProcessedCondition,
  ProcessedEndpoint,
  ProcessedEndpointsData,
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
  let statusIcon: 'OK' | '!!' | '--' = '--';

  if (latestResult) {
    if (latestResult.success) {
      statusClass = 'healthy';
      statusLabel = 'Healthy';
      statusIcon = 'OK';
    } else {
      statusClass = 'unhealthy';
      statusLabel = 'Unhealthy';
      statusIcon = '!!';
    }
  }

  const result: ProcessedEndpoint = {
    index,
    name: endpoint.name,
    group: endpoint.group || null,
    key: endpoint.key,
    statusClass,
    statusLabel,
    statusIcon,
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
  const processedEndpoints = endpoints.map((endpoint, index) =>
    preprocessEndpoint(endpoint, index),
  );

  // Calculate totals
  let healthyCount = 0;
  let unhealthyCount = 0;
  let unknownCount = 0;
  const unhealthyEndpoints: ProcessedEndpoint[] = [];
  const unknownEndpoints: ProcessedEndpoint[] = [];
  let latestTimestamp: Date | null = null;

  for (const ep of processedEndpoints) {
    if (ep.statusClass === 'healthy') {
      healthyCount++;
    } else if (ep.statusClass === 'unhealthy') {
      unhealthyCount++;
      unhealthyEndpoints.push(ep);
    } else {
      unknownCount++;
      unknownEndpoints.push(ep);
    }
  }

  // Find latest check timestamp from original data
  for (const endpoint of endpoints) {
    const result = endpoint.results?.[0];
    if (result?.timestamp) {
      const ts = new Date(result.timestamp);
      if (!latestTimestamp || ts > latestTimestamp) {
        latestTimestamp = ts;
      }
    }
  }

  return {
    endpoints: processedEndpoints,
    healthyCount,
    unhealthyCount,
    unknownCount,
    totalCount: processedEndpoints.length,
    lastChecked: latestTimestamp ? formatTimestamp(latestTimestamp.toISOString()) : 'Unknown',
    unhealthyEndpoints,
    unknownEndpoints,
    hasUnhealthy: unhealthyEndpoints.length > 0,
    hasUnknown: unknownEndpoints.length > 0,
    hasIssues: unhealthyEndpoints.length > 0 || unknownEndpoints.length > 0,
  };
}

// Browser-only code: HTMX event handlers
if (typeof document !== 'undefined') {
  // Register preprocessor with HTMX client-side-templates
  // Use document instead of body - events bubble up and body may not exist yet
  document.addEventListener('htmx:configRequest', (event: Event) => {
    // Ensure JSON response type
    const detail = (event as CustomEvent).detail;
    detail.headers.Accept = 'application/json';
  });

  document.addEventListener('htmx:beforeSwap', (event: Event) => {
    const detail = (event as CustomEvent).detail;
    // Check if this is our endpoints request
    if (
      detail.target.id === 'app' &&
      detail.xhr.responseURL.includes('/api/v1/endpoints/statuses')
    ) {
      try {
        const data = JSON.parse(detail.xhr.responseText) as EndpointStatus[];
        const processed = preprocessEndpoints(data);
        // Store endpoints globally for click handlers
        (window as unknown as { __endpoints: ProcessedEndpoint[] }).__endpoints =
          processed.endpoints;
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
