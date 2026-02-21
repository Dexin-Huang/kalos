# Aesthetic Formulas Reference

All formulas, constants, and thresholds used by the design-audit skill.
Claude reads this file and applies each metric to the extracted layout JSON.

---

## Metric 1: Modular Scale Consistency

**Purpose:** Check whether all font sizes follow a consistent typographic scale.

**Steps:**
1. Extract all distinct `fontSize` values from the audit JSON, sort ascending
2. Compute ratio between each consecutive pair: `ratio_i = size[i+1] / size[i]`
3. Compute mean and standard deviation of all ratios
4. Score = `1 - (std_dev / mean)` (inverted coefficient of variation), clamped to [0, 1]

**Named scales for identification:**
| Name            | Ratio |
|-----------------|-------|
| Minor Second    | 1.067 |
| Major Second    | 1.125 |
| Minor Third     | 1.200 |
| Major Third     | 1.250 |
| Perfect Fourth  | 1.333 |
| Augmented Fourth| 1.414 |
| Perfect Fifth   | 1.500 |
| Golden Ratio    | 1.618 |

**Thresholds:**
- Pass: CV < 0.05 (ratios vary less than 5%)
- Warn: CV < 0.15
- Fail: CV >= 0.15

**Outlier detection:** Any font size whose ratio to its nearest scale neighbor exceeds 1.5x the expected ratio is an outlier.

---

## Metric 2: Spacing Harmony (Auto-Detected Grid + Geometric Progression)

**Purpose:** Check that spacing values follow a systematic grid and progression.

**Steps:**
1. Extract all distinct margin and padding values (top/bottom/left/right) from elements, ignore 0
2. **Auto-detect grid unit:** Find the GCD of the 5 most common spacing values (rounded to nearest integer). Common grids: 4pt, 6pt, 8pt. Use this detected grid unit for compliance checks.
3. **Grid compliance:** For each value, check `value % detectedGridUnit === 0` (allow ±1px tolerance for subpixel rounding)
4. **Geometric progression:** Sort all unique spacing values ascending, compute ratios between consecutive pairs, measure consistency (same CV formula as Metric 1)
5. Score = `(grid_compliant_count / total_count) * 0.5 + scale_consistency * 0.5`

**Thresholds:**
- Pass: score >= 0.80
- Warn: score >= 0.60
- Fail: score < 0.60

---

## Metric 3: Vertical Rhythm

**Purpose:** Ensure line heights and paragraph spacing create consistent vertical rhythm.

**Steps:**
1. Collect all `lineHeight` values (resolved to px) from text elements
2. Round all lineHeight values to the nearest integer before computing GCD. Use Euclidean GCD algorithm. If the resulting base unit is < 2, use 4 as the default base unit. The result is the base rhythm unit (ideally 4 or 8).
3. For each text element: check `lineHeight % baseUnit === 0`
4. For paragraph spacing (marginTop/marginBottom on `<p>` elements): check it equals 1x–2x the element's lineHeight
5. Score = percentage of elements whose lineHeight is on the grid

**Thresholds:**
- Pass: >= 85% on grid
- Warn: >= 65%
- Fail: < 65%

---

## Metric 4: WCAG Contrast

**Purpose:** Verify text/background contrast meets accessibility standards.

**Relative luminance formula:**
```
For each sRGB channel (R, G, B) normalized to [0, 1]:
  if channel <= 0.04045: linear = channel / 12.92
  else: linear = ((channel + 0.055) / 1.055) ^ 2.4

L = 0.2126 * R_linear + 0.7152 * G_linear + 0.0722 * B_linear
```

**Contrast ratio:**
```
CR = (L_lighter + 0.05) / (L_darker + 0.05)
```

**Requirements:**
| Category | AA | AAA |
|----------|-----|------|
| Normal text (<24px, not bold) | >= 4.5:1 | >= 7:1 |
| Large text (>=24px, or >=18.66px bold) | >= 3:1 | >= 4.5:1 |
| Interactive controls (buttons, inputs) | >= 3:1 | >= 4.5:1 |

**Score:** Report both AA% and AAA% pass rates. Primary score = AA pass rate.

**Thresholds:**
- Pass: 100% AA compliance
- Warn: >= 90% AA
- Fail: < 90% AA

---

## Metric 5: Proportional Harmony

**Purpose:** Check whether layout proportions follow a consistent proportional system. The golden ratio (φ = 1.618) is the primary named ratio, but the metric rewards any coherent proportional system applied consistently across the layout.

**Golden ratio constant:** φ = 1.618033988749895
**Tolerance:** ±0.15 (so range 1.468 to 1.768)

**Checks:**
1. **Section spacing:** For vertically stacked major sections, compute ratio of spacing between consecutive section pairs. Check against φ.
2. **Content block aspect ratios:** For sections/containers with both width and height, compute `max(w,h) / min(w,h)` and check against φ.
3. **Golden grid alignment:** Check if major elements align to golden grid lines at 38.2% and 61.8% of viewport width (within 2% tolerance).

**Score:** Percentage of checked ratios/positions within golden tolerance.

**Thresholds:**
- Pass: >= 40% of ratios are golden (aspirational metric — golden ratio is a bonus, not a requirement)
- Warn: >= 20%
- Fail: < 20%

---

## Metric 6: Gestalt Proximity

**Purpose:** Verify that related elements are visually grouped via spacing.

**Steps:**
1. Identify sibling groups: elements that share a parent container
2. For each group of 3+ siblings:
   - Compute intra-group spacing (distance between consecutive siblings)
   - Compute inter-group spacing (distance to the nearest element outside the group)
3. Compute ratio: `inter_group_spacing / intra_group_spacing`

**Thresholds for ratio:**
- Pass: ratio >= 2.0
- Warn: ratio >= 1.5
- Fail: ratio < 1.5

**Score:** Percentage of groups meeting the 2.0 threshold.

---

## Metric 7: Alignment Score

**Purpose:** Measure how many elements share alignment axes.

**Steps:**
1. For all visible elements, collect: left edge (x), right edge (x + width), center-x (cx), center-y (cy), top edge (y), bottom edge (y + height)
2. Use a 2px tolerance for grouping (values within 2px are considered aligned)
3. Count alignment axes: unique x-positions or y-positions shared by 3+ elements
4. For each element, check if it shares at least one alignment axis with other elements
5. Score = percentage of elements sharing at least one axis

**Thresholds:**
- Pass: >= 80%
- Warn: >= 60%
- Fail: < 60%

---

## Metric 8: Line Length (Readability)

**Purpose:** Ensure text blocks have readable line lengths.

**Formula:**
```
chars_per_line ≈ element_width / (fontSize * charWidthFactor)
```

The `charWidthFactor` depends on font family (detected via the `fontFamily` field):
- Sans-serif fonts: 0.48
- Serif fonts: 0.52
- Monospace fonts: 0.60

**Optimal range:** 45–75 characters per line
**Acceptable range:** 35–90 characters per line

**Score:** Percentage of text blocks within the optimal range.

**Thresholds:**
- Pass: >= 80% in optimal range
- Warn: >= 60%
- Fail: < 60%

Only evaluate block-level text elements (paragraphs, headings, list items) — skip inline elements, labels, buttons.

---

## Metric 9: Visual Weight Balance

**Purpose:** Check whether the visual center of mass aligns with the optical center.

**Steps:**
1. For each visible element, compute visual weight: `weight_i = area_i * contrast_i`
   - `area_i = width * height`
   - `contrast_i` = contrast ratio of the element's color against the page background
2. Compute center of visual mass:
   - `cx_mass = sum(weight_i * cx_i) / sum(weight_i)`
   - `cy_mass = sum(weight_i * cy_i) / sum(weight_i)`
3. Optical center of page: `(viewportWidth * 0.50, viewportHeight * 0.46)` (slightly above geometric center)
4. Deviation = Euclidean distance between visual mass center and optical center, normalized by viewport diagonal
5. Score = `1 - (deviation / 0.25)`, clamped to [0, 1] (0.25 = max acceptable deviation as fraction of diagonal)

**Thresholds:**
- Pass: score >= 0.80
- Warn: score >= 0.60
- Fail: score < 0.60

---

## Metric 10: Birkhoff Aesthetic Measure

**Purpose:** Holistic order-to-complexity ratio.

**Formula:** `M = O / C`

**Complexity (C):**
```
C = count_distinct_font_sizes + count_distinct_spacing_values + count_distinct_colors
```

Where `count_distinct_colors` is the count of distinct values in the UNION of `uniqueColors` and `uniqueBackgroundColors`.

**Order (O):**

All Order components must be normalized to [0, 1] before weighting:
- `alignment_axes_count` normalized: `min(alignment_axes_count / 20, 1)` (cap at 20 axes)
- `grid_compliance_rate`: already in [0, 1]
- `scale_consistency`: already in [0, 1]
- `symmetry_score`: already in [0, 1]

```
O = alignment_axes_norm * 2
  + grid_compliance_rate * 10
  + scale_consistency * 10
  + symmetry_score * 5
```

Where:
- `alignment_axes_norm` = `min(alignment_axes_count / 20, 1)` (from Metric 7)
- `grid_compliance_rate` = fraction of spacings on 8pt grid (from Metric 2)
- `scale_consistency` = modular scale score (from Metric 1)
- `symmetry_score` = fraction of elements with a horizontally mirrored counterpart (within 5% tolerance)

**Interpretation:**
- M > 1.0: High harmony (order dominates complexity)
- M = 0.5–1.0: Balanced
- M < 0.5: Potentially chaotic — too many disparate values

---

## Metric 11: Animation Timing

**Purpose:** Check that animation/transition durations use standard tokens.

**Material Design 3 standard durations (ms):** 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000

**Standard easing functions:**
- `ease` / `ease-in-out`
- `cubic-bezier(0.4, 0, 0.2, 1)` — standard (Material)
- `cubic-bezier(0, 0, 0.2, 1)` — decelerate
- `cubic-bezier(0.4, 0, 1, 1)` — accelerate
- `cubic-bezier(0.4, 0, 0, 1)` — emphasized decelerate
- Allow custom beziers if they're used consistently across the site

**Score:** Percentage of transition/animation declarations using standard durations.

**Thresholds:**
- Pass: >= 80%
- Warn: >= 50%
- Fail: < 50%

---

## Overall Aesthetic Score

Weighted average of all metrics (scores normalized to 0–1, final reported as 0–100):

| Metric | Weight |
|--------|--------|
| WCAG Contrast (Metric 4) | 20% |
| Modular Scale (Metric 1) | 15% |
| Spacing Harmony (Metric 2) | 15% |
| Vertical Rhythm (Metric 3) | 10% |
| Proportional Harmony (Metric 5) | 5% |
| Alignment (Metric 7) | 10% |
| Line Length (Metric 8) | 5% |
| Gestalt Proximity (Metric 6) | 5% |
| Visual Balance (Metric 9) | 10% |
| Birkhoff (Metric 10) | 5% |

Animation Timing (Metric 11) is reported separately as a bonus metric — it doesn't factor into the main score since not all pages have animations.

**Grade scale:**
| Score | Grade |
|-------|-------|
| 90–100 | A — Exceptional harmony |
| 80–89 | B — Strong design system adherence |
| 70–79 | C — Good with notable gaps |
| 60–69 | D — Significant inconsistencies |
| < 60 | F — Needs systematic design review |
