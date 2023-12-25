enum NotificationType {
  EMAIL = "EMAIL",
}

interface NotificationEvent {
  Recipients: string[];
  Subject: string;
  Body: string;
  IsHtml: boolean;
  Type: NotificationType;
}

export { NotificationEvent, NotificationType };
