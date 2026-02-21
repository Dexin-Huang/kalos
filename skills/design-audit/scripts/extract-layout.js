/**
 * extract-layout.js — Pure browser extraction for design-audit
 * Runs inside page.evaluate(). No imports, no Node APIs — DOM only.
 * Loaded via: new Function('return (' + fileContent + ')()')
 */
function() {
  const results = {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pageHeight: document.documentElement.scrollHeight,
    elements: [],
    pageLevelStats: {
      uniqueFontSizes: [],
      uniqueSpacingValues: [],
      uniqueColors: [],
      uniqueBackgroundColors: [],
      uniqueTransitionDurations: [],
      uniqueAnimationDurations: [],
      uniqueEasingFunctions: [],
    },
  };

  function parseColor(str) {
    const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? parseFloat(m[4]) : 1 };
  }

  function getEffectiveBg(el) {
    let cur = el;
    while (cur && cur !== document.documentElement) {
      const bg = getComputedStyle(cur).backgroundColor;
      const c = parseColor(bg);
      if (c && c.a > 0.01) {
        if (c.a < 1) {
          const blend = (v) => Math.round(v * c.a + 255 * (1 - c.a));
          return { r: blend(c.r), g: blend(c.g), b: blend(c.b), a: 1, raw: bg };
        }
        return { ...c, raw: bg };
      }
      cur = cur.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1, raw: 'rgb(255, 255, 255)' };
  }

  function getSelector(el) {
    if (el.id) return `#${el.id}`;
    const parts = [];
    let cur = el;
    for (let i = 0; i < 4 && cur && cur !== document.body; i++) {
      let part = cur.tagName.toLowerCase();
      if (cur.id) { parts.unshift(`#${cur.id}`); break; }
      if (cur.className && typeof cur.className === 'string') {
        const cls = cur.className.trim().split(/\s+/).slice(0, 2).join('.');
        if (cls) part += `.${cls}`;
      }
      const parent = cur.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
        if (siblings.length > 1) {
          part += `:nth-of-type(${siblings.indexOf(cur) + 1})`;
        }
      }
      parts.unshift(part);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  }

  const fontSizes = new Set();
  const spacings = new Set();
  const colors = new Set();
  const bgColors = new Set();
  const transitionDurs = new Set();
  const animationDurs = new Set();
  const easings = new Set();

  const round1 = (v) => Math.round(v * 10) / 10;

  const TEXT_TAGS = new Set([
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'li', 'td', 'th',
    'label', 'button', 'blockquote', 'figcaption', 'dt', 'dd',
  ]);
  const INTERACTIVE_TAGS = new Set(['a', 'button', 'input', 'select', 'textarea']);
  const SECTION_TAGS = new Set(['section', 'main', 'article', 'header', 'footer', 'nav', 'aside', 'div']);

  for (const el of document.querySelectorAll('body *')) {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const tag = el.tagName.toLowerCase();
    const isText = TEXT_TAGS.has(tag) && el.innerText && el.innerText.trim().length > 0;
    const isInteractive = INTERACTIVE_TAGS.has(tag) ||
                          el.getAttribute('role') === 'button' ||
                          el.getAttribute('tabindex') !== null;
    const isSection = SECTION_TAGS.has(tag);

    if (!isText && !isInteractive && !isSection) continue;
    if (isSection && !isText && !isInteractive && rect.height < 10) continue;

    const fontSize = parseFloat(style.fontSize);
    const lineHeight = style.lineHeight === 'normal' ? fontSize * 1.2 : parseFloat(style.lineHeight);
    const fontWeight = parseInt(style.fontWeight) || 400;

    const mt = parseFloat(style.marginTop) || 0;
    const mb = parseFloat(style.marginBottom) || 0;
    const ml = parseFloat(style.marginLeft) || 0;
    const mr = parseFloat(style.marginRight) || 0;
    const pt = parseFloat(style.paddingTop) || 0;
    const pb = parseFloat(style.paddingBottom) || 0;
    const pl = parseFloat(style.paddingLeft) || 0;
    const pr = parseFloat(style.paddingRight) || 0;

    const color = style.color;
    const bg = getEffectiveBg(el);
    const transDur = style.transitionDuration;
    const animDur = style.animationDuration;
    const transTiming = style.transitionTimingFunction;

    if (isText && fontSize) fontSizes.add(round1(fontSize));
    for (const v of [mt, mb, ml, mr, pt, pb, pl, pr]) {
      if (v > 0) spacings.add(round1(v));
    }
    if (color) colors.add(color);
    if (bg.raw) bgColors.add(bg.raw);
    if (transDur && transDur !== '0s') {
      transDur.split(',').forEach(d => transitionDurs.add(d.trim()));
    }
    if (animDur && animDur !== '0s') {
      animDur.split(',').forEach(d => animationDurs.add(d.trim()));
    }
    if (transTiming && transTiming !== 'ease') easings.add(transTiming);

    const entry = {
      tag,
      selector: getSelector(el),
      parentSelector: el.parentElement ? getSelector(el.parentElement) : undefined,
      isText,
      isInteractive,
      isSection: isSection && !isText,
      text: isText ? (el.innerText || '').trim().substring(0, 80) : undefined,
      role: el.getAttribute('role') || undefined,
      fontSize,
      fontWeight,
      fontFamily: style.fontFamily.split(',')[0].trim().replace(/['"]/g, ''),
      fontStyle: style.fontStyle,
      lineHeight: round1(lineHeight),
      letterSpacing: style.letterSpacing === 'normal' ? 0 : parseFloat(style.letterSpacing) || 0,
      wordSpacing: style.wordSpacing === 'normal' ? 0 : parseFloat(style.wordSpacing) || 0,
      color,
      colorParsed: parseColor(color),
      backgroundColor: bg.raw,
      backgroundColorParsed: { r: bg.r, g: bg.g, b: bg.b, a: bg.a },
      x: round1(rect.x),
      y: round1(rect.y),
      width: round1(rect.width),
      height: round1(rect.height),
      cx: round1(rect.x + rect.width / 2),
      cy: round1(rect.y + rect.height / 2),
      marginTop: mt, marginBottom: mb, marginLeft: ml, marginRight: mr,
      paddingTop: pt, paddingBottom: pb, paddingLeft: pl, paddingRight: pr,
      textLength: isText ? (el.innerText || '').trim().length : undefined,
      transitionDuration: transDur !== '0s' ? transDur : undefined,
      animationDuration: animDur !== '0s' ? animDur : undefined,
      transitionTimingFunction: transTiming || undefined,
    };

    Object.keys(entry).forEach(k => { if (entry[k] === undefined) delete entry[k]; });
    results.elements.push(entry);
  }

  const stats = results.pageLevelStats;
  stats.uniqueFontSizes = [...fontSizes].sort((a, b) => a - b);
  stats.uniqueSpacingValues = [...spacings].sort((a, b) => a - b);
  stats.uniqueColors = [...colors];
  stats.uniqueBackgroundColors = [...bgColors];
  stats.uniqueTransitionDurations = [...transitionDurs];
  stats.uniqueAnimationDurations = [...animationDurs];
  stats.uniqueEasingFunctions = [...easings];
  stats.elementCount = results.elements.length;
  stats.textElementCount = results.elements.filter(e => e.isText).length;
  stats.interactiveElementCount = results.elements.filter(e => e.isInteractive).length;
  stats.sectionCount = results.elements.filter(e => e.isSection).length;

  return results;
}
