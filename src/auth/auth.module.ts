import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  CheckAuthAndRenderLoginUseCase,
  GenerateJwtUseCase,
  GetAuthSuccessDataUseCase,
  HandleGoogleCallbackUseCase,
  LogoutUseCase,
  ValidateJwtPayloadUseCase,
  VerifyTokenUseCase,
} from './use-cases';

const useCases = [
  GenerateJwtUseCase,
  VerifyTokenUseCase,
  ValidateJwtPayloadUseCase,
  HandleGoogleCallbackUseCase,
  LogoutUseCase,
  CheckAuthAndRenderLoginUseCase,
  GetAuthSuccessDataUseCase,
];

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [...useCases, GoogleStrategy, JwtStrategy, JwtAuthGuard],
  exports: [VerifyTokenUseCase, GenerateJwtUseCase, JwtAuthGuard],
})
export class AuthModule {}
