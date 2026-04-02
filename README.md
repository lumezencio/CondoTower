# CondoTech — Sistema de Gestão de Condomínios

> Plataforma completa para gestão de condomínios residenciais de pequeno e médio porte (até 200 unidades), com controle financeiro, lançamento de notas fiscais, apuração automática de impostos retidos, comunicação e muito mais.

---

## Visão Geral

O **CondoTech** é um sistema web moderno desenvolvido com Next.js (TypeScript) no frontend, FastAPI (Python) no backend e PostgreSQL como banco de dados. Toda a infraestrutura roda em Docker, permitindo subir o ambiente completo com um único comando.

### Tecnologias Principais

| Camada         | Tecnologia                              |
|----------------|-----------------------------------------|
| Frontend       | Next.js 16 + React 19 + TypeScript      |
| Backend/API    | Python 3.12 + FastAPI + SQLAlchemy      |
| Banco de Dados | PostgreSQL 16                           |
| Cache          | Redis 7                                 |
| ORM (web)      | Prisma 6                                |
| ORM (backend)  | SQLAlchemy 2 + Alembic                  |
| Containerização| Docker + Docker Compose                 |
| Estilização    | Tailwind CSS 4                          |
| Autenticação   | JWT (jose) + bcrypt                     |

---

## Módulos do Sistema

| # | Módulo                    | Status       | Descrição                                               |
|---|---------------------------|--------------|---------------------------------------------------------|
| 1 | Cadastros                 | Implementado | Unidades, proprietários, moradores, veículos e pets     |
| 2 | Financeiro                | Implementado | Contas a pagar, contas a receber, fluxo de caixa        |
| 3 | Notas de Entrada + Fiscal | Implementado | Lançamento de NF com apuração automática de impostos    |
| 4 | Comunicados               | Implementado | Avisos, circulares e notificações internas              |
| 5 | Documentos                | Implementado | Repositório de atas, contratos, apólices e regimentos   |
| 6 | Ocorrências               | Implementado | Registro e acompanhamento de ocorrências                |
| 7 | Chamados (Tickets)        | Implementado | Manutenção preventiva, corretiva e solicitações         |
| 8 | Reservas                  | Implementado | Reserva de áreas comuns com aprovação                   |
| 9 | Encomendas                | Implementado | Controle de encomendas e pacotes recebidos              |
|10 | Assembleias               | Implementado | Convocação, pauta, votação e geração de atas            |
|11 | Enquetes                  | Implementado | Votações e enquetes para moradores                      |
|12 | Sorteios                  | Implementado | Sorteio de vagas, áreas e brindes                       |
|13 | Contatos                  | Implementado | Agenda de contatos do condomínio                        |
|14 | Recados / Mensagens       | Implementado | Comunicação direta entre moradores e gestão             |
|15 | Aprovações                | Implementado | Fluxo de aprovação de obras, festas e reformas          |
|16 | Relatórios                | Implementado | Relatórios financeiros, inadimplência e operacional     |
|17 | Dashboard                 | Implementado | Visão geral com indicadores e gráficos em tempo real    |

---

## Subindo o Ambiente Local

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução
- Git

### Subir tudo com Docker Compose

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/condotech.git
cd condotech

# Copie o arquivo de ambiente
cp .env.docker .env

# Suba todos os serviços
docker compose up -d

# Aguarde os serviços iniciarem (~30 segundos) e execute as migrations
docker compose exec web npx prisma migrate deploy
docker compose exec web node scripts/seed.cjs

# (Opcional) Popular dados de exemplo
docker compose exec web node scripts/seed-tenant.cjs
```

### Serviços disponíveis após subir

| Serviço            | URL                         | Descrição                          |
|--------------------|-----------------------------|------------------------------------|
| Frontend (Next.js) | http://localhost:3000       | Interface principal do sistema     |
| API Python (FastAPI)| http://localhost:8000      | Serviço de cálculo de impostos     |
| Docs da API        | http://localhost:8000/docs  | Swagger UI automático do FastAPI   |
| PostgreSQL         | localhost:5432              | Banco de dados principal           |
| Redis              | localhost:6379              | Cache e filas                      |
| Adminer (DB)       | http://localhost:8080       | Interface visual para o banco      |

### Credenciais padrão após seed

```
URL:    http://localhost:3000
Email:  admin@condotech.com
Senha:  Admin@123
```

---

## Estrutura do Projeto

```
condotech/
├── web/                        # Frontend Next.js (TypeScript)
│   ├── src/
│   │   ├── app/                # Rotas (App Router)
│   │   │   ├── (auth)/         # Login, registro, recuperação de senha
│   │   │   ├── (dashboard)/    # Área logada do sistema
│   │   │   └── api/            # API Routes do Next.js
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── modules/            # Módulos de negócio
│   │   └── lib/                # Utilitários e configurações
│   ├── prisma/
│   │   ├── schema.prisma       # Schema do banco de dados
│   │   └── migrations/         # Histórico de migrations
│   ├── scripts/                # Scripts de seed e provisionamento
│   └── Dockerfile              # Container do frontend
│
├── backend/                    # API Python FastAPI
│   ├── app/
│   │   ├── main.py             # Entrypoint da API
│   │   ├── database.py         # Configuração do banco
│   │   ├── models/             # Modelos SQLAlchemy
│   │   ├── schemas/            # Schemas Pydantic
│   │   ├── routes/             # Endpoints da API
│   │   └── services/           # Lógica de negócio
│   │       └── tax_calculator.py # Cálculo automático de impostos
│   ├── alembic/                # Migrations do backend Python
│   ├── requirements.txt        # Dependências Python
│   └── Dockerfile              # Container do backend
│
├── docker-compose.yml          # Orquestração dos serviços
├── .env.docker                 # Variáveis de ambiente para Docker
└── README.md                   # Esta documentação
```

---

## Módulo Fiscal — Notas de Entrada e Impostos Retidos

O CondoTech realiza automaticamente o cálculo e controle de **impostos retidos na fonte** quando o condomínio lança notas fiscais de prestadores de serviço.

### Como funciona

1. Administrador lança uma **Nota de Entrada** (NF de prestador de serviço)
2. O sistema identifica o tipo de serviço e o regime do fornecedor
3. O **serviço Python** calcula automaticamente os impostos a reter:
   - **INSS** — Previdência Social (11% PF / conforme RPA)
   - **IRRF** — Imposto de Renda Retido na Fonte (1% a 1,5%)
   - **ISS** — Imposto sobre Serviços (2% a 5%, conforme município)
   - **CSLL** — Contribuição Social (1%)
   - **COFINS** — Contribuição (3%)
   - **PIS/PASEP** — Programa de Integração (0,65%)
4. O sistema gera as guias de recolhimento com datas de vencimento
5. O controle de pagamento das guias fica integrado ao fluxo de contas a pagar

### Alíquotas por tipo de serviço

| Tipo de Serviço          | IRRF | CSLL | COFINS | PIS   | ISS  |
|--------------------------|------|------|--------|-------|------|
| Limpeza / Conservação    | 1,0% | 1,0% | 3,0%   | 0,65% | 5,0% |
| Vigilância / Segurança   | 1,0% | 1,0% | 3,0%   | 0,65% | 5,0% |
| Manutenção em geral      | 1,5% | 1,0% | 3,0%   | 0,65% | 5,0% |
| Serviços de TI           | 1,5% | 1,0% | 3,0%   | 0,65% | 2,0% |
| Serviços profissionais   | 1,5% | 1,0% | 3,0%   | 0,65% | 5,0% |

> Alíquotas do ISS variam por município. O sistema permite configurar a alíquota local.

---

## Desenvolvimento

### Rodando individualmente (sem Docker)

**Frontend:**
```bash
cd web
cp .env.example .env.local
# Edite .env.local com a URL do banco
npm install
npx prisma migrate dev
node scripts/seed.cjs
npm run dev
```

**Backend Python:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Comandos úteis

```bash
# Ver logs de todos os serviços
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f web
docker compose logs -f backend

# Acessar o banco via Prisma Studio
docker compose exec web npx prisma studio

# Executar migrations
docker compose exec web npx prisma migrate dev

# Rodar seeds novamente
docker compose exec web node scripts/seed.cjs

# Reiniciar apenas o frontend
docker compose restart web

# Parar todos os serviços
docker compose down

# Parar e remover volumes (APAGA O BANCO)
docker compose down -v
```

---

## Segurança

- Autenticação JWT com refresh tokens
- Senhas com hash bcrypt (custo 12)
- Rate limiting nas rotas de autenticação
- Isolamento multi-tenant por prefixo de banco
- Validação de dados com Zod (frontend) e Pydantic (backend)
- Compliance LGPD: dados pessoais criptografados

---

## Licença

Projeto proprietário. Todos os direitos reservados.

**© 2025 CondoTech**
