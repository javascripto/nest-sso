import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { VerifyTokenUseCase } from './verify-token.use-case';

@Injectable()
export class CheckAuthAndRenderLoginUseCase {
  constructor(private readonly verifyTokenUseCase: VerifyTokenUseCase) {}

  execute(req: Request, res: Response): void {
    const token = req.cookies?.access_token;

    if (token) {
      const payload = this.verifyTokenUseCase.execute(token);
      if (payload) {
        res.redirect('/');
        return;
      }
      res.clearCookie('access_token');
    }

    res.render('login');
  }
}
