# VidaSó - TODO

## Schema & Database
- [x] Tabelas: users (extendida), chefs, cleaners, bookings, shopping_lists, shopping_items, reviews, user_preferences
- [x] Migrations executadas via webdev_execute_sql
- [x] Seed de dados de exemplo (chefs, cleaners)

## Backend (tRPC Routers)
- [x] Router: chefs (list, getById, match com IA)
- [x] Router: cleaners (list, getById)
- [x] Router: bookings (create, list, cancel)
- [x] Router: shopping (createList, addItem, removeItem, getLists, scheduleDelivery, suggestItems via LLM)
- [x] Router: reviews (create, listByProvider)
- [x] Router: userPreferences (save, get)
- [x] Router: providers (register, updateAvailability, getBookings)

## Frontend - Landing Page
- [x] Hero section com headline, CTA e imagem
- [x] Seção de benefícios (3 cards: Chef, Compras, Limpeza)
- [x] Seção de pesquisa de mercado com dados validados
- [x] Seção de como funciona (passo a passo)
- [x] Seção de depoimentos
- [x] Footer com links e informações

## Frontend - Autenticação & Perfil
- [x] Fluxo de login via OAuth com returnPath
- [x] Questionário de preferências alimentares (onboarding - 4 passos)
- [x] Perfil do usuário visível no dashboard

## Frontend - Módulo Chef
- [x] Listagem de chefs com filtros (culinária, preço, avaliação)
- [x] Card de chef com foto, especialidades, preço e avaliação
- [x] Perfil detalhado do chef com portfólio e agendamento
- [x] Modal de agendamento de serviço com cálculo de preço
- [x] Matching por IA (botão "Usar IA" na listagem)

## Frontend - Módulo Compras
- [x] Criação de lista de compras
- [x] Adição/remoção de itens com sugestões de IA (LLM)
- [x] Agendamento de entrega com horário escolhido pelo usuário
- [x] Histórico de listas com status

## Frontend - Módulo Limpeza
- [x] Listagem de profissionais com filtros
- [x] Card de profissional com foto, tipo de serviço e preço
- [x] Modal de agendamento de limpeza com seleção de tipo de serviço

## Frontend - Dashboard
- [x] Resumo de serviços agendados (4 cards de estatísticas)
- [x] Próximos compromissos (timeline)
- [x] Gastos mensais (gráfico de barras)
- [x] Recomendações personalizadas por IA
- [x] Ações rápidas para cada módulo

## Frontend - Avaliações & Histórico
- [x] Sistema de avaliação por estrelas + comentário
- [x] Histórico de serviços utilizados com botão de avaliação

## Frontend - Painel de Prestadores
- [x] Cadastro de chef/profissional de limpeza com formulário completo
- [x] Gestão de disponibilidade (visão geral)
- [x] Visualização de agenda e bookings recebidos

## Testes
- [x] Testes vitest para routers principais (20 testes passando)
- [x] Correção de TypeScript errors (0 erros)
- [x] Correção de OAuth returnPath para redirect pós-login
