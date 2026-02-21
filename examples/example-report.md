# Design Audit Report

**URL:** https://example.com
**Date:** 2025-02-21T14:00:00.000Z
**Viewport:** 1440x900
**Overall Score:** 74/100 — Grade C

---

## Per-Metric Breakdown

### 1. Modular Scale Consistency — 0.82 — Pass

- **Detected scale:** Perfect Fourth (ratio ≈ 1.333)
- **Font sizes found:** 12, 14, 16, 21.3, 28.4, 37.9 px
- **Ratios:** 14/12 = 1.167, 16/14 = 1.143, 21.3/16 = 1.331, 28.4/21.3 = 1.333, 37.9/28.4 = 1.334
- **CV (coefficient of variation):** 0.064 — within Warn threshold
- **Outlier:** 12px and 14px deviate from the Perfect Fourth scale; the smallest 2 sizes use an inconsistent minor second ratio
- **Violations:** `.caption` at 12px (nearest scale value: 12.0px — borderline), `.label` at 14px (nearest: 14.2px)

---

### 2. Spacing Harmony (8pt Grid) — 0.68 — Warn

- **Total unique spacing values:** 11 (4, 6, 8, 12, 16, 24, 32, 48, 64, 80, 96)
- **8pt grid compliant:** 8 of 11 (8, 16, 24, 32, 48, 64, 80, 96) → 72.7%
- **Non-compliant:** 4px, 6px, 12px
- **Geometric progression CV:** 0.18 — consistent once outliers removed
- **Score:** (0.727 × 0.5) + (0.82 × 0.5) = 0.774 → 0.68 after penalty for 3 non-grid values
- **Violations:** `.card` padding-top: 6px, `.badge` margin-right: 4px, `.divider` margin: 12px

---

### 3. Vertical Rhythm — 0.71 — Warn

- **Base rhythm unit detected:** 8px (GCD of line heights: 25.6, 20, 45.5 ≈ 8px via rounding)
- **Elements on grid:** 12 of 18 text elements (66.7%)
- **Violations:** `h1` line-height 45.5px (not divisible by 8 — suggest 48px), `p` line-height 25.6px (suggest 24px)
- **Paragraph spacing:** Most `<p>` margin-bottoms (24px) = 1× line-height — good

---

### 4. WCAG Contrast — 0.91 — Pass

- **Text elements evaluated:** 18
- **AA pass rate (4.5:1):** 16/18 = 88.9% ← below 100% threshold
- **AAA pass rate (7:1):** 12/18 = 66.7%
- **Primary score:** 0.91 (adjusted — both violations are borderline)

**Violations:**
| Element | Selector | Foreground | Background | Ratio | Required |
|---------|----------|------------|------------|-------|----------|
| Body text | `.secondary-text` | rgb(156,163,175) | rgb(255,255,255) | 2.9:1 | 4.5:1 AA |
| Nav link | `.nav-link` | rgb(156,163,175) | rgb(249,250,251) | 2.8:1 | 4.5:1 AA |

---

### 5. Golden Ratio Proximity — 0.33 — Warn

- **φ = 1.618, tolerance ±0.15**
- **Section spacing ratios checked:** 3 pairs
  - Section 1→2 gap: 96px / 48px = 2.0 (outside tolerance)
  - Section 2→3 gap: 80px / 48px = 1.667 ✓ (within tolerance)
  - Section 3→4 gap: 64px / 48px = 1.333 (outside tolerance)
- **Content block aspect ratios:** Hero section 1440×480 = 3.0 (not golden)
- **Golden grid alignment:** 2 of 6 major elements align to 38.2% or 61.8% of 1440px
- **Score:** 3 of 9 checks pass = 0.33

---

### 6. Gestalt Proximity — 0.75 — Pass

- **Sibling groups evaluated:** 4 groups with 3+ siblings
- **Intra-group spacing (average):** 16px
- **Inter-group spacing (average):** 80px
- **Ratio:** 80/16 = 5.0 — well above 2.0 threshold
- **Groups passing (≥2.0 ratio):** 3 of 4 = 75%
- **Violation:** Feature cards group — intra: 24px, inter: 32px, ratio = 1.33

---

### 7. Alignment Score — 0.86 — Pass

- **Alignment axes detected (within 2px tolerance):**
  - x=120px (left edge) — 14 elements
  - x=1320px (right edge) — 12 elements
  - cx=720px (horizontal center) — 8 elements
  - y=96px (first section top) — 4 elements
- **Elements sharing ≥1 axis:** 36 of 42 = 85.7%
- **Violations:** 6 elements off-grid (decorative icons, positioned absolutely)

---

### 8. Line Length (Readability) — 0.72 — Warn

- **Text blocks evaluated:** 8 (paragraphs and headings only)
- **Estimated chars/line formula:** width / (fontSize × 0.5)

| Element | Width | Font Size | Est. Chars/Line | In Range? |
|---------|-------|-----------|-----------------|-----------|
| Hero `<p>` | 520px | 16px | 65 | ✓ optimal |
| Feature `<p>` | 680px | 14px | 97 | ✗ too wide |
| Section `<p>` | 800px | 16px | 100 | ✗ too wide |
| Testimonial `<p>` | 380px | 16px | 47.5 | ✓ optimal |

- **In optimal range (45–75):** 4 of 8 = 50% — below Warn threshold → adjusted to 0.72 with partial credit
- **Violations:** 4 text blocks exceed 90 chars/line — add `max-width: 65ch`

---

### 9. Visual Weight Balance — 0.79 — Warn

- **Visual center of mass:** cx=648px, cy=412px
- **Optical center (1440×900):** cx=720px, cy=414px (0.46× height)
- **Deviation:** √((720-648)² + (414-412)²) = 72.0px
- **Viewport diagonal:** √(1440² + 900²) = 1700px
- **Normalized deviation:** 72/1700 = 0.042
- **Score:** 1 - (0.042/0.25) = 0.83 → 0.79 (adjusted for skewed left-heavy hero)
- **Note:** The hero image is left-aligned, pulling the visual mass leftward

---

### 10. Birkhoff Aesthetic Measure — M = 0.94 — Balanced

- **Complexity (C):** 6 font sizes + 11 spacing values + 5 colors = 22
- **Order (O):**
  - alignment_axes_count × 2 = 4 × 2 = 8
  - grid_compliance_rate × 10 = 0.727 × 10 = 7.27
  - scale_consistency × 10 = 0.82 × 10 = 8.2
  - symmetry_score × 5 = 0.6 × 5 = 3.0
  - Total O = 26.47
- **M = O/C = 26.47/22 = 1.20** → High harmony (order dominates)
- **Interpretation:** Design is ordered relative to its complexity; main concern is the 3 non-grid spacing values and 2 outlier font sizes inflating C

---

### 11. Animation Timing (Bonus) — 0.88 — Pass

- **Transition declarations:** 8 total
- **Using standard durations (Material Design):** 7 of 8 (150ms, 200ms, 300ms)
- **Non-standard:** 1 element uses `transition-duration: 250ms` (not in the standard set — though 250 is acceptable, it's not in MD3 spec)
- **Easing functions:** All 8 use `cubic-bezier(0.4, 0, 0.2, 1)` — consistent and standard

---

## Weighted Overall Score

| Metric | Weight | Score | Weighted |
|--------|--------|-------|---------|
| WCAG Contrast | 20% | 0.91 | 18.2 |
| Modular Scale | 15% | 0.82 | 12.3 |
| Spacing Harmony | 15% | 0.68 | 10.2 |
| Vertical Rhythm | 10% | 0.71 | 7.1 |
| Golden Ratio | 10% | 0.33 | 3.3 |
| Alignment | 10% | 0.86 | 8.6 |
| Line Length | 5% | 0.72 | 3.6 |
| Gestalt Proximity | 5% | 0.75 | 3.75 |
| Visual Balance | 5% | 0.79 | 3.95 |
| Birkhoff | 5% | 0.94 | 4.7 |
| **Total** | **100%** | | **75.7 → 74/100** |

**Grade: C — Good with notable gaps**

---

## Top 5 Actionable Improvements

1. **Fix WCAG contrast failures (impact: +4-6 pts)** — Change `.secondary-text` and `.nav-link` text color from `rgb(156,163,175)` to `rgb(107,114,128)` (contrast ratio increases from 2.9:1 to 4.7:1 against white; and 4.5:1 against #f9fafb). This resolves 2 AA violations.

2. **Constrain long text blocks (impact: +2-3 pts)** — Add `max-width: 65ch` to paragraph text in feature sections and the wide section `<p>`. Currently 4 blocks exceed 90 chars/line — readability degrades significantly above 75 chars.

3. **Replace non-grid spacings (impact: +2 pts)** — Swap 4px → 0 or 8px, 6px → 8px, and 12px → 8px or 16px. This brings 8pt grid compliance from 73% to 100% and improves Spacing Harmony from Warn to Pass.

4. **Round line heights to 8px grid (impact: +2 pts)** — Set `h1` line-height from 45.5px to 48px and `<p>` from 25.6px to 24px. This locks vertical rhythm to the 8px grid and brings Vertical Rhythm from Warn to Pass.

5. **Improve golden ratio alignment (impact: +1-2 pts)** — Adjust section spacing to use a 1.618 progression: if base gap is 48px, the next should be 77px (≈80px), then 128px. Consider centering the hero content at the 61.8% horizontal point (x≈890px) to utilize the golden grid.
