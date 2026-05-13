# Currículo/Portfólio Interativo (FGC-CV)

Este repositório contém a versão mais recente e modularizada do currículo e portfólio interativo de **Fernando Gomes Côrtes**. Criada com React + Vite, a aplicação foi otimizada para oferecer uma experiência veloz, responsiva e tecnologicamente avançada para recrutadores e parceiros.

## 🔗 Links Oficiais
- **Site Live**: [https://fgc-cv.vercel.app/](https://fgc-cv.vercel.app/)
- **Repositório**: [https://github.com/fernangcortes/fgc-cv](https://github.com/fernangcortes/fgc-cv)

## 🚀 Novas Funcionalidades e Melhorias Técnicas

- **Arquitetura Modular em `src/`**: Todo o código foi reorganizado em componentes independentes, tipos TypeScript e constantes centralizadas para facilitar a manutenção e escalabilidade.
- **Gráfico de Habilidades Dinâmico (Recharts)**: Visualização profissional das competências técnicas utilizando gráficos de barras responsivos, integrados ao sistema de temas (Dark/Light).
- **Tour Guiado Aprimorado (React Joyride)**: Sistema de onboarding que guia o usuário pelas principais funcionalidades. 
    - *Update*: Agora o tour pode ser reiniciado quantas vezes o usuário desejar e os "beacons" (bolinhas piscantes) foram removidos para uma interface mais limpa.
- **Assistente de IA Integrado (AIPitchAgent)**: Chatbot inteligente que utiliza a API do Google Gemini para responder perguntas sobre o portfólio com base em um contexto dinâmico.
- **Busca Global por Contexto (Fuzzy Search)**: Filtro inteligente que permite encontrar projetos, empresas ou habilidades instantaneamente em todo o site.
- **Modo de Impressão Profissional**: CSS dedicado que transforma o site em um currículo tradicional A4 otimizado para PDF ao pressionar `Ctrl+P`.
- **Lightbox e Player Otimizado**: Visualização de portfólio audiovisual sem perda de performance.

## 🛠️ Tecnologias Utilizadas

- **Core**: React 18, Vite, TypeScript
- **Estilização**: Tailwind CSS (via CDN para agilidade)
- **Visualização de Dados**: Recharts
- **UX/Onboarding**: React Joyride
- **IA**: Google Gemini Pro (via SDK da Google)
- **Hospedagem**: Vercel

## ⚙️ Estrutura do Projeto

```bash
src/
├── components/     # Componentes modulares (Tour, Chat IA, Gráficos, etc.)
├── constants.ts    # Central de dados (Onde você edita suas informações)
├── types.ts        # Definições de tipos TypeScript
├── App.tsx         # Componente principal e lógica de estado
└── main.tsx        # Ponto de entrada da aplicação
```

## 📦 Como Desenvolver Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/fernangcortes/fgc-cv.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🤖 Configuração da IA

Para que o assistente funcione, você deve configurar a variável de ambiente `GEMINI_API_KEY` no seu painel da Vercel ou criar um arquivo `.env` local com a sua chave.

---
Feito com 💚 por Fernando Gomes Côrtes.
