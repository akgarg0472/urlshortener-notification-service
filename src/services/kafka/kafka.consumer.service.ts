import { EachMessageHandler, KafkaMessage } from "kafkajs";
import { basename, dirname } from "path";
import {
  disconnectConsumer,
  initKafkaWithTopicAndMessageHandler,
} from "../../configs/kafka.configs";
import { getLogger } from "../../logger/logger";
import { sendEmailNotification } from "../notification/notification.service";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

const initKafka = async () => {
  const topicName: string =
    process.env["KAFKA_TOPIC_NAME"] || "urlshortener.notifications.email";
  initKafkaWithTopicAndMessageHandler([topicName], kafkaMessageHandler);
};

const destroyKafka = async () => {
  logger.info("Disconnecting from kafka");
  await disconnectConsumer();
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

    const notificationType =
      notificationEvent.NotificationType ?? notificationEvent.notificationType;

    if (notificationType === "EMAIL") {
      sendEmailNotification(notificationEvent);
    } else {
      logger.warn(
        `Invalid notification type received: ${notificationEvent.NotificationType}`
      );
    }
  } catch (err: any) {
    logger.error(`Error processing Kafka message: ${err}`);
  }
};

const kafkaMessageHandler: EachMessageHandler = async ({ message }) => {
  onMessage(message);
};

export { destroyKafka, initKafka, kafkaMessageHandler };
