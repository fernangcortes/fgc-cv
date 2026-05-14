# Currículo/Portfólio Interativo (FGC-CV)

Este repositório contém a versão mais recente e modularizada do currículo e portfólio interativo de **Fernando Gomes Côrtes**. Criada com React + Vite, a aplicação foi otimizada para oferecer uma experiência veloz, responsiva e tecnologicamente avançada para recrutadores e parceiros.

## 🔗 Links Oficiais

- **Site Live**: [https://fgc-cv.vercel.app/](https://fgc-cv.vercel.app/)
- **Repositório**: [https://github.com/fernangcortes/fgc-cv](https://github.com/fernangcortes/fgc-cv)

## 🚀 Funcionalidades e Diferenciais Técnicos

### 1. Pesquisa Inteligente com Autocomplete

- **Busca Global**: Um sistema de filtro que varre habilidades, empresas, projetos e ferramentas instantaneamente.
- **Sugestões Dinâmicas**: Utiliza um `<datalist>` gerado dinamicamente a partir dos seus dados reais, oferecendo sugestões de busca conforme o usuário digita.
- **Acessibilidade**: Implementado com padrões de formulário (ID/Name) para suporte total a navegadores.

### 2. Tour Guiado Inteligente (React Joyride v3)

- **Onboarding Controlado**: Um tour passo a passo que explica as seções do site.
- **Troca Automática de Contexto**: O tour é inteligente o suficiente para trocar de abas automaticamente (ex: muda da "Visão Geral" para "Audiovisual") para mostrar elementos que só existem em visualizações específicas, garantindo que o usuário nunca perca um passo.

### 3. Assistente de IA (AIPitchAgent)

- **Contexto Completo**: Integrado ao Google Gemini Pro, o assistente possui todo o seu currículo como "memória de curto prazo".
- **Sugestões Personalizadas**: Capaz de sugerir projetos específicos baseados na intenção do recrutador (ex: "Mostre-me projetos de edição de vídeo").

### 4. Gestão de Dados (DevOrganizer)

- **Migração para Nuvem**: Sistema interno para gerenciar e migrar constantes locais para o Firebase Cloud Firestore, permitindo edições dinâmicas no futuro.

### 5. Modo de Impressão e Design

- **Dark Mode Nativo**: Interface baseada em tons de zinco e esmeralda para conforto visual.
- **Print Friendly**: Ao pressionar `Ctrl+P`, o site se reorganiza em um layout de currículo clássico A4, otimizado para leitura e exportação para PDF.

## 🛠️ Tecnologias Utilizadas

- **Core**: React 18, Vite, TypeScript
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts (Visualização de skills)
- **Onboarding**: React Joyride (v3)
- **Inteligência Artificial**: Google Gemini SDK
- **Backend/Storage**: Firebase (Firestore)
- **Hospedagem**: Vercel

## ⚙️ Estrutura do Projeto

```bash
src/
├── components/     # Componentes modulares (Tour, Chat IA, Gráficos, etc.)
├── data/           # Módulos de dados divididos por domínio (Experiência, Audiovisual, etc.)
├── hooks/          # Hooks customizados para busca, tema e Firestore
├── utils/          # Funções utilitárias (Lógica de busca fuzzy, etc.)
├── constants.ts    # Barrel file para exportação centralizada de dados
├── types.ts        # Definições de tipos TypeScript para todo o projeto
└── App.tsx         # Orquestrador principal da aplicação
```

## 📦 Como Desenvolver Localmente

1. **Clone o repositório**:

   ```bash
   git clone https://github.com/fernangcortes/fgc-cv.git
   ```

2. **Instale as dependências**:

   ```bash
   npm install
   ```

3. **Configure o Ambiente**:
   Crie um arquivo `.env` com sua chave:

   ```env
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```

4. **Inicie o servidor**:

   ```bash
   npm run dev
   ```

## 🔮 Futuras Implementações (Roadmap)

- [ ] **Dashboard de Edição**: Interface administrativa completa para editar o currículo sem tocar no código (via Firestore).
- [ ] **Analytics de Busca**: Entender quais competências os recrutadores mais pesquisam no portfólio.
- [ ] **Multi-idioma (i18n)**: Suporte completo para Inglês e Espanhol.
- [ ] **Integração com LinkedIn API**: Sincronização automática de experiências recentes.
- [ ] **PWA (Progressive Web App)**: Permitir instalação do currículo no celular para acesso offline.

---
Feito com 💚 por Fernando Gomes Côrtes.
