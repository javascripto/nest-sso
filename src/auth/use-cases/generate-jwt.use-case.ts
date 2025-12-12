import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthTokenResult,
  GoogleUser,
  JwtPayload,
} from '../interfaces/auth.interface';

@Injectable()
export class GenerateJwtUseCase {
  constructor(private readonly jwtService: JwtService) {}

  execute(user: GoogleUser): AuthTokenResult {
    const payload: JwtPayload = {
      sub: user.email,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }
}
