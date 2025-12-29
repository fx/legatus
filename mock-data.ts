/**
 * Mock data generator for visual testing of themes.
 * Generates 40 random services with realistic distribution of states.
 */

interface ConditionResult {
  condition: string;
  success: boolean;
}

interface Result {
  status: number;
  hostname: string;
  duration: number;
  timestamp: string;
  conditionResults: ConditionResult[];
  success: boolean;
}

interface EndpointStatus {
  name: string;
  group?: string;
  key: string;
  results: Result[];
}

// Service name parts for generating realistic names
const SERVICE_PREFIXES = [
  "auth", "user", "payment", "order", "inventory", "notification",
  "email", "sms", "search", "analytics", "logging", "metrics",
  "gateway", "proxy", "cache", "queue", "worker", "scheduler",
  "billing", "subscription", "checkout", "cart", "catalog", "product",
  "review", "comment", "media", "upload", "download", "cdn",
  "session", "token", "oauth", "identity", "profile", "settings"
];

const SERVICE_SUFFIXES = [
  "service", "api", "server", "worker", "db", "redis", "postgres",
  "mongo", "elastic", "kafka", "rabbitmq", "grpc", "rest", "graphql"
];

// Groups for organizing services
const GROUPS = [
  "production", "staging", "infrastructure", "backend", "frontend",
  "database", "messaging", "monitoring", "security", "external"
];

// Condition templates
const CONDITIONS = [
  "[STATUS] == 200",
  "[STATUS] == 201",
  "[RESPONSE_TIME] < 500",
  "[RESPONSE_TIME] < 1000",
  "[RESPONSE_TIME] < 2000",
  "[BODY].status == \"ok\"",
  "[BODY].healthy == true",
  "[CERTIFICATE_EXPIRATION] > 48h",
];

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array
 */
function randomPick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/**
 * Generate a random service name
 */
function generateServiceName(index: number): string {
  const prefix = SERVICE_PREFIXES[index % SERVICE_PREFIXES.length];
  const suffix = randomPick(SERVICE_SUFFIXES);
  return `${prefix}-${suffix}`;
}

/**
 * Generate a random ISO timestamp within the last hour
 */
function generateTimestamp(): string {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const randomTime = randomInt(hourAgo, now);
  return new Date(randomTime).toISOString();
}

/**
 * Generate random condition results
 */
function generateConditions(success: boolean): ConditionResult[] {
  const count = randomInt(1, 3);
  const conditions: ConditionResult[] = [];

  for (let i = 0; i < count; i++) {
    const condition = randomPick(CONDITIONS);
    // If service is unhealthy, make at least one condition fail
    const conditionSuccess = success ? true : (i === 0 ? false : Math.random() > 0.3);
    conditions.push({ condition, success: conditionSuccess });
  }

  return conditions;
}

/**
 * Generate a single endpoint status
 */
function generateEndpoint(index: number): EndpointStatus {
  const name = generateServiceName(index);
  const group = Math.random() > 0.1 ? randomPick(GROUPS) : undefined;
  const key = group ? `${group}_${name.replace(/-/g, "_")}` : name.replace(/-/g, "_");

  // Determine state: ~75% healthy, ~15% unhealthy, ~10% unknown (no results)
  const stateRoll = Math.random();
  const isUnknown = stateRoll > 0.9;
  const isHealthy = stateRoll <= 0.75;

  if (isUnknown) {
    return { name, group, key, results: [] };
  }

  // Generate response time: 1ms to 5000ms (in nanoseconds)
  const durationMs = randomInt(1, 5000);
  const duration = durationMs * 1_000_000;

  // HTTP status based on health
  const status = isHealthy ? (Math.random() > 0.9 ? 201 : 200) : randomPick([500, 502, 503, 504, 408, 429]);

  const result: Result = {
    status,
    hostname: `${name.split("-")[0]}.example.com`,
    duration,
    timestamp: generateTimestamp(),
    conditionResults: Math.random() > 0.2 ? generateConditions(isHealthy) : [],
    success: isHealthy,
  };

  return { name, group, key, results: [result] };
}

/**
 * Generate mock data for 40 services
 */
export function generateMockData(): EndpointStatus[] {
  const endpoints: EndpointStatus[] = [];

  for (let i = 0; i < 40; i++) {
    endpoints.push(generateEndpoint(i));
  }

  // Sort by group then name for consistent display
  endpoints.sort((a, b) => {
    const groupA = a.group || "";
    const groupB = b.group || "";
    if (groupA !== groupB) return groupA.localeCompare(groupB);
    return a.name.localeCompare(b.name);
  });

  return endpoints;
}
