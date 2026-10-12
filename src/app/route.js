// GET / → trang index công khai (không lộ danh sách endpoint)
import { renderPage, htmlResponse } from '@/lib/page';

const html = renderPage({
  title: 'Fuel Price Service',
  style: `
  body{display:grid;place-items:center;overflow:hidden}
  main{text-align:center;padding:48px 40px;max-width:420px;width:calc(100% - 32px)}
  .icon{font-size:56px;display:inline-block;animation:float 3s ease-in-out infinite}
  @keyframes float{50%{transform:translateY(-8px)}}
  h1{font-weight:700;font-size:28px;margin:16px 0 8px}
  p{font-weight:300;color:#a9adc9}
  .status{margin-top:24px;display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;
    background:rgba(46,213,115,.12);color:#5ef0a0;font-size:14px;font-weight:500}
  .dot{width:8px;height:8px;border-radius:50%;background:#2ed573;animation:pulse 2s infinite}
  @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(46,213,115,.7)}70%{box-shadow:0 0 0 10px rgba(46,213,115,0)}100%{box-shadow:0 0 0 0 rgba(46,213,115,0)}}
  footer{margin-top:28px;line-height:1.8}
  `,
  body: `
<main class="card">
  <span class="icon">⛽</span>
  <h1 class="grad">Fuel Price Service</h1>
  <p>Private backend service.</p>
  <div class="status"><span class="dot"></span>Operational</div>
  <footer>
    <a id="privacy-link" href="/privacy">Datenschutz / Privacy</a> · <a id="support-link" href="/support">Support</a><br>
    Data: <a href="https://creativecommons.tankerkoenig.de" target="_blank" rel="noopener">Tankerkönig</a> (CC BY 4.0)
  </footer>
</main>`,
});

export function GET() {
  return htmlResponse(html);
}
