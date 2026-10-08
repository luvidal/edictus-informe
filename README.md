# @edictus/informe

**English** · [Español](README.es.md)

A printable credit-analysis report (*informe*) as a single React component. It
takes a pre-computed `InformeInput` with the applicants, their profiles, their
assets and debts, and the summary figures. It renders a branded, multi-page
document ready for print-to-PDF.

## Highlights

- **Pure presentation.** There is no fetching, no calculation and no state: the
  host computes the numbers and this package lays them out.
- **Print-first CSS.**
  - `@page` rules include a running header that carries the client's name in
    the page margin.
  - Each section starts on a new page.
  - `@media print` rules handle the rest.
  - Every class is prefixed `.informe-*`, so it drops into any app without
    clashing.
- **Four sections:**
  - **Resumen**: header band, key callouts (monthly payment, debt load, net
    worth), applicant chips and summary tables.
  - **Perfil**: a side-by-side matrix for up to three applicants (primary
    borrower plus co-borrowers). With four or more it switches to one stacked
    section per person.
  - **Situación**: debts, properties, vehicles and investments, with a person
    column when there is more than one applicant.
  - **Políticas** (optional): per-investor credit-policy checks.
- **Brandable.** The company name, logo and up to three colors become CSS
  variables. A luminance check picks black or white text, and very dark colors
  are only used as thin accents instead of full color bands.
- **29 tests**, including HTML-structure snapshots for one to four applicants.

## Install

```bash
npm i github:luvidal/edictus-informe#<commit-sha>
```

Peer dependencies: `react` and `react-dom` ≥ 18.

## Usage

```tsx
import { Informe, type InformeInput } from '@edictus/informe'
import '@edictus/informe/dist/index.css'

export function ReportPage({ input }: { input: InformeInput }) {
  return <Informe input={input} />
}
```

Print the page from the browser, or with any headless print-to-PDF, to get the
final document. [`src/fixtures.ts`](src/fixtures.ts) has a complete example
input, with synthetic data.

## Development

```bash
npm test        # Vitest + happy-dom, including HTML snapshots
npm run build   # tsup → dist/ (ESM + CJS + type declarations + CSS)
```
