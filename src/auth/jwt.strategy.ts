import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: '123',
    });
  }

  async validate(payload: any) {
    // what will be attached to req.user
    console.log(payload)
    return {
      id: payload.id,
      email: payload.email,
    };
  }
}
