import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { CookieOptions, GoogleUser } from '../interfaces/auth.interface';
import { GenerateJwtUseCase } from './generate-jwt.use-case';

@Injectable()
export class HandleGoogleCallbackUseCase {
  constructor(
    private readonly generateJwtUseCase: GenerateJwtUseCase,
    private readonly configService: ConfigService,
  ) {}

  private getCookieMaxAge(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 7 * 24 * 60 * 60 * 1000; // 7 dias padrão
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  execute(user: GoogleUser, res: Response): void {
    const { access_token, user: authenticatedUser } =
      this.generateJwtUseCase.execute(user);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.getCookieMaxAge(),
    };

    // Salva o token em um cookie HTTP-only seguro
    res.cookie('access_token', access_token, cookieOptions);

    // Redireciona para a página de sucesso
    const encodedUser = encodeURIComponent(JSON.stringify(authenticatedUser));
    res.redirect(`/auth/success?user=${encodedUser}`);
  }
}
