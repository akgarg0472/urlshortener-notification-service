import Mail from "nodemailer/lib/mailer";
import { getEmailTransporter } from "../../configs/emaisender.configs";
import { NotificationEvent } from "../../models/kafka.event.models";

const sendEmailNotification = async (notificationEvent: NotificationEvent) => {
  console.log(`Received email event: ${notificationEvent}`);

  const emailOptions: Mail.Options = {
    to: notificationEvent.Recipients,
    subject: notificationEvent.Subject,
    text: !notificationEvent.IsHtml ? notificationEvent.Body : undefined,
    html: notificationEvent.IsHtml ? notificationEvent.Body : undefined,
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
