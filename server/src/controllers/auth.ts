import { Request, Response } from 'express';
import { User, IUser } from '../models/User.js';
import { createToken } from '../middleware/auth.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Register request received:', req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { name, email, password } = req.body as { name: string; email: string; password: string };

    // Check if user already exists
    const existingUser = await User.findOne({ email }).select('+password');
    if (existingUser) {
      console.log('User already exists:', email);
      res.status(400).json({
        success: false,
        error: 'User already exists'
      });
      return;
    }

    console.log('Creating new user:', { name, email });

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Create token
    const token = createToken(user._id.toString());

    console.log('User created successfully:', { id: user._id, name: user.name, email: user.email });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Login request received:', { email: req.body.email });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { email, password } = req.body as { email: string; password: string };

    // Check if user exists
    const user = await User.findOne({ email }).select('+password') as IUser | null;
    if (!user) {
      console.log('User not found:', email);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Create token
    const token = createToken(user._id.toString());

    console.log('User logged in successfully:', { id: user._id, name: user.name, email: user.email });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Get current user request received');

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};
