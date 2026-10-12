// GET /support → trang hỗ trợ (Support URL cho App Store)
import { renderPage, htmlResponse } from '@/lib/page';

// ⚠️ Dùng chung email với trang privacy
const CONTACT_EMAIL = 'support@ckk.biz';

const faq = [
  ['Woher kommen die Preise? / Where do the prices come from?',
    'Von der Markttransparenzstelle für Kraftstoffe (MTS-K) des Bundeskartellamts über Tankerkönig. / From the German Federal Cartel Office (MTS-K) via Tankerkönig.'],
  ['Wie aktuell sind die Preise? / How current are the prices?',
    'Tankstellen melden Preisänderungen in Echtzeit; die App zeigt Daten mit maximal ca. 5 Minuten Verzögerung. / Stations report changes in real time; the app shows data with up to ~5 minutes delay.'],
  ['Ein Preis ist falsch. / A price is wrong.',
    'Die Preise werden von den Tankstellen selbst gemeldet. Bitte schreiben Sie uns die Tankstelle und Uhrzeit. / Prices are reported by the stations themselves. Please email us the station and time.'],
  ['Warum braucht die App meinen Standort? / Why does the app need my location?',
    'Nur um Tankstellen in Ihrer Nähe zu finden. Der Standort wird nicht gespeichert. Alternativ können Sie nach Postleitzahl suchen. / Only to find nearby stations. It is never stored. You can also search by postal code.'],
];

const html = renderPage({
  title: 'Support – Fuel Price Service',
  description: 'Hilfe und Kontakt für die Fuel Price App. Help and contact for the Fuel Price app.',
  style: `
  main{max-width:760px;margin:48px auto;padding:40px;width:calc(100% - 32px)}
  h1{font-size:32px;font-weight:700;margin-bottom:8px}
  .lead{color:#a9adc9;font-weight:300;margin-bottom:28px}
  .contact{display:flex;align-items:center;gap:16px;padding:20px 24px;border-radius:16px;margin-bottom:36px;
    background:linear-gradient(135deg,rgba(255,138,61,.15),rgba(255,61,127,.15));border:1px solid rgba(255,178,107,.3)}
  .contact span{font-size:32px}
  .contact strong{display:block;margin-bottom:2px}
  .btn{margin-left:auto;padding:10px 18px;border-radius:999px;font-weight:500;color:#0b0d1a;
    background:linear-gradient(90deg,#ffb26b,#ff5c93);transition:transform .2s,box-shadow .2s;white-space:nowrap}
  .btn:hover{color:#0b0d1a;transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,92,147,.4)}
  h2{font-size:22px;margin-bottom:16px}
  details{border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
    margin-bottom:10px;transition:background .2s}
  details:hover{background:rgba(255,255,255,.07)}
  summary{cursor:pointer;padding:16px 20px;font-weight:500;list-style:none}
  summary::after{content:'+';float:right;color:#ffb26b;transition:transform .2s}
  details[open] summary::after{transform:rotate(45deg)}
  details p{padding:0 20px 16px;color:#c9cce3;font-weight:300;line-height:1.7}
  footer{text-align:center;margin-top:32px}
  @media(max-width:560px){.contact{flex-wrap:wrap}.btn{margin-left:0}}
  `,
  body: `
<main class="card">
  <h1 class="grad">Support</h1>
  <p class="lead">Fragen, Feedback oder Probleme mit der App? Wir helfen gern.<br>Questions, feedback or issues with the app? We're happy to help.</p>

  <div class="contact">
    <span>✉️</span>
    <div><strong>E-Mail</strong>${CONTACT_EMAIL}</div>
    <a id="contact-btn" class="btn" href="mailto:${CONTACT_EMAIL}?subject=Fuel%20Price%20App%20Support">Kontakt / Contact</a>
  </div>

  <h2>FAQ</h2>
  ${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n  ')}

  <footer>
    <a id="home-link" href="/">Home</a> ·
    <a id="privacy-link" href="/privacy">Datenschutz / Privacy</a> ·
    Data: <a href="https://creativecommons.tankerkoenig.de" target="_blank" rel="noopener">Tankerkönig</a> (CC BY 4.0)
  </footer>
</main>`,
});

export function GET() {
  return htmlResponse(html);
}
