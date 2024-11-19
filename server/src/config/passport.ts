import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, JwtPayload } from 'passport-jwt';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import { Request } from 'express';
import logger from '../utils/logger.js';
import { config } from './env.js';
import { userRepository } from '../repositories/user.repository.js';
import { UserProvider } from '../models/User.js';

interface GoogleProfile extends Omit<Profile, 'displayName'> {
  displayName?: string;
  photos?: { value: string }[];
  emails?: { value: string; verified: boolean }[];
  id: string;
}

type DoneCallback = (error: any, user?: any, info?: { message: string }) => void;


// Configure Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done: DoneCallback) => {
      try {
        const user = await userRepository.findByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        logger.info('User authenticated successfully:', { email });
        return done(null, user);
      } catch (error) {
        logger.error('Local strategy authentication error:', error);
        return done(error);
      }
    },
  ) as passport.Strategy,
);

// Configure JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.secret,
      passReqToCallback: true,
    },
    async (req: Request, payload: JwtPayload, done: DoneCallback) => {
      try {
        const user = await userRepository.findByEmail(payload.id);
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        return done(null, user);
      } catch (error) {
        logger.error('JWT strategy authentication error:', error);
        return done(error);
      }
    },
  ) as passport.Strategy,
);

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
      passReqToCallback: true,
    },
    async (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: DoneCallback,
    ) => {
      try {
        // First check if user exists with Google ID
        let user = await userRepository.findByGoogleId(profile.id);

        if (!user) {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined, {
              message: 'No email found in Google profile',
            });
          }

          // Check if user exists with this email
          const existingUser = await userRepository.findByEmail(email);

          if (existingUser) {
            // Link Google account to existing user
            existingUser.googleId = profile.id;
            existingUser.provider = UserProvider.GOOGLE;
            user = await userRepository.save(existingUser);
          } else {
            // Create new user with required fields
            user = await userRepository.createUser({
              email,
              name: profile.displayName || 'Google User',
              provider: UserProvider.GOOGLE,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
            });
          }
        }

        logger.info('Google authentication successful:', { email: user.email });
        return done(null, user);
      } catch (error) {
        logger.error('Google authentication error:', error);
        return done(error instanceof Error ? error : new Error('Google authentication failed'));
      }
    },
  ) as passport.Strategy,
);

export function configurePassport(passportInstance: typeof passport): void {
  // No-op function to satisfy the import in app.ts
  // Passport strategies are already configured above
  passportInstance.initialize();
}

export default passport;
