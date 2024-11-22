export interface NotificationPayload {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  recipients: string[];
  metadata?: Record<string, unknown>;
  type?: string;
  icon?: string;
  link?: string;
  actions?: Array<{
    name: string;
    title: string;
    url?: string;
  }>;
  expiresAt?: Date;
  sendAt?: Date;
  deliveryChannels?: Array<'email' | 'push' | 'sms' | 'in-app'>;
}
