/**
 * Format nanoseconds to human-readable duration
 * @param {number} nanoseconds
 * @returns {string}
 */
function formatDuration(nanoseconds) {
  const ms = nanoseconds / 1_000_000;
  if (ms < 1) {
    return Math.round(nanoseconds / 1000) + 'us';
  }
  if (ms < 1000) {
    return Math.round(ms) + 'ms';
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return seconds.toFixed(1) + 's';
  }
  const minutes = seconds / 60;
  return minutes.toFixed(1) + 'm';
}

/**
 * Format ISO timestamp to relative time
 * @param {string} isoString
 * @returns {string}
 */
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return 'Unknown';
  }
  const now = new Date();
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
    return diffSeconds <= 5 ? 'just now' : diffSeconds + 's ago';
  }
  if (diffMinutes < 60) {
    return diffMinutes + 'm ago';
  }
  return diffHours + 'h ago';
}

/**
 * Preprocess API data for Mustache template
 * @param {Array} endpoints
 * @returns {Object}
 */
function preprocessEndpoints(endpoints) {
  return {
    endpoints: endpoints.map((endpoint, index) => {
      const latestResult = endpoint.results && endpoint.results[0];
      let statusClass = 'unknown';
      let statusLabel = 'Unknown';

      if (latestResult) {
        if (latestResult.success) {
          statusClass = 'healthy';
          statusLabel = 'Healthy';
        } else {
          statusClass = 'unhealthy';
          statusLabel = 'Unhealthy';
        }
      }

      const result = {
        index: index,
        name: endpoint.name,
        group: endpoint.group || null,
        key: endpoint.key,
        statusClass: statusClass,
        statusLabel: statusLabel,
        hasResult: !!latestResult,
      };

      if (latestResult) {
        result.formattedDuration = formatDuration(latestResult.duration);
        result.formattedTimestamp = formatTimestamp(latestResult.timestamp);
        result.httpStatus = latestResult.status || null;
        result.hasConditions = latestResult.conditionResults && latestResult.conditionResults.length > 0;
        if (result.hasConditions) {
          result.conditions = latestResult.conditionResults.map(cr => ({
            condition: cr.condition,
            icon: cr.success ? '\u2713' : '\u2717',
            iconClass: cr.success ? 'condition-icon-success' : 'condition-icon-failure',
          }));
        }
      }

      return result;
    }),
  };
}

// Register preprocessor with HTMX client-side-templates
document.body.addEventListener('htmx:configRequest', function(event) {
  // Ensure JSON response type
  event.detail.headers['Accept'] = 'application/json';
});

document.body.addEventListener('htmx:beforeSwap', function(event) {
  // Check if this is our endpoints request
  if (event.detail.target.id === 'app' && event.detail.xhr.responseURL.includes('/api/v1/endpoints/statuses')) {
    try {
      const data = JSON.parse(event.detail.xhr.responseText);
      const processed = preprocessEndpoints(data);
      // Replace the response with preprocessed data
      event.detail.serverResponse = JSON.stringify(processed);
    } catch (e) {
      console.error('Failed to preprocess endpoints:', e);
    }
  }
});
