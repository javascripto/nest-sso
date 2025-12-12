import { join } from 'node:path';
import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    // Configurar cookie parser
    app.use(cookieParser());

    // Configurar EJS como view engine
    (app as NestExpressApplication).setBaseViewsDir(
      join(__dirname, '..', 'views'),
    );
    (app as NestExpressApplication).setViewEngine('ejs');

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/ (GET)', () => {
    it('should redirect to /auth/login when no token is provided', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(302)
        .expect('Location', '/auth/login');
    });
  });

  describe('/auth/login (GET)', () => {
    it('should return 200 and render login page', () => {
      return request(app.getHttpServer()).get('/auth/login').expect(200);
    });
  });

  describe('/auth/google (GET)', () => {
    it('should redirect to Google OAuth', () => {
      return request(app.getHttpServer())
        .get('/auth/google')
        .expect(302)
        .expect('Location', /accounts\.google\.com/);
    });
  });

  describe('/auth/logout (GET)', () => {
    it('should redirect to login page', () => {
      return request(app.getHttpServer())
        .get('/auth/logout')
        .expect(302)
        .expect('Location', '/auth/login');
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should redirect to login when no token is provided', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(302)
        .expect('Location', '/auth/login');
    });
  });

  describe('/auth/success (GET)', () => {
    it('should redirect to login when no token is provided', () => {
      return request(app.getHttpServer())
        .get('/auth/success')
        .expect(302)
        .expect('Location', '/auth/login');
    });
  });
});
