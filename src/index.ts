import * as dotenv from "dotenv";
dotenv.config();

import { initEmailTransporter } from "./configs/emailsender.configs";
import { initKafka } from "./services/kafka/kafka.consumer.service";
import { basename, dirname } from "path";
import { getLogger } from "./logger/logger";

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
