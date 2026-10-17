import type { LegalText } from "./en";

export const pt: LegalText = {
  support: {
    title: "Ajuda",
    intro: "O Cartographer é um quiz diário de geografia mundial para iPhone e para a web. [Jogue no seu navegador →](/)",
    dataTitle: "Tudo fica no seu dispositivo",
    dataBody:
      "Sem conta, sem cadastro, sem cookies e sem anúncios. O app de iPhone não se conecta à internet em momento algum. O site guarda seus resultados só no seu navegador e conta as visitas com o Cloudflare Web Analytics, sem cookies, que não consegue identificar você. Veja a [política de privacidade](/privacy).",
    faqTitle: "Perguntas frequentes",
    faq: [
      {
        q: "O que posso jogar?",
        a: "Sessenta quizzes: capitais do mundo e de cada continente, estados, províncias e regiões de mais de quarenta países, rios, montanhas, mares e ilhas, além de Mistura aleatória, Quantas regiões?, Encontre a região e Contra o relógio. O site tem também dois quizzes de bandeiras, e perguntas de bandeiras aparecem nas misturas. Cada quiz tem a sua [lista de estudo](/learn).",
      },
      {
        q: "Como funciona o Desafio diário?",
        a: "Todo dia, todo mundo recebe as mesmas dez perguntas variadas no nível Navegador (20 segundos cada), e você tem uma única tentativa. O desafio é gerado a partir da data, então não precisa de servidor. Seu resultado vem com uma grade sem spoilers para compartilhar onde quiser. O app e o site têm cada um o seu próprio desafio diário.",
      },
      {
        q: "Qual é a diferença entre os três níveis?",
        a: "O nível escolhido vale para todos os quizzes. **Explorador** pergunta sobre lugares conhecidos, sem relógio e com quatro opções. **Navegador** amplia o leque, acrescenta uma quinta opção e 20 segundos por pergunta. **Cartógrafo** escolhe os lugares menos conhecidos, oferece seis opções e 12 segundos, e as respostas erradas se parecem mais com a certa.",
      },
      {
        q: "Posso fazer com que meus resultados não sejam salvos?",
        a: "Sim. **Ajustes → Salvar histórico** desativa isso, no app e no site. Os resultados existentes ficam guardados até você escolher **Apagar todo o histórico**, que os remove para sempre.",
      },
      {
        q: "Perdi minha sequência / meu histórico sumiu",
        a: "O histórico fica só no dispositivo: não passa de um celular para outro e não está no iCloud. Se você apagar o app, ele é apagado. No site, ele fica no seu navegador, então ao limpar os dados do site ou trocar de navegador você começa do zero. Não há sincronização entre o app e o site. Infelizmente, não há como recuperá-lo.",
      },
      {
        q: "Encontrei uma resposta errada",
        a: "Escreva para nós indicando a pergunta exata. Todos os dados foram conferidos em fontes confiáveis, mas algumas regiões têm capitais disputadas ou compartilhadas, e pode haver erros. Correções são bem-vindas e entram rápido.",
      },
    ],
    contactTitle: "Contato",
    contactBody: "Erros, correções e sugestões: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com).",
  },

  privacy: {
    title: "Política de privacidade",
    updated: "Última atualização: 12 de outubro de 2026",
    note: "Esta é uma tradução. A [versão em inglês](en:/privacy) é a que prevalece.",
    sections: [
      {
        blocks: [
          "**Em resumo.** O Cartographer não coleta, transmite nem compartilha dados pessoais. Não há contas, cookies, publicidade nem rastreamento entre sites. O app de iPhone não se conecta à internet em momento algum. O site conta as visitas e mede a velocidade das páginas com o Cloudflare Web Analytics, que não registra identificadores pessoais; seus resultados nunca saem do seu dispositivo.",
        ],
      },
      {
        title: "O que o app guarda",
        blocks: [
          "O Cartographer guarda o seguinte **somente no seu dispositivo**:",
          { list: ["Seu histórico: data, nome do quiz, dificuldade, pontuação e duração", "Sua sequência diária e seus melhores tempos no Contra o relógio", "Seus ajustes, como a última dificuldade escolhida"] },
          "Isso é guardado localmente no banco de dados da Apple no dispositivo. Nunca é enviado para a nuvem, nunca chega até nós e nunca é compartilhado com terceiros. Não temos servidores nem forma de ver esses dados.",
        ],
      },
      {
        title: "No site",
        blocks: [
          "O site do Cartographer guarda o mesmo tipo de informação no armazenamento local do seu navegador, no seu dispositivo. Nada é enviado. O site não usa cookies nem mostra anúncios.",
          { heading: "Estatísticas de visitas" },
          "Para saber quantas pessoas usam o site e com que rapidez as páginas carregam, o site usa o [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/). Ao carregar uma página, um pequeno script da Cloudflare (static.cloudflareinsights.com) envia:",
          {
            list: [
              "o endereço da página e, se houver, o site que levou até ela",
              "seu navegador, sistema operacional e tipo de dispositivo",
              "seu país, deduzido do seu endereço IP (o endereço em si não é guardado)",
              "quanto tempo a página levou para carregar e aparecer",
            ],
          },
          "Ele não usa cookies, não guarda nada no seu dispositivo, não cria uma impressão digital do seu navegador e não segue você entre sites. Só vemos totais, como visitas por dia ou por país, e não conseguimos identificar você. Suas respostas, pontuações, sequências e histórico nunca são enviados. Veja a [política de privacidade da Cloudflare](https://www.cloudflare.com/privacypolicy/).",
          { heading: "Hospedagem" },
          "Como qualquer site, as páginas são servidas por provedores de hospedagem (atualmente a Cloudflare, e o GitHub Pages para uma cópia desta política e da página de ajuda), cujos servidores podem registrar dados técnicos comuns, como o seu endereço IP. Nós não recebemos nem usamos essas informações. Veja a [política de privacidade da Cloudflare](https://www.cloudflare.com/privacypolicy/) e a [declaração de privacidade do GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).",
        ],
      },
      {
        title: "Você decide",
        blocks: [
          {
            list: [
              "O histórico é salvo por padrão, e você pode desativá-lo quando quiser em **Ajustes → Salvar histórico**.",
              "Ao desativá-lo, novos resultados deixam de ser salvos e os existentes são mantidos.",
              "**Ajustes → Apagar todo o histórico** remove para sempre tudo o que foi salvo.",
              "Apagar o app remove tudo do seu dispositivo. No site, limpar os dados deste site no navegador tem o mesmo efeito.",
            ],
          },
        ],
      },
      {
        title: "Compartilhar",
        blocks: [
          "Quando você decide compartilhar um resultado ou uma sequência, o app passa uma imagem ou uma linha de texto para o menu de compartilhamento do iOS; o site usa o menu de compartilhamento do seu dispositivo ou copia o texto para você colar. O que acontece depois fica entre você e o app para onde enviar. O Cartographer não transmite nada por conta própria.",
        ],
      },
      {
        title: "Crianças",
        blocks: [
          "O Cartographer é adequado para todas as idades e não coleta dados pessoais de ninguém, inclusive de menores de 13 anos. As estatísticas de visitas do site descritas acima são anônimas e iguais para todos. Não há publicidade nem compras dentro do app.",
        ],
      },
      {
        title: "Terceiros",
        blocks: [
          "O app de iPhone não inclui SDKs de terceiros, bibliotecas de análise nem redes de publicidade. O site usa o Cloudflare Web Analytics, como descrito acima, e nenhum outro serviço de terceiros.",
        ],
      },
      {
        title: "Mudanças",
        blocks: ["Se esta política mudar, a nova versão será publicada neste endereço e a data acima será atualizada."],
      },
      {
        title: "Contato",
        blocks: ["Dúvidas sobre esta política: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com)"],
      },
    ],
  },
};
