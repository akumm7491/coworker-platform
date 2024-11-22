import { WebSocket } from 'ws';
import { Redis } from 'ioredis';
import { cacheService } from '../cache/CacheService.js';
import { queueService } from '../queue/QueueService.js';
import logger from '../../../utils/logger.js';

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  userId?: string;
  priority?: 'low' | 'medium' | 'high';
  expiresAt?: Date;
}

export interface PushNotificationOptions {
  webPush?: {
    subscription: PushSubscription;
    vapidDetails: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
  };
  fcm?: {
    token: string;
    data?: Record<string, any>;
  };
}

export class NotificationService {
  private static instance: NotificationService;
  private readonly queueName = 'notifications';
  private readonly channelName = 'notifications';
  private wsClients: Map<string, Set<WebSocket>> = new Map();
  private redisClient: Redis;

  private constructor() {
    this.initialize();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initialize(): Promise<void> {
    // Initialize Redis client for pub/sub
    this.redisClient = await cacheService.createClient('notifications');
    this.setupRedisSubscriber();
    this.setupNotificationQueue();
  }

  private async setupRedisSubscriber(): Promise<void> {
    const subscriber = await cacheService.createClient('notifications-sub');
    subscriber.subscribe(this.channelName, err => {
      if (err) {
        logger.error('Error subscribing to notifications channel:', err);
        return;
      }
      logger.info('Subscribed to notifications channel');
    });

    subscriber.on('message', (channel, message) => {
      if (channel === this.channelName) {
        try {
          const notification = JSON.parse(message);
          this.broadcastNotification(notification);
        } catch (error) {
          logger.error('Error processing notification message:', error);
        }
      }
    });
  }

  private async setupNotificationQueue(): Promise<void> {
    await queueService.createQueue({
      name: this.queueName,
      concurrency: 5,
    });

    const queue = await queueService.getQueue(this.queueName);
    queue.process(async job => {
      const { type, data } = job.data;
      switch (type) {
        case 'push':
          return this.sendPushNotification(data.notification, data.options);
        case 'email':
          return this.sendEmailNotification(data.notification);
        case 'sms':
          return this.sendSMSNotification(data.notification);
        default:
          throw new Error(`Unknown notification type: ${type}`);
      }
    });
  }

  async send(notification: NotificationPayload): Promise<void> {
    try {
      // Store notification in database
      await this.storeNotification(notification);

      // Publish to Redis channel
      await this.redisClient.publish(this.channelName, JSON.stringify(notification));

      // Queue for delivery through different channels
      if (notification.userId) {
        const userChannels = await this.getUserNotificationChannels(notification.userId);
        for (const channel of userChannels) {
          await this.queueNotification(notification, channel);
        }
      }

      logger.info('Notification sent successfully', { notification });
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }

  async registerWebSocket(userId: string, ws: WebSocket): Promise<void> {
    if (!this.wsClients.has(userId)) {
      this.wsClients.set(userId, new Set());
    }
    this.wsClients.get(userId)!.add(ws);

    ws.on('close', () => {
      this.wsClients.get(userId)?.delete(ws);
      if (this.wsClients.get(userId)?.size === 0) {
        this.wsClients.delete(userId);
      }
    });
  }

  private broadcastNotification(notification: NotificationPayload): void {
    if (notification.userId) {
      // Send to specific user
      this.wsClients.get(notification.userId)?.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(notification));
        }
      });
    } else {
      // Broadcast to all connected clients
      this.wsClients.forEach(clients => {
        clients.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(notification));
          }
        });
      });
    }
  }

  private async storeNotification(notification: NotificationPayload): Promise<void> {
    // Store notification in database for history/audit
    // Implementation depends on your database schema
  }

  private async getUserNotificationChannels(userId: string): Promise<string[]> {
    // Get user's preferred notification channels from database
    // Implementation depends on your user preferences schema
    return ['email', 'push', 'sms'];
  }

  private async queueNotification(
    notification: NotificationPayload,
    channel: string,
  ): Promise<void> {
    await queueService.addJob(this.queueName, {
      type: channel,
      data: { notification },
    });
  }

  private async sendPushNotification(
    notification: NotificationPayload,
    options: PushNotificationOptions,
  ): Promise<void> {
    // Implement push notification logic (Web Push, FCM, etc.)
  }

  private async sendEmailNotification(notification: NotificationPayload): Promise<void> {
    // Implement email notification logic
  }

  private async sendSMSNotification(notification: NotificationPayload): Promise<void> {
    // Implement SMS notification logic
  }
}

export const notificationService = NotificationService.getInstance();
