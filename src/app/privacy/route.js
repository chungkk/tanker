// GET /privacy → Datenschutzerklärung / Privacy Policy
import { renderPage, htmlResponse } from '@/lib/page';

// ⚠️ Sửa thông tin liên hệ cho đúng trước khi công khai
const CONTACT_EMAIL = 'support@ckk.biz';
const LAST_UPDATED = '12.10.2026';

const html = renderPage({
  title: 'Datenschutzerklärung / Privacy Policy – Fuel Price Service',
  description: 'Datenschutzerklärung und Privacy Policy des Fuel Price Service.',
  style: `
  main{max-width:760px;margin:48px auto;padding:40px;width:calc(100% - 32px)}
  h1{font-size:32px;font-weight:700;margin-bottom:6px}
  .meta{color:#8f93b8;font-size:14px;margin-bottom:24px}
  nav.lang{display:flex;gap:8px;margin-bottom:32px}
  nav.lang a{padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.07);
    border:1px solid rgba(255,255,255,.1);color:#e8eaf6;font-size:14px}
  nav.lang a:hover{background:rgba(255,178,107,.15);color:#ffb26b}
  section{margin-bottom:40px}
  h2{font-size:22px;font-weight:700;margin:8px 0 16px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.1)}
  h3{font-size:16px;font-weight:500;color:#ffb26b;margin:22px 0 8px}
  p,li{font-weight:300;line-height:1.7;color:#c9cce3}
  ul{padding-left:20px}
  footer{text-align:center;margin-top:16px}
  `,
  body: `
<main class="card">
  <h1 class="grad">Datenschutz / Privacy</h1>
  <p class="meta">Stand / Last updated: ${LAST_UPDATED}</p>
  <nav class="lang">
    <a id="lang-de" href="#de">🇩🇪 Deutsch</a>
    <a id="lang-en" href="#en">🇬🇧 English</a>
  </nav>

  <section id="de" lang="de">
    <h2>Datenschutzerklärung</h2>

    <h3>1. Verantwortlicher</h3>
    <p>Verantwortlich für die Datenverarbeitung ist der Betreiber dieses Dienstes.
      Kontakt: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>

    <h3>2. Welche Daten verarbeitet werden</h3>
    <ul>
      <li><strong>Standortdaten:</strong> Wenn Sie in der App nach Tankstellen in Ihrer Nähe suchen, werden
        die Koordinaten (Breiten-/Längengrad) bzw. die Postleitzahl an unseren Server übermittelt, um passende
        Tankstellen und Preise abzurufen. Diese Daten werden <strong>nicht gespeichert</strong> und keiner Person zugeordnet.</li>
      <li><strong>Server-Logdaten:</strong> Beim Aufruf des Dienstes verarbeitet unser Hosting-Anbieter technisch
        notwendige Daten (z.&nbsp;B. IP-Adresse, Datum/Uhrzeit, angefragte URL, User-Agent) kurzfristig zur
        Gewährleistung von Betrieb und Sicherheit.</li>
    </ul>
    <p>Wir verlangen keine Registrierung, verwenden keine Cookies und erstellen keine Nutzerprofile.</p>

    <h3>3. Zweck und Rechtsgrundlage</h3>
    <p>Die Verarbeitung erfolgt ausschließlich, um Ihnen aktuelle Kraftstoffpreise anzuzeigen
      (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO) sowie zur Sicherstellung eines stabilen und sicheren Betriebs
      (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO).</p>

    <h3>4. Empfänger / Drittanbieter</h3>
    <ul>
      <li><strong>Vercel Inc.</strong> (Hosting) – Server können sich außerhalb der EU befinden; die Übermittlung
        erfolgt auf Grundlage von EU-Standardvertragsklauseln bzw. dem EU-U.S. Data Privacy Framework.</li>
      <li><strong>Tankerkönig</strong> – Preisdaten werden über die Tankerkönig-API abgefragt (Quelle: MTS-K des
        Bundeskartellamts). Dabei wird nur der Suchbereich übermittelt, keine Daten, die Sie identifizieren.</li>
    </ul>

    <h3>5. Speicherdauer</h3>
    <p>Suchanfragen werden nicht gespeichert. Antworten werden höchstens wenige Minuten ohne Personenbezug
      zwischengespeichert (Cache). Server-Logs werden vom Hosting-Anbieter nach kurzer Zeit automatisch gelöscht.</p>

    <h3>6. Ihre Rechte</h3>
    <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
      Datenübertragbarkeit und Widerspruch (Art.&nbsp;15–21 DSGVO) sowie das Recht auf Beschwerde bei einer
      Datenschutz-Aufsichtsbehörde. Wenden Sie sich dazu an <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>

    <h3>7. Kinder</h3>
    <p>Der Dienst richtet sich nicht an Kinder unter 16 Jahren und erhebt wissentlich keine Daten von Kindern.</p>

    <h3>8. Änderungen</h3>
    <p>Wir können diese Datenschutzerklärung bei Bedarf anpassen. Es gilt die jeweils hier veröffentlichte Fassung.</p>
  </section>

  <section id="en" lang="en">
    <h2>Privacy Policy</h2>

    <h3>1. Controller</h3>
    <p>The operator of this service is responsible for data processing.
      Contact: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>

    <h3>2. Data we process</h3>
    <ul>
      <li><strong>Location data:</strong> When you search for nearby fuel stations in the app, your coordinates
        (latitude/longitude) or postal code are sent to our server to look up stations and prices. This data is
        <strong>not stored</strong> and is not linked to you.</li>
      <li><strong>Server logs:</strong> Our hosting provider briefly processes technically necessary data
        (e.g. IP address, date/time, requested URL, user agent) to operate and secure the service.</li>
    </ul>
    <p>We do not require registration, do not use cookies and do not build user profiles.</p>

    <h3>3. Purpose and legal basis</h3>
    <p>Data is processed solely to show you current fuel prices (Art.&nbsp;6(1)(b) GDPR) and to ensure stable,
      secure operation (Art.&nbsp;6(1)(f) GDPR).</p>

    <h3>4. Recipients / third parties</h3>
    <ul>
      <li><strong>Vercel Inc.</strong> (hosting) – servers may be located outside the EU; transfers are based on
        EU Standard Contractual Clauses or the EU-U.S. Data Privacy Framework.</li>
      <li><strong>Tankerkönig</strong> – price data is retrieved via the Tankerkönig API (source: MTS-K of the German
        Federal Cartel Office). Only the search area is transmitted, nothing that identifies you.</li>
    </ul>

    <h3>5. Retention</h3>
    <p>Search requests are not stored. Responses may be cached for a few minutes without any personal reference.
      Server logs are deleted automatically by the hosting provider after a short period.</p>

    <h3>6. Your rights</h3>
    <p>You have the right of access, rectification, erasure, restriction, data portability and objection
      (Art.&nbsp;15–21 GDPR), as well as the right to lodge a complaint with a supervisory authority.
      Contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>

    <h3>7. Children</h3>
    <p>The service is not directed at children under 16 and does not knowingly collect data from children.</p>

    <h3>8. Changes</h3>
    <p>We may update this policy when necessary. The version published here applies.</p>
  </section>

  <footer>
    <a id="home-link" href="/">← Fuel Price Service</a> ·
    Data: <a href="https://creativecommons.tankerkoenig.de" target="_blank" rel="noopener">Tankerkönig</a> (CC BY 4.0)
  </footer>
</main>`,
});

export function GET() {
  return htmlResponse(html);
}
