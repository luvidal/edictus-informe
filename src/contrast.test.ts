import { describe, it, expect } from 'vitest'
import { parseHex, pickForeground, isAccentOnly, contrastRatio, analyzeColor } from './contrast'

describe('parseHex', () => {
  it('accepts #rgb shorthand', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(parseHex('#000')).toEqual({ r: 0, g: 0, b: 0 })
  })
  it('accepts #rrggbb', () => {
    expect(parseHex('#2d6d85')).toEqual({ r: 45, g: 109, b: 133 })
  })
  it('accepts un-prefixed', () => {
    expect(parseHex('ffffff')).toEqual({ r: 255, g: 255, b: 255 })
  })
  it('rejects garbage', () => {
    expect(parseHex(null)).toBeNull()
    expect(parseHex(undefined)).toBeNull()
    expect(parseHex('')).toBeNull()
    expect(parseHex('not-a-color')).toBeNull()
    expect(parseHex('#ggg')).toBeNull()
  })
})

describe('pickForeground', () => {
  it('white text on dark backgrounds', () => {
    expect(pickForeground('#000000')).toBe('#ffffff')
    expect(pickForeground('#1a4d5c')).toBe('#ffffff')
    expect(pickForeground('#2d6d85')).toBe('#ffffff')
  })
  it('black text on light backgrounds', () => {
    expect(pickForeground('#ffffff')).toBe('#000000')
    expect(pickForeground('#ffd966')).toBe('#000000')
    expect(pickForeground('#9ad0ec')).toBe('#000000')
  })
  it('crosses the luminance midpoint cleanly', () => {
    // relativeLuminance crosses 0.5 around #bcbcbc (gamma-corrected)
    expect(pickForeground('#777777')).toBe('#ffffff')
    expect(pickForeground('#cccccc')).toBe('#000000')
  })
})

describe('contrastRatio', () => {
  it('white vs black is 21', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1)
  })
  it('symmetric', () => {
    expect(contrastRatio('#2d6d85', '#ffffff'))
      .toBeCloseTo(contrastRatio('#ffffff', '#2d6d85'), 5)
  })
})

describe('isAccentOnly', () => {
  it('mid-luminance colors are accent-only (neither black nor white text reads cleanly)', () => {
    expect(isAccentOnly('#888888')).toBe(true)
    expect(isAccentOnly('#aaaaaa')).toBe(true)
  })
  it('very dark backgrounds host white text fine', () => {
    expect(isAccentOnly('#000000')).toBe(false)
    expect(isAccentOnly('#1a4d5c')).toBe(false)
  })
  it('very light backgrounds host black text fine', () => {
    expect(isAccentOnly('#ffffff')).toBe(false)
    expect(isAccentOnly('#fff5cc')).toBe(false)
  })
})

describe('analyzeColor', () => {
  it('returns full result for a valid color', () => {
    const out = analyzeColor('#2d6d85')
    expect(out.hex).toBe('#2d6d85')
    expect(out.foreground).toBe('#ffffff')
    expect(out.accentOnly).toBe(false)
  })
  it('falls back to brand default for invalid input', () => {
    const out = analyzeColor(null)
    expect(out.hex).toBe('#1a4d5c')
    expect(out.foreground).toBe('#ffffff')
  })
  it('computes accent foreground independently from primary foreground', () => {
    // A light accent (yellow) needs black text even when primary is dark blue.
    const primary = analyzeColor('#1a4d5c')
    const accent = analyzeColor('#ffd966')
    expect(primary.foreground).toBe('#ffffff')
    expect(accent.foreground).toBe('#000000')
    expect(primary.foreground).not.toBe(accent.foreground)
  })
})
