enum NotificationType {
  EMAIL = "EMAIL",
}

interface NotificationEvent {
  recipients: string[];
  Recipients: string[];
  subject: string;
  Subject: string;
  body: string;
  Body: string;
  isHtml: boolean;
  IsHtml: boolean;
  type: NotificationType;
  Type: NotificationType;
}

export { NotificationEvent, NotificationType };
