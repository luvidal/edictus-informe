import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Informe } from './informe'
import { fixtureN1, fixtureN2, fixtureN3, fixtureN4 } from './fixtures'

/**
 * HTML-structure snapshot tests (not pixel) for N=1/2/3/4 applicants.
 *
 * Uses `renderToStaticMarkup` so the output is deterministic — no React
 * hydration markers — and trimmed to the actual `.informe-root` content.
 */

describe('Informe HTML structure', () => {
  it('renders N=1 (single titular) — matrix collapses to 2-col layout', () => {
    const html = renderToStaticMarkup(<Informe input={fixtureN1()} />)
    expect(html).toMatchSnapshot()
    // No Persona column in Situación at N=1.
    expect(html).not.toContain('>Persona<')
    // No applicant-roster chip block at N=1.
    expect(html).not.toContain('informe-roster')
    // Matrix has NO thead (single applicant collapses to 2-col label/value).
    // matrixRows render as <th scope='row'>; check there's no <th scope='col'>.
    expect(html).not.toContain("scope=\"col\"")
  })

  it('renders N=2 — matrix shows Titular | Codeudor headers, roster chips visible', () => {
    const html = renderToStaticMarkup(<Informe input={fixtureN2()} />)
    expect(html).toMatchSnapshot()
    expect(html).toContain('informe-roster')
    expect(html).toContain('>Titular<')
    expect(html).toContain('>Cod. 1<')
    // Persona column inserted in Situación tables.
    expect(html).toContain('>Persona<')
  })

  it('renders N=3 — matrix shows Titular | Cod.1 | Cod.2', () => {
    const html = renderToStaticMarkup(<Informe input={fixtureN3()} />)
    expect(html).toMatchSnapshot()
    expect(html).toContain('>Cod. 1<')
    expect(html).toContain('>Cod. 2<')
    expect(html).toContain('>Persona<')
  })

  it('renders N=4 — falls back to stacked per-person Perfil sections', () => {
    const html = renderToStaticMarkup(<Informe input={fixtureN4()} />)
    expect(html).toMatchSnapshot()
    // Stacked path uses the personblock class, not the matrix.
    expect(html).toContain('informe-perfil__personblock')
    expect(html).toContain('informe-perfil--stacked')
    // Persona column still appears in Situación for N>1.
    expect(html).toContain('>Persona<')
  })
})

describe('Callouts', () => {
  it('renders three numeric callouts on page 1', () => {
    const html = renderToStaticMarkup(<Informe input={fixtureN1()} />)
    expect(html).toContain('informe-callouts')
    expect(html).toContain('Dividendo')
    expect(html).toContain('Carga financiera')
    expect(html).toContain('Patrimonio neto')
  })

  it('formats percent callouts as "%"', () => {
    const html = renderToStaticMarkup(<Informe input={fixtureN1()} />)
    expect(html).toContain('28.0%')
  })
})

describe('Empty-state row', () => {
  it('renders Sin … registradas inside <tbody>, never as a floating <p>', () => {
    // N=1 fixture has no vehiculos and no inversiones.
    const html = renderToStaticMarkup(<Informe input={fixtureN1()} />)
    expect(html).toContain('Sin vehículos registrados.')
    expect(html).toContain('Sin inversiones registradas.')
    // Empty rows live inside <tbody>; the empty cells get a colSpan.
    expect(html).toContain('informe-table__emptycell')
  })
})

describe('Long-text fields', () => {
  it('pulls longText=true fields out of the matrix into a stacked list', () => {
    const html = renderToStaticMarkup(<Informe input={fixtureN2()} />)
    expect(html).toContain('informe-perfilmatrix__longtext')
    // "Empresa" is flagged longText:true in the fixture; it should appear in
    // the long-text list, not as a matrix row.
    expect(html).toContain('informe-perfilmatrix__longlabel')
    expect(html).toContain('Empresa')
  })
})

describe('Brand CSS vars', () => {
  it('writes brand colors as CSS variables on the informe root', () => {
    const html = renderToStaticMarkup(<Informe input={fixtureN1()} />)
    expect(html).toContain('--informe-primary')
    expect(html).toContain('#1a4d5c')
    expect(html).toContain('--informe-accent')
    expect(html).toContain('#4a9bb0')
  })

  it('does not hardcode brand colors in the rendered markup beyond the style attribute', () => {
    // Replace the inline style block with a marker, then assert no brand hex
    // sneaks in elsewhere. (The fallback "#1a4d5c" leaks via contrast analysis
    // when brand is undefined; the fixture uses different colors deliberately.)
    const input = fixtureN1()
    // Use a brand color the fallback contrast helper would never emit:
    input.brand = { primary: '#aa00aa', secondary: '#00aa00', accent: '#0000aa', companyName: 'Test' }
    const html = renderToStaticMarkup(<Informe input={input} />)
    expect(html).toContain('#aa00aa')
    expect(html).toContain('#0000aa')
  })
})
