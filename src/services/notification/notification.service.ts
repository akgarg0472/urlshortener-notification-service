import Mail from "nodemailer/lib/mailer";
import { getEmailTransporter } from "../../configs/emailsender.configs";
import { NotificationEvent } from "../../models/kafka.event.models";

const sendEmailNotification = async (notificationEvent: NotificationEvent) => {
  console.log(`Received email event: ${JSON.stringify(notificationEvent)}`);

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
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error sending email: ${err.message}`);
    }
  }
};

export { sendEmailNotification };
