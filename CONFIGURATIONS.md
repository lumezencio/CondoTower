# CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE - WORDCONDOS

---

## 📝 VARIÁVEIS DE AMBIENTE

### Frontend (.env.local)

```bash
# ==============================================
# NEXT.JS CONFIGURATION
# ==============================================
NEXT_PUBLIC_APP_NAME=WORDCONDOS
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# ==============================================
# AUTHENTICATION
# ==============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

# ==============================================
# API ENDPOINTS
# ==============================================
NEXT_PUBLIC_API_TIMEOUT=30000

# ==============================================
# FILE UPLOAD
# ==============================================
NEXT_PUBLIC_MAX_FILE_SIZE=10485760 # 10MB in bytes
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# ==============================================
# FEATURES FLAGS
# ==============================================
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_2FA=true

# ==============================================
# THIRD-PARTY SERVICES
# ==============================================
# Google Analytics (optional)
NEXT_PUBLIC_GA_TRACKING_ID=

# Firebase (for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Sentry (error tracking)
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

### Backend (.env)

```bash
# ==============================================
# APPLICATION
# ==============================================
NODE_ENV=development
PORT=4000
APP_NAME=WORDCONDOS
APP_URL=http://localhost:3000

# ==============================================
# DATABASE
# ==============================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/wordcondos?schema=public

# Connection Pool
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# ==============================================
# REDIS
# ==============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ==============================================
# JWT AUTHENTICATION
# ==============================================
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# ==============================================
# ENCRYPTION
# ==============================================
ENCRYPTION_KEY=your-32-character-encryption-key
BCRYPT_ROUNDS=12

# ==============================================
# AWS S3
# ==============================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=wordcondos-uploads
AWS_S3_URL=https://wordcondos-uploads.s3.amazonaws.com

# ==============================================
# EMAIL SERVICE
# ==============================================
# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@wordcondos.com
SENDGRID_FROM_NAME=WORDCONDOS

# Or AWS SES
# AWS_SES_REGION=us-east-1
# AWS_SES_FROM_EMAIL=noreply@wordcondos.com

# ==============================================
# PAYMENT GATEWAY
# ==============================================
# Example: Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=your-access-token
MERCADOPAGO_PUBLIC_KEY=your-public-key

# Or Banco do Brasil
# BB_CLIENT_ID=your-client-id
# BB_CLIENT_SECRET=your-client-secret
# BB_DEVELOPER_KEY=your-developer-key

# ==============================================
# NOTIFICATIONS
# ==============================================
# Firebase Cloud Messaging
FCM_SERVER_KEY=your-fcm-server-key

# ==============================================
# RATE LIMITING
# ==============================================
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# ==============================================
# CORS
# ==============================================
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# ==============================================
# LOGGING
# ==============================================
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# ==============================================
# MONITORING
# ==============================================
# Sentry
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=development

# New Relic (optional)
# NEW_RELIC_LICENSE_KEY=your-license-key
# NEW_RELIC_APP_NAME=WORDCONDOS-API

# ==============================================
# CRON JOBS
# ==============================================
ENABLE_CRON_JOBS=true
CRON_GENERATE_BOLETOS=0 0 1 * * # Todo dia 1 às 00:00
CRON_SEND_REMINDERS=0 0 9 * * # Todo dia às 09:00
CRON_BACKUP_DATABASE=0 0 2 * * # Todo dia às 02:00

# ==============================================
# FEATURE FLAGS
# ==============================================
ENABLE_2FA=true
ENABLE_OAUTH=false
ENABLE_EMAIL_VERIFICATION=true
ENABLE_BOLETO_GENERATION=true
```

---

## 📋 CONFIGURAÇÕES IMPORTANTES

### 1. next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: [
      'localhost',
      'wordcondos-uploads.s3.amazonaws.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  
  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

### 2. .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 3. .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 4. tsconfig.json (Frontend)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 5. nest-cli.json (Backend)

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "webpackConfigPath": "webpack-hmr.config.js"
  }
}
```

### 6. docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: wordcondos-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: wordcondos
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - wordcondos-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: wordcondos-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - wordcondos-network

  # Backend API
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    container_name: wordcondos-api
    restart: unless-stopped
    ports:
      - "4000:4000"
    env_file:
      - ./apps/api/.env
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/api:/app
      - /app/node_modules
    networks:
      - wordcondos-network
    command: npm run start:dev

  # Frontend Web
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    container_name: wordcondos-web
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - ./apps/web/.env.local
    depends_on:
      - api
    volumes:
      - ./apps/web:/app
      - /app/node_modules
      - /app/.next
    networks:
      - wordcondos-network
    command: npm run dev

volumes:
  postgres_data:
  redis_data:

networks:
  wordcondos-network:
    driver: bridge
```

---

## 🔐 SEGURANÇA - CHECKLIST

### Antes de ir para Produção

#### Environment Variables
- [ ] Trocar todas as senhas e secrets
- [ ] Usar secrets managers (AWS Secrets Manager, HashiCorp Vault)
- [ ] Nunca commitar arquivos .env
- [ ] Validar todas as env vars no startup

#### Database
- [ ] Habilitar SSL/TLS
- [ ] Configurar network security groups
- [ ] Implementar least privilege access
- [ ] Habilitar encryption at rest
- [ ] Configurar automated backups

#### API
- [ ] Implementar rate limiting
- [ ] Habilitar CORS apenas para domínios específicos
- [ ] Implementar request validation
- [ ] Sanitizar todos os inputs
- [ ] Implementar CSRF protection
- [ ] Usar Helmet.js para headers de segurança
- [ ] Implementar API versioning

#### Authentication
- [ ] Usar HTTPS everywhere
- [ ] Implementar password policies
- [ ] Habilitar 2FA para admins
- [ ] Implementar account lockout
- [ ] Log todas as tentativas de login
- [ ] Implementar session timeout

#### Files & Uploads
- [ ] Validar tipo de arquivo no backend
- [ ] Implementar tamanho máximo
- [ ] Fazer scan de vírus (ClamAV)
- [ ] Armazenar em S3 com ACL privado
- [ ] Gerar URLs signed temporárias

#### Logging & Monitoring
- [ ] Log todas as ações sensíveis
- [ ] Não logar dados sensíveis (senhas, tokens)
- [ ] Implementar alertas de segurança
- [ ] Monitorar tentativas de acesso não autorizado
- [ ] Implementar log rotation

---

## 📊 PERFORMANCE - CHECKLIST

### Backend
- [ ] Implementar caching (Redis)
- [ ] Usar connection pooling
- [ ] Otimizar queries (índices, eager loading)
- [ ] Implementar pagination
- [ ] Usar compression (gzip)
- [ ] Implementar CDN para assets

### Frontend
- [ ] Implementar code splitting
- [ ] Lazy load componentes
- [ ] Otimizar imagens (Next.js Image)
- [ ] Implementar service worker (PWA)
- [ ] Minificar assets
- [ ] Usar React.memo para componentes pesados
- [ ] Implementar virtual scrolling para listas grandes

### Database
- [ ] Criar índices apropriados
- [ ] Analisar e otimizar slow queries
- [ ] Implementar read replicas
- [ ] Configurar connection pooling
- [ ] Regular vacuum e analyze (PostgreSQL)

---

## 🧪 TESTES - SETUP

### Jest Configuration (jest.config.js)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### E2E Tests (Playwright)

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 📦 SCRIPTS ÚTEIS

### package.json (Root)

```json
{
  "name": "wordcondos",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "dev:web": "cd apps/web && npm run dev",
    "dev:api": "cd apps/api && npm run start:dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,scss,md}\"",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "db:migrate": "cd apps/api && npx prisma migrate dev",
    "db:seed": "cd apps/api && npx prisma db seed",
    "db:studio": "cd apps/api && npx prisma studio"
  }
}
```

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Desenvolvimento
npm run dev                    # Inicia frontend + backend
npm run docker:up              # Sobe serviços Docker
npm run db:migrate             # Executa migrations
npm run db:seed                # Popula banco com dados iniciais

# Testes
npm run test                   # Roda todos os testes
npm run test:e2e              # Roda testes E2E
npm run test:coverage         # Gera relatório de cobertura

# Build
npm run build                  # Build de produção
npm run lint                   # Executa linter
npm run format                 # Formata código

# Database
npm run db:studio             # Abre Prisma Studio
npx prisma migrate reset      # Reseta banco (cuidado!)
npx prisma db push            # Sincroniza schema sem migration
```

---

**WORDCONDOS** - Configuração Completa para Sucesso 🎯
