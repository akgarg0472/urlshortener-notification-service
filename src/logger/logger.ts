import winston from "winston";
import { _getFileLogger } from "./fileLogger";
import { _getConsoleLogger } from "./consoleLogger";

const validLogLevels = ["error", "warn", "info", "debug", "silly"];

/**
 * Enum representing the application environments.
 */
enum Environment {
  PROD = "PROD",
  TEST = "TEST",
  DEV = "DEV",
}

/**
 * Retrieves the current application environment from environment variables.
 * @returns {Environment} The current environment.
 */
const getCurrentEnv = (): Environment => {
  const env = process.env["NODE_ENV"]?.toUpperCase() ?? "DEV";

  switch (env) {
    case Environment.PROD:
      return Environment.PROD;
    case Environment.TEST:
      return Environment.TEST;
    case Environment.DEV:
      return Environment.DEV;
    default:
      return Environment.DEV; // Default to DEV if no valid environment is set
  }
};

const loggerMap = new Map<string, winston.Logger>();

/**
 * Retrieves a logger instance for the specified file.
 *
 * If a logger for the file already exists, it returns the cached instance.
 * Otherwise, it creates a new logger and caches it.
 *
 * @param fileName - The name of the file for which to retrieve the logger.
 * @returns {winston.Logger} A Winston logger instance.
 */
export const getLogger = (fileName: string): winston.Logger => {
  let logger: winston.Logger | undefined = loggerMap.get(fileName);

  if (logger !== undefined) {
    return logger; // Return cached logger if it exists
  }

  logger = createLogger(fileName); // Create a new logger
  loggerMap.set(fileName, logger); // Cache the logger
  return logger;
};

/**
 * Creates a logger instance based on the current environment.
 *
 * @param fileName - The name of the file for which to create the logger.
 * @returns {winston.Logger} A Winston logger instance.
 */
const createLogger = (fileName: string): winston.Logger => {
  const env: Environment = getCurrentEnv();
  const level: string = process.env["LOG_LEVEL"]?.toLowerCase() ?? "info";

  if (!validLogLevels.includes(level)) {
    throw new Error(
      `Invalid log level provided: ${level}. Supported log levels: ${validLogLevels.join(
        ", "
      )}`
    );
  }

  if (env === Environment.PROD) {
    return _getFileLogger(fileName, level); // Use file logger in production environment only
  } else {
    return _getConsoleLogger(fileName, level); // Use console logger in non-production environment
  }
};

/**
 * Changes the log level of a specified logger or all loggers if no name is provided.
 *
 * @param level - The new log level to set (e.g., 'info', 'debug', 'error').
 * @param loggerName - Optional; the name of the logger to change. If null, changes all loggers.
 */
export const changeLogLevel = (level: string, loggerName: string | null) => {
  if (loggerName !== null) {
    const logger = loggerMap.get(loggerName);

    if (logger) {
      logger.level = level;
      logger.log(
        level,
        `Log level changed to '${level.toUpperCase()}' for '${loggerName}'`
      );
    }
  } else {
    loggerMap.forEach((logger: winston.Logger) => {
      logger.level = level;
      logger.log(level, `Log level changed to '${level.toUpperCase()}'`);
    });
  }
};
