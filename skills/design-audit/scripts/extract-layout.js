/**
 * extract-layout.js — Pure browser extraction function for design-audit skill
 *
 * This file contains ONLY the function body that runs inside page.evaluate().
 * No imports, no Playwright, no Node APIs — just DOM walking and computed style extraction.
 *
 * Loaded by run-extraction.sh via: new Function('return (' + fileContent + ')()')
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

  // Helper: parse rgba string to object
  function parseColor(colorStr) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return null;
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
  }

  // Helper: walk ancestors to find effective background color
  function getEffectiveBackground(el) {
    let current = el;
    while (current && current !== document.documentElement) {
      const bg = getComputedStyle(current).backgroundColor;
      const parsed = parseColor(bg);
      if (parsed && parsed.a > 0.01) {
        // If semi-transparent, blend with white as fallback
        if (parsed.a < 1) {
          return {
            r: Math.round(parsed.r * parsed.a + 255 * (1 - parsed.a)),
            g: Math.round(parsed.g * parsed.a + 255 * (1 - parsed.a)),
            b: Math.round(parsed.b * parsed.a + 255 * (1 - parsed.a)),
            a: 1,
            raw: bg,
          };
        }
        return { ...parsed, raw: bg };
      }
      current = current.parentElement;
    }
    // Default: white
    return { r: 255, g: 255, b: 255, a: 1, raw: 'rgb(255, 255, 255)' };
  }

  // Helper: generate a unique-ish CSS selector
  function getSelector(el) {
    if (el.id) return `#${el.id}`;
    const parts = [];
    let current = el;
    for (let i = 0; i < 4 && current && current !== document.body; i++) {
      let part = current.tagName.toLowerCase();
      if (current.id) { parts.unshift(`#${current.id}`); break; }
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).slice(0, 2).join('.');
        if (classes) part += `.${classes}`;
      }
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
        if (siblings.length > 1) {
          const idx = siblings.indexOf(current) + 1;
          part += `:nth-of-type(${idx})`;
        }
      }
      parts.unshift(part);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  // Collect unique values
  const fontSizeSet = new Set();
  const spacingSet = new Set();
  const colorSet = new Set();
  const bgColorSet = new Set();
  const transitionDurationSet = new Set();
  const animationDurationSet = new Set();
  const easingSet = new Set();

  // Walk all elements
  const allElements = document.querySelectorAll('body *');

  for (const el of allElements) {
    const style = getComputedStyle(el);

    // Skip hidden elements
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

    const rect = el.getBoundingClientRect();
    // Skip zero-area elements
    if (rect.width === 0 && rect.height === 0) continue;

    const tag = el.tagName.toLowerCase();
    const isText = el.innerText && el.innerText.trim().length > 0 &&
                   ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'li', 'td', 'th',
                    'label', 'button', 'blockquote', 'figcaption', 'dt', 'dd'].includes(tag);
    const isInteractive = ['a', 'button', 'input', 'select', 'textarea'].includes(tag) ||
                          el.getAttribute('role') === 'button' ||
                          el.getAttribute('tabindex') !== null;
    const isSection = ['section', 'main', 'article', 'header', 'footer', 'nav', 'aside', 'div'].includes(tag);

    // Skip leaf nodes that are neither text nor interactive nor section containers
    if (!isText && !isInteractive && !isSection) continue;
    // For sections, only include if they're direct layout containers (have > 0 height)
    if (isSection && !isText && !isInteractive && rect.height < 10) continue;

    const fontSize = parseFloat(style.fontSize);
    const lineHeight = style.lineHeight === 'normal'
      ? fontSize * 1.2
      : parseFloat(style.lineHeight);
    const fontWeight = parseInt(style.fontWeight) || 400;

    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    const marginLeft = parseFloat(style.marginLeft) || 0;
    const marginRight = parseFloat(style.marginRight) || 0;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;

    const color = style.color;
    const bgColor = getEffectiveBackground(el);

    // Collect transition/animation info
    const transitionDuration = style.transitionDuration;
    const animationDuration = style.animationDuration;
    const transitionTimingFn = style.transitionTimingFunction;

    // Track unique values
    if (isText && fontSize) fontSizeSet.add(Math.round(fontSize * 10) / 10);
    [marginTop, marginBottom, marginLeft, marginRight, paddingTop, paddingBottom, paddingLeft, paddingRight]
      .filter(v => v > 0)
      .forEach(v => spacingSet.add(Math.round(v * 10) / 10));
    if (color) colorSet.add(color);
    if (bgColor.raw) bgColorSet.add(bgColor.raw);
    if (transitionDuration && transitionDuration !== '0s') {
      transitionDuration.split(',').map(s => s.trim()).forEach(d => transitionDurationSet.add(d));
    }
    if (animationDuration && animationDuration !== '0s') {
      animationDuration.split(',').map(s => s.trim()).forEach(d => animationDurationSet.add(d));
    }
    if (transitionTimingFn && transitionTimingFn !== 'ease') {
      easingSet.add(transitionTimingFn);
    }

    const entry = {
      tag,
      selector: getSelector(el),
      isText,
      isInteractive,
      isSection: isSection && !isText,
      text: isText ? (el.innerText || '').trim().substring(0, 80) : undefined,
      role: el.getAttribute('role') || undefined,

      // Typography
      fontSize,
      fontWeight,
      fontFamily: style.fontFamily.split(',')[0].trim().replace(/['"]/g, ''),
      fontStyle: style.fontStyle,
      lineHeight: Math.round(lineHeight * 10) / 10,
      letterSpacing: style.letterSpacing === 'normal' ? 0 : parseFloat(style.letterSpacing) || 0,
      wordSpacing: style.wordSpacing === 'normal' ? 0 : parseFloat(style.wordSpacing) || 0,

      // Colors
      color,
      backgroundColor: bgColor.raw,
      backgroundColorParsed: { r: bgColor.r, g: bgColor.g, b: bgColor.b, a: bgColor.a },

      // Geometry
      x: Math.round(rect.x * 10) / 10,
      y: Math.round(rect.y * 10) / 10,
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10,
      cx: Math.round((rect.x + rect.width / 2) * 10) / 10,
      cy: Math.round((rect.y + rect.height / 2) * 10) / 10,

      // Spacing
      marginTop, marginBottom, marginLeft, marginRight,
      paddingTop, paddingBottom, paddingLeft, paddingRight,

      // Text metrics
      textLength: isText ? (el.innerText || '').trim().length : undefined,

      // Animations
      transitionDuration: transitionDuration !== '0s' ? transitionDuration : undefined,
      animationDuration: animationDuration !== '0s' ? animationDuration : undefined,
      transitionTimingFunction: transitionTimingFn || undefined,
    };

    // Clean undefined values
    Object.keys(entry).forEach(k => { if (entry[k] === undefined) delete entry[k]; });

    results.elements.push(entry);
  }

  // Populate page-level stats
  results.pageLevelStats.uniqueFontSizes = [...fontSizeSet].sort((a, b) => a - b);
  results.pageLevelStats.uniqueSpacingValues = [...spacingSet].sort((a, b) => a - b);
  results.pageLevelStats.uniqueColors = [...colorSet];
  results.pageLevelStats.uniqueBackgroundColors = [...bgColorSet];
  results.pageLevelStats.uniqueTransitionDurations = [...transitionDurationSet];
  results.pageLevelStats.uniqueAnimationDurations = [...animationDurationSet];
  results.pageLevelStats.uniqueEasingFunctions = [...easingSet];
  results.pageLevelStats.elementCount = results.elements.length;
  results.pageLevelStats.textElementCount = results.elements.filter(e => e.isText).length;
  results.pageLevelStats.interactiveElementCount = results.elements.filter(e => e.isInteractive).length;
  results.pageLevelStats.sectionCount = results.elements.filter(e => e.isSection).length;

  return results;
}
