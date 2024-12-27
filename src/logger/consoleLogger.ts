import winston from "winston";

const validLogLevels = ["error", "warn", "info", "debug", "silly"];
const logLevel: string = (process.env["LOG_LEVEL"] || "info")?.toLowerCase();

const logger: winston.Logger = winston.createLogger({
  level: validLogLevels.includes(logLevel) ? logLevel : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} ${level.toUpperCase()} [${label}]: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

logger.isLevelEnabled = (level: string): boolean => {
  const levels = winston.config.npm.levels;
  return levels[level] <= levels[logger.level];
};

/**
 * Creates a console logger instance using Winston.
 *
 * This logger formats messages to include timestamps, log levels,
 * and the filename where the logger is being used. The output is
 * colorized for better readability in the console.
 *
 * @param label - The name of the file where the logger is being instantiated.
 *                   This is used to label log messages for easier identification.
 * @param logLevel - logging level to log
 * @returns A Winston logger instance configured for console output.
 */
export const _getConsoleLogger = (label: string, logLevel: string = "info") => {
  const childLogger: winston.Logger = logger.child({ label });
  childLogger.level = logLevel;
  return childLogger;
};
