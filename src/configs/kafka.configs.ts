import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  EachMessageHandler,
  Kafka,
  logLevel,
} from "kafkajs";

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

  console.log(`Connected to Kafka consumer`);

  const topic: ConsumerSubscribeTopics = {
    topics: topics,
    fromBeginning: true,
  };

  await consumer.subscribe(topic);

  console.log(`Consumer subscribed to topics: '${topics}'`);

  await consumer.run({
    eachMessage: messageHandler,
  });
};

const disconnectConsumer = async (consumer: Consumer) => {
  try {
    await consumer.disconnect();
    console.log("Disconnected from kafka");
  } catch (error) {
    console.log("Error while disconnecting from kafka: ", error);
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
