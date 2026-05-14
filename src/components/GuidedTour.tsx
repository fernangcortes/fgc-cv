import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, Step, EventData } from 'react-joyride';

interface GuidedTourProps {
  run: boolean;
  onFinish: () => void;
}

export function GuidedTour({ run, onFinish }: GuidedTourProps) {
  const [tourKey, setTourKey] = useState(0);

  useEffect(() => {
    if (run) {
      setTourKey(prev => prev + 1);
    }
  }, [run]);

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Bem-vindo ao meu currículo interativo! Vamos fazer um tour rápido?',
      placement: 'center',
    },
    {
      target: '.tour-step-tabs',
      content: 'Navegue entre o modo Criador/Audiovisual e o modo Desenvolvedor do meu currículo aqui.',
    },
    {
      target: '.tour-step-search',
      content: 'Use a barra de pesquisa para encontrar rapidamente habilidades, trabalhos, projetos ou ferramentas em todo o portfólio.',
    },
    {
      target: '.tour-step-filters',
      content: 'Filtre as obras por tipos específicos, ou encontre agrupadamente por projeto nos botões de filtro e "Grupos".',
    },
    {
      target: '.tour-step-ai',
      content: 'O Assistente de IA está à sua disposição! Ele usa este currículo como contexto e pode sugerir projetos exatos baseados na sua dúvida. Pergunte sobre minha experiência ou veja como usar este currículo white-label.',
    }
  ];

  const handleJoyrideCallback = (data: EventData) => {
    const { status, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onFinish();
    } else if (action === 'close') {
      onFinish();
    }
  };

  return (
    <Joyride
      key={tourKey}
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      options={{
        zIndex: 10000,
        primaryColor: '#059669', // text-emerald-600
        showProgress: true,
        overlayClickAction: false,
        buttons: ['skip', 'back', 'primary'],
      }}
      styles={{
        beacon: {
          display: 'none',
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular',
      }}
    />
  );
}
