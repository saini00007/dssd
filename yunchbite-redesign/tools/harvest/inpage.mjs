// Functions that run INSIDE the page (via page.evaluate). They are serialised with
// Function#toString, so each one must be completely self-contained (no outer references).

/** Slowly scroll to the bottom to trigger lazy loading / IntersectionObserver / Next.js lazy images. */
export async function autoScroll({ stepFrac = 0.6, delayMs = 160, maxSteps = 140, maxMs = 30000 }) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const t0 = Date.now();
  let y = 0;
  let lastH = 0;
  let stable = 0;
  for (let i = 0; i < maxSteps && Date.now() - t0 < maxMs; i++) {
    const h = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
    window.scrollTo(0, y);
    await sleep(delayMs);
    if (y + innerHeight >= h - 2) {
      // at the bottom: wait for the page to grow (infinite lists / late images)
      await sleep(350);
      const h2 = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
      if (h2 === lastH) stable++; else stable = 0;
      lastH = h2;
      if (stable >= 1) break;
    }
    y += Math.max(120, Math.floor(innerHeight * stepFrac));
  }
  window.scrollTo(0, document.documentElement.scrollHeight);
  await sleep(300);
  window.scrollTo(0, 0);
  await sleep(300);
  return { height: document.documentElement.scrollHeight, steps: Math.round((Date.now() - t0) / delayMs) };
}

/** Everything we need from the rendered DOM in one round trip. */
export function extractPage({ minSvg = 24 }) {
  const abs = (u) => { try { return new URL(u, document.baseURI).href; } catch { return null; } };
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const clsOf = (el) => {
    const c = el.className;
    return (c && typeof c === 'object' && 'baseVal' in c ? c.baseVal : c || '').toString().slice(0, 140);
  };
  const ctxOf = (el) => {
    const r = el.getBoundingClientRect();
    const a = el.closest ? el.closest('a[href]') : null;
    const par = el.parentElement;
    return {
      docTop: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height),
      inHeader: !!el.closest('header,[role=banner]'), inNav: !!el.closest('nav,[role=navigation]'),
      inFooter: !!el.closest('footer,[role=contentinfo]'), inMain: !!el.closest('main,[role=main],article'),
      link: a ? a.href : null, cls: clsOf(el), id: el.id || '', parentCls: par ? clsOf(par) : '',
    };
  };
  const parseSrcset = (s) => {
    const res = [];
    const re = /\s*([^\s,][^\s]*?)(?:\s+(\d+(?:\.\d+)?[wx]))?\s*(?:,|$)/g;
    let m;
    while ((m = re.exec(s || '')) && m[0]) res.push({ url: m[1], desc: m[2] || '' });
    return res;
  };

  // ---------------------------------------------------------------- asset references
  const refs = [];
  const push = (url, how, el, extra = {}) => {
    const u = url && abs(url);
    if (!u || /^(data|blob|javascript):/i.test(u)) return;
    refs.push({ url: u, how, ...(el ? ctxOf(el) : {}), ...extra });
  };

  const images = [];
  for (const img of document.images) {
    const rect = img.getBoundingClientRect();
    const alt = img.getAttribute('alt');
    const pic = img.closest('picture');
    const info = {
      src: img.getAttribute('src'), currentSrc: img.currentSrc || null, alt, hasAlt: img.hasAttribute('alt'),
      naturalW: img.naturalWidth, naturalH: img.naturalHeight,
      renderedW: Math.round(rect.width), renderedH: Math.round(rect.height),
      loading: img.getAttribute('loading'), inPicture: !!pic, inHeader: !!img.closest('header'), inFooter: !!img.closest('footer'),
    };
    images.push(info);
    const extra = { alt: alt || '', renderedW: info.renderedW, renderedH: info.renderedH };
    if (img.currentSrc) push(img.currentSrc, 'img', img, extra);
    if (img.getAttribute('src')) push(img.getAttribute('src'), 'img', img, extra);
    for (const c of parseSrcset(img.getAttribute('srcset'))) push(c.url, 'img-srcset', img, { ...extra, desc: c.desc });
    for (const a of ['data-src', 'data-lazy-src', 'data-original', 'data-image']) {
      if (img.getAttribute(a)) push(img.getAttribute(a), 'img-lazy', img, extra);
    }
    for (const a of ['data-srcset', 'data-lazy-srcset']) {
      for (const c of parseSrcset(img.getAttribute(a))) push(c.url, 'img-lazy', img, extra);
    }
    if (pic) {
      for (const s of pic.querySelectorAll('source')) {
        for (const c of parseSrcset(s.getAttribute('srcset'))) {
          push(c.url, 'picture-source', img, { ...extra, desc: c.desc, sourceType: s.getAttribute('type') || '', media: s.getAttribute('media') || '' });
        }
      }
    }
  }
  for (const v of document.querySelectorAll('video,audio')) {
    const tag = v.tagName.toLowerCase();
    const extra = {
      autoplay: v.hasAttribute('autoplay'), loop: v.hasAttribute('loop'), muted: v.hasAttribute('muted') || v.muted,
      alt: v.getAttribute('aria-label') || '',
    };
    if (v.getAttribute('src')) push(v.getAttribute('src'), tag, v, extra);
    if (v.currentSrc) push(v.currentSrc, tag, v, extra);
    for (const s of v.querySelectorAll('source')) if (s.getAttribute('src')) push(s.getAttribute('src'), tag, v, extra);
    if (v.getAttribute('poster')) push(v.getAttribute('poster'), 'video-poster', v, extra);
  }
  // computed background-image & friends (incl. ::before / ::after)
  const urlRe = /url\((['"]?)(.*?)\1\)/g;
  const cssProps = ['backgroundImage', 'maskImage', 'webkitMaskImage', 'borderImageSource', 'listStyleImage'];
  for (const el of document.querySelectorAll('body, body *')) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'IMG', 'SOURCE', 'SVG', 'PATH'].includes(el.tagName.toUpperCase())) continue;
    for (const pseudo of [null, '::before', '::after']) {
      const cs = getComputedStyle(el, pseudo);
      for (const p of cssProps) {
        if (pseudo && p !== 'backgroundImage') continue;
        const v = cs[p];
        if (!v || v === 'none' || !v.includes('url(')) continue;
        urlRe.lastIndex = 0;
        let m;
        while ((m = urlRe.exec(v))) push(m[2], 'css-bg', el, { pseudo: pseudo || '', cssProp: p });
      }
      if (pseudo) {
        const c = cs.content;
        if (c && c.includes('url(')) { urlRe.lastIndex = 0; let m; while ((m = urlRe.exec(c))) push(m[2], 'css-bg', el, { pseudo, cssProp: 'content' }); }
      }
    }
  }
  for (const l of document.querySelectorAll('link[rel]')) {
    const rel = l.getAttribute('rel').toLowerCase();
    const href = l.getAttribute('href');
    if (/(^|\s)(icon|shortcut icon)(\s|$)/.test(rel)) push(href, 'favicon', null, { sizes: l.getAttribute('sizes') || '', mime: l.getAttribute('type') || '' });
    else if (/apple-touch-icon/.test(rel)) push(href, 'apple-touch-icon', null, { sizes: l.getAttribute('sizes') || '' });
    else if (/mask-icon|fluid-icon/.test(rel)) push(href, 'favicon', null, {});
    else if (rel.includes('image_src')) push(href, 'og-image', null, {});
    else if (rel.includes('preload') || rel.includes('prefetch')) {
      const as = (l.getAttribute('as') || '').toLowerCase();
      if (['image', 'font', 'video', 'audio'].includes(as)) push(href, 'preload', null, { as });
      for (const c of parseSrcset(l.getAttribute('imagesrcset'))) push(c.url, 'preload', null, { as: 'image' });
    }
  }
  for (const m of document.querySelectorAll('meta[property],meta[name],meta[itemprop]')) {
    const k = (m.getAttribute('property') || m.getAttribute('name') || m.getAttribute('itemprop') || '').toLowerCase();
    if (/^(og:image(:url|:secure_url)?|twitter:image(:src)?|msapplication-tileimage)$/.test(k) || k === 'image') {
      push(m.getAttribute('content'), k.startsWith('og:') || k.startsWith('twitter') || k === 'image' ? 'og-image' : 'favicon', null, { metaKey: k });
    }
  }
  for (const o of document.querySelectorAll('object[data],embed[src]')) push(o.getAttribute('data') || o.getAttribute('src'), 'embed', o, {});
  const manifestHref = document.querySelector('link[rel="manifest"]')?.getAttribute('href');

  // ---------------------------------------------------------------- inline SVGs
  const svgs = [];
  const SHAPES = new Set(['path', 'circle', 'rect', 'ellipse', 'polygon', 'polyline', 'line', 'g', 'text', 'tspan', 'use']);
  for (const svg of document.querySelectorAll('svg')) {
    if (svg.parentElement && svg.parentElement.closest('svg')) continue;
    const r = svg.getBoundingClientRect();
    if (Math.max(r.width, r.height) <= minSvg) continue;
    if (getComputedStyle(svg).display === 'none') continue;
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    if (clone.querySelector('[*|href^="http://www.w3.org/1999/xlink"]') || /xlink:href/.test(clone.outerHTML)) {
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    }
    if (!clone.getAttribute('width')) clone.setAttribute('width', String(Math.round(r.width)));
    if (!clone.getAttribute('height')) clone.setAttribute('height', String(Math.round(r.height)));
    if (!clone.getAttribute('viewBox') && r.width && r.height) clone.setAttribute('viewBox', `0 0 ${Math.round(r.width)} ${Math.round(r.height)}`);
    // bake class-driven paint into attributes so the file renders standalone
    const origEls = [svg, ...svg.querySelectorAll('*')];
    const cloneEls = [clone, ...clone.querySelectorAll('*')];
    const color = getComputedStyle(svg).color;
    origEls.forEach((o, i) => {
      const c = cloneEls[i];
      const tag = o.tagName.toLowerCase();
      if (SHAPES.has(tag) && (o.getAttribute('class') || !o.hasAttribute('fill'))) {
        const cs = getComputedStyle(o);
        if (cs.fill && !c.hasAttribute('fill')) c.setAttribute('fill', cs.fill);
        if (cs.stroke && cs.stroke !== 'none' && !c.hasAttribute('stroke')) {
          c.setAttribute('stroke', cs.stroke);
          if (cs.strokeWidth) c.setAttribute('stroke-width', cs.strokeWidth);
        }
      }
      if (o.getAttribute('class')) c.removeAttribute('class');
    });
    // <use href="#id"> pointing at sprites elsewhere in the document
    const defs = [];
    for (const u of clone.querySelectorAll('use')) {
      const h = u.getAttribute('href') || u.getAttribute('xlink:href') || '';
      if (h.startsWith('#') && !clone.querySelector(`[id="${CSS.escape(h.slice(1))}"]`)) {
        const t = document.getElementById(h.slice(1));
        if (t) defs.push(t.outerHTML);
      }
    }
    let markup = clone.outerHTML.replace(/currentColor/gi, color);
    if (defs.length) markup = markup.replace(/>/, `><defs>${defs.join('')}</defs>`);
    const a = svg.closest('a[href]');
    const nameHint = svg.getAttribute('aria-label') || norm(svg.querySelector('title')?.textContent) || svg.id ||
      (a && (a.getAttribute('aria-label') || a.title)) || clsOf(svg).split(' ')[0] || '';
    svgs.push({
      markup: `<?xml version="1.0" encoding="UTF-8"?>\n${markup}\n`, nameHint,
      ...ctxOf(svg), alt: norm(svg.querySelector('title')?.textContent) || svg.getAttribute('aria-label') || '',
    });
  }

  // ---------------------------------------------------------------- links
  const links = [...document.querySelectorAll('a[href]')].map((a) => ({
    href: a.href, raw: a.getAttribute('href'),
    text: norm(a.innerText || a.textContent) || a.getAttribute('aria-label') || norm(a.querySelector('img')?.getAttribute('alt')) || '',
    region: a.closest('header,[role=banner]') ? 'header' : a.closest('footer,[role=contentinfo]') ? 'footer' : a.closest('nav') ? 'nav' : 'body',
    target: a.getAttribute('target') || '',
  }));

  // ---------------------------------------------------------------- meta
  const metaTag = (sel, attr = 'content') => document.querySelector(sel)?.getAttribute(attr) || null;
  const og = {}; const twitter = {};
  for (const m of document.querySelectorAll('meta[property^="og:"]')) og[m.getAttribute('property')] = m.getAttribute('content');
  for (const m of document.querySelectorAll('meta[name^="twitter:"]')) twitter[m.getAttribute('name')] = m.getAttribute('content');
  const meta = {
    title: document.title || '', description: metaTag('meta[name="description" i]'),
    canonical: (() => { const h = metaTag('link[rel="canonical"]', 'href'); return h ? abs(h) : null; })(),
    robots: metaTag('meta[name="robots" i]'), lang: document.documentElement.lang || null,
    og, twitter, themeColor: metaTag('meta[name="theme-color"]'),
    jsonLdRaw: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
    isNext: !!(window.__NEXT_DATA__ || window.next || document.getElementById('__next') || document.querySelector('script[src*="/_next/"]')),
    docHeight: document.documentElement.scrollHeight,
  };
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter((h) => getComputedStyle(h).display !== 'none')
    .map((h) => ({ level: Number(h.tagName[1]), text: norm(h.innerText || h.textContent) }));

  // inline <style> text (for @font-face discovery)
  const inlineCss = [...document.querySelectorAll('style')].map((s) => s.textContent).filter(Boolean);

  // ---------------------------------------------------------------- markdown
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'META', 'LINK', 'TITLE', 'DATALIST', 'SOURCE', 'TRACK', 'PATH', 'DEFS']);
  const BLOCK_DESC = 'div,p,h1,h2,h3,h4,h5,h6,ul,ol,li,section,article,table,form,figure,header,footer,nav,main,aside';
  const hidden = (el) => {
    if (el.hidden || el.getAttribute('aria-hidden') === 'true' && getComputedStyle(el).position === 'absolute') return true;
    const cs = getComputedStyle(el);
    return cs.display === 'none' || cs.visibility === 'hidden';
  };
  const isBlock = (el) => {
    const d = getComputedStyle(el).display;
    return !['inline', 'inline-block', 'inline-flex', 'contents'].includes(d);
  };
  const imgSrc = (img) => {
    const s = img.currentSrc || img.getAttribute('src') || img.getAttribute('data-src') || '';
    try {
      const u = new URL(s, document.baseURI);
      if (/\/(_next|_vercel)\/image\/?$/.test(u.pathname) && u.searchParams.get('url')) return new URL(u.searchParams.get('url'), u.origin).href;
      return u.href;
    } catch { return s; }
  };
  const buttonLike = (a) => /(^|[\s_-])(btn|button|cta)([\s_-]|$)/i.test(clsOf(a)) || a.getAttribute('role') === 'button';
  const BR = '\u0001';

  function inl(node) {
    if (node.nodeType === 3) return node.nodeValue;
    if (node.nodeType !== 1) return '';
    const el = node;
    if (SKIP.has(el.tagName.toUpperCase()) || hidden(el)) return '';
    const tag = el.tagName.toLowerCase();
    const kids = () => [...el.childNodes].map(inl).join('');
    switch (tag) {
      case 'br': return BR;
      case 'strong': case 'b': { const t = kids().trim(); return t ? `**${t}**` : ''; }
      case 'em': case 'i': { const t = kids().trim(); return t ? `*${t}*` : ''; }
      case 'code': { const t = kids().trim(); return t ? `\`${t}\`` : ''; }
      case 'img': return `![${norm(el.getAttribute('alt'))}](${imgSrc(el)})`;
      case 'picture': { const i = el.querySelector('img'); return i ? inl(i) : ''; }
      case 'button': { const t = norm(kids()); return t ? ` [Button: ${t}] ` : ''; }
      case 'svg': { const t = el.getAttribute('aria-label') || norm(el.querySelector('title')?.textContent); return t && Math.max(el.getBoundingClientRect().width, 0) > minSvg ? `{Inline SVG: ${t}}` : ''; }
      case 'a': {
        const t = norm(kids().replace(new RegExp(BR, 'g'), ' '));
        if (!t) return '';
        const href = el.getAttribute('href') || '';
        if (/^javascript:/i.test(href) || href === '') return t;
        return buttonLike(el) ? ` [CTA: ${t}](${el.href}) ` : `[${t}](${el.href})`;
      }
      case 'input': {
        const type = (el.getAttribute('type') || 'text').toLowerCase();
        if (type === 'hidden') return '';
        if (['submit', 'button', 'reset'].includes(type)) return ` [Button: ${el.value || type}] `;
        return ` [Input ${type}: ${el.getAttribute('placeholder') || el.getAttribute('aria-label') || el.name || ''}] `;
      }
      case 'textarea': return ` [Textarea: ${el.getAttribute('placeholder') || el.name || ''}] `;
      case 'select': return ` [Select: ${[...el.options].map((o) => norm(o.textContent)).join(' | ')}] `;
      case 'video': case 'audio': {
        const src = el.currentSrc || el.getAttribute('src') || el.querySelector('source')?.getAttribute('src') || '';
        const poster = el.getAttribute('poster');
        return ` [${tag === 'video' ? 'Video' : 'Audio'}: ${src ? new URL(src, document.baseURI).href : '?'}${poster ? ` poster=${new URL(poster, document.baseURI).href}` : ''}] `;
      }
      case 'iframe': return ` [Embed: ${el.getAttribute('src') || ''}] `;
      default: {
        const t = kids();
        return isBlock(el) ? ` ${t} ` : t;
      }
    }
  }
  const finishInline = (s) => s.replace(/[ \t\r\n ]+/g, ' ').split(BR).map((x) => x.trim()).join('  \n').trim();

  const blocks = [];
  let run = [];
  const flush = () => {
    const t = finishInline(run.join(''));
    run = [];
    if (t) blocks.push(t);
  };

  function list(el, depth) {
    const ordered = el.tagName === 'OL';
    const lines = [];
    let n = 0;
    for (const li of el.children) {
      if (li.tagName !== 'LI' || hidden(li)) continue;
      n++;
      const bullet = ordered ? `${n}.` : '-';
      const pad = '  '.repeat(depth);
      const own = [];
      const nested = [];
      for (const c of li.childNodes) {
        if (c.nodeType === 1 && /^(UL|OL)$/.test(c.tagName)) nested.push(c); else own.push(c);
      }
      const t = finishInline(own.map(inl).join(''));
      if (t) lines.push(`${pad}${bullet} ${t.replace(/\n/g, ' ')}`);
      for (const nl of nested) lines.push(...list(nl, depth + 1));
    }
    return lines;
  }
  function table(el) {
    const rows = [...el.querySelectorAll('tr')].filter((r) => !hidden(r));
    const lines = [];
    rows.forEach((r, i) => {
      const cells = [...r.children].filter((c) => /^T[DH]$/.test(c.tagName)).map((c) => finishInline(inl(c)).replace(/\|/g, '/').replace(/\n/g, ' '));
      lines.push(`| ${cells.join(' | ')} |`);
      if (i === 0) lines.push(`| ${cells.map(() => '---').join(' | ')} |`);
    });
    return lines.join('\n');
  }

  const REGION = { HEADER: 'Header', FOOTER: 'Footer', ASIDE: 'Aside' };
  function walk(node) {
    if (node.nodeType === 3) { run.push(node.nodeValue); return; }
    if (node.nodeType !== 1) return;
    const el = node;
    const T = el.tagName.toUpperCase();
    if (SKIP.has(T) || hidden(el)) return;
    switch (T) {
      case 'H1': case 'H2': case 'H3': case 'H4': case 'H5': case 'H6': {
        flush(); const t = finishInline(el.childNodes.length ? [...el.childNodes].map(inl).join('') : '');
        if (t) blocks.push(`${'#'.repeat(Number(T[1]))} ${t.replace(/\n+/g, ' ')}`);
        return;
      }
      case 'P': case 'FIGCAPTION': case 'SUMMARY': case 'DT': case 'DD': case 'LABEL': case 'LEGEND': {
        flush(); const t = finishInline([...el.childNodes].map(inl).join(''));
        if (t) blocks.push(t); return;
      }
      case 'UL': case 'OL': { flush(); const l = list(el, 0); if (l.length) blocks.push(l.join('\n')); return; }
      case 'TABLE': { flush(); const t = table(el); if (t) blocks.push(t); return; }
      case 'PRE': { flush(); const t = el.textContent.replace(/\n+$/, ''); if (t.trim()) blocks.push('```\n' + t + '\n```'); return; }
      case 'HR': flush(); blocks.push('---'); return;
      case 'BLOCKQUOTE': {
        flush(); const saved = blocks.length;
        for (const c of el.childNodes) walk(c);
        flush();
        const inner = blocks.splice(saved).join('\n\n');
        if (inner) blocks.push(inner.split('\n').map((l) => `> ${l}`).join('\n'));
        return;
      }
      case 'BR': run.push(BR); return;
      case 'BUTTON': case 'INPUT': case 'TEXTAREA': case 'SELECT': case 'IMG': case 'PICTURE': case 'VIDEO': case 'AUDIO': case 'IFRAME': case 'SVG': {
        const t = inl(el);
        if (!t.trim()) return;
        if (['BUTTON', 'IMG', 'PICTURE', 'VIDEO', 'AUDIO', 'IFRAME'].includes(T) || /^\[(Button|Input|Select|Textarea)/.test(t.trim())) {
          flush(); blocks.push(finishInline(t));
        } else run.push(t);
        return;
      }
      case 'A': {
        if (el.querySelector(BLOCK_DESC) || (el.querySelector('img') && !norm(el.textContent))) {
          // card-style link wrapping blocks: keep the structure, then note the destination
          flush();
          for (const c of el.childNodes) walk(c);
          flush();
          const href = el.getAttribute('href');
          if (href && !/^(javascript:|#)/i.test(href)) blocks.push(`-> ${el.href}`);
          return;
        }
        const t = inl(el);
        if (buttonLike(el)) { flush(); blocks.push(finishInline(t)); } else run.push(t);
        return;
      }
      default: {
        const region = REGION[T] || (T === 'NAV' && !el.closest('header,footer') ? 'Navigation' : null);
        const block = isBlock(el) || region;
        if (!block && !el.querySelector(BLOCK_DESC)) { run.push(inl(el)); return; }
        if (block) flush();
        if (region) blocks.push(`---\n**${region}${el.getAttribute('aria-label') ? ` (${el.getAttribute('aria-label')})` : ''}**`);
        for (const c of el.childNodes) walk(c);
        if (block) flush();
        if (region) blocks.push('---');
      }
    }
  }
  walk(document.body);
  flush();
  // collapse repeated separators
  const md = blocks.join('\n\n').replace(/(---\n\n)(?=---)/g, '').replace(/\n{3,}/g, '\n\n');

  const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
  return { meta, headings, links, images, refs, svgs, manifestHref: manifestHref ? abs(manifestHref) : null, inlineCss, markdown: md, html };
}
