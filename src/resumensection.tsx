import type { ReactNode } from 'react'
import { displayCurrencyCompact } from '@jogi/reports'
import type { InformeResumenRow, InformeResumenTable } from './types'

function formatResumenCell(v: unknown, row: InformeResumenRow): ReactNode {
  if (v == null || v === '') return '—'
  if (typeof v === 'number') {
    if (row.format === 'percent') return `${(v * 100).toFixed(1)}%`
    if (row.format === 'integer') return v.toLocaleString('es-CL')
    return displayCurrencyCompact(v)
  }
  return String(v)
}

function ResumenRow({ row, colCount }: { row: InformeResumenRow; colCount: number }) {
  if (row.type === 'subheader') {
    return (
      <tr className='informe-resumen__row informe-resumen__row--subheader'>
        <td colSpan={colCount + 1}>{row.label}</td>
      </tr>
    )
  }
  const typeClass = row.type === 'grandtotal'
    ? 'informe-resumen__row--grandtotal'
    : row.type === 'total'
      ? 'informe-resumen__row--total'
      : ''
  return (
    <tr className={`informe-resumen__row ${typeClass}`}>
      <td className='informe-resumen__cell informe-resumen__cell--label'>{row.label}</td>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className='informe-resumen__cell informe-resumen__cell--num'>
          {formatResumenCell(row.values?.[i], row)}
        </td>
      ))}
    </tr>
  )
}

function ResumenTable({ table }: { table: InformeResumenTable }) {
  const colCount = table.headers.length - 1
  return (
    <div className='informe-resumen__block'>
      <h3 className='informe-resumen__title'>{table.title}</h3>
      <table className='informe-resumen'>
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th
                key={`${h}-${i}`}
                className={`informe-resumen__th${i === 0 ? ' informe-resumen__th--label' : ' informe-resumen__th--num'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.length === 0 ? (
            <tr className='informe-resumen__row'>
              <td colSpan={table.headers.length} className='informe-resumen__emptycell'>
                Sin datos.
              </td>
            </tr>
          ) : table.rows.map((row, i) => (
            <ResumenRow key={i} row={row} colCount={colCount} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export interface ResumenSectionProps {
  tables: InformeResumenTable[]
}

/**
 * Three pre-built Resumen tables (Ingresos / Patrimonio / Indicadores), plus
 * the optional edad+plazo 4th table when present. Numbers render with tabular
 * numerics, totals get a `--informe-secondary` top border, grandtotals get a
 * `--informe-primary` 2px top border.
 */
export function ResumenSection({ tables }: ResumenSectionProps) {
  return (
    <div className='informe-resumen-section'>
      {tables.map((table, i) => (
        <ResumenTable key={`${table.title}-${i}`} table={table} />
      ))}
    </div>
  )
}
