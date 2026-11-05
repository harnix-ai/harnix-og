// Harnix blog thumbnail: element tree for Satori / @vercel/og (1200x630).
// Same code is used for local preview (cli.js) and for the Vercel edge endpoint (api/og.js).

const h = (type, style, ...children) => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.flat().filter((c) => c !== null && c !== undefined && c !== false) },
});

const T = {
  bg: '#0c0c0d', surface: '#141416', surface2: '#1b1b1e', line: '#26262a', line2: '#35353b',
  text: '#f2f2f3', text2: '#a8a8ae', text3: '#90909a',
};
// Brand tokens (dark theme) converted from oklch: accent 0.74 0.13 165, info 0.74 0.11 245, warn 0.81 0.13 82.
const HUES = {
  harnix: { c: '#3ec99a', soft: 'rgba(62,201,154,0.14)', ring: 'rgba(62,201,154,0.40)' },
  trend: { c: '#6fb3f0', soft: 'rgba(111,179,240,0.14)', ring: 'rgba(111,179,240,0.40)' },
  guide: { c: '#e4bd5a', soft: 'rgba(228,189,90,0.14)', ring: 'rgba(228,189,90,0.40)' },
};

function rng(seedStr) {
  let s = 2166136261;
  for (const ch of String(seedStr)) s = Math.imul(s ^ ch.charCodeAt(0), 16777619);
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507);
    s = Math.imul(s ^ (s >>> 13), 3266489909);
    return ((s ^= s >>> 16) >>> 0) / 4294967296;
  };
}

// Generative background: unique per seed, quiet, on-brand.
function backdrop(seed, hue, style) {
  const r = rng(seed);
  const shapes = [];
  if (style === 'dots') {
    for (let y = 0; y < 14; y++)
      for (let x = 0; x < 26; x++) {
        const v = r();
        if (v < 0.55 || x < 15) continue;
        const big = v > 0.93;
        shapes.push(h('div', {
          position: 'absolute', left: 30 + x * 46, top: 18 + y * 46, width: big ? 8 : 4, height: big ? 8 : 4,
          borderRadius: big ? 2 : 2, background: big ? hue.c : T.line2, opacity: big ? 0.55 : 0.6,
        }));
      }
  } else if (style === 'bars') {
    const n = 34;
    for (let i = 0; i < n; i++) {
      const hgt = 16 + Math.floor(r() * 120);
      shapes.push(h('div', {
        position: 'absolute', left: 780 + i * 12, bottom: 0, width: 8, height: hgt,
        borderRadius: 3, background: r() > 0.88 ? hue.c : T.line, opacity: 0.45,
      }));
    }
  } else {
    // 'rings': concentric arcs anchored top-right
    const cx = 1000 + Math.floor(r() * 120), cy = -40 + Math.floor(r() * 80);
    for (let i = 0; i < 6; i++) {
      const d = 220 + i * 120;
      shapes.push(h('div', {
        position: 'absolute', left: cx - d / 2, top: cy - d / 2, width: d, height: d, borderRadius: d,
        border: `1px solid ${i === 2 ? hue.ring : T.line}`,
      }));
    }
  }
  return h('div', { position: 'absolute', left: 0, top: 0, width: 1200, height: 630 }, shapes);
}

function wordmark(hue) {
  return h('div', { alignItems: 'center', fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 34, color: T.text, letterSpacing: -0.5 },
    'harn',
    h('div', { position: 'relative', flexDirection: 'column', alignItems: 'center' },
      h('div', { position: 'absolute', top: 6, width: 8, height: 8, borderRadius: 2, background: HUES.harnix.c }),
      'ı'),
    'x');
}

function kickerChip(text, hue) {
  return h('div', {
    alignItems: 'center', alignSelf: 'flex-start', gap: 10, padding: '8px 16px', borderRadius: 8,
    background: hue.soft, border: `1px solid ${hue.ring}`, color: hue.c, fontSize: 20, fontWeight: 700,
    letterSpacing: 1.6, textTransform: 'uppercase',
  }, h('div', { width: 9, height: 9, borderRadius: 2, background: hue.c }), text);
}

function titleSize(title, width) {
  const n = title.length;
  const base = width > 900 ? [76, 66, 58, 50] : [66, 58, 50, 44];
  return n <= 40 ? base[0] : n <= 62 ? base[1] : n <= 85 ? base[2] : base[3];
}

// ---- right-side panels (content-aware visuals) ----
function panelTrace(items, hue, locale) {
  const steps = items.length ? items.slice(0, 5) : (locale === 'en' ? ['Question', 'Documents', 'Tools', 'Answer'] : ['Câu hỏi', 'Tài liệu', 'Công cụ', 'Trả lời']);
  return h('div', { flexDirection: 'column', width: 360, padding: '22px 24px', borderRadius: 14, background: T.surface, border: `1px solid ${T.line}` },
    h('div', { fontSize: 15, color: T.text3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }, 'Run'),
    steps.map((s, i) => {
      const last = i === steps.length - 1;
      return h('div', { alignItems: 'center', gap: 14, padding: '11px 0', borderTop: i ? `1px solid ${T.line}` : 'none' },
        h('div', { width: 14, height: 14, borderRadius: 14, border: `2px solid ${last ? hue.c : T.text3}`, background: last ? hue.c : 'transparent' }),
        h('div', { fontSize: 20, color: last ? T.text : T.text2, flex: 1 }, s),
        h('div', { width: 40 + ((i * 29) % 50), height: 7, borderRadius: 4, background: last ? hue.c : T.line2 }));
    }));
}

function panelStat(stat, label, src, hue) {
  return h('div', { flexDirection: 'column', width: 380, padding: '30px 30px', borderRadius: 14, background: T.surface, border: `1px solid ${T.line}` },
    h('div', { fontSize: 112, fontWeight: 800, color: hue.c, lineHeight: 1, letterSpacing: -3 }, stat),
    h('div', { fontSize: 22, color: T.text, marginTop: 16, lineHeight: 1.35 }, label),
    src ? h('div', { fontSize: 16, color: T.text3, marginTop: 14 }, src) : null);
}

function panelChat(q, a, hue, locale) {
  return h('div', { flexDirection: 'column', width: 400, gap: 14 },
    h('div', { alignSelf: 'flex-end', maxWidth: 330, padding: '14px 18px', borderRadius: 14, background: T.surface2, border: `1px solid ${T.line2}`, fontSize: 20, color: T.text, lineHeight: 1.35 }, q),
    h('div', { flexDirection: 'column', maxWidth: 360, padding: '14px 18px', borderRadius: 14, background: T.surface, border: `1px solid ${hue.ring}`, fontSize: 20, color: T.text2, lineHeight: 1.35 },
      a,
      h('div', { alignItems: 'center', gap: 8, marginTop: 12, fontSize: 15, color: hue.c },
        h('div', { width: 8, height: 8, borderRadius: 8, background: hue.c }),
        locale === 'en' ? 'Trace · source cited' : 'Trace · có trích dẫn nguồn')));
}

function panelList(items, hue) {
  return h('div', { flexDirection: 'column', width: 380, gap: 12 },
    items.slice(0, 5).map((s, i) => h('div', { alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 12, background: T.surface, border: `1px solid ${T.line}` },
      h('div', { width: 34, height: 34, borderRadius: 8, background: hue.soft, color: hue.c, fontSize: 18, fontWeight: 700, alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk' }, String(i + 1).padStart(2, '0')),
      h('div', { fontSize: 20, color: T.text, flex: 1, lineHeight: 1.25 }, s))));
}

function panelCompare(left, right, hue) {
  const col = (t, on) => h('div', { flexDirection: 'column', width: 180, height: 250, padding: '20px', borderRadius: 14, justifyContent: 'space-between',
    background: on ? hue.soft : T.surface, border: `1px solid ${on ? hue.ring : T.line}` },
    h('div', { fontSize: 24, fontWeight: 700, color: on ? hue.c : T.text, lineHeight: 1.2 }, t),
    h('div', { flexDirection: 'column', gap: 8 }, [0.9, 0.6, 0.75].map((w) => h('div', { width: 140 * w, height: 7, borderRadius: 4, background: on ? hue.ring : T.line2 }))));
  return h('div', { alignItems: 'center', gap: 16 }, col(left, false),
    h('div', { fontSize: 22, color: T.text3, fontWeight: 700 }, 'vs'), col(right, true));
}

function panelGraph(seed, hue, items) {
  const r = rng(seed + 'g');
  const W = 400, H = 360, cx = 200, cy = 180;
  let lines = '', dots = '';
  const n = 8;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + r() * 0.5;
    const rad = 115 + r() * 50;
    pts.push([cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad]);
  }
  pts.forEach(([x, y], i) => {
    lines += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${i % 3 === 0 ? hue.c : T.line2}" stroke-width="${i % 3 === 0 ? 2 : 1.5}" stroke-dasharray="${i % 3 === 0 ? '0' : '4 6'}"/>`;
    const nx = pts[(i + 1) % n];
    if (r() > 0.5) lines += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${nx[0].toFixed(1)}" y2="${nx[1].toFixed(1)}" stroke="${T.line}" stroke-width="1.2"/>`;
    const on = i % 3 === 0;
    dots += `<rect x="${(x - 11).toFixed(1)}" y="${(y - 11).toFixed(1)}" width="22" height="22" rx="6" fill="${on ? hue.c : T.surface2}" stroke="${on ? hue.c : T.line2}"/>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${lines}${dots}<rect x="${cx - 46}" y="${cy - 46}" width="92" height="92" rx="22" fill="${T.surface}" stroke="${hue.c}" stroke-width="2"/></svg>`;
  const src = 'data:image/svg+xml;base64,' + (typeof Buffer !== 'undefined' ? Buffer.from(svg).toString('base64') : btoa(svg));
  return h('div', { position: 'relative', width: W, height: H },
    { type: 'img', props: { src, width: W, height: H, style: { position: 'absolute', left: 0, top: 0 } } },
    h('div', { position: 'absolute', left: cx - 46, top: cy - 46, width: 92, height: 92, alignItems: 'center', justifyContent: 'center',
      fontSize: 22, fontWeight: 700, color: hue.c, fontFamily: 'Space Grotesk' }, (items[0] || 'AI').slice(0, 5)));
}

function card(p) {
  // Use precomposed glyphs: Satori 0.10 does not shape combining marks like a browser.
  p = Object.fromEntries(Object.entries(p).map(([key, value]) =>
    [key, typeof value === 'string' ? value.normalize('NFC') : value]));
  const locale = p.l === 'en' ? 'en' : 'vi';
  const cat = HUES[p.c] ? p.c : 'harnix';
  const hue = HUES[cat];
  const items = (p.items || '').split('|').map((s) => s.trim()).filter(Boolean);
  const seed = p.s || p.t || 'harnix';
  const r = rng(seed);
  const variant = p.v || ['trace', 'chat', 'list', 'graph'][Math.floor(r() * 4)];
  const bgStyle = p.bg || ['dots', 'rings', 'bars'][Math.floor(r() * 3)];
  const tagline = locale === 'en' ? 'Harness every run.' : 'Giao việc cho AI. Nắm từng bước.';

  let panel = null;
  if (variant === 'stat' && p.stat) panel = panelStat(p.stat, p.statlabel || '', p.src || '', hue);
  else if (variant === 'chat') panel = panelChat(p.q || (locale === 'en' ? 'Why did the bot say that?' : 'Vì sao bot trả lời vậy?'), p.a || (locale === 'en' ? 'Here are the steps I took…' : 'Đây là các bước tôi đã làm…'), hue, locale);
  else if (variant === 'list' && items.length) panel = panelList(items, hue);
  else if (variant === 'compare' && p.left && p.right) panel = panelCompare(p.left, p.right, hue);
  else if (variant === 'graph') panel = panelGraph(seed, hue, items);
  else if (variant !== 'type') panel = panelTrace(items, hue, locale);

  const textW = panel ? 640 : 1000;
  const title = String(p.t || 'Harnix');

  return h('div', { width: 1200, height: 630, background: T.bg, position: 'relative', fontFamily: 'Be Vietnam Pro', color: T.text },
    backdrop(seed, hue, bgStyle),
    h('div', { position: 'absolute', left: -200, top: -260, width: 700, height: 700, borderRadius: 700,
      backgroundImage: `radial-gradient(circle, ${hue.soft}, rgba(0,0,0,0) 70%)` }),
    h('div', { position: 'absolute', left: 72, top: 64, width: textW, height: 502, flexDirection: 'column' },
      kickerChip(p.k || (locale === 'en' ? 'Harnix' : 'Harnix'), hue),
      h('div', { marginTop: 30, fontSize: titleSize(title, textW), fontWeight: 700, lineHeight: 1.16, letterSpacing: -1, color: T.text }, title),
      h('div', { marginTop: 'auto', alignItems: 'center', gap: 18, fontSize: 20, color: T.text2 },
        wordmark(hue), h('div', { width: 1, height: 26, background: T.line2 }), tagline,
        h('div', { width: 1, height: 26, background: T.line2 }), locale === 'en' ? 'harnix.vn/en/blog' : 'harnix.vn/blog')),
    panel ? h('div', { position: 'absolute', right: 64, top: 0, height: 630, alignItems: 'center' }, panel) : null);
}

module.exports = { card };
