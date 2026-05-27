# Escopo do Protótipo: Plataforma "VidaSó" - IA para Pessoas que Moram Sozinhas

## Nome da Plataforma
**VidaSó** - Sua vida mais fácil, só para você

## Funcionalidades Principais

### 1. Autenticação e Perfil do Usuário
- Cadastro com email/senha
- Perfil com preferências de gosto
- Histórico de preferências alimentares
- Restrições alimentares
- Orçamento mensal

### 2. Módulo de Personal Chef (com IA)
- Questionário de preferências de gosto (culinária, ingredientes favoritos, restrições)
- Algoritmo de matching inteligente que recomenda chefs baseado em:
  - Tipo de culinária preferida
  - Avaliações e experiência do chef
  - Disponibilidade
  - Proximidade geográfica
  - Preço
- Visualização de perfil do chef com portfólio
- Agendamento de serviço
- Sistema de avaliação

### 3. Módulo de Compras Automatizadas
- Criar lista de compras personalizada
- Sugestões de produtos baseadas em histórico
- Integração com supermercados (simulado)
- Agendamento de entrega
- Histórico de compras
- Reordenação rápida de itens frequentes

### 4. Módulo de Limpeza
- Seleção de profissionais de limpeza cadastrados
- Agendamento de serviço
- Tipos de limpeza (básica, profunda, semanal)
- Avaliação de profissionais
- Histórico de serviços

### 5. Dashboard Principal
- Resumo de serviços agendados
- Próximos compromissos
- Recomendações personalizadas
- Gastos mensais
- Atalhos rápidos

### 6. Sistema de Recomendação com IA
- Recomendações baseadas em preferências
- Sugestões de chefs similares
- Produtos sugeridos para lista de compras
- Horários ideais de entrega

## Tecnologia

### Frontend
- React + TypeScript
- TailwindCSS para estilização
- Componentes reutilizáveis

### Backend
- Node.js/Express
- Banco de dados MySQL
- Autenticação JWT

### IA/Algoritmos
- Algoritmo de matching baseado em scoring
- Recomendações colaborativas
- Preferências de usuário

## Dados de Exemplo

### Chefs
- Chef Maria: Culinária Caseira, R$ 80/pessoa
- Chef João: Culinária Italiana, R$ 120/pessoa
- Chef Ana: Culinária Saudável/Fitness, R$ 90/pessoa

### Supermercados
- Carrefour (simulado)
- Pão de Açúcar (simulado)

### Profissionais de Limpeza
- Limpeza Básica: R$ 150
- Limpeza Profunda: R$ 250
- Limpeza Semanal: R$ 400/mês

## Fluxo de Usuário

1. **Cadastro** → Responder questionário de preferências
2. **Dashboard** → Ver recomendações personalizadas
3. **Encontrar Chef** → Usar filtros e IA para encontrar chef ideal
4. **Fazer Compras** → Criar lista ou reutilizar anterior
5. **Agendar Limpeza** → Selecionar profissional e data
6. **Gerenciar Serviços** → Acompanhar agendamentos

## Diferenciais

1. **Integração Completa**: Todos os serviços em um único lugar
2. **IA Personalizada**: Recomendações inteligentes baseadas em preferências
3. **Automação**: Listas de compras recorrentes
4. **Conveniência**: Agendamento integrado
5. **Comunidade**: Avaliações e recomendações de outros usuários
