import type { ReactNode } from 'react'
import { displayCurrencyCompact } from '@jogi/reports'
import { analyzeColor } from './contrast'
import {
  Cover, InformePage, SectionTitle, DataTable, FieldGrid, Footer, currencyCell,
  type DataTableColumn,
} from './primitives'
import type {
  InformeInput, InformeApplicant, InformeResumenRow,
  ColumnConfig, SituacionRow,
} from './types'
import './informe.css'

function brandStyle(brand: InformeInput['brand']): React.CSSProperties {
  const primary = analyzeColor(brand.primary)
  const secondary = analyzeColor(brand.secondary)
  const accent = analyzeColor(brand.accent)
  const effectivePrimary = primary.accentOnly ? secondary : primary
  return {
    ['--informe-primary' as string]: effectivePrimary.hex,
    ['--informe-secondary' as string]: secondary.hex,
    ['--informe-accent' as string]: accent.hex,
    ['--informe-on-primary' as string]: effectivePrimary.foreground,
    ['--informe-on-accent' as string]: accent.foreground,
  } as React.CSSProperties
}

function PerfilForPerson({ applicant }: { applicant: InformeApplicant }) {
  // Group pre-resolved subsections by `section`, so the rendered structure
  // matches the pre-extraction composition (one block per section, sub-blocks
  // by subsection).
  const sections = new Map<string, typeof applicant.perfil>()
  for (const sub of applicant.perfil) {
    if (!sections.has(sub.section)) sections.set(sub.section, [])
    sections.get(sub.section)!.push(sub)
  }
  return (
    <>
      {Array.from(sections.entries()).map(([sectionTitle, subs]) => (
        <div key={sectionTitle} className='informe-section-block'>
          <h3 className='informe-section-block__title'>{sectionTitle}</h3>
          {subs.map((sub, i) => (
            <div key={`${sectionTitle}-${i}`} className='informe-section-block'>
              {sub.subsection && sub.subsection !== sectionTitle && (
                <p className='informe-person-header'>{sub.subsection}</p>
              )}
              <FieldGrid rows={sub.fields.map(f => ({ label: f.label, value: f.value }))} />
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

function mapColumns(cols: ColumnConfig[]): DataTableColumn<SituacionRow>[] {
  return cols.map(c => ({
    key: c.key,
    label: c.label,
    width: c.width,
    align: c.align ?? (c.format === 'currency' || c.format === 'integer' ? 'right' : 'left'),
    render: c.format === 'currency'
      ? (row: SituacionRow) => currencyCell(row[c.key])
      : undefined,
  }))
}

function SituacionTablesForPerson({ applicant }: { applicant: InformeApplicant }) {
  const { deudas, propiedades, vehiculos, inversiones } = applicant.situacion
  return (
    <>
      <div className='informe-section-block'>
        <h3 className='informe-section-block__title'>Deudas</h3>
        <DataTable
          columns={mapColumns(deudas.columns)}
          rows={deudas.rows}
          emptyLabel='Sin deudas registradas.'
        />
      </div>
      <div className='informe-section-block'>
        <h3 className='informe-section-block__title'>Propiedades</h3>
        <DataTable
          columns={mapColumns(propiedades.columns)}
          rows={propiedades.rows}
          emptyLabel='Sin propiedades registradas.'
        />
      </div>
      <div className='informe-section-block'>
        <h3 className='informe-section-block__title'>Vehículos</h3>
        <DataTable
          columns={mapColumns(vehiculos.columns)}
          rows={vehiculos.rows}
          emptyLabel='Sin vehículos registrados.'
        />
      </div>
      <div className='informe-section-block'>
        <h3 className='informe-section-block__title'>Inversiones</h3>
        <DataTable
          columns={mapColumns(inversiones.columns)}
          rows={inversiones.rows}
          emptyLabel='Sin inversiones registradas.'
        />
      </div>
    </>
  )
}

function ResumenSection({ tables }: { tables: InformeInput['resumen']['tables'] }) {
  return (
    <>
      {tables.map((table, i) => (
        <div key={`${table.title}-${i}`} className='informe-section-block'>
          <h3 className='informe-section-block__title'>{table.title}</h3>
          <ResumenRowsTable rows={table.rows} headers={table.headers} />
        </div>
      ))}
    </>
  )
}

function ResumenRowsTable({ rows, headers }: { rows: InformeResumenRow[]; headers: string[] }) {
  return (
    <table className='informe-resumen-table'>
      <thead>
        <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => <ResumenRow key={i} row={row} colCount={headers.length - 1} />)}
      </tbody>
    </table>
  )
}

function ResumenRow({ row, colCount }: { row: InformeResumenRow; colCount: number }) {
  if (row.type === 'subheader') {
    return (
      <tr className='informe-resumen-row--subheader'>
        <td colSpan={colCount + 1}>{row.label}</td>
      </tr>
    )
  }
  const cls = row.type === 'grandtotal'
    ? 'informe-resumen-row--grandtotal'
    : row.type === 'total'
      ? 'informe-resumen-row--total'
      : ''
  return (
    <tr className={cls}>
      <td>{row.label}</td>
      {Array.from({ length: colCount }).map((_, i) => {
        const v = row.values?.[i]
        return <td key={i} className='informe-resumen-cell--right'>{formatResumenCell(v, row)}</td>
      })}
    </tr>
  )
}

function formatResumenCell(v: unknown, row: InformeResumenRow): ReactNode {
  if (v == null) return '—'
  if (typeof v === 'number') {
    if (row.format === 'percent') return `${(v * 100).toFixed(1)}%`
    if (row.format === 'integer') return v.toLocaleString('es-CL')
    return displayCurrencyCompact(v)
  }
  return String(v)
}

export interface InformeProps {
  input: InformeInput
}

export function Informe({ input }: InformeProps): JSX.Element {
  return (
    <article className='informe-root' style={brandStyle(input.brand)}>
      <Cover
        title={input.meta.requestLabel}
        subtitle={input.cliente?.nombre ?? null}
        cliente={input.cliente}
        generatedAt={input.meta.generatedAt}
        logoUrl={input.brand.logoUrl ?? null}
        companyName={input.brand.companyName ?? null}
      />
      {input.applicants.map((applicant, i) => (
        <InformePage key={`perfil-${i}`}>
          <SectionTitle eyebrow={`Perfil — ${applicant.role === 'titular' ? 'Titular' : 'Codeudor'}`}>
            {applicant.label}
          </SectionTitle>
          <PerfilForPerson applicant={applicant} />
        </InformePage>
      ))}
      {input.applicants.map((applicant, i) => (
        <InformePage key={`situacion-${i}`}>
          <SectionTitle eyebrow={`Situación — ${applicant.role === 'titular' ? 'Titular' : 'Codeudor'}`}>
            {applicant.label}
          </SectionTitle>
          <SituacionTablesForPerson applicant={applicant} />
        </InformePage>
      ))}
      <InformePage>
        <SectionTitle eyebrow='Resumen'>Resumen Financiero</SectionTitle>
        <ResumenSection tables={input.resumen.tables} />
      </InformePage>
      <Footer companyName={input.brand.companyName ?? null} />
    </article>
  )
}

export default Informe
