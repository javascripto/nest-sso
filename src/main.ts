import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar cookie parser
  app.use(cookieParser());

  // Prefixo /api para todas as rotas da API
  app.setGlobalPrefix('api', {
    exclude: ['auth/google', 'auth/google/callback', 'auth/logout', 'auth/success', 'auth/profile', 'app', 'app/*path'],
  });

  // Configurar EJS como view engine (para páginas legadas)
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  // Configurar arquivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Servir assets da SPA React em produção
  app.useStaticAssets(join(__dirname, '..', 'client', 'dist'));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
