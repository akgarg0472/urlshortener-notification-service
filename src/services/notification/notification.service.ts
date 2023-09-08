import Mail from "nodemailer/lib/mailer";
import { getEmailTransporter } from "../../configs/emaisender.configs";
import { NotificationEvent } from "../../models/kafka.event.models";

const sendEmailNotification = async (notificationEvent: NotificationEvent) => {
  console.log(`Received email event: ${notificationEvent}`);

  const emailOptions: Mail.Options = {
    to: notificationEvent.recipients,
    subject: notificationEvent.subject,
    text: !notificationEvent.isHtml ? notificationEvent.body : undefined,
    html: notificationEvent.isHtml ? notificationEvent.body : undefined,
  };

  try {
    getEmailTransporter().sendMail(emailOptions);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error sending email: ${error.message}`);
    }
  }
};

export { sendEmailNotification };
