import type { LegalText } from "./en";

export const tl: LegalText = {
  support: {
    title: "Tulong",
    intro: "Ang Cartographer ay araw-araw na quiz sa heograpiya ng mundo para sa iPhone at sa web. [Maglaro sa browser →](/)",
    dataTitle: "Nasa device mo lang ang lahat",
    dataBody:
      "Walang account, walang pag-sign up, walang cookie, walang ads. Hindi kumokonekta sa internet ang iPhone app. Sa browser mo lang naka-save ang mga resulta mo sa website, at binibilang nito ang mga bisita gamit ang Cloudflare Web Analytics, na walang cookie at hindi ka makikilala. Tingnan ang [patakaran sa pagkapribado](/privacy).",
    faqTitle: "Mga madalas itanong",
    faq: [
      {
        q: "Ano ang puwede kong laruin?",
        a: "Animnapung quiz: mga kabisera ng mundo at ng bawat kontinente, mga estado, lalawigan at rehiyon ng mahigit apatnapung bansa, mga ilog, bundok, dagat at isla, at Halo-halong Tanong, Ilan ang Rehiyon?, Hanapin ang Rehiyon at Karera sa Oras. May dalawa pang quiz sa watawat ang website, at may mga tanong tungkol sa watawat sa mga halo nito. May [listahang pag-aaralan](/learn) ang bawat quiz.",
      },
      {
        q: "Paano gumagana ang Hamon Ngayong Araw?",
        a: "Araw-araw, pare-pareho ang sampung halo-halong tanong ng lahat sa antas na Nabigador (20 segundo bawat isa), at isang beses ka lang puwedeng sumubok. Mula sa petsa ginagawa ang hamon, kaya hindi kailangan ng server. Kasama ng resulta mo ang isang grid na walang spoiler na puwede mong i-share kahit saan. May kanya-kanyang hamon ang app at ang website.",
      },
      {
        q: "Ano ang pagkakaiba ng tatlong antas?",
        a: "Ang antas na pinili mo ay para sa lahat ng quiz. Ang **Manlalakbay** ay nagtatanong tungkol sa mga kilalang lugar, walang orasan, at may apat na pagpipilian. Mas malawak ang **Nabigador**, may ikalimang pagpipilian at 20 segundo. Kinukuha ng **Kartograpo** ang mga hindi gaanong kilala, may anim na pagpipilian at 12 segundo — at mas kahawig ng tamang sagot ang mga maling pagpipilian.",
      },
      {
        q: "Puwede bang huwag i-save ang mga resulta ko?",
        a: "Oo. Sa app at sa website, pinapatay ito ng **Mga Setting → Itala ang kasaysayan ng quiz**. Mananatili ang mga dating resulta hanggang piliin mo ang **Burahin ang Buong Kasaysayan**, na permanenteng magbubura sa mga ito.",
      },
      {
        q: "Nawala ang sunod-sunod kong araw / ang kasaysayan ko",
        a: "Sa device lang naka-save ang kasaysayan, kaya hindi ito lumilipat sa ibang telepono at wala sa iCloud. Kapag binura ang app, mabubura rin ito. Sa website, nasa browser mo ito, kaya kapag binura mo ang data ng site o lumipat ka ng browser, magsisimula ka ulit. Hindi ito naka-sync sa pagitan ng app at website. Pasensya na, hindi na ito maibabalik.",
      },
      {
        q: "May nakita akong maling sagot",
        a: "Pakisabi sa amin kung aling tanong. Sinuri ang bawat impormasyon sa mga mapagkakatiwalaang sanggunian, pero may ilang rehiyon na pinagtatalunan o pinaghahatian ang kabisera, kaya posibleng may mali. Malugod naming tinatanggap ang mga pagtatama at mabilis itong naaayos.",
      },
    ],
    contactTitle: "Makipag-ugnayan",
    contactBody: "Mga ulat ng bug, pagtatama at mungkahi: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com).",
  },

  privacy: {
    title: "Patakaran sa Pagkapribado",
    updated: "Huling na-update: Oktubre 12, 2026",
    note: "Isa itong salin. Ang [bersyong Ingles](en:/privacy) ang masusunod.",
    sections: [
      {
        blocks: [
          "**Sa madaling salita.** Hindi nangongolekta, nagpapadala o nagbabahagi ng anumang personal na datos ang Cartographer. Walang account, walang cookie, walang ads, at walang pagsubaybay sa iba't ibang website. Hindi kumokonekta sa internet ang iPhone app. Binibilang ng website ang mga bisita at sinusukat ang bilis ng mga pahina gamit ang Cloudflare Web Analytics, na hindi nagtatala ng anumang personal na pagkakakilanlan; hindi kailanman umaalis sa device mo ang mga resulta mo sa quiz.",
        ],
      },
      {
        title: "Ano ang sine-save ng app",
        blocks: [
          "Sine-save ng Cartographer ang mga sumusunod **sa device mo lang**:",
          { list: ["Kasaysayan ng quiz: petsa, pangalan ng quiz, antas ng hirap, puntos at tagal", "Ang sunod-sunod mong araw at pinakamabilis mong oras sa Karera sa Oras", "Ang mga setting mo, gaya ng huling pinili mong antas"] },
          "Naka-save ito sa database ng Apple sa device. Hindi ito kailanman ina-upload, ipinapadala sa amin, o ibinabahagi sa iba. Wala kaming server at hindi namin ito nakikita.",
        ],
      },
      {
        title: "Sa website",
        blocks: [
          "Sine-save ng website ng Cartographer ang parehong uri ng impormasyon sa local storage ng browser mo, sa device mo. Hindi ito kailanman ina-upload. Walang cookie at walang ads ang website.",
          { heading: "Istatistika ng mga bisita" },
          "Para malaman kung ilan ang gumagamit ng site at gaano kabilis mag-load ang mga pahina, gumagamit ang website ng [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/). Kapag nag-load ang isang pahina, iniuulat ng maliit na script mula sa Cloudflare (static.cloudflareinsights.com) ang:",
          {
            list: [
              "address ng pahina at ang site na nag-link dito, kung mayroon",
              "ang browser, operating system at uri ng device mo",
              "ang bansa mo, batay sa IP address mo (hindi sine-save ang mismong address)",
              "gaano katagal nag-load at lumabas ang pahina",
            ],
          },
          "Hindi ito gumagamit ng cookie, walang sine-save sa device mo, hindi gumagawa ng fingerprint ng browser mo, at hindi ka sinusundan sa ibang website. Mga kabuuan lang ang nakikita namin, gaya ng bisita bawat araw o bawat bansa, at hindi ka namin makikilala. Hindi kailanman ipinapadala ang mga sagot, puntos, sunod-sunod na araw at kasaysayan mo. Tingnan ang [patakaran sa pagkapribado ng Cloudflare](https://www.cloudflare.com/privacypolicy/).",
          { heading: "Hosting" },
          "Gaya ng anumang website, inihahatid ang mga pahina ng mga hosting provider (sa ngayon ay Cloudflare, at GitHub Pages para sa kopya ng patakarang ito at ng pahina ng tulong), na maaaring magtala ng karaniwang teknikal na detalye gaya ng IP address mo. Hindi namin natatanggap o ginagamit ang impormasyong iyon. Tingnan ang [patakaran sa pagkapribado ng Cloudflare](https://www.cloudflare.com/privacypolicy/) at ang [pahayag sa pagkapribado ng GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).",
        ],
      },
      {
        title: "Ikaw ang may kontrol",
        blocks: [
          {
            list: [
              "Naka-on ang pagtatala bilang default at puwede itong i-off anumang oras sa **Mga Setting → Itala ang kasaysayan ng quiz**.",
              "Kapag naka-off, hindi na sine-save ang mga bagong resulta at nananatili ang mga dati.",
              "Permanenteng binubura ng **Mga Setting → Burahin ang Buong Kasaysayan** ang lahat ng naka-save.",
              "Kapag binura ang app, mabubura ang lahat sa device mo. Sa website, ganoon din ang epekto ng pagbura sa data ng site na ito sa browser mo.",
            ],
          },
        ],
      },
      {
        title: "Pagbabahagi",
        blocks: [
          "Kapag pinili mong i-share ang isang resulta o ang sunod-sunod mong araw, ibinibigay ng app ang isang larawan o maikling teksto sa share sheet ng iOS; ginagamit naman ng website ang share sheet ng device mo o kinokopya ang teksto para i-paste mo. Ang susunod na mangyayari ay nasa pagitan mo at ng app na pinadalhan mo. Walang ipinapadala ang Cartographer nang kusa.",
        ],
      },
      {
        title: "Mga bata",
        blocks: [
          "Angkop ang Cartographer sa lahat ng edad at hindi ito nangongolekta ng personal na datos mula kaninuman, kasama ang mga batang wala pang 13 taong gulang. Hindi nagpapakilala at pareho para sa lahat ang istatistika ng mga bisita na inilarawan sa itaas. Walang ads at walang in-app purchase.",
        ],
      },
      {
        title: "Mga third party",
        blocks: ["Walang third-party SDK, analytics library o ad network ang iPhone app. Cloudflare Web Analytics lang ang ginagamit ng website, gaya ng inilarawan sa itaas, at walang iba pang serbisyo ng third party."],
      },
      {
        title: "Mga pagbabago",
        blocks: ["Kapag nagbago ang patakarang ito, ipo-post ang bagong bersyon sa address na ito at babaguhin ang petsa sa itaas."],
      },
      {
        title: "Makipag-ugnayan",
        blocks: ["Mga tanong tungkol sa patakarang ito: [cartographer.quiz@gmail.com](mailto:cartographer.quiz@gmail.com)"],
      },
    ],
  },
};
