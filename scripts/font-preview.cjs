// Run after npm install: node scripts/font-preview.cjs
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');
const root = path.resolve(__dirname, '..');
const apiPath = path.join(root, 'api/og.js');
const api = new Module(apiPath, module);
api.filename = apiPath;
api.paths = Module._nodeModulePaths(path.dirname(apiPath));
api._compile(fs.readFileSync(apiPath, 'utf8') + '\nmodule.exports = loadFonts;', apiPath);
const fonts = api.exports();
const phrases = ['Tiếng Việt', 'Triển khai', 'thử nghiệm', 'vận hành thật', 'Đường dẫn', 'Tổ chức'];
const oldFonts = [];
for (const weight of [500, 700, 800]) for (const sub of ['vietnamese', 'latin-ext', 'latin'])
  oldFonts.push({ name: 'Be Vietnam Pro', weight, style: 'normal', data: fs.readFileSync(path.join(root, `node_modules/@fontsource/be-vietnam-pro/files/be-vietnam-pro-${sub}-${weight}-normal.woff`)) });
oldFonts.push(...fonts.filter(f => f.name === 'Space Grotesk'));
const style = { fontFamily: 'Be Vietnam Pro', fontWeight: 700, fontSize: 48, lineHeight: 1.3, color: '#f4f4f5' };
const block = children => ({ type: 'div', props: { style, children } });
const render = (tree, fonts, width, height) => satori(tree, { fonts, width, height });
(async () => {
  const out = path.join(root, 'artifacts'); fs.mkdirSync(out, { recursive: true });
  const tree = { type: 'div', props: { style: { ...style, width: 1200, height: 630, background: '#0b0b0c', padding: 48, display: 'flex', flexDirection: 'column', gap: 12 }, children: phrases.map(block) } };
  const sample = require('../card').card({ t: 'Triển khai AI agent 2026: từ thử nghiệm sang vận hành thật', k: 'Xu hướng', c: 'trend', v: 'stat', stat: '21%', statlabel: 'tổ chức có mô hình quản trị trưởng thành cho AI agent', src: 'Nguồn: Deloitte' });
  const sampleSvg = await render(sample, fonts, 1200, 630);
  fs.writeFileSync(path.join(out, 'og-title-fixed.png'), new Resvg(sampleSvg).render().asPng());
  const svg = await render(tree, fonts, 1200, 630);
  fs.writeFileSync(path.join(out, 'vietnamese-og-test.svg'), svg);
  fs.writeFileSync(path.join(out, 'vietnamese-og-test.png'), new Resvg(svg).render().asPng());
  const rows = await Promise.all(phrases.map(async text => {
    const node = block(text);
    const before = await render(node, oldFonts, 450, 90);
    const after = await render(node, fonts, 450, 90);
    return `<tr><td>${before}</td><td>${after}</td><td class="browser">${text}</td></tr>`;
  }));
  const full = fs.readFileSync(path.join(root, 'fonts/be-vietnam-pro-700-normal.woff')).toString('base64');
  const css = fs.readFileSync(path.join(root, 'node_modules/@fontsource/be-vietnam-pro/700.css'), 'utf8')
    .replace(/url\(\.\/files\/([^)]*)\)/g, (_, name) => `url(data:font/woff${name.endsWith('woff2') ? '2' : ''};base64,${fs.readFileSync(path.join(root, 'node_modules/@fontsource/be-vietnam-pro/files', name)).toString('base64')})`);
  fs.writeFileSync(path.join(out, 'font-comparison.html'), `<!doctype html><meta charset="utf-8"><style>${css}
  @font-face{font-family:Full;src:url(data:font/woff;base64,${full});font-weight:700}
  body{background:#0b0b0c;color:#f4f4f5;font-family:Arial;margin:24px}table{border-collapse:collapse}th{text-align:left;padding:12px;font-size:20px}td{width:450px;height:90px;vertical-align:top;border-top:1px solid #333}.browser{font-family:Full;font-size:48px;font-weight:700;line-height:1.3}.subset{font-family:'Be Vietnam Pro'}</style>
  <table><tr><th>Satori: original subsets (mixed fonts)</th><th>Satori: full Be Vietnam Pro 700</th><th>Chromium: full Be Vietnam Pro 700</th></tr>${rows.join('')}</table><pre id="metrics"></pre><script>
  document.fonts.ready.then(async()=>{await document.fonts.load('700 48px \"Be Vietnam Pro\"', ${JSON.stringify(phrases.join(' '))});const c=document.createElement('canvas').getContext('2d');const result=${JSON.stringify(phrases)}.map(text=>{c.font='700 48px Full';const full=c.measureText(text).width;c.font='700 48px "Be Vietnam Pro"';const subsets=c.measureText(text).width;return {text,full,subsets,equal:Math.abs(full-subsets)<0.01}});document.querySelector('#metrics').textContent=JSON.stringify(result,null,2);});</script>`);
  console.log('Created artifacts/vietnamese-og-test.png and artifacts/font-comparison.html');
})();
