const { NestFactory } = require('@nestjs/core');
const { NestExpressApplication } = require('@nestjs/platform-express');
const { join } = require('node:path');
const cookieParser = require('cookie-parser');

let app;

module.exports = async (req, res) => {
  if (!app) {
    // Dynamic import for ESM module
    const { AppModule } = await import('../dist/app.module.js');

    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'],
    });

    app.use(cookieParser());
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('ejs');
    app.useStaticAssets(join(__dirname, '..', 'public'));

    await app.init();
  }

  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
};
