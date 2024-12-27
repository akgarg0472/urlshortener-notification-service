import Mail from "nodemailer/lib/mailer";
import { getEmailTransporter } from "../../configs/emailsender.configs";
import { NotificationEvent } from "../../models/kafka.event.models";
import { basename, dirname } from "path";
import { getLogger } from "../../logger/logger";

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
    getEmailTransporter().sendMail(emailOptions);
  } catch (err: any) {
    if (err instanceof Error) {
      logger.error(`Error sending email: ${JSON.stringify(err)}`);
    }
  }
};

export { sendEmailNotification };
