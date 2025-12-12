# NestJS SSO - Single Sign-On com Google OAuth

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

Sistema de autenticação Single Sign-On (SSO) construído com NestJS, utilizando Google OAuth 2.0 e JWT para gerenciamento de sessões.

## 📋 Descrição

Este projeto implementa um sistema completo de autenticação SSO com as seguintes características:

- **Login com Google OAuth 2.0**: Autenticação segura utilizando contas Google
- **JWT (JSON Web Tokens)**: Gerenciamento de sessões com tokens seguros
- **Cookies HTTP-only**: Armazenamento seguro de tokens no navegador
- **Views EJS**: Interface visual para login, perfil e páginas de sucesso
- **Arquitetura Clean**: Organização em Use Cases para lógica de negócio

## 🏗️ Arquitetura do Projeto

```
src/
├── main.ts                 # Bootstrap da aplicação
├── app.module.ts           # Módulo raiz
├── app.controller.ts       # Controller principal (página home)
├── list-routes.ts          # Script de listagem de rotas
└── auth/
    ├── auth.module.ts      # Módulo de autenticação
    ├── auth.controller.ts  # Controller de autenticação
    ├── decorators/
    │   ├── current-user.decorator.ts  # Decorator para obter usuário atual
    │   └── public.decorator.ts        # Decorator para rotas públicas
    ├── filters/
    │   └── unauthorized-redirect.filter.ts  # Redireciona 401 para login
    ├── guards/
    │   └── jwt-auth.guard.ts          # Guard de autenticação JWT (global)
    ├── interfaces/
    │   └── auth.interface.ts          # Interfaces e tipos
    ├── strategies/
    │   ├── google.strategy.ts         # Estratégia OAuth Google
    │   └── jwt.strategy.ts            # Estratégia JWT
    └── use-cases/
        ├── check-auth-and-render-login.use-case.ts
        ├── generate-jwt.use-case.ts
        ├── get-auth-success-data.use-case.ts
        ├── handle-google-callback.use-case.ts
        ├── logout.use-case.ts
        ├── validate-jwt-payload.use-case.ts
        └── verify-token.use-case.ts
```

## 🚀 Rotas da Aplicação

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `GET` | `/` | Página inicial (Home) | Privado 🔒 |
| `GET` | `/auth/login` | Página de login | Público |
| `GET` | `/auth/google` | Inicia fluxo OAuth Google | Público |
| `GET` | `/auth/google/callback` | Callback do Google OAuth | Público |
| `GET` | `/auth/success` | Página de sucesso após login | Privado 🔒 |
| `GET` | `/auth/profile` | Página de perfil do usuário | Privado 🔒 |
| `GET` | `/auth/logout` | Logout do usuário | Público |

## 🔐 Fluxo de Autenticação

```
1. Usuário acessa / e é redirecionado
2. Usuário acessa /auth/login
3. Clica em "Login com Google"
4. Redirecionado para /auth/google
5. Google OAuth autentica o usuário
6. Callback retorna para /auth/google/callback
7. JWT é gerado e salvo em cookie HTTP-only
8. Usuário é redirecionado para /auth/success
9. Pode acessar rotas protegidas como / e /auth/profile
```

## 📦 Use Cases

O projeto utiliza o padrão Use Case para organizar a lógica de negócio:

| Use Case | Descrição |
|----------|-----------|
| `GenerateJwtUseCase` | Gera token JWT a partir dos dados do usuário Google |
| `VerifyTokenUseCase` | Verifica e decodifica um token JWT |
| `ValidateJwtPayloadUseCase` | Valida o payload do JWT e retorna o usuário autenticado |
| `HandleGoogleCallbackUseCase` | Processa o callback do Google OAuth e configura cookies |
| `CheckAuthAndRenderLoginUseCase` | Verifica autenticação e renderiza página de login |
| `GetAuthSuccessDataUseCase` | Obtém dados para exibição na página de sucesso |
| `LogoutUseCase` | Realiza logout limpando cookies |

## 🛠️ Script de Listagem de Rotas

O projeto inclui um script utilitário para listar todas as rotas da aplicação:

```bash
npm run routes
```

### O que o script faz:

1. **Inicializa a aplicação NestJS** sem iniciar o servidor HTTP
2. **Percorre todos os módulos** e controllers registrados
3. **Extrai metadados** de cada rota (método HTTP, path, guards)
4. **Detecta rotas privadas** verificando guards de autenticação e decorators `@Public()`
5. **Exibe uma tabela formatada** no terminal com todas as rotas

### Exemplo de saída:

```
🚀 Rotas da aplicação:

┌────────┬────────────────────────┬─────────────┐
│ Método │ Rota                   │ Acesso      │
├────────┼────────────────────────┼─────────────┤
│ GET    │ /                      │ Privado 🔒  │
│ GET    │ /auth/login            │             │
│ GET    │ /auth/google           │             │
│ GET    │ /auth/google/callback  │             │
│ GET    │ /auth/success          │ Privado 🔒  │
│ GET    │ /auth/profile          │ Privado 🔒  │
│ GET    │ /auth/logout           │             │
└────────┴────────────────────────┴─────────────┘
```

### Como funciona internamente:

- Utiliza o `Reflector` do NestJS para ler metadados
- **Todas as rotas são privadas por padrão** (guard global configurado)
- Verifica o decorator `@Public()` para identificar rotas públicas explícitas
- Formata a saída usando caracteres Unicode para criar uma tabela visual

## 🔒 Guard Global de Autenticação

O projeto utiliza um **guard global** (`JwtAuthGuard`) que protege todas as rotas por padrão. Isso significa que:

- **Novas rotas são automaticamente protegidas** - segurança por padrão
- **Rotas públicas devem ser explicitamente marcadas** com o decorator `@Public()`
- **Rotas de API retornam 401** quando não autenticadas (comportamento padrão)
- **Rotas de páginas web podem redirecionar** para login usando `@UseFilters(UnauthorizedRedirectFilter)`

### Configuração no `AppModule`:

```typescript
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

### Redirecionamento para Login (rotas específicas):

Para rotas que renderizam páginas HTML (não APIs), você pode usar o filtro `UnauthorizedRedirectFilter` para redirecionar usuários não autenticados para a página de login:

```typescript
import { UseFilters } from '@nestjs/common';
import { UnauthorizedRedirectFilter } from './filters/unauthorized-redirect.filter';

@Controller('auth')
export class AuthController {
  @Get('profile')
  @UseFilters(UnauthorizedRedirectFilter)  // Redireciona para /auth/login se não autenticado
  @Render('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }
}
```

Rotas de API (sem o filtro) continuarão retornando 401 Unauthorized em JSON.

### Marcando rotas como públicas:

```typescript
import { Public } from './auth/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  @Public()  // Esta rota não requer autenticação
  @Get('login')
  loginPage() { }

  @Get('profile')  // Esta rota requer autenticação (padrão)
  getProfile() { }
}
```

## ⚙️ Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

O arquivo `.env` é criado automaticamente a partir do `.env.example` no `postinstall`. Configure as seguintes variáveis:

```env
# Google OAuth Config
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT Config
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRES_IN=1h

# App Config
PORT=3000
```

### 3. Configurar Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API Google+ ou Google Identity
4. Configure as credenciais OAuth 2.0
5. Adicione `http://localhost:3000/auth/google/callback` como URI de redirecionamento autorizado

## 🚀 Executando o Projeto

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Listar rotas
npm run routes
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## 🔧 Ferramentas de Desenvolvimento

- **Biome**: Linter e formatter (substitui ESLint + Prettier)
- **Husky**: Git hooks para validação pre-commit
- **lint-staged**: Executa linting apenas em arquivos staged

```bash
# Lint
npm run lint

# Format
npm run format

# Check completo
npm run biome:check
```

## 📁 Views (Templates EJS)

| View | Descrição |
|------|-----------|
| `login.ejs` | Página de login com botão Google OAuth |
| `home.ejs` | Página inicial com informações do usuário |
| `profile.ejs` | Página de perfil (rota protegida) |
| `success.ejs` | Página de sucesso após autenticação |

## 🔒 Segurança

- **Cookies HTTP-only**: Tokens não acessíveis via JavaScript
- **Secure cookies em produção**: HTTPS obrigatório
- **SameSite Lax**: Proteção contra CSRF
- **Token expiration**: JWT expira em 7 dias
- **Extração dual de JWT**: Suporte a cookies e header Authorization (Bearer)

## 📚 Tecnologias Utilizadas

- **NestJS** v11 - Framework Node.js
- **Passport.js** - Middleware de autenticação
- **passport-google-oauth20** - Estratégia Google OAuth
- **passport-jwt** - Estratégia JWT
- **@nestjs/jwt** - Módulo JWT para NestJS
- **EJS** - Template engine
- **cookie-parser** - Parsing de cookies
- **Biome** - Linter/Formatter

## 📝 License

Este projeto está sob a licença UNLICENSED.
