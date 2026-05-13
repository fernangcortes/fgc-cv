import { ProjectGroup } from '../types';

export const PORTFOLIO_GROUPS: ProjectGroup[] = [
  {
    category: "Ecossistema CapIAu (Gestão & Produção)",
    projects: [
      {
        name: "CapIAu",
        year: "2026",
        description: "Plataforma completa que gerencia todas as etapas da produção audiovisual: do roteiro à distribuição, potencializado por Inteligência Artificial.",
        url: "https://cap-i-au-7wr2.vercel.app/",
        badges: ["Produção", "Gestão"]
      },
      {
        name: "Inventariado / Gestão CriaLab",
        year: "2026",
        description: "Sistema de gestão e catalogação de inventário de equipamentos para o CriaLab e ecossistema CapIAu.",
        url: "https://inventariado.vercel.app",
        badges: ["Live", "Gestão"]
      },
      {
        name: "Gerador de Lista de Itens",
        year: "2026",
        description: "Gerenciador de pedidos de produção audiovisual com IA (traduz briefing para lista de itens de equipamentos).",
        url: "https://github.com/fernangcortes/gerador-de-lista-de-itens",
        badges: ["IA", "Produção"]
      },
      {
        name: "CapIAu Play",
        year: "2026",
        description: "Player e ambiente de testes para protótipos, demos e distribuição do acervo audiovisual.",
        url: "https://github.com/fernangcortes/capIAu-play",
        badges: ["Módulo"]
      },
      {
        name: "CineAsset Generator",
        year: "2026",
        description: "Gerador de assets vetoriais padronizados para inventário de equipamentos (ícones e visuais).",
        url: "https://github.com/fernangcortes/CineAsset-Generator"
      },
      {
        name: "CapIAu Portfólio AV",
        year: "2026",
        description: "Landing page e portfólio interativo focado no ecossistema audiovisual + IA.",
        url: "https://github.com/fernangcortes/capiau-portfolio-av"
      }
    ]
  },
  {
    category: "Broadcast, Streaming & Automação",
    projects: [
      {
        name: "NACrIA: God Stack",
        year: "2026",
        description: "Hub Central de automação integrando protocolos OSC, VISCA, Art-Net e visão computacional para infraestrutura de broadcast.",
        badges: ["P&D", "Arquitetura"]
      },
      {
        name: "Rádio UEG 2026",
        year: "2026",
        description: "Ecossistema Client-Admin em KMP e Tauri v2 com streaming LL-HLS e transcrição Whisper local.",
        badges: ["P&D", "KMP", "Rust"]
      },
      {
        name: "Omnimix Controller & CapIAu",
        year: "2026",
        description: "Protocolo reitor e control surface modular para broadcast: vMix, ATEM, PTZ, plugins de redução de ruído via X32 e Bitfocus Companion.",
        url: "https://github.com/fernangcortes/omnimix-controller",
        badges: ["Hardware/Software", "P&D"]
      },
      {
        name: "CapIAu Streaming",
        year: "2026",
        description: "Módulo para streaming e operação ao vivo (automação e controle de transmissões).",
        url: "https://github.com/fernangcortes/capIAu-streaming",
        badges: ["Módulo", "Live"]
      },
      {
        name: "DCP Padrão",
        year: "2026",
        description: "Plataforma de mapeamento técnico dos padrões de projeção de todas as salas de cinema de Goiânia.",
        badges: ["P&D", "Comunidade"]
      }
    ]
  },
  {
    category: "Edição de Vídeo e Áudio com IA",
    projects: [
      {
        name: "AI Doc Editor",
        year: "2026",
        description: "Editor automático de vídeo baseado em transcrição: realiza cortes, marcações e organização automatizada por roteiro.",
        url: "https://github.com/fernangcortes/ai-doc-editor",
        badges: ["IA", "Edição"]
      },
      {
        name: "Ghost Editor AI",
        year: "2026",
        description: "Edição de vídeo automatizada com IA: curadoria, transcrição e montagem. Exporta arquivos para OTIO/Kdenlive.",
        url: "https://github.com/fernangcortes/ghost-editor-ai"
      },
      {
        name: "CapIAudio",
        year: "2026",
        description: "Gravação de áudio inteligente com marcadores gerados automaticamente para Premiere/Resolve, integrando workflows de pós-produção eficientes.",
        url: "https://github.com/fernangcortes/CapIAudio"
      },
      {
        name: "LabCredits",
        year: "2026",
        description: "Automação de créditos finais via reconhecimento facial de equipe em estúdio gerando MOGRTs.",
        badges: ["P&D", "Python", "OpenCV"]
      }
    ]
  },
  {
    category: "Teleprompter & Mentoria Vocal",
    projects: [
      {
        name: "crIAprompter",
        year: "2026",
        description: "Teleprompter com voice tracking: acompanha a fala do apresentador em tempo real, possui controles manuais e janela invertida.",
        url: "https://github.com/fernangcortes/crIAprompter",
        badges: ["Voice Tracking", "React"]
      },
      {
        name: "TeleprompterIA",
        year: "2026",
        description: "App que sincroniza texto e fala via IA, focado no treino de fala e leitura fluida.",
        url: "https://teleprompteria.com.br/"
      },
      {
        name: "crIAprompter Web",
        year: "2026",
        description: "Mentor em chat para teleprompter que auxilia no roteiro, analisa ritmo, realiza ajustes e prática de fala.",
        url: "https://github.com/fernangcortes/criaprompter-web"
      }
    ]
  },
  {
    category: "Gestão, Financeiro & Administração",
    projects: [
      {
        name: "eMei Portal",
        year: "2026",
        description: "Portal web e plataforma completa para MEI, integrando gestão de clientes, serviços e finanças.",
        url: "https://emei-portal.vercel.app/"
      },
      {
        name: "Gestão de Contratos",
        year: "2026",
        description: "Módulo para gestão governamental ou empresarial de contratos (cadastro, status e acompanhamento).",
        url: "https://github.com/fernangcortes/contratos"
      },
      {
        name: "IES Gestão Orçamentária",
        year: "2026",
        description: "Plataforma interativa de capacitação em gestão orçamentária para IES públicas (trilhas formativas, glossário e RPG).",
        url: "https://github.com/fernangcortes/ies-gestao-orcamentaria"
      },
      {
        name: "Calculadora de Consignado (Servidor GO)",
        year: "2026",
        description: "App que calcula o custo efetivo real, CET e simulações de empréstimos consignados para servidores públicos.",
        url: "https://github.com/fernangcortes/calculadora-consignado-servidor-go"
      },
      {
        name: "Ponto Real G0",
        year: "2026",
        description: "App web para controle, registro e gestão de folhas de ponto em sistemas estaduais.",
        url: "https://ponto-real-go.onrender.com"
      },
      {
        name: "Buscador de Licitações Públicas",
        year: "2026",
        description: "Sistema automatizado para buscar e filtrar oportunidades de editais e licitações compatíveis com MEI em Goiás.",
        badges: ["P&D", "Automação"]
      }
    ]
  },
  {
    category: "Produtividade, Ferramentas Pessoais & Outros",
    projects: [
      {
        name: "Segundo Cérebro Automático",
        year: "2026",
        description: "Sistema RAG local + extensão Chrome para capturar contexto e interagir com um assistente inteligente privado.",
        url: "https://github.com/fernangcortes/segundo-cerebro-automatico",
        badges: ["IA Local", "RAG"]
      },
      {
        name: "Na Risca",
        year: "2026",
        description: "App de cronograma reverso contra a cegueira temporal com modos emocionais adaptativos (Zen, Bomba, Blindado).",
        badges: ["P&D", "Electron"]
      },
      {
        name: "Palácio dos Sonhos",
        year: "2026",
        description: "PWA focado no rastreamento de hábitos gamificados com XP, níveis de progresso, metas e analytics completo.",
        url: "https://github.com/fernangcortes/palacio-dos-sonhos"
      },
      {
        name: "Teste Dominância Cerebral",
        year: "2026",
        description: "Teste Whole Brain (Ned Herrmann): análise de perfil comportamental com visualização de radar e exportação para PDF.",
        url: "https://github.com/fernangcortes/teste-dominancia-cerebral"
      },
      {
        name: "HTML para PNG",
        year: "2026",
        description: "Ferramenta para converter componentes HTML/CSS em imagens PNG para geração ágil de cards e postagens de redes sociais.",
        url: "https://github.com/fernangcortes/html-to-png"
      },
      {
        name: "Currículo FGC",
        year: "2026",
        description: "Motor web por trás deste portfólio dinâmico interativo e responsivo estilo SPA.",
        url: "https://github.com/fernangcortes/fgc-cv"
      },
      {
        name: "CapIAu OS: Módulo 360°",
        year: "2026",
        description: "Interface imersiva estilo Street View para rastreio físico de acervo e auditoria de prateleiras nas dependências de equipamentos.",
        badges: ["P&D", "Visão Computacional"]
      }
    ]
  }
];
