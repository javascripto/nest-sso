import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/auth.interface';

@Injectable()
export class VerifyTokenUseCase {
  constructor(private readonly jwtService: JwtService) {}

  execute(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}
