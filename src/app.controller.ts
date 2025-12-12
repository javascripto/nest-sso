import { Controller, Get, Render, UseFilters } from '@nestjs/common';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { UnauthorizedRedirectFilter } from './auth/filters/unauthorized-redirect.filter';
import { AuthenticatedUser } from './auth/interfaces';

@Controller()
export class AppController {
  @Get()
  @UseFilters(UnauthorizedRedirectFilter)
  @Render('home')
  home(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }
}
