import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces';
import { ValidateJwtPayloadUseCase } from '../use-cases';

// Extrai o token do cookie ou do header Authorization
const extractJwtFromCookieOrHeader = (req: Request): string | null => {
  // Primeiro tenta extrair do cookie
  if (req.cookies?.access_token) {
    return req.cookies.access_token;
  }
  // Depois tenta extrair do header Authorization (Bearer token)
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private validateJwtPayloadUseCase: ValidateJwtPayloadUseCase,
  ) {
    super({
      jwtFromRequest: extractJwtFromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    const user = this.validateJwtPayloadUseCase.execute(payload);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
