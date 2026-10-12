import type { LegalText } from "./en";

export const it: LegalText = {
  support: {
    title: "Assistenza",
    intro: "Cartographer è un quiz quotidiano di geografia mondiale per iPhone e per il web. [Gioca nel browser →](/)",
    dataTitle: "Tutto resta sul tuo dispositivo",
    dataBody:
      "Niente account, niente registrazione, niente cookie, niente pubblicità. L’app per iPhone non si collega mai alla rete. Il sito salva i tuoi risultati solo nel browser e conta le visite con Cloudflare Web Analytics, senza cookie, che non può identificarti. Leggi l’[informativa sulla privacy](/privacy).",
    faqTitle: "Domande frequenti",
    faq: [
      {
        q: "A cosa posso giocare?",
        a: "Sessanta quiz: capitali del mondo e dei continenti, stati, province e regioni di oltre quaranta paesi, fiumi, montagne, mari e isole, più Mix casuale, Quante regioni?, Trova la regione e Prova a tempo. Il sito ha anche due quiz sulle bandiere, e le domande sulle bandiere compaiono nei suoi mix. Ogni quiz ha il suo [elenco da studiare](/learn).",
      },
      {
        q: "Come funziona la Sfida del giorno?",
        a: "Ogni giorno tutti ricevono le stesse dieci domande miste al livello Navigatore (20 secondi ciascuna), e hai un solo tentativo. Il quiz viene generato a partire dalla data, quindi non serve alcun server. Il risultato arriva con una griglia senza spoiler da condividere ovunque. L’app e il sito hanno ciascuno la propria sfida del giorno.",
      },
      {
        q: "Che differenza c’è tra i tre livelli?",
        a: "Il livello scelto vale per tutti i quiz. **Esploratore** chiede di luoghi noti, senza tempo, con quattro risposte. **Navigatore** allarga il campo, aggiunge una quinta risposta e 20 secondi a domanda. **Cartografo** pesca tra i luoghi meno noti, offre sei risposte e 12 secondi, e le risposte sbagliate somigliano di più a quella giusta.",
      },
      {
        q: "Posso evitare che i miei risultati vengano salvati?",
        a: "Sì. **Impostazioni → Salva la cronologia** lo disattiva, nell’app e sul sito. I risultati esistenti restano finché non scegli **Elimina tutta la cronologia**, che li cancella per sempre.",
      },
      {
        q: "Ho perso la serie / la cronologia è sparita",
        a: "La cronologia resta solo sul dispositivo: non passa da un telefono all’altro e non è su iCloud. Eliminando l’app si elimina anche lei. Sul sito è nel browser, quindi cancellando i dati del sito o cambiando browser si riparte da zero. Non si sincronizza tra app e sito. Purtroppo non è possibile recuperarla.",
      },
      {
        q: "Ho trovato una risposta sbagliata",
        a: "Scrivici indicando la domanda esatta. Ogni dato è stato verificato su fonti affidabili, ma alcune regioni hanno capitali contese o condivise e gli errori sono possibili. Le correzioni sono benvenute e vengono applicate in fretta.",
      },
    ],
    contactTitle: "Contatti",
    contactBody: "Segnalazioni, correzioni e suggerimenti: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com).",
  },

  privacy: {
    title: "Informativa sulla privacy",
    updated: "Ultimo aggiornamento: 12 ottobre 2026",
    note: "Questa è una traduzione. Fa fede la [versione inglese](en:/privacy).",
    sections: [
      {
        blocks: [
          "**In breve.** Cartographer non raccoglie, trasmette né condivide dati personali. Non ci sono account, cookie, pubblicità né tracciamento tra siti. L’app per iPhone non si collega mai a internet. Il sito conta le visite e misura la velocità delle pagine con Cloudflare Web Analytics, che non registra identificativi personali; i risultati dei tuoi quiz non lasciano mai il tuo dispositivo.",
        ],
      },
      {
        title: "Cosa salva l’app",
        blocks: [
          "Cartographer salva quanto segue **solo sul tuo dispositivo**:",
          { list: ["La cronologia dei quiz: data, nome del quiz, difficoltà, punteggio e durata", "La serie giornaliera e i record delle prove a tempo", "Le impostazioni, come l’ultima difficoltà scelta"] },
          "Questi dati sono salvati localmente nel database di Apple sul dispositivo. Non vengono mai caricati, mai inviati a noi e mai condivisi con terzi. Non gestiamo server e non possiamo vederli.",
        ],
      },
      {
        title: "Sul sito",
        blocks: [
          "Il sito di Cartographer salva lo stesso tipo di informazioni nella memoria locale del browser, sul tuo dispositivo. Non vengono mai caricate. Il sito non usa cookie e non mostra pubblicità.",
          { heading: "Statistiche delle visite" },
          "Per sapere quante persone usano il sito e quanto velocemente si caricano le pagine, il sito usa [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/). Al caricamento di una pagina, un piccolo script di Cloudflare (static.cloudflareinsights.com) invia:",
          {
            list: [
              "l’indirizzo della pagina e, se presente, il sito che vi ha rimandato",
              "il tuo browser, il sistema operativo e il tipo di dispositivo",
              "il tuo paese, ricavato dall’indirizzo IP (l’indirizzo stesso non viene conservato)",
              "il tempo impiegato dalla pagina per caricarsi e apparire",
            ],
          },
          "Non usa cookie, non salva nulla sul dispositivo, non crea un’impronta del browser e non ti segue tra un sito e l’altro. Vediamo solo totali, come le visite al giorno o per paese, e non possiamo identificarti. Risposte, punteggi, serie e cronologia non vengono mai inviati. Vedi l’[informativa sulla privacy di Cloudflare](https://www.cloudflare.com/privacypolicy/).",
          { heading: "Hosting" },
          "Come ogni sito, le pagine sono servite da fornitori di hosting (attualmente Cloudflare, e GitHub Pages per una copia di questa informativa e della pagina di assistenza), i cui server possono registrare dati tecnici comuni come il tuo indirizzo IP. Noi non riceviamo né usiamo queste informazioni. Vedi l’[informativa sulla privacy di Cloudflare](https://www.cloudflare.com/privacypolicy/) e la [dichiarazione sulla privacy di GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).",
        ],
      },
      {
        title: "Il controllo è tuo",
        blocks: [
          {
            list: [
              "Il salvataggio è attivo per impostazione predefinita e si può disattivare in qualsiasi momento in **Impostazioni → Salva la cronologia**.",
              "Disattivandolo non vengono più salvati nuovi risultati e quelli esistenti restano.",
              "**Impostazioni → Elimina tutta la cronologia** cancella per sempre tutto ciò che è salvato.",
              "Eliminando l’app si cancella tutto dal dispositivo. Sul sito, cancellare i dati del sito nel browser ha lo stesso effetto.",
            ],
          },
        ],
      },
      {
        title: "Condivisione",
        blocks: [
          "Quando scegli di condividere un risultato o una serie, l’app passa un’immagine o una breve riga di testo al menu di condivisione di iOS; il sito usa il menu di condivisione del dispositivo o copia il testo da incollare. Quello che succede dopo riguarda te e l’app a cui lo invii. Cartographer non trasmette nulla di sua iniziativa.",
        ],
      },
      {
        title: "Minori",
        blocks: [
          "Cartographer è adatto a tutte le età e non raccoglie dati personali da nessuno, nemmeno da bambini sotto i 13 anni. Le statistiche delle visite descritte sopra sono anonime e uguali per tutti. Non ci sono pubblicità né acquisti in-app.",
        ],
      },
      {
        title: "Terze parti",
        blocks: [
          "L’app per iPhone non include SDK di terze parti, librerie di analisi né reti pubblicitarie. Il sito usa Cloudflare Web Analytics come descritto sopra, e nessun altro servizio di terze parti.",
        ],
      },
      {
        title: "Modifiche",
        blocks: ["Se questa informativa cambia, la nuova versione sarà pubblicata a questo indirizzo e la data in alto aggiornata."],
      },
      {
        title: "Contatti",
        blocks: ["Domande su questa informativa: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com)"],
      },
    ],
  },
};
