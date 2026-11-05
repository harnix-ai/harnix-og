// harnix-og on Vercel: GET /og.png?t=...&...&sig=<hmac> -> 1200x630 PNG
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');
const { card } = require('../card');

const SECRET = process.env.OG_SECRET || '';
const KEYS = ['t', 'k', 'c', 'v', 'l', 's', 'bg', 'items', 'stat', 'statlabel', 'src', 'q', 'a', 'left', 'right'];

let fonts = null;
function loadFonts() {
  if (fonts) return fonts;
  const bvp = path.join(process.cwd(), 'node_modules/@fontsource/be-vietnam-pro/files');
  const sg = path.join(process.cwd(), 'node_modules/@fontsource/space-grotesk/files');
  fonts = [];
  for (const w of [500, 700, 800])
    for (const sub of ['vietnamese', 'latin-ext', 'latin'])
      fonts.push({ name: 'Be Vietnam Pro', weight: w, style: 'normal', data: fs.readFileSync(path.join(bvp, `be-vietnam-pro-${sub}-${w}-normal.woff`)) });
  for (const sub of ['latin', 'latin-ext'])
    fonts.push({ name: 'Space Grotesk', weight: 600, style: 'normal', data: fs.readFileSync(path.join(sg, `space-grotesk-${sub}-600-normal.woff`)) });
  return fonts;
}

function sign(params) {
  const canon = KEYS.filter((k) => params[k] !== undefined && params[k] !== '').sort().map((k) => `${k}=${params[k]}`).join('\n');
  return crypto.createHmac('sha256', SECRET).update(canon, 'utf8').digest('hex').slice(0, 32);
}

module.exports = async (req, res) => {
  try {
    if (!SECRET) { res.statusCode = 500; return res.end('OG_SECRET not set'); }
    const url = new URL(req.url, 'http://x');
    if (url.searchParams.get('health') === '1') { res.statusCode = 200; return res.end('ok'); }
    const params = {};
    for (const k of KEYS) { const v = url.searchParams.get(k); if (v !== null) params[k] = v.slice(0, 400); }
    const sig = url.searchParams.get('sig') || '';
    const want = sign(params);
    if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) {
      res.statusCode = 403; return res.end('bad signature');
    }
    const svg = await satori(card(params), { width: 1200, height: 630, fonts: loadFonts() });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    res.setHeader('content-type', 'image/png');
    res.setHeader('cache-control', 'public, max-age=31536000, immutable');
    res.statusCode = 200;
    res.end(png);
  } catch (e) {
    console.error(e);
    res.statusCode = 500; res.end('render error');
  }
};
