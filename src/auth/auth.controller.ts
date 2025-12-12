import {
  Controller,
  Get,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { UnauthorizedRedirectFilter } from './filters/unauthorized-redirect.filter';
import { AuthenticatedUser, GoogleUser } from './interfaces';
import {
  CheckAuthAndRenderLoginUseCase,
  GetAuthSuccessDataUseCase,
  HandleGoogleCallbackUseCase,
  LogoutUseCase,
} from './use-cases';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly logoutUseCase: LogoutUseCase,
    private readonly handleGoogleCallbackUseCase: HandleGoogleCallbackUseCase,
    private readonly checkAuthAndRenderLoginUseCase: CheckAuthAndRenderLoginUseCase,
    private readonly getAuthSuccessDataUseCase: GetAuthSuccessDataUseCase,
  ) {}

  @Public()
  @Get('login')
  loginPage(@Req() req: Request, @Res() res: Response) {
    return this.checkAuthAndRenderLoginUseCase.execute(req, res);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {} // O guard redireciona automaticamente para a página de login do Google

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: { user: GoogleUser }, @Res() res: Response) {
    return this.handleGoogleCallbackUseCase.execute(req.user, res);
  }

  @Get('success')
  @UseFilters(UnauthorizedRedirectFilter)
  @Render('success')
  authSuccess(@Req() req: Request) {
    return this.getAuthSuccessDataUseCase.execute(req);
  }

  @Get('profile')
  @UseFilters(UnauthorizedRedirectFilter)
  @Render('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }

  @Public()
  @Get('logout')
  logout(@Res() res: Response) {
    return this.logoutUseCase.execute(res);
  }
}
