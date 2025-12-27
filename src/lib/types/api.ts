/**
 * Gatus API type definitions
 * Types for /api/v1/endpoints/statuses response
 */

/**
 * Result of evaluating a single health check condition
 */
export type ConditionResult = {
  /** The condition expression that was evaluated */
  condition: string
  /** Whether the condition passed */
  success: boolean
}

/**
 * A single health check result for an endpoint
 */
export type Result = {
  /** HTTP status code (if applicable) */
  status?: number
  /** Resolved hostname (if applicable) */
  hostname?: string
  /** Response time in nanoseconds */
  duration: number
  /** Results of all condition evaluations */
  conditionResults: ConditionResult[]
  /** Whether all conditions passed */
  success: boolean
  /** ISO 8601 timestamp of when the check was performed */
  timestamp: string
}

/**
 * Status information for a monitored endpoint
 */
export type EndpointStatus = {
  /** Display name of the endpoint */
  name: string
  /** Optional group for organizing endpoints */
  group?: string
  /** Unique identifier for the endpoint */
  key: string
  /** Array of recent health check results */
  results: Result[]
}

/**
 * Array of endpoint statuses returned by /api/v1/endpoints/statuses
 */
export type EndpointStatuses = EndpointStatus[]
