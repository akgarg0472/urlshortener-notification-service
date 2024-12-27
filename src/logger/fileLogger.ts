import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logBaseDirectory = process.env["LOGS_BASE_DIR"] ?? "/tmp/";
const logFileName = process.env["LOG_FILE_NAME"] ?? "notification-service.log";
const logLevel: string = (process.env["LOG_LEVEL"] || "info")?.toLowerCase();
const validLogLevels = ["error", "warn", "info", "debug", "silly"];

const transports: winston.transport[] = [
  new DailyRotateFile({
    dirname: logBaseDirectory,
    filename: logFileName,
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "500m",
  }),
];

const logger: winston.Logger = winston.createLogger({
  level: validLogLevels.includes(logLevel) ? logLevel : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:SSS" }),
    winston.format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    })
  ),
  transports: transports,
});

logger.isLevelEnabled = (level: string): boolean => {
  const levels = winston.config.npm.levels;
  return levels[level] <= levels[logger.level];
};

/**
 * Creates a production logger instance using Winston.
 *
 * This logger is configured for production environments, formatting log messages
 * to include timestamps and log levels. Logs are written to a specified file.
 *
 * @param label - The name of the file where the logger is instantiated.
 *                   This label helps identify the source of log messages.
 * @param logLevel - logging level to log
 * @returns A Winston logger instance configured for production logging.
 */
export const _getFileLogger = (
  label: string,
  logLevel: string = "info"
): winston.Logger => {
  const childLogger: winston.Logger = logger.child({ label });
  childLogger.level = logLevel;
  return childLogger;
};
