import type { LegalText } from "./en";

export const fr: LegalText = {
  support: {
    title: "Assistance",
    intro: "Cartographer est un quiz quotidien de géographie mondiale pour iPhone et le Web. [Jouer dans votre navigateur →](/)",
    dataTitle: "Tout reste sur votre appareil",
    dataBody:
      "Pas de compte, pas d’inscription, pas de cookies, pas de publicité. L’app iPhone ne fait aucune connexion réseau. Le site garde vos résultats uniquement dans votre navigateur et compte les visites avec Cloudflare Web Analytics, sans cookies, qui ne peut pas vous identifier. Voir la [politique de confidentialité](/privacy).",
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "À quoi puis-je jouer ?",
        a: "Soixante quiz : capitales du monde et des continents, États, provinces et régions de plus de quarante pays, fleuves, montagnes, mers et îles, plus Mélange aléatoire, Combien de régions ?, Trouvez la région et Contre-la-montre. Le site propose aussi deux quiz de drapeaux, et des questions de drapeaux apparaissent dans ses mélanges. Chaque quiz a sa [liste à étudier](/learn).",
      },
      {
        q: "Comment fonctionne le Défi du jour ?",
        a: "Chaque jour, tout le monde reçoit les mêmes dix questions variées au niveau Navigateur (20 secondes chacune), et vous n’avez qu’une tentative. Le quiz est créé à partir de la date, il n’a donc besoin d’aucun serveur. Votre résultat s’accompagne d’une grille sans spoiler à partager partout. L’app et le site ont chacun leur propre défi du jour.",
      },
      {
        q: "Quelle est la différence entre les trois niveaux ?",
        a: "Le niveau choisi s’applique à tous les quiz. **Explorateur** porte sur des lieux connus, sans chrono, avec quatre réponses. **Navigateur** élargit le choix, ajoute une cinquième réponse et un chrono de 20 secondes. **Cartographe** puise dans les lieux les plus méconnus, propose six réponses et 12 secondes — et les mauvaises réponses ressemblent davantage à la bonne.",
      },
      {
        q: "Puis-je empêcher l’enregistrement de mes résultats ?",
        a: "Oui. **Réglages → Enregistrer l’historique** le désactive, dans l’app et sur le site. Les résultats existants sont conservés jusqu’à ce que vous choisissiez **Effacer tout l’historique**, qui les supprime définitivement.",
      },
      {
        q: "J’ai perdu ma série / mon historique a disparu",
        a: "L’historique reste uniquement sur l’appareil : il ne passe pas d’un téléphone à l’autre et n’est pas dans iCloud. Supprimer l’app le supprime. Sur le site, il est dans votre navigateur : effacer les données du site ou changer de navigateur repart de zéro. Il n’est pas synchronisé entre l’app et le site. Il est malheureusement impossible de le récupérer.",
      },
      {
        q: "J’ai trouvé une erreur",
        a: "Écrivez-nous en précisant la question exacte. Chaque information a été vérifiée auprès de sources fiables, mais quelques régions ont des capitales contestées ou partagées, et des erreurs restent possibles. Les corrections sont bienvenues et rapidement intégrées.",
      },
    ],
    contactTitle: "Contact",
    contactBody: "Bugs, corrections et suggestions : [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com).",
  },

  privacy: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : 12 octobre 2026",
    note: "Ceci est une traduction. La [version anglaise](en:/privacy) fait foi.",
    sections: [
      {
        blocks: [
          "**En bref.** Cartographer ne collecte, ne transmet et ne partage aucune donnée personnelle. Il n’y a ni compte, ni cookie, ni publicité, ni suivi d’un site à l’autre. L’app iPhone ne se connecte jamais à Internet. Le site compte les visites et mesure la vitesse des pages avec Cloudflare Web Analytics, qui n’enregistre aucun identifiant personnel ; vos résultats ne quittent jamais votre appareil.",
        ],
      },
      {
        title: "Ce que l’app enregistre",
        blocks: [
          "Cartographer enregistre les éléments suivants **uniquement sur votre appareil** :",
          { list: ["Votre historique : date, nom du quiz, difficulté, score et durée", "Votre série quotidienne et vos records de Contre-la-montre", "Vos réglages, comme la dernière difficulté choisie"] },
          "Ces données sont stockées localement dans la base de données d’Apple sur l’appareil. Elles ne sont jamais téléversées, jamais envoyées et jamais partagées avec un tiers. Nous n’exploitons aucun serveur et ne pouvons pas les consulter.",
        ],
      },
      {
        title: "Sur le site Web",
        blocks: [
          "Le site Cartographer enregistre les mêmes types d’informations dans le stockage local de votre navigateur, sur votre appareil. Elles ne sont jamais téléversées. Le site n’utilise pas de cookies et n’affiche pas de publicité.",
          { heading: "Statistiques de visite" },
          "Pour savoir combien de personnes utilisent le site et à quelle vitesse ses pages se chargent, le site utilise [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/). Au chargement d’une page, un petit script de Cloudflare (static.cloudflareinsights.com) transmet :",
          {
            list: [
              "l’adresse de la page et, le cas échéant, le site qui y renvoie",
              "votre navigateur, votre système d’exploitation et votre type d’appareil",
              "votre pays, déduit de votre adresse IP (l’adresse elle-même n’est pas conservée)",
              "le temps de chargement et d’affichage de la page",
            ],
          },
          "Il ne dépose aucun cookie, n’enregistre rien sur votre appareil, ne crée pas d’empreinte de votre navigateur et ne vous suit pas d’un site à l’autre. Nous ne voyons que des totaux, comme les visites par jour ou par pays, et ne pouvons pas vous identifier. Vos réponses, scores, séries et historique ne sont jamais envoyés. Voir la [politique de confidentialité de Cloudflare](https://www.cloudflare.com/privacypolicy/).",
          { heading: "Hébergement" },
          "Comme tout site Web, les pages sont servies par des hébergeurs (actuellement Cloudflare, ainsi que GitHub Pages pour une copie de cette politique et de la page d’assistance), dont les serveurs peuvent enregistrer des informations techniques courantes comme votre adresse IP. Nous ne recevons ni n’utilisons ces informations. Voir la [politique de confidentialité de Cloudflare](https://www.cloudflare.com/privacypolicy/) et la [déclaration de confidentialité de GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).",
        ],
      },
      {
        title: "Vos choix",
        blocks: [
          {
            list: [
              "L’enregistrement est activé par défaut et peut être désactivé à tout moment dans **Réglages → Enregistrer l’historique**.",
              "Le désactiver empêche l’enregistrement de nouveaux résultats et conserve les existants.",
              "**Réglages → Effacer tout l’historique** supprime définitivement tout ce qui est enregistré.",
              "Supprimer l’app efface tout de votre appareil. Sur le site, effacer les données du site dans votre navigateur a le même effet.",
            ],
          },
        ],
      },
      {
        title: "Partage",
        blocks: [
          "Quand vous choisissez de partager un résultat ou une série, l’app transmet une image ou une courte ligne de texte à la feuille de partage d’iOS ; le site utilise la feuille de partage de votre appareil ou copie le texte pour que vous le colliez. La suite se passe entre vous et l’app destinataire. Cartographer ne transmet rien de lui-même.",
        ],
      },
      {
        title: "Enfants",
        blocks: [
          "Cartographer convient à tous les âges et ne collecte aucune donnée personnelle, y compris auprès des enfants de moins de 13 ans. Les statistiques de visite du site décrites plus haut sont anonymes et identiques pour tous. Il n’y a ni publicité ni achat intégré.",
        ],
      },
      {
        title: "Services tiers",
        blocks: [
          "L’app iPhone n’intègre aucun SDK tiers, aucune bibliothèque d’analyse et aucune régie publicitaire. Le site utilise Cloudflare Web Analytics comme décrit plus haut, et aucun autre service tiers.",
        ],
      },
      {
        title: "Modifications",
        blocks: ["Si cette politique change, la nouvelle version sera publiée à cette adresse et la date ci-dessus mise à jour."],
      },
      {
        title: "Contact",
        blocks: ["Questions sur cette politique : [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com)"],
      },
    ],
  },
};
