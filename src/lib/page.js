/**
 * Khung HTML dùng chung cho các trang công khai (index, privacy, ...)
 */

const baseStyle = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{min-height:100vh;font-family:Outfit,system-ui,sans-serif;color:#e8eaf6;
    background:radial-gradient(ellipse at top,#1b1f3b 0%,#0b0d1a 60%);overflow-x:hidden}
  .glow{position:fixed;top:-160px;left:50%;margin-left:-260px;width:520px;height:520px;border-radius:50%;
    filter:blur(120px);opacity:.3;z-index:0;pointer-events:none;
    background:conic-gradient(from 0deg,#ff8a3d,#ff3d7f,#7c4dff,#ff8a3d);animation:spin 18s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes up{from{opacity:0;transform:translateY(16px)}}
  .card{position:relative;z-index:1;border-radius:24px;background:rgba(255,255,255,.05);
    border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(18px);box-shadow:0 20px 60px rgba(0,0,0,.4);
    animation:up .8s ease-out}
  .grad{background:linear-gradient(90deg,#ffb26b,#ff5c93);-webkit-background-clip:text;background-clip:text;color:transparent}
  a{color:#ffb26b;text-decoration:none;transition:color .2s}
  a:hover{color:#ff5c93}
  footer{font-size:12px;color:#6b6f8f}
  footer a{color:#8f93b8}
`;

export function renderPage({ title, description = title, style = '', body, lang = 'de' }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&display=swap" rel="stylesheet">
<style>${baseStyle}${style}</style>
</head>
<body>
<div class="glow"></div>
${body}
</body>
</html>`;
}

export function htmlResponse(html, cache = 86400) {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': `public, max-age=300, s-maxage=${cache}`,
    },
  });
}
