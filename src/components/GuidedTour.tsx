import React, { useState, useEffect } from 'react';
import { Joyride, CallBackProps, STATUS, Step } from 'react-joyride';

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
      disableBeacon: true,
    },
    {
      target: '.tour-step-tabs',
      content: 'Navegue entre o modo Criador/Audiovisual e o modo Desenvolvedor do meu currículo aqui.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-search',
      content: 'Use a barra de pesquisa para encontrar rapidamente habilidades, trabalhos, projetos ou ferramentas em todo o portfólio.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-filters',
      content: 'Filtre as obras por tipos específicos, ou encontre agrupadamente por projeto nos botões de filtro e "Grupos ▾".',
      disableBeacon: true,
    },
    {
      target: '.tour-step-ai',
      content: 'O Assistente de IA está à sua disposição! Ele usa este currículo como contexto e pode sugerir projetos exatos baseados na sua dúvida. Pergunte sobre minha experiência ou veja como usar este currículo white-label.',
      disableBeacon: true,
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      onFinish();
    } else if (action === 'close') {
      onFinish();
    }
  };

  return (
    <Joyride
      key={tourKey}
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      disableBeacons={true}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#059669', // text-emerald-600
        },
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
