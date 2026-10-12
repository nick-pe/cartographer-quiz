import type { LegalText } from "./en";

export const es: LegalText = {
  support: {
    title: "Ayuda",
    intro: "Cartographer es un quiz diario de geografía mundial para iPhone y la web. [Juega en tu navegador →](/)",
    dataTitle: "Todo se queda en tu dispositivo",
    dataBody:
      "Sin cuenta, sin registro, sin cookies y sin anuncios. La app de iPhone no se conecta a la red en ningún momento. La web guarda tus resultados solo en tu navegador y cuenta las visitas con Cloudflare Web Analytics, sin cookies, que no puede identificarte. Consulta la [política de privacidad](/privacy).",
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        q: "¿A qué puedo jugar?",
        a: "Sesenta quizzes: capitales del mundo y de cada continente, estados, provincias y regiones de más de cuarenta países, ríos, montañas, mares e islas, además de Mezcla aleatoria, ¿Cuántas regiones?, Encuentra la región y Contrarreloj. La web tiene también dos quizzes de banderas, y las preguntas de banderas aparecen en sus mezclas. Cada quiz tiene su [lista de estudio](/learn).",
      },
      {
        q: "¿Cómo funciona el Reto diario?",
        a: "Cada día todo el mundo recibe las mismas diez preguntas variadas en nivel Navegante (20 segundos cada una), y tienes un solo intento. El reto se genera a partir de la fecha, así que no necesita servidor. Tu resultado viene con una cuadrícula sin spoilers para compartir donde quieras. La app y la web tienen cada una su propio reto diario.",
      },
      {
        q: "¿En qué se diferencian los tres niveles?",
        a: "El nivel que eliges se aplica a todos los quizzes. **Explorador** pregunta por lugares conocidos, sin reloj y con cuatro opciones. **Navegante** amplía el abanico, añade una quinta opción y 20 segundos por pregunta. **Cartógrafo** elige los lugares menos conocidos, ofrece seis opciones y 12 segundos, y las respuestas incorrectas se parecen más a la correcta.",
      },
      {
        q: "¿Puedo hacer que no se guarden mis resultados?",
        a: "Sí. **Ajustes → Guardar historial** lo desactiva, en la app y en la web. Los resultados existentes se conservan hasta que elijas **Borrar todo el historial**, que los elimina para siempre.",
      },
      {
        q: "He perdido mi racha / mi historial ha desaparecido",
        a: "El historial está solo en el dispositivo: no pasa de un teléfono a otro y no está en iCloud. Si borras la app, se borra. En la web está en tu navegador, así que al borrar los datos del sitio o cambiar de navegador empiezas de cero. No se sincroniza entre la app y la web. Lo sentimos, no hay forma de recuperarlo.",
      },
      {
        q: "He encontrado una respuesta incorrecta",
        a: "Escríbenos indicando la pregunta exacta. Todos los datos se han comprobado con fuentes fiables, pero algunas regiones tienen capitales disputadas o compartidas y puede haber errores. Las correcciones son bienvenidas y se aplican rápido.",
      },
    ],
    contactTitle: "Contacto",
    contactBody: "Errores, correcciones y sugerencias: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com).",
  },

  privacy: {
    title: "Política de privacidad",
    updated: "Última actualización: 12 de octubre de 2026",
    note: "Esta es una traducción. La [versión en inglés](en:/privacy) es la que prevalece.",
    sections: [
      {
        blocks: [
          "**En resumen.** Cartographer no recopila, transmite ni comparte datos personales. No hay cuentas, cookies, publicidad ni seguimiento entre sitios web. La app de iPhone no se conecta a internet en ningún momento. La web cuenta las visitas y mide la velocidad de las páginas con Cloudflare Web Analytics, que no registra identificadores personales; tus resultados nunca salen de tu dispositivo.",
        ],
      },
      {
        title: "Qué guarda la app",
        blocks: [
          "Cartographer guarda lo siguiente **solo en tu dispositivo**:",
          { list: ["Tu historial: fecha, nombre del quiz, dificultad, puntuación y duración", "Tu racha diaria y tus mejores tiempos en Contrarreloj", "Tus ajustes, como la última dificultad elegida"] },
          "Se guarda localmente en la base de datos de Apple en el dispositivo. Nunca se sube, nunca se nos envía y nunca se comparte con terceros. No tenemos servidores ni forma de verlo.",
        ],
      },
      {
        title: "En la web",
        blocks: [
          "La web de Cartographer guarda el mismo tipo de información en el almacenamiento local de tu navegador, en tu dispositivo. Nunca se sube. La web no usa cookies ni muestra anuncios.",
          { heading: "Estadísticas de visitas" },
          "Para saber cuántas personas usan la web y lo rápido que cargan sus páginas, la web usa [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/). Al cargar una página, un pequeño script de Cloudflare (static.cloudflareinsights.com) envía:",
          {
            list: [
              "la dirección de la página y, si la hay, la web que enlazó a ella",
              "tu navegador, sistema operativo y tipo de dispositivo",
              "tu país, deducido de tu dirección IP (la dirección en sí no se guarda)",
              "cuánto tardó la página en cargarse y mostrarse",
            ],
          },
          "No usa cookies, no guarda nada en tu dispositivo, no crea una huella de tu navegador y no te sigue entre sitios web. Solo vemos totales, como visitas por día o por país, y no podemos identificarte. Tus respuestas, puntuaciones, rachas e historial nunca se envían. Consulta la [política de privacidad de Cloudflare](https://www.cloudflare.com/privacypolicy/).",
          { heading: "Alojamiento" },
          "Como cualquier web, las páginas las sirven proveedores de alojamiento (actualmente Cloudflare, y GitHub Pages para una copia de esta política y de la página de ayuda), cuyos servidores pueden registrar datos técnicos habituales como tu dirección IP. Nosotros no recibimos ni usamos esa información. Consulta la [política de privacidad de Cloudflare](https://www.cloudflare.com/privacypolicy/) y la [declaración de privacidad de GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).",
        ],
      },
      {
        title: "Tú decides",
        blocks: [
          {
            list: [
              "El historial se guarda por defecto y puedes desactivarlo cuando quieras en **Ajustes → Guardar historial**.",
              "Al desactivarlo dejan de guardarse resultados nuevos y se conservan los existentes.",
              "**Ajustes → Borrar todo el historial** elimina para siempre todo lo guardado.",
              "Al borrar la app se elimina todo de tu dispositivo. En la web, borrar los datos de este sitio en tu navegador tiene el mismo efecto.",
            ],
          },
        ],
      },
      {
        title: "Compartir",
        blocks: [
          "Cuando decides compartir un resultado o una racha, la app pasa una imagen o una línea de texto al menú de compartir de iOS; la web usa el menú de compartir de tu dispositivo o copia el texto para que lo pegues. Lo que ocurra después queda entre tú y la app a la que lo envíes. Cartographer no transmite nada por sí misma.",
        ],
      },
      {
        title: "Menores",
        blocks: [
          "Cartographer es apta para todas las edades y no recopila datos personales de nadie, tampoco de menores de 13 años. Las estadísticas de visitas de la web descritas arriba son anónimas e iguales para todos. No hay publicidad ni compras dentro de la app.",
        ],
      },
      {
        title: "Terceros",
        blocks: [
          "La app de iPhone no incluye SDK de terceros, bibliotecas de analítica ni redes publicitarias. La web usa Cloudflare Web Analytics como se describe arriba, y ningún otro servicio de terceros.",
        ],
      },
      {
        title: "Cambios",
        blocks: ["Si esta política cambia, la nueva versión se publicará en esta dirección y se actualizará la fecha de arriba."],
      },
      {
        title: "Contacto",
        blocks: ["Preguntas sobre esta política: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com)"],
      },
    ],
  },
};
