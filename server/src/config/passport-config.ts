import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { config } from './env.js';
import { userRepository } from '../repositories/user.repository.js';
import logger from '../utils/logger.js';

export function configurePassport() {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.jwt.secret,
      },
      async (payload, done) => {
        try {
          const user = await userRepository.findById(payload.id);
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          logger.error('JWT strategy authentication error:', error);
          return done(error, false);
        }
      }
    )
  );

  return passport;
}
