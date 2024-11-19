import logger from '../../utils/logger.js';


interface BillingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

interface BillingSubscription {
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'cancelled' | 'expired';
}

class BillingService {
  private plans: BillingPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 9.99,
      features: ['Up to 5 agents', 'Basic analytics', 'Email support'],
    },
    {
      id: 'pro',
      name: 'Professional Plan',
      price: 29.99,
      features: ['Up to 20 agents', 'Advanced analytics', 'Priority support'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 99.99,
      features: ['Unlimited agents', 'Custom analytics', '24/7 support'],
    },
  ];

  private subscriptions: Map<string, BillingSubscription> = new Map();

  async getPlans(): Promise<BillingPlan[]> {
    return this.plans;
  }

  async getPlan(planId: string): Promise<BillingPlan | undefined> {
    return this.plans.find(plan => plan.id === planId);
  }

  async createSubscription(userId: string, planId: string): Promise<BillingSubscription> {
    const plan = await this.getPlan(planId);
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    const subscription: BillingSubscription = {
      userId,
      planId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'active',
    };

    this.subscriptions.set(userId, subscription);
    logger.info(`Created subscription for user ${userId} with plan ${planId}`);
    return subscription;
  }

  async getSubscription(userId: string): Promise<BillingSubscription | undefined> {
    return this.subscriptions.get(userId);
  }

  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) {
      throw new Error(`No active subscription found for user ${userId}`);
    }

    subscription.status = 'cancelled';
    this.subscriptions.set(userId, subscription);
    logger.info(`Cancelled subscription for user ${userId}`);
  }

  async renewSubscription(userId: string): Promise<BillingSubscription> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) {
      throw new Error(`No subscription found for user ${userId}`);
    }

    subscription.startDate = new Date();
    subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    subscription.status = 'active';

    this.subscriptions.set(userId, subscription);
    logger.info(`Renewed subscription for user ${userId}`);
    return subscription;
  }
}

export const billingService = new BillingService();
