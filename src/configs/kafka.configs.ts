import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  EachMessageHandler,
  Kafka,
  LogEntry,
  logLevel,
} from "kafkajs";

import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";
import { getEnvNumber } from "../utils/envUtils";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

let consumer: Consumer | null = null;

const initKafkaWithTopicAndMessageHandler = async (
  topics: string[],
  messageHandler: EachMessageHandler
) => {
  const brokersUrl: string[] = getKafkaBrokerUrls();
  consumer = createKafkaConsumer(brokersUrl);
  await initKafkaConsumer(consumer, topics, messageHandler);
};

const disconnectConsumer = async (): Promise<void> => {
  try {
    if (consumer === null) {
      logger.info(
        "Failed to disconnect Kafka consumer because it is not initialized"
      );
      return;
    }

    await consumer.stop();
    await consumer.disconnect();
  } catch (error: any) {
    logger.error(`Error while disconnecting from kafka consumer: ${error}`);
  }
};

const createKafkaConsumer = (
  brokersUrl: string[],
  loggingLevel: string = "INFO"
): Consumer => {
  const kafkaLogLevel = getKafkaLogLevel(loggingLevel);

  const kafka: Kafka = new Kafka({
    brokers: brokersUrl,
    clientId: "notification-service-consumer-client",
    retry: {
      maxRetryTime: getEnvNumber("KAFKA_MAX_RETRY_TIME_MS", 60_000),
      initialRetryTime: getEnvNumber("KAFKA_INITIAL_RETRY_TIME_MS", 1_000),
      retries: getEnvNumber("KAFKA_MAX_RETRIES", 10),
    },
    logLevel: kafkaLogLevel,
    logCreator: kafkaLogCreator,
  });

  const consumerConfig: ConsumerConfig = {
    groupId: "notification-service-consumer-group",
    allowAutoTopicCreation: true,
  };

  const c: Consumer = kafka.consumer(consumerConfig);

  c.on("consumer.connect", () => {
    logger.info("Kafka consumer connected successfully");
  });

  c.on("consumer.disconnect", () => {
    logger.info("Kafka consumer disconnected successfully");
  });

  c.on("consumer.stop", async () => {
    logger.info("Kafka consumer stopped successfully");
  });

  return c;
};

const initKafkaConsumer = async (
  consumer: Consumer,
  topics: string[],
  messageHandler: EachMessageHandler
) => {
  await consumer.connect();

  logger.info(`Connected to Kafka consumer`);

  const topic: ConsumerSubscribeTopics = {
    topics: topics,
    fromBeginning: true,
  };

  await consumer.subscribe(topic);

  logger.info(`Consumer subscribed to topics: '${topics}'`);

  await consumer.run({
    eachMessage: messageHandler,
    autoCommit: true,
    autoCommitInterval: 5000,
  });
};

const getKafkaBrokerUrls = (): string[] => {
  const brokerUrlsEnv: string | undefined = process.env["KAFKA_BROKER_URLS"];
  return brokerUrlsEnv ? brokerUrlsEnv.split(",") : ["localhost:9092"];
};

const kafkaLogCreator = () => {
  return (entry: LogEntry) => {
    const logLevel: string = toWinstonLogLevel(entry.level);

    if (logger.isLevelEnabled(logLevel)) {
      const { message, ...extra } = entry.log;

      logger.log({
        level: toWinstonLogLevel(entry.level),
        message,
        extra,
      });
    }
  };
};

const toWinstonLogLevel = (level: logLevel) => {
  switch (level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
      return "error";
    case logLevel.WARN:
      return "warn";
    case logLevel.INFO:
      return "info";
    case logLevel.DEBUG:
      return "debug";
    default:
      return "error";
  }
};

const getKafkaLogLevel = (loggingLevel: string): logLevel => {
  switch (loggingLevel.toUpperCase()) {
    case "ERROR":
      return logLevel.ERROR;
    case "WARN":
      return logLevel.WARN;
    case "INFO":
      return logLevel.INFO;
    case "DEBUG":
      return logLevel.DEBUG;
    default:
      return logLevel.NOTHING;
  }
};

export { disconnectConsumer, initKafkaWithTopicAndMessageHandler };
