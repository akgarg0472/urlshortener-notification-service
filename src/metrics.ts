import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from "prom-client";

/**
 * A custom registry for storing and managing metrics.
 * This registry is used to register and collect metrics.
 */
const register: Registry = new Registry();

/**
 * A counter metric that tracks the total number of HTTP requests.
 * The counter is labeled with the HTTP method (GET, POST, etc.), the path of the request, and the status code returned.
 */
const httpRequestCounter: Counter = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status_code"],
});

/**
 * A histogram metric that tracks the duration of HTTP requests.
 * The histogram records the distribution of request durations in seconds,
 * with pre-defined buckets to group the durations.
 */
const httpRequestDurationHistogram: Histogram = new Histogram({
  name: "http_request_duration_seconds",
  help: "Histogram of HTTP request durations in seconds",
  labelNames: ["method", "path", "status_code"],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

/**
 * A counter metric that tracks the total number of notification events.
 * The counter is labeled with the type of notification.
 */
const notificationEventCounter: Counter = new Counter({
  name: "notification_events_total",
  help: "Total number of Notification Events",
  labelNames: ["notification_type"],
});

/**
 * A histogram metric that tracks the duration of notification event processing.
 * The histogram records the distribution of event durations in seconds,
 * with pre-defined buckets to group the durations.
 */
const notificationEventDurationHistogram: Histogram<
  "notification_type" | "success"
> = new Histogram({
  name: "notification_event_duration_seconds",
  help: "Histogram of notification request processing durations in seconds",
  labelNames: ["notification_type", "success"],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

/**
 * Increases the HTTP request counter by 1 for the given method, path, and status code.
 *
 * @param method - The HTTP method of the request (e.g., 'GET', 'POST').
 * @param path - The request path (e.g., '/home', '/api/user').
 * @param statusCode - The HTTP status code returned for the request.
 */
export const increaseHttpRequestCounter = (
  method: string | undefined,
  path: string | undefined,
  statusCode: number
): void => {
  httpRequestCounter.inc({
    method: method,
    path: path,
    status_code: statusCode,
  });
};

/**
 * Observes and records the duration of an HTTP request in the specified histogram.
 *
 * @param method - The HTTP method of the request (e.g., 'GET', 'POST').
 * @param path - The request path (e.g., '/home', '/api/user').
 * @param statusCode - The HTTP status code returned for the request.
 * @param durationInMillis - The duration of the request in milliseconds.
 */
export const observeHttpRequestDuration = (
  method: string | undefined,
  path: string | undefined,
  statusCode: number,
  durationInMillis: number
): void => {
  const durationInSeconds = durationInMillis / 1000;
  httpRequestDurationHistogram.observe(
    { method: method, path: path, status_code: statusCode },
    durationInSeconds
  );
};

/**
 * Increases the notification event counter by 1 for the specified notification type.
 *
 * @param notificationType - The type of notification (e.g., 'email', 'sms').
 */
export const increaseNotificationEventsCounter = (
  notificationType: string
): void => {
  notificationEventCounter.inc({ notification_type: notificationType });
};

/**
 * Observes and records the duration of notification event processing in the specified histogram.
 *
 * @param notificationType - The type of notification (e.g., 'email', 'sms').
 * @param durationInMillis - The duration of the notification event processing in milliseconds.
 */
export const observeNotificationEventDuration = (
  notificationType: string,
  success: boolean,
  durationInMillis: number
): void => {
  const durationInSeconds = durationInMillis / 1000;
  notificationEventDurationHistogram.observe(
    {
      notification_type: notificationType,
      success: `${success}`,
    },
    durationInSeconds
  );
};

/**
 * Retrieves the collected metrics from the registry in the Prometheus text format.
 *
 * @returns {Promise<string>} - A promise that resolves to a string representing the metrics in Prometheus format.
 */
export const getMetrics = async (): Promise<string> => {
  return await register.metrics();
};

/**
 * Initializes the Prometheus client by registering custom metrics and collecting default system metrics.
 * This function registers the following custom metrics:
 * - `httpRequestCounter`: Tracks the total number of HTTP requests, labeled by method, path, and status code.
 * - `httpRequestDurationHistogram`: Tracks the duration of HTTP requests in seconds, with predefined buckets.
 * - `notificationEventCounter`: Tracks the total number of notification events, labeled by notification type.
 * - `notificationEventDurationHistogram`: Tracks the duration of notification event processing in seconds, with predefined buckets.
 *
 * Additionally, it collects default system metrics (like memory usage, CPU usage, etc.) via `collectDefaultMetrics`.
 *
 * This function is typically called during the initialization phase of the application to set up Prometheus metrics.
 */
export const initPrometheusClient = () => {
  register.registerMetric(httpRequestCounter);
  register.registerMetric(httpRequestDurationHistogram);
  register.registerMetric(notificationEventCounter);
  register.registerMetric(notificationEventDurationHistogram);
  collectDefaultMetrics({ register });
};
