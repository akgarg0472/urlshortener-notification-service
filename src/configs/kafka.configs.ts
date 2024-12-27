import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  EachMessageHandler,
  Kafka,
  logLevel,
} from "kafkajs";

import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

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

  const consumer: Consumer = kafka.consumer(consumerConfig);

  return consumer;
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
  });
};

const disconnectConsumer = async (consumer: Consumer): Promise<void> => {
  try {
    await consumer.disconnect();
    logger.info("Disconnected from kafka");
  } catch (error: any) {
    logger.error(`Error while disconnecting from kafka: ${error}`);
  }
};

const initKafkaWithTopicAndMessageHandler = async (
  topics: string[],
  messageHandler: EachMessageHandler
) => {
  const brokersUrl: string[] = getKafkaBrokerUrls();
  const consumer: Consumer = createKafkaConsumer(brokersUrl);
  await initKafkaConsumer(consumer, topics, messageHandler);
};

const getKafkaBrokerUrls = (): string[] => {
  const brokerUrlsEnv: string | undefined = process.env.KAFKA_BROKER_URLS;
  return brokerUrlsEnv ? brokerUrlsEnv.split(",") : ["localhost:9092"];
};

export { disconnectConsumer, initKafkaWithTopicAndMessageHandler };
