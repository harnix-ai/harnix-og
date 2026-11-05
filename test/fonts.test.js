const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const satori = require('satori').default;
const { card } = require('../card');

// Exercise the production font loader without exporting test hooks from the API.
const apiPath = path.resolve(__dirname, '../api/og.js');
const api = new Module(apiPath, module);
api.filename = apiPath;
api.paths = Module._nodeModulePaths(path.dirname(apiPath));
const previousSecret = process.env.OG_SECRET;
process.env.OG_SECRET = 'font-regression-test-secret';
api._compile(fs.readFileSync(apiPath, 'utf8') + '\nmodule.exports.loadFonts = loadFonts;', apiPath);
if (previousSecret === undefined) delete process.env.OG_SECRET;
else process.env.OG_SECRET = previousSecret;
const loadFonts = api.exports.loadFonts;
const phrases = ['Tiếng Việt', 'Triển khai', 'thử nghiệm', 'vận hành thật', 'Đường dẫn', 'Tổ chức'];
const text = t => ({ type: 'div', props: { style: { fontFamily: 'Be Vietnam Pro', fontSize: 48, fontWeight: 700 }, children: t } });
const render = (node, fonts) => satori(node, { width: 1200, height: 630, fonts });
const reference = [{ name: 'Be Vietnam Pro', weight: 700, style: 'normal', data: fs.readFileSync(path.resolve(__dirname, '../fonts/be-vietnam-pro-700-normal.woff')) }];

test('every title glyph uses Be Vietnam Pro 700 outlines and metrics, without Space Grotesk fallback', async () => {
  for (const phrase of phrases) {
    assert.equal(await render(text(phrase), loadFonts()), await render(text(phrase), reference), phrase);
  }
});

test('NFD Vietnamese input renders identically to NFC in the real card', async () => {
  const title = phrases.join(' · ');
  assert.equal(await render(card({ t: title.normalize('NFD'), v: 'type' }), loadFonts()),
    await render(card({ t: title.normalize('NFC'), v: 'type' }), loadFonts()));
});

test('bundled faces cover Vietnamese and preserve the original Fontsource glyph outlines', () => {
  const opentype = require('@shuding/opentype.js');
  const parse = data => opentype.parse(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  const vietnamese = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯư' +
    Array.from({ length: 0x1efa - 0x1ea0 }, (_, i) => String.fromCodePoint(0x1ea0 + i)).join('');
  for (const weight of [500, 700, 800]) {
    const data = fs.readFileSync(path.resolve(__dirname, `../fonts/be-vietnam-pro-${weight}-normal.woff`));
    assert.equal(data.subarray(0, 4).toString(), 'wOFF');
    const full = parse(data);
    assert.equal(full.tables.os2.usWeightClass, weight);
    for (const c of vietnamese) assert.ok(full.charToGlyphIndex(c), `${weight}: missing ${c}`);
    for (const sub of ['vietnamese', 'latin-ext', 'latin']) {
      const subset = parse(fs.readFileSync(path.resolve(__dirname, `../node_modules/@fontsource/be-vietnam-pro/files/be-vietnam-pro-${sub}-${weight}-normal.woff`)));
      for (const c of vietnamese) if (subset.charToGlyphIndex(c)) {
        assert.equal(full.charToGlyph(c).path.toPathData(3), subset.charToGlyph(c).path.toPathData(3), `${weight}: changed outline for ${c}`);
        assert.equal(full.charToGlyph(c).advanceWidth, subset.charToGlyph(c).advanceWidth, `${weight}: changed advance for ${c}`);
      }
    }
  }
});

test('signed API requests render NFC/NFD identically and still reject invalid signatures', async () => {
  const crypto = require('node:crypto');
  const request = async (title, valid = true) => {
    const canon = `t=${title}\nv=type`;
    const sig = valid ? crypto.createHmac('sha256', 'font-regression-test-secret').update(canon).digest('hex').slice(0, 32) : '0'.repeat(32);
    const req = { url: '/og.png?' + new URLSearchParams({ t: title, v: 'type', sig }) };
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.body = body; } };
    await api.exports(req, res);
    return res;
  };
  const title = phrases.join(' · ');
  const nfc = await request(title.normalize('NFC'));
  const nfd = await request(title.normalize('NFD'));
  assert.equal(nfc.statusCode, 200);
  assert.equal(nfc.headers['content-type'], 'image/png');
  assert.equal(nfc.body.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.deepEqual(nfd.body, nfc.body);
  assert.equal((await request(title, false)).statusCode, 403);
});
