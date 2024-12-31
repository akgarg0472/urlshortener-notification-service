import Mail from "nodemailer/lib/mailer";
import { basename, dirname } from "path";
import { getEmailTransporter } from "../../configs/emailsender.configs";
import { getLogger } from "../../logger/logger";
import { NotificationEvent } from "../../models/kafka.event.models";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

const sendEmailNotification = async (notificationEvent: NotificationEvent) => {
  if (logger.isInfoEnabled()) {
    logger.info(`Received email event: ${JSON.stringify(notificationEvent)}`);
  }

  const emailOptions: Mail.Options = {
    to: notificationEvent.recipients || notificationEvent.Recipients,
    subject: notificationEvent.subject || notificationEvent.Subject,
    text:
      !notificationEvent.isHtml || !notificationEvent.IsHtml
        ? notificationEvent.body || notificationEvent.Body
        : undefined,
    html:
      notificationEvent.isHtml || notificationEvent.IsHtml
        ? notificationEvent.body || notificationEvent.Body
        : undefined,
  };

  try {
    const transport = getEmailTransporter();

    if (transport) {
      transport.sendMail(emailOptions);
    } else {
      logger.warn(
        "Not sending email notification transport is not initialized!"
      );
    }
  } catch (err: any) {
    if (err instanceof Error) {
      logger.error(`Error sending email: ${JSON.stringify(err)}`);
    }
  }
};

export { sendEmailNotification };
