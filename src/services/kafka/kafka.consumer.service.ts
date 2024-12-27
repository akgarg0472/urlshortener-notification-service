import { EachMessageHandler, KafkaMessage } from "kafkajs";
import { initKafkaWithTopicAndMessageHandler } from "../../configs/kafka.configs";
import { sendEmailNotification } from "../notification/notification.service";
import { basename, dirname } from "path";
import { getLogger } from "../../logger/logger";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

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

export { initKafka, kafkaMessageHandler };
