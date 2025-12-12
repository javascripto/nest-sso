import { join } from 'node:path';
import { RequestMethod } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { IS_PUBLIC_KEY } from './auth/decorators/public.decorator';

enum RouteAccess {
  PUBLIC = '',
  PRIVATE = 'Privado 🔒',
}

interface RouteInfo {
  Método: string;
  Rota: string;
  Acesso: RouteAccess;
}

const PATH_METADATA = 'path';
const METHOD_METADATA = 'method';

function getRouteAccess(
  reflector: Reflector,
  controller: new (...args: unknown[]) => unknown,
  methodName: string,
  prototype: Record<string, unknown>,
): RouteAccess {
  const method = prototype[methodName] as (...args: unknown[]) => unknown;

  // Com guard global, verificar se tem @Public() no método ou controller
  // Se tiver @Public(), é pública. Caso contrário, é privada por padrão.
  const isPublicMethod = reflector.get<boolean>(IS_PUBLIC_KEY, method);
  const isPublicController = reflector.get<boolean>(IS_PUBLIC_KEY, controller);

  if (isPublicMethod || isPublicController) {
    return RouteAccess.PUBLIC;
  }

  // Todas as rotas são privadas por padrão (guard global)
  return RouteAccess.PRIVATE;
}

function collectRoutesFromControllers(
  app: NestExpressApplication,
): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const reflector = app.get(Reflector);

  // Obter todos os módulos
  const modulesContainer = (
    app as unknown as { container: { getModules: () => Map<unknown, unknown> } }
  ).container?.getModules();

  if (!modulesContainer) {
    return routes;
  }

  for (const moduleRef of modulesContainer.values()) {
    const controllers = (
      moduleRef as { controllers: Map<unknown, { instance: unknown; metatype: new (...args: unknown[]) => unknown }> }
    ).controllers;

    if (!controllers) continue;

    for (const [, wrapper] of controllers) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) continue;

      const controllerPath =
        Reflect.getMetadata(PATH_METADATA, metatype) || '';
      const prototype = Object.getPrototypeOf(instance) as Record<
        string,
        unknown
      >;

      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) =>
          name !== 'constructor' && typeof prototype[name] === 'function',
      );

      for (const methodName of methodNames) {
        const method = prototype[methodName] as (
          ...args: unknown[]
        ) => unknown;
        const routePath = Reflect.getMetadata(PATH_METADATA, method);
        const requestMethod = Reflect.getMetadata(METHOD_METADATA, method);

        if (routePath === undefined || requestMethod === undefined) continue;

        const fullPath = ('/' + [controllerPath, routePath].filter(Boolean).join('/'))
          .replace(/\/+/g, '/');

        const httpMethod = RequestMethod[requestMethod] || 'GET';
        const access = getRouteAccess(
          reflector,
          metatype,
          methodName,
          prototype,
        );

        routes.push({
          Método: httpMethod,
          Rota: fullPath,
          Acesso: access,
        });
      }
    }
  }

  return routes;
}

function printTable(routes: RouteInfo[]) {
  if (routes.length === 0) return;

  const columns = Object.keys(routes[0]) as (keyof RouteInfo)[];
  const columnWidths = columns.map((col) =>
    Math.max(col.length, ...routes.map((r) => r[col].length)),
  );

  const separator =
    '┼' + columnWidths.map((w) => '─'.repeat(w + 2)).join('┼') + '┼';
  const topBorder =
    '┌' + columnWidths.map((w) => '─'.repeat(w + 2)).join('┬') + '┐';
  const bottomBorder =
    '└' + columnWidths.map((w) => '─'.repeat(w + 2)).join('┴') + '┘';

  const formatRow = (values: string[]) =>
    '│' +
    values.map((v, i) => ` ${v.padEnd(columnWidths[i])} `).join('│') +
    '│';

  console.log(topBorder);
  console.log(formatRow(columns));
  console.log(separator.replace(/┼/g, '├').replace(/┼$/, '┤'));

  for (const route of routes) {
    console.log(formatRow(columns.map((col) => route[col])));
  }

  console.log(bottomBorder);
}

async function listRoutes() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
  });

  app.use(cookieParser());
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.init();

  const routes = collectRoutesFromControllers(app);

  console.log('\n🚀 Rotas da aplicação:\n');
  printTable(routes);
  console.log('');

  await app.close();
  process.exit(0);
}

listRoutes();
