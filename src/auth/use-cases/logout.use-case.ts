import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class LogoutUseCase {
  execute(res: Response): void {
    res.clearCookie('access_token');
    res.redirect('/auth/login');
  }
}
