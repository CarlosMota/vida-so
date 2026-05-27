# VidaSo

Protótipo de plataforma para pessoas que moram sozinhas, com módulos de personal chef, compras inteligentes, limpeza residencial, dashboard e painel de prestadores.

## Estrutura

```text
.
├── src/                 # Aplicação React + Vite
│   ├── components/      # Componentes compartilhados e UI primitives
│   ├── contexts/        # Providers de React
│   ├── hooks/           # Hooks de frontend
│   ├── lib/             # Utilitários e cliente/demo tRPC
│   ├── pages/           # Rotas/telas do app
│   └── shared/          # Constantes compartilhadas por frontend/backend
├── server/              # Backend, routers tRPC, DB, schema e OAuth
│   └── _core/           # Infra de contexto, cookies, LLM e tRPC
├── scripts/             # Scripts operacionais e de desenvolvimento
├── tests/               # Testes automatizados
├── docs/                # Documentação de escopo, mercado e TODO
├── index.html           # Entrada Vite
├── vite.config.ts       # Configuração Vite e aliases
└── tsconfig.json        # Configuração TypeScript
```

## Requisitos

- Node.js
- npm

## Instalação

```bash
npm install --legacy-peer-deps
```

O `--legacy-peer-deps` é necessário porque uma dependência auxiliar de desenvolvimento declara peer dependency para versões antigas do Vite.

## Desenvolvimento

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Acesse:

```text
http://127.0.0.1:5173/
```

O frontend está preparado para abrir com dados de demonstração, sem exigir MySQL ou OAuth no ambiente local.

## Verificações

```bash
npm run check
npm test
npm run build
npm run build:check
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o Vite em desenvolvimento |
| `npm run build` | Gera build de produção do frontend |
| `npm run start` | Pré-visualiza o build com Vite Preview |
| `npm run check` | Executa TypeScript sem emitir arquivos |
| `npm test` | Executa testes Vitest |
| `npm run build:check` | Roda TypeScript, testes e build em sequência |
| `npm run health` | Verifica variáveis, DB e checks locais |
| `npm run db:migrate` | Executa migrations do Drizzle |
| `npm run db:seed` | Popula banco com dados de exemplo |
| `npm run db:reset` | Limpa tabelas de desenvolvimento |
| `npm run db:export` | Exporta dados para JSON |
| `npm run stats` | Gera relatório de estatísticas |

## Banco de Dados

Os scripts de banco usam `DATABASE_URL` no `.env`. Para um ambiente apenas de interface/protótipo, o app roda com dados mockados em `src/lib/trpc.ts`.

Fluxo com banco:

```bash
npm run db:migrate
npm run db:seed
```
