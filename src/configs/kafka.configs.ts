import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  DisconnectEvent,
  EachMessageHandler,
  Kafka,
  logLevel,
} from "kafkajs";

import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";

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
  loggingLevel: logLevel = logLevel.ERROR
): Consumer => {
  const kafka: Kafka = new Kafka({
    logLevel: loggingLevel,
    brokers: brokersUrl,
    clientId: "notification-service-consumer-client",
  });

  const consumerConfig: ConsumerConfig = {
    groupId: "notification-service-consumer-group",
  };

  const c: Consumer = kafka.consumer(consumerConfig);

  c.on("consumer.disconnect", (event: DisconnectEvent) => {
    logger.info("Kafka consumer disconnected successfully");
  });

  c.on("consumer.stop", async (event: DisconnectEvent) => {
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
    fromBeginning: false,
  };

  await consumer.subscribe(topic);

  logger.info(`Consumer subscribed to topics: '${topics}'`);

  await consumer.run({
    eachMessage: messageHandler,
  });
};

const getKafkaBrokerUrls = (): string[] => {
  const brokerUrlsEnv: string | undefined = process.env["KAFKA_BROKER_URLS"];
  return brokerUrlsEnv ? brokerUrlsEnv.split(",") : ["localhost:9092"];
};

export { disconnectConsumer, initKafkaWithTopicAndMessageHandler };
