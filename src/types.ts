/**
 * Gatus API type definitions
 * Based on https://github.com/TwiN/gatus API response structure
 */

/** Result of a single condition check */
export interface ConditionResult {
  condition: string;
  success: boolean;
}

/** Result of a single health check */
export interface Result {
  status: number;
  hostname: string;
  duration: number;
  timestamp: string;
  conditionResults: ConditionResult[];
  success: boolean;
}

/** Endpoint status from Gatus API */
export interface EndpointStatus {
  name: string;
  group?: string;
  key: string;
  results: Result[];
}

/** Preprocessed condition for template rendering */
export interface ProcessedCondition {
  condition: string;
  icon: string;
  iconClass: string;
}

/** Preprocessed endpoint for Mustache template */
export interface ProcessedEndpoint {
  index: number;
  name: string;
  group: string | null;
  key: string;
  statusClass: 'healthy' | 'unhealthy' | 'unknown';
  statusLabel: 'Healthy' | 'Unhealthy' | 'Unknown';
  hasResult: boolean;
  formattedDuration?: string;
  formattedTimestamp?: string;
  httpStatus?: number | null;
  hasConditions?: boolean;
  conditions?: ProcessedCondition[];
}

/** Preprocessed data for Mustache template */
export interface ProcessedEndpointsData {
  endpoints: ProcessedEndpoint[];
}
