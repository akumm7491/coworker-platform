import { Schema, model, Document } from 'mongoose';
import { EventType, Event } from '../events/types.js';
import { eventBus } from '../events/eventBus.js';

export interface IUserReadModel extends Document {
  id: string;
  name: string;
  email: string;
  google?: {
    id: string;
    email: string;
  };
  github?: {
    id: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

const userSchema = new Schema<IUserReadModel>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  google: {
    id: String,
    email: String,
  },
  github: {
    id: String,
    email: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'google.id': 1 });
userSchema.index({ 'github.id': 1 });

export const UserReadModel = model<IUserReadModel>('User', userSchema);

// Event handlers
eventBus.subscribe(EventType.USER_REGISTERED, async (event: Event) => {
  const { email, name, provider, providerId } = event.data;

  const user = new UserReadModel({
    id: event.aggregateId,
    name,
    email,
    ...(provider === 'google' && {
      google: {
        id: providerId,
        email,
      },
    }),
    ...(provider === 'github' && {
      github: {
        id: providerId,
        email,
      },
    }),
  });

  await user.save();
});

eventBus.subscribe(EventType.USER_UPDATED, async (event: Event) => {
  const { name, email } = event.data;

  await UserReadModel.findOneAndUpdate(
    { id: event.aggregateId },
    {
      $set: {
        name,
        email,
        updatedAt: new Date(),
      },
      $inc: { version: 1 },
    },
  );
});

eventBus.subscribe(EventType.USER_DELETED, async (event: Event) => {
  await UserReadModel.findOneAndDelete({ id: event.aggregateId });
});
