import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../interfaces';

export interface AuthSuccessResult {
  token: string | undefined;
  user: AuthenticatedUser | null;
}

@Injectable()
export class GetAuthSuccessDataUseCase {
  execute(req: Request): AuthSuccessResult {
    let user: AuthenticatedUser | null = null;

    try {
      const userParam = req.query.user as string;
      if (userParam) {
        user = JSON.parse(decodeURIComponent(userParam));
      }
    } catch {
      user = null;
    }

    return {
      token: req.cookies?.access_token,
      user,
    };
  }
}
