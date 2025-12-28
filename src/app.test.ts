import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeController, formatDuration, formatTimestamp, preprocessEndpoint } from './app';
import type { EndpointStatus } from './types';

describe('formatDuration', () => {
  it('formats nanoseconds to microseconds', () => {
    expect(formatDuration(500)).toBe('1us');
    expect(formatDuration(999_999)).toBe('1000us');
  });

  it('formats nanoseconds to milliseconds', () => {
    expect(formatDuration(1_000_000)).toBe('1ms');
    expect(formatDuration(5_500_000)).toBe('6ms');
    expect(formatDuration(999_000_000)).toBe('999ms');
  });

  it('formats nanoseconds to seconds', () => {
    expect(formatDuration(1_000_000_000)).toBe('1.0s');
    expect(formatDuration(2_500_000_000)).toBe('2.5s');
    expect(formatDuration(59_900_000_000)).toBe('59.9s');
  });

  it('formats nanoseconds to minutes', () => {
    expect(formatDuration(60_000_000_000)).toBe('1.0m');
    expect(formatDuration(90_000_000_000)).toBe('1.5m');
    expect(formatDuration(300_000_000_000)).toBe('5.0m');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0us');
  });
});

describe('formatTimestamp', () => {
  const now = new Date('2025-01-15T12:00:00Z');

  it('returns "just now" for times within 5 seconds', () => {
    expect(formatTimestamp('2025-01-15T12:00:00Z', now)).toBe('just now');
    expect(formatTimestamp('2025-01-15T11:59:58Z', now)).toBe('just now');
  });

  it('returns seconds ago for times within a minute', () => {
    expect(formatTimestamp('2025-01-15T11:59:30Z', now)).toBe('30s ago');
    expect(formatTimestamp('2025-01-15T11:59:10Z', now)).toBe('50s ago');
  });

  it('returns minutes ago for times within an hour', () => {
    expect(formatTimestamp('2025-01-15T11:55:00Z', now)).toBe('5m ago');
    expect(formatTimestamp('2025-01-15T11:30:00Z', now)).toBe('30m ago');
  });

  it('returns hours ago for times within a day', () => {
    expect(formatTimestamp('2025-01-15T10:00:00Z', now)).toBe('2h ago');
    expect(formatTimestamp('2025-01-14T18:00:00Z', now)).toBe('18h ago');
  });

  it('returns formatted date for times over 24 hours ago', () => {
    const result = formatTimestamp('2025-01-10T12:00:00Z', now);
    // Date format varies by locale, just check it's not a relative time
    expect(result).not.toContain('ago');
    expect(result).not.toBe('just now');
  });

  it('returns "just now" for future times', () => {
    expect(formatTimestamp('2025-01-15T12:00:30Z', now)).toBe('just now');
  });

  it('returns "Unknown" for invalid dates', () => {
    expect(formatTimestamp('invalid-date', now)).toBe('Unknown');
    expect(formatTimestamp('', now)).toBe('Unknown');
  });
});

describe('preprocessEndpoint', () => {
  it('handles endpoint with no results', () => {
    const endpoint: EndpointStatus = {
      name: 'Test Service',
      group: 'backend',
      key: 'backend_test-service',
      results: [],
    };

    const result = preprocessEndpoint(endpoint, 0);

    expect(result.index).toBe(0);
    expect(result.name).toBe('Test Service');
    expect(result.group).toBe('backend');
    expect(result.key).toBe('backend_test-service');
    expect(result.statusClass).toBe('unknown');
    expect(result.statusLabel).toBe('Unknown');
    expect(result.hasResult).toBe(false);
  });

  it('handles healthy endpoint with successful result', () => {
    const endpoint: EndpointStatus = {
      name: 'API',
      key: 'api',
      results: [
        {
          status: 200,
          hostname: 'api.example.com',
          duration: 50_000_000,
          timestamp: '2025-01-15T12:00:00Z',
          conditionResults: [{ condition: '[STATUS] == 200', success: true }],
          success: true,
        },
      ],
    };

    const result = preprocessEndpoint(endpoint, 5);

    expect(result.index).toBe(5);
    expect(result.name).toBe('API');
    expect(result.group).toBeNull();
    expect(result.statusClass).toBe('healthy');
    expect(result.statusLabel).toBe('Healthy');
    expect(result.hasResult).toBe(true);
    expect(result.formattedDuration).toBe('50ms');
    expect(result.httpStatus).toBe(200);
    expect(result.hasConditions).toBe(true);
    expect(result.conditions).toHaveLength(1);
    expect(result.conditions?.[0]?.icon).toBe('\u2713');
    expect(result.conditions?.[0]?.iconClass).toBe('condition-icon-success');
  });

  it('handles unhealthy endpoint with failed result', () => {
    const endpoint: EndpointStatus = {
      name: 'Database',
      group: 'infra',
      key: 'infra_database',
      results: [
        {
          status: 500,
          hostname: 'db.example.com',
          duration: 5_000_000_000,
          timestamp: '2025-01-15T12:00:00Z',
          conditionResults: [
            { condition: '[STATUS] == 200', success: false },
            { condition: '[RESPONSE_TIME] < 1000', success: true },
          ],
          success: false,
        },
      ],
    };

    const result = preprocessEndpoint(endpoint, 1);

    expect(result.statusClass).toBe('unhealthy');
    expect(result.statusLabel).toBe('Unhealthy');
    expect(result.formattedDuration).toBe('5.0s');
    expect(result.httpStatus).toBe(500);
    expect(result.conditions).toHaveLength(2);
    expect(result.conditions?.[0]?.icon).toBe('\u2717');
    expect(result.conditions?.[0]?.iconClass).toBe('condition-icon-failure');
    expect(result.conditions?.[1]?.icon).toBe('\u2713');
    expect(result.conditions?.[1]?.iconClass).toBe('condition-icon-success');
  });

  it('handles endpoint with result but no conditions', () => {
    const endpoint: EndpointStatus = {
      name: 'Simple Check',
      key: 'simple',
      results: [
        {
          status: 200,
          hostname: 'simple.example.com',
          duration: 10_000_000,
          timestamp: '2025-01-15T12:00:00Z',
          conditionResults: [],
          success: true,
        },
      ],
    };

    const result = preprocessEndpoint(endpoint, 0);

    expect(result.hasConditions).toBe(false);
    expect(result.conditions).toBeUndefined();
  });
});

describe('ThemeController', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  // Mock document.documentElement
  const mockDocumentElement = {
    setAttribute: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('document', {
      documentElement: mockDocumentElement,
      getElementById: vi.fn().mockReturnValue(null),
    });
    localStorageMock.clear();
    mockDocumentElement.setAttribute.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getConfig', () => {
    it('returns defaults when localStorage is empty', () => {
      const config = ThemeController.getConfig();
      expect(config.theme).toBe('gatus');
      expect(config.colorMode).toBe('system');
    });

    it('reads valid values from localStorage', () => {
      localStorageMock.setItem('gatus-minimal:theme', 'github');
      localStorageMock.setItem('gatus-minimal:color-mode', 'dark');

      const config = ThemeController.getConfig();
      expect(config.theme).toBe('github');
      expect(config.colorMode).toBe('dark');
    });

    it('falls back to defaults for invalid theme value', () => {
      localStorageMock.setItem('gatus-minimal:theme', 'invalid-theme');
      localStorageMock.setItem('gatus-minimal:color-mode', 'light');

      const config = ThemeController.getConfig();
      expect(config.theme).toBe('gatus');
      expect(config.colorMode).toBe('light');
    });

    it('falls back to defaults for invalid color mode value', () => {
      localStorageMock.setItem('gatus-minimal:theme', 'tui');
      localStorageMock.setItem('gatus-minimal:color-mode', 'auto');

      const config = ThemeController.getConfig();
      expect(config.theme).toBe('tui');
      expect(config.colorMode).toBe('system');
    });
  });

  describe('setTheme', () => {
    it('updates localStorage and document attribute', () => {
      ThemeController.setTheme('github');

      expect(localStorageMock.getItem('gatus-minimal:theme')).toBe('github');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'github');
    });

    it('ignores invalid theme values', () => {
      ThemeController.setTheme('invalid' as 'github');

      expect(localStorageMock.getItem('gatus-minimal:theme')).toBeNull();
      expect(mockDocumentElement.setAttribute).not.toHaveBeenCalled();
    });
  });

  describe('setColorMode', () => {
    it('updates localStorage and document attribute', () => {
      ThemeController.setColorMode('dark');

      expect(localStorageMock.getItem('gatus-minimal:color-mode')).toBe('dark');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-color-mode', 'dark');
    });

    it('ignores invalid color mode values', () => {
      ThemeController.setColorMode('auto' as 'dark');

      expect(localStorageMock.getItem('gatus-minimal:color-mode')).toBeNull();
      expect(mockDocumentElement.setAttribute).not.toHaveBeenCalled();
    });
  });

  describe('applyConfig', () => {
    it('applies current config to document', () => {
      localStorageMock.setItem('gatus-minimal:theme', 'tui');
      localStorageMock.setItem('gatus-minimal:color-mode', 'light');

      ThemeController.applyConfig();

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'tui');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-color-mode', 'light');
    });
  });
});
