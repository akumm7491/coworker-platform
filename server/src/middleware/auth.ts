import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export const createToken = (userId: string): string => {
  try {
    return jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  } catch (error) {
    console.error('Error creating token:', error);
    throw new Error('Error creating authentication token');
  }
};

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      console.log('No token provided');
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      console.log('Token decoded:', decoded);

      // Get user from token
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('User not found for token:', decoded.id);
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Add user to request object
      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      };
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
      return;
    }
  } catch (error) {
    console.error('Protect middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    });
    return;
  }
};
