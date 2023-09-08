import { EachMessageHandler, KafkaMessage } from "kafkajs";
import { initKafkaWithTopicAndMessageHandler } from "../../configs/kafka.configs";

const initKafka = async () => {
  const topicName: string =
    process.env.KAFKA_TOPIC_NAME || "urlshortener-notifications";
  initKafkaWithTopicAndMessageHandler([topicName], kafkaMessageHandler);
};

const onMessage = (message: KafkaMessage) => {
  const messageString = message.value?.toString();

  if (!messageString) {
    return;
  }

  const notificationEvent: any = {
    ...JSON.parse(messageString),
    timestamp: new Date().getTime(),
  };

  console.log("Notification event received:", notificationEvent);
};

const kafkaMessageHandler: EachMessageHandler = async ({ message }) => {
  onMessage(message);
};

export { initKafka, kafkaMessageHandler };
