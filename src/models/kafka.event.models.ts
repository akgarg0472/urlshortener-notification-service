enum NotificationType {
  EMAIL = "EMAIL",
}

interface NotificationEvent {
  recipients: string[];
  subject: string;
  body: string;
  isHtml: boolean;
  type: NotificationType;
}

export { NotificationEvent, NotificationType };
