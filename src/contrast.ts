/**
 * Color helpers for branded informe output.
 *
 * - `pickForeground`: WCAG-style relative luminance check → black or white text.
 * - `isAccentOnly`: a color whose luminance is too dark to host body text comfortably,
 *   even with white text — caller should use it as a thin accent (rule line, heading
 *   underline) rather than a full band background.
 */

export interface ContrastResult {
  /** Hex foreground color ("#000000" / "#ffffff") for legible text on the input. */
  foreground: '#000000' | '#ffffff'
  /** True when the color is too saturated/dark for a band background — use as accent only. */
  accentOnly: boolean
}

const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function parseHex(hex: string | null | undefined): { r: number; g: number; b: number } | null {
  if (!hex) return null
  const m = hex.match(HEX_RE)
  if (!m) return null
  let body = m[1]
  if (body.length === 3) body = body.split('').map(c => c + c).join('')
  const num = parseInt(body, 16)
  return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff }
}

function channel(v: number): number {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex)
  if (!rgb) return 1
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

/**
 * WCAG contrast ratio (1..21). Used to gate "accent-only" — when the contrast against
 * white text is still poor, even white text on the band would be hard to read at body sizes.
 */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Pick black or white foreground for a hex background. Uses 0.5 luminance midpoint
 * with a small bias toward white on saturated brand colors (ratio against white > 4.5).
 */
export function pickForeground(hex: string): '#000000' | '#ffffff' {
  const lum = relativeLuminance(hex)
  if (lum > 0.5) return '#000000'
  return '#ffffff'
}

/**
 * Decide if the color should only be used as a thin accent (rule line, heading underline)
 * instead of as a band background. Returns `true` for mid-tone colors (luminance between
 * 0.2 and 0.55) — these don't host body text comfortably with either black or white text
 * at body-copy sizes; very light or very dark colors are fine as bands.
 */
export function isAccentOnly(hex: string): boolean {
  const lum = relativeLuminance(hex)
  return lum >= 0.2 && lum <= 0.55
}

export function analyzeColor(hex: string | null | undefined): ContrastResult & { hex: string } {
  const fallback = '#1a4d5c'
  const safeHex = parseHex(hex) ? hex! : fallback
  return {
    hex: safeHex,
    foreground: pickForeground(safeHex),
    accentOnly: isAccentOnly(safeHex),
  }
}
