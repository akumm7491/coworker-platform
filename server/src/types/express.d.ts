import { User as CustomUser } from '../models/User.js';

declare global {
  namespace Express {
    interface User extends CustomUser {}

    interface Request {
      user?: User;
      startTime?: number;
    }
  }
}

export {};
