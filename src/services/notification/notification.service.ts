import Mail from "nodemailer/lib/mailer";
import { basename, dirname } from "path";
import { getEmailTransporter } from "../../configs/emailsender.configs";
import { getLogger } from "../../logger/logger";
import {
  increaseNotificationEventsCounter,
  observeNotificationEventDuration,
} from "../../metrics";
import {
  NotificationEvent,
  NotificationType,
} from "../../models/kafka.event.models";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

const sendEmailNotification = async (notificationEvent: NotificationEvent) => {
  const startTime = performance.now();

  if (logger.isDebugEnabled()) {
    logger.debug(
      `Received email notification event: ${JSON.stringify(notificationEvent)}`
    );
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

  let successful = false;

  try {
    const transport = getEmailTransporter();

    if (transport) {
      await transport.sendMail(emailOptions);
      successful = true;
    } else {
      logger.error("Not sending email because transport is not initialized!");
    }
  } catch (err: any) {
    logger.error(`Error sending email`, { error: err });
  } finally {
    increaseNotificationEventsCounter(NotificationType.EMAIL);
    observeNotificationEventDuration(
      NotificationType.EMAIL,
      successful,
      performance.now() - startTime
    );
  }
};

export { sendEmailNotification };
