import dotenv from "dotenv";
import { initEmailTransporter } from "./configs/emailsender.configs";
import { initKafka } from "./services/kafka/kafka.consumer.service";

dotenv.config();

initEmailTransporter();
initKafka();
