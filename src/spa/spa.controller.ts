import { join } from 'node:path';
import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('app')
export class SpaController {
  private readonly indexPath = join(
    __dirname,
    '..',
    '..',
    'client',
    'dist',
    'index.html',
  );

  @Get()
  serveRoot(@Res() res: Response) {
    return res.sendFile(this.indexPath);
  }

  @Get('*')
  serveSpa(@Res() res: Response) {
    return res.sendFile(this.indexPath);
  }
}
