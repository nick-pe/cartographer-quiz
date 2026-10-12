import type { LegalText } from "./en";

export const de: LegalText = {
  support: {
    title: "Hilfe",
    intro: "Cartographer ist ein tägliches Weltgeografie-Quiz für iPhone und Web. [Jetzt im Browser spielen →](/)",
    dataTitle: "Alles bleibt auf deinem Gerät",
    dataBody:
      "Kein Konto, keine Anmeldung, keine Cookies, keine Werbung. Die iPhone-App stellt überhaupt keine Netzwerkverbindungen her. Die Website speichert deine Ergebnisse nur in deinem Browser und zählt Besuche mit dem cookiefreien Cloudflare Web Analytics, das dich nicht identifizieren kann. Siehe [Datenschutzerklärung](/privacy).",
    faqTitle: "Häufige Fragen",
    faq: [
      {
        q: "Was kann ich spielen?",
        a: "Sechzig Quiz: Hauptstädte der Welt und der Kontinente, die Bundesstaaten, Provinzen und Regionen von über vierzig Ländern, Flüsse, Berge, Meere und Inseln, dazu Zufallsmix, „Wie viele Regionen?“, „Finde die Region“ und Speedrun. Die Website hat außerdem zwei Flaggen-Quiz, und Flaggenfragen kommen auch in den Mixen vor. Zu jedem Quiz gibt es eine [Lernliste](/learn).",
      },
      {
        q: "Wie funktioniert das Tagesquiz?",
        a: "Alle bekommen jeden Tag dieselben zehn gemischten Fragen auf Stufe Navigator (20 Sekunden pro Frage), und du hast einen Versuch. Das Rätsel wird aus dem Datum erzeugt und braucht deshalb keinen Server. Dein Ergebnis bekommst du als spoilerfreies Raster, das du überall teilen kannst. App und Website haben jeweils ihr eigenes Tagesquiz.",
      },
      {
        q: "Was unterscheidet die drei Stufen?",
        a: "Die gewählte Stufe gilt für alle Quiz. **Entdecker** fragt nach bekannten Orten, ohne Zeitlimit, mit vier Antworten. **Navigator** fragt breiter, mit fünf Antworten und 20 Sekunden. **Kartograf** nimmt die unbekanntesten Einträge, bietet sechs Antworten und 12 Sekunden – und die falschen Antworten liegen näher an der richtigen.",
      },
      {
        q: "Kann ich das Speichern meiner Ergebnisse abschalten?",
        a: "Ja. **Einstellungen → Quiz-Verlauf speichern** schaltet es aus, in der App und auf der Website. Bisherige Ergebnisse bleiben erhalten, bis du **Gesamten Verlauf löschen** wählst; dann werden sie endgültig gelöscht.",
      },
      {
        q: "Meine Serie / mein Verlauf ist weg",
        a: "Der Verlauf liegt nur auf dem Gerät, wird also nicht zwischen Telefonen übertragen und ist nicht in iCloud. Wenn du die App löschst, ist er weg. Auf der Website liegt er in deinem Browser: Websitedaten löschen oder den Browser wechseln heißt neu anfangen. App und Website synchronisieren nicht miteinander. Wiederherstellen lässt er sich leider nicht.",
      },
      {
        q: "Ich habe eine falsche Antwort gefunden",
        a: "Bitte schreib uns mit der genauen Frage. Alle Fakten wurden mit verlässlichen Quellen geprüft, aber einige Regionen haben umstrittene oder geteilte Hauptstädte, und Fehler sind möglich. Korrekturen sind willkommen und werden schnell eingearbeitet.",
      },
    ],
    contactTitle: "Kontakt",
    contactBody: "Fehlermeldungen, Korrekturen und Vorschläge: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com).",
  },

  privacy: {
    title: "Datenschutzerklärung",
    updated: "Zuletzt aktualisiert am 12. Oktober 2026",
    note: "Dies ist eine Übersetzung. Maßgeblich ist die [englische Fassung](en:/privacy).",
    sections: [
      {
        blocks: [
          "**Kurz gesagt.** Cartographer erhebt, überträgt und teilt keine personenbezogenen Daten. Es gibt keine Konten, keine Cookies, keine Werbung und kein websiteübergreifendes Tracking. Die iPhone-App verbindet sich überhaupt nicht mit dem Internet. Die Website zählt Besuche und misst die Ladezeit mit Cloudflare Web Analytics, das keine persönlichen Kennungen speichert; deine Quiz-Ergebnisse verlassen nie dein Gerät.",
        ],
      },
      {
        title: "Was die App speichert",
        blocks: [
          "Cartographer speichert Folgendes **nur auf deinem Gerät**:",
          { list: ["Deinen Quiz-Verlauf: Datum, Quizname, Schwierigkeit, Punktzahl und Dauer", "Deine Tagesserie und deine Speedrun-Bestzeiten", "Deine Einstellungen, etwa die zuletzt gewählte Schwierigkeit"] },
          "Das wird lokal in Apples Datenbank auf dem Gerät gespeichert. Es wird nie hochgeladen, nie an uns gesendet und nie mit Dritten geteilt. Wir betreiben keine Server und können es nicht einsehen.",
        ],
      },
      {
        title: "Auf der Website",
        blocks: [
          "Die Cartographer-Website speichert dieselben Arten von Informationen im lokalen Speicher deines Browsers, auf deinem Gerät. Sie werden nie hochgeladen. Die Website verwendet keine Cookies und zeigt keine Werbung.",
          { heading: "Besuchsstatistik" },
          "Um zu sehen, wie viele Menschen die Website nutzen und wie schnell die Seiten laden, verwendet die Website [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/). Beim Laden einer Seite meldet ein kleines Skript von Cloudflare (static.cloudflareinsights.com):",
          {
            list: [
              "die Adresse der Seite und, falls vorhanden, die Website, die darauf verlinkt hat",
              "deinen Browser, dein Betriebssystem und deinen Gerätetyp",
              "dein Land, ermittelt aus deiner IP-Adresse (die Adresse selbst wird nicht gespeichert)",
              "wie lange die Seite zum Laden und Anzeigen gebraucht hat",
            ],
          },
          "Es setzt keine Cookies, speichert nichts auf deinem Gerät, erstellt keinen Browser-Fingerabdruck und verfolgt dich nicht über Websites hinweg. Wir sehen nur Summen, etwa Besuche pro Tag oder pro Land, und können dich nicht identifizieren. Deine Antworten, Punkte, Serien und dein Verlauf werden nie gesendet. Siehe [Datenschutzerklärung von Cloudflare](https://www.cloudflare.com/privacypolicy/).",
          { heading: "Hosting" },
          "Wie bei jeder Website werden die Seiten von Hosting-Anbietern ausgeliefert (derzeit Cloudflare sowie GitHub Pages für eine Kopie dieser Erklärung und der Hilfeseite). Deren Server können beim Abruf übliche technische Angaben wie deine IP-Adresse protokollieren. Wir erhalten und nutzen diese Angaben nicht. Siehe [Datenschutzerklärung von Cloudflare](https://www.cloudflare.com/privacypolicy/) und [Datenschutzerklärung von GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).",
        ],
      },
      {
        title: "Deine Kontrolle darüber",
        blocks: [
          {
            list: [
              "Das Speichern ist standardmäßig an und lässt sich jederzeit unter **Einstellungen → Quiz-Verlauf speichern** ausschalten.",
              "Ausschalten verhindert, dass neue Ergebnisse gespeichert werden; bestehende bleiben erhalten.",
              "**Einstellungen → Gesamten Verlauf löschen** entfernt alles Gespeicherte endgültig.",
              "Wenn du die App löschst, ist alles von deinem Gerät entfernt. Auf der Website bewirkt das Löschen der Websitedaten im Browser dasselbe.",
            ],
          },
        ],
      },
      {
        title: "Teilen",
        blocks: [
          "Wenn du ein Ergebnis oder eine Serie teilst, übergibt die App ein Bild oder eine kurze Textzeile an das Teilen-Menü von iOS; die Website nutzt das Teilen-Menü deines Geräts oder kopiert den Text zum Einfügen. Was danach geschieht, liegt bei dir und der App, an die du es sendest. Cartographer überträgt von sich aus nichts.",
        ],
      },
      {
        title: "Kinder",
        blocks: [
          "Cartographer ist für alle Altersgruppen geeignet und erhebt von niemandem personenbezogene Daten, auch nicht von Kindern unter 13 Jahren. Die oben beschriebene Besuchsstatistik ist anonym und für alle gleich. Es gibt keine Werbung und keine In-App-Käufe.",
        ],
      },
      {
        title: "Drittanbieter",
        blocks: [
          "Die iPhone-App enthält keine Drittanbieter-SDKs, keine Analyse-Bibliotheken und keine Werbenetzwerke. Die Website verwendet Cloudflare Web Analytics wie oben beschrieben und keine weiteren Dienste von Drittanbietern.",
        ],
      },
      {
        title: "Änderungen",
        blocks: ["Wenn sich diese Erklärung ändert, wird die neue Fassung unter dieser Adresse veröffentlicht und das Datum oben angepasst."],
      },
      {
        title: "Kontakt",
        blocks: ["Fragen zu dieser Erklärung: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com)"],
      },
    ],
  },
};
