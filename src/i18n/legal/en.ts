// The Support and Privacy pages. English is the authoritative version of the
// privacy policy; translations say so in `privacy.note`.
//
// Text may use **bold** and [links](url). A url starting with "/" is a page on
// this site, in the reader's language.

export type Block = string | { list: string[] } | { heading: string };

export interface LegalText {
  support: {
    title: string;
    intro: string;
    dataTitle: string;
    dataBody: string;
    faqTitle: string;
    faq: { q: string; a: string }[];
    contactTitle: string;
    contactBody: string;
  };
  privacy: {
    title: string;
    updated: string;
    /** For translations: the English version is authoritative. */
    note?: string;
    sections: { title?: string; blocks: Block[] }[];
  };
}

export const CONTACT = "cartographer.quiz@gmail.com";

export const en: LegalText = {
  support: {
    title: "Support",
    intro: "Cartographer is a daily world geography quiz for iPhone and the web. [Play in your browser →](/)",
    dataTitle: "Everything stays on your device",
    dataBody:
      "No account, no sign-up, no cookies, no ads. The iPhone app makes no network requests at all. The website keeps your results in your browser only, and counts visits with cookie-free Cloudflare Web Analytics, which can’t identify you. See the [privacy policy](/privacy).",
    faqTitle: "Frequently asked",
    faq: [
      {
        q: "What can I play?",
        a: "Sixty quizzes: world and continental capitals, the states, provinces and regions of over forty countries, rivers, mountains, seas and islands, plus Random Mix, How Many Regions?, Spot the Region and a Speed Run. The website also has two flag quizzes, and flag questions turn up in its mixes. Every quiz has a [study list](/learn) too.",
      },
      {
        q: "How does the Daily Challenge work?",
        a: "Everyone gets the same ten mixed questions each day at Navigator level (20 seconds each), and you get one attempt. The puzzle is generated from the date itself, so it needs no server. Your result comes with a spoiler-free grid you can share anywhere. The app and the website each have their own daily puzzle.",
      },
      {
        q: "What’s the difference between the three levels?",
        a: "The level you pick applies to every quiz. **Explorer** asks about well-known places, untimed, with four options. **Navigator** widens the net, adds a fifth option and a 20-second clock. **Cartographer** draws from the most obscure entries, offers six options and gives you 12 seconds — and the wrong answers get closer to the right one.",
      },
      {
        q: "Can I stop the app recording my results?",
        a: "Yes. **Settings → Record quiz history** turns it off, in the app and on the website. Existing results are kept until you choose **Delete All History**, which erases them permanently.",
      },
      {
        q: "I lost my streak / my history disappeared",
        a: "History lives only on the device, so it doesn’t transfer between phones and isn’t in iCloud. Deleting the app deletes it. On the website it lives in your browser, so clearing site data or switching browsers starts you fresh. It doesn’t sync between the app and the website. There’s no way to recover it — sorry.",
      },
      {
        q: "I found a wrong answer",
        a: "Please tell us, with the exact question. Every fact was checked against authoritative sources, but a few regions have genuinely contested or shared capitals, and errors are possible. Corrections are welcome and get fixed quickly.",
      },
    ],
    contactTitle: "Contact",
    contactBody: "Bug reports, corrections and suggestions: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com).",
  },

  privacy: {
    title: "Privacy Policy",
    updated: "Last updated 12 October 2026",
    sections: [
      {
        blocks: [
          "**The short version.** Cartographer does not collect, transmit, or share any personal data. There are no accounts, no cookies, no advertising, and no tracking across websites. The iPhone app does not connect to the internet at all. The website counts visits and measures page speed with Cloudflare Web Analytics, which records no personal identifiers; your quiz results never leave your device.",
        ],
      },
      {
        title: "What the app stores",
        blocks: [
          "Cartographer saves the following **only on your device**:",
          { list: ["Your quiz history: date, quiz name, difficulty, score, and duration", "Your daily streak and Speed Run best times", "Your settings, such as the difficulty you last chose"] },
          "This is stored locally using Apple’s on-device database. It is never uploaded, never sent to us, and never shared with a third party. We operate no servers and have no way to see it.",
        ],
      },
      {
        title: "On the website",
        blocks: [
          "The Cartographer website stores the same kinds of information, in your browser’s local storage, on your device. It is never uploaded. The site uses no cookies and shows no ads.",
          { heading: "Visit statistics" },
          "To see how many people use the site and how quickly its pages load, the website uses [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/). When a page loads, a small script from Cloudflare (static.cloudflareinsights.com) reports:",
          {
            list: [
              "the address of the page and the site that linked to it, if any",
              "your browser, operating system and type of device",
              "your country, worked out from your IP address (the address itself isn’t stored)",
              "how long the page took to load and display",
            ],
          },
          "It sets no cookies, stores nothing on your device, doesn’t fingerprint your browser and doesn’t follow you across websites. We only see totals, such as visits per day or per country, and cannot identify you. Your quiz answers, scores, streaks and history are never sent. See [Cloudflare’s privacy policy](https://www.cloudflare.com/privacypolicy/).",
          { heading: "Hosting" },
          "Like any website, the pages are delivered by hosting providers (currently Cloudflare, and GitHub Pages for a copy of this policy and the support page), whose servers may record standard technical details such as your IP address when you load them. We don’t receive or use that information. See [Cloudflare’s privacy policy](https://www.cloudflare.com/privacypolicy/) and [GitHub’s privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).",
        ],
      },
      {
        title: "Your control over it",
        blocks: [
          {
            list: [
              "Recording is on by default and can be switched off at any time in **Settings → Record quiz history**.",
              "Turning it off stops new results being saved and leaves existing ones intact.",
              "**Settings → Delete All History** permanently removes everything stored.",
              "Deleting the app removes all of it from your device. On the website, clearing this site’s data in your browser does the same.",
            ],
          },
        ],
      },
      {
        title: "Sharing",
        blocks: [
          "When you choose to share a result or a streak, the app hands an image or a short line of text to the iOS share sheet; the website uses your device’s share sheet or copies the text for you to paste. What happens after that is between you and the app you send it to. Cartographer transmits nothing on its own.",
        ],
      },
      {
        title: "Children",
        blocks: [
          "Cartographer is suitable for all ages and collects no personal data from anyone, including children under 13. The website’s visit statistics described above are anonymous and the same for everyone. There is no advertising and there are no in-app purchases.",
        ],
      },
      {
        title: "Third parties",
        blocks: [
          "The iPhone app includes no third-party SDKs, no analytics libraries, and no advertising networks. The website uses Cloudflare Web Analytics as described above, and no other third-party services.",
        ],
      },
      {
        title: "Changes",
        blocks: ["If this policy changes, the updated version will be posted at this address and the date above revised."],
      },
      {
        title: "Contact",
        blocks: ["Questions about this policy: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com)"],
      },
    ],
  },
};
