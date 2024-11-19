import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import * as bcrypt from 'bcrypt';  // Using bcrypt consistently
import { config } from './env.js';
import { AppDataSource } from './database.js';
import { User } from '../models/User.js';
import logger from '../utils/logger.js';

const userRepository = AppDataSource.getRepository(User);

// Configure Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        logger.info('Login attempt:', { email });
        
        const user = await userRepository.findOne({ 
          where: { email },
          select: ['id', 'email', 'password', 'name']
        });

        if (!user) {
          logger.info('User not found:', { email });
          return done(null, false, { message: 'Invalid credentials' });
        }

        logger.info('Found user:', { email, userId: user.id, passwordHash: user.password });
        
        const isMatch = await bcrypt.compare(password, user.password);
        logger.info('Password comparison:', { email, isMatch, inputPassword: password });
        
        if (!isMatch) {
          logger.info('Password mismatch:', { email });
          return done(null, false, { message: 'Invalid credentials' });
        }

        logger.info('Login successful:', { email, userId: user.id });
        return done(null, user);
      } catch (error) {
        logger.error('Login error:', error);
        return done(error);
      }
    },
  ),
);

// Configure JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.secret,
    },
    async (payload, done) => {
      try {
        const user = await userRepository.findOne({ 
          where: { id: payload.id },
          select: ['id', 'email', 'name']
        });

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);
