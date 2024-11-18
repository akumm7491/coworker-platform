import { Strategy as PassportStrategy } from 'passport';
import { StrategyOptions, VerifyCallback } from 'passport-jwt';

declare module 'passport-jwt' {
  export interface JwtPayload {
    id: string;
    [key: string]: any;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback);
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): (req: any) => string | null;
    fromHeader(header_name: string): (req: any) => string | null;
    fromBodyField(field_name: string): (req: any) => string | null;
    fromUrlQueryParameter(param_name: string): (req: any) => string | null;
  };
}
