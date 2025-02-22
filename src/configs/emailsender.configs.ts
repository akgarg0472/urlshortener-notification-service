import nodemailer, { Transporter } from "nodemailer";
import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";
import { shutdown } from "../notificationService";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

let emailTransporter: Transporter | null = null;

const getTransporterOptions = () => {
  const host: string | undefined = process.env["EMAIL_HOST"];
  const port: string | undefined = process.env["EMAIL_PORT"];
  const secure: string | undefined = process.env["EMAIL_SECURE"];
  const username: string | undefined = process.env["EMAIL_AUTH_USERNAME"];
  const password: string | undefined = process.env["EMAIL_AUTH_PASSWORD"];

  if (!host || !port || !secure || !username || !password) {
    logger.error("Invalid email sender configs found. Terminating application");
    shutdown(1);
    return;
  }

  const transporterOptions = {
    host: host?.toString()!,
    port: parseInt(port?.toString()!),
    secure: "true" === secure?.toString()!.toLowerCase(),
    auth: {
      user: username?.toString()!,
      pass: password?.toString()!,
    },
  };

  return transporterOptions;
};

const initEmailTransporter = (): void => {
  const transporterOptions = getTransporterOptions();
  emailTransporter = nodemailer.createTransport(transporterOptions);
};

const getEmailTransporter = (): Transporter | null => {
  return emailTransporter;
};

const destroyEmailSenderTransport = () => {
  if (!emailTransporter) {
    logger.info("Not destroying email sender because it is not initialized");
    return;
  }

  try {
    emailTransporter.close();
    logger.info("Email transport closed successfully");
  } catch (err: any) {
    logger.error(`Error destroying email transport:`, err);
  }
};

export {
  destroyEmailSenderTransport,
  getEmailTransporter,
  initEmailTransporter,
};
