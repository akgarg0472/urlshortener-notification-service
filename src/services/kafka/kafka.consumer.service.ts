import { EachMessageHandler, KafkaMessage } from "kafkajs";
import { initKafkaWithTopicAndMessageHandler } from "../../configs/kafka.configs";
import { sendEmailNotification } from "../notification/notification.service";

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
  try {
    const notificationEvent: any = {
      ...JSON.parse(messageString),
      timestamp: new Date().getTime(),
    };

    sendEmailNotification(notificationEvent);
  } catch (err) {
    console.log(`Error processing Kafka message: ${err}`);
  }
};

const kafkaMessageHandler: EachMessageHandler = async ({ message }) => {
  onMessage(message);
};

export { initKafka, kafkaMessageHandler };
