import * as dotenv from "dotenv";
dotenv.config();

import { KafkaJSProtocolError } from "kafkajs";
import { basename, dirname } from "path";
import {
  destroyEmailSenderTransport,
  initEmailTransporter,
} from "./configs/emailsender.configs";
import { getLogger } from "./logger/logger";
import {
  destroyKafka,
  initKafka,
} from "./services/kafka/kafka.consumer.service";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

initEmailTransporter();
initKafka();

process.on("uncaughtException", (error: Error) => {
  if (logger.isErrorEnabled()) {
    logger.error(`uncaughtException: ${JSON.stringify(error)}`);
  }
});

process.on("unhandledRejection", async (reason: any, _: Promise<unknown>) => {
  if (reason instanceof KafkaJSProtocolError) {
    logger.warn(`Terminating application due to kafka error: ${reason}`);
    await shutdown(-1);
    return;
  }

  logger.error(`Unhandled Rejection with reason: ${JSON.stringify(reason)}`);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM: Initiating graceful shutdown...");
  await shutdown(143);
});

process.on("SIGINT", async () => {
  logger.info("Received SIGINT: Initiating graceful shutdown...");
  await shutdown(130);
});

const shutdown = async (exitCode: number) => {
  await destroyKafka();
  destroyEmailSenderTransport();

  logger.info(`Exiting process with exit code: ${exitCode}`);

  logger.transports.forEach((transport) => {
    if (typeof transport.close === "function") {
      transport.close();
    } else if (typeof transport.end === "function") {
      transport.end();
    }
  });

  process.exit(exitCode);
};
