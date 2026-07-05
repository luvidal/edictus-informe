import type { CSSProperties, ReactNode } from 'react'
import { displayCurrencyCompact } from '@edictus/reports'
import type {
  InformeApplicant, ColumnConfig, SituacionRow,
} from './types'

const PERSONA_KEY = '__persona__'
const ABSENCE_KEY = '__absence__'

type Category = 'deudas' | 'propiedades' | 'vehiculos' | 'inversiones'

interface CategoryConfig {
  key: Category
  title: string
  emptyLabel: string
}

const CATEGORIES: CategoryConfig[] = [
  { key: 'deudas',      title: 'Deudas',       emptyLabel: 'Sin deudas registradas.' },
  { key: 'propiedades', title: 'Propiedades',  emptyLabel: 'Sin propiedades registradas.' },
  { key: 'vehiculos',   title: 'Vehículos',    emptyLabel: 'Sin vehículos registrados.' },
  { key: 'inversiones', title: 'Inversiones',  emptyLabel: 'Sin inversiones registradas.' },
]

function formatCell(value: unknown, format: ColumnConfig['format']): ReactNode {
  if (value == null || value === '') return '—'
  if (format === 'currency') {
    return typeof value === 'number' ? displayCurrencyCompact(value) : String(value)
  }
  if (format === 'integer') {
    return typeof value === 'number' ? value.toLocaleString('es-CL') : String(value)
  }
  return String(value)
}

interface MergedRow {
  row: SituacionRow
  /** Marker: render this row as a per-applicant "Sin … registradas." absence row. */
  absent?: boolean
}

interface MergedRowsResult {
  rows: MergedRow[]
  columns: ColumnConfig[]
}

/**
 * Merge rows for a category across all applicants. Inserts a leading `Persona`
 * column when N>1; the column is suppressed at N=1. The first applicant's
 * column config wins (analyst-defined column order across applicants is
 * identical — they all come from the same `buildDeudas`/`buildPropiedades`/etc.
 * preset).
 *
 * At N>1, applicants whose category is empty contribute one muted absence row
 * so the table reflects every applicant's standing, not just the ones with
 * data. At N=1 the table-wide empty row in `CategoryTable` covers the empty
 * case, so absence rows are not emitted.
 */
function mergeRowsForCategory(
  applicants: InformeApplicant[],
  category: Category,
  emptyLabel: string,
): MergedRowsResult {
  // Base columns from the first applicant that has them.
  const baseColumns = applicants[0]?.situacion[category].columns ?? []
  const showPersona = applicants.length > 1
  const mergedRows: MergedRow[] = []
  applicants.forEach((a) => {
    const rows = a.situacion[category].rows
    if (rows.length === 0) {
      if (showPersona) {
        mergedRows.push({
          row: { [PERSONA_KEY]: a.label, [ABSENCE_KEY]: emptyLabel },
          absent: true,
        })
      }
      return
    }
    for (const row of rows) {
      mergedRows.push({ row: { ...row, [PERSONA_KEY]: a.label } })
    }
  })
  const columns: ColumnConfig[] = showPersona
    ? [{ key: PERSONA_KEY, label: 'Persona', align: 'left', format: 'text' }, ...baseColumns]
    : baseColumns
  return { rows: mergedRows, columns }
}

function CategoryTable({
  title, emptyLabel, rows, columns,
}: {
  title: string
  emptyLabel: string
  rows: MergedRow[]
  columns: ColumnConfig[]
}) {
  return (
    <div className='informe-sitcat'>
      <h3 className='informe-sitcat__title'>{title}</h3>
      <table className='informe-table'>
        <colgroup>
          {columns.map(c => (
            <col
              key={c.key}
              style={c.width ? ({ width: c.width } as CSSProperties) : undefined}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map(c => {
              const align = c.align ?? (c.format === 'currency' || c.format === 'integer' ? 'right' : 'left')
              const numeric = c.format === 'currency' || c.format === 'integer'
              return (
                <th
                  key={c.key}
                  className={`informe-table__th informe-table__th--${align}${numeric ? ' informe-table__th--num' : ''}`}
                >
                  {c.label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className='informe-table__emptyrow'>
              <td colSpan={columns.length} className='informe-table__emptycell'>{emptyLabel}</td>
            </tr>
          ) : rows.map((merged, ri) => {
            if (merged.absent) {
              // Per-applicant absence row at N>1: keep the Persona cell, then a
              // single italic "Sin … registradas." cell spanning the remaining
              // data columns. Matches the table-wide empty row's styling.
              const dataColSpan = Math.max(columns.length - 1, 1)
              return (
                <tr key={ri} className='informe-table__row informe-table__emptyrow'>
                  <td className='informe-table__td informe-table__td--left'>
                    {String(merged.row[PERSONA_KEY] ?? '')}
                  </td>
                  <td colSpan={dataColSpan} className='informe-table__emptycell'>
                    {String(merged.row[ABSENCE_KEY] ?? '')}
                  </td>
                </tr>
              )
            }
            return (
              <tr key={ri} className='informe-table__row'>
                {columns.map(c => {
                  const align = c.align ?? (c.format === 'currency' || c.format === 'integer' ? 'right' : 'left')
                  const numeric = c.format === 'currency' || c.format === 'integer'
                  return (
                    <td
                      key={c.key}
                      className={`informe-table__td informe-table__td--${align}${numeric ? ' informe-table__td--num' : ''}`}
                    >
                      {formatCell(merged.row[c.key], c.format)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export interface SituacionTablesProps {
  applicants: InformeApplicant[]
}

/**
 * Category-grouped Situación: one table per (Deudas / Propiedades / Vehículos /
 * Inversiones), spanning all applicants. `Persona` column inserted at N>1.
 * Always renders `<thead>` plus an empty-state row inside `<tbody>` (never the
 * old floating italic paragraph).
 */
export function SituacionTables({ applicants }: SituacionTablesProps) {
  return (
    <div className='informe-situacion'>
      {CATEGORIES.map(cat => {
        const merged = mergeRowsForCategory(applicants, cat.key, cat.emptyLabel)
        return (
          <CategoryTable
            key={cat.key}
            title={cat.title}
            emptyLabel={cat.emptyLabel}
            rows={merged.rows}
            columns={merged.columns}
          />
        )
      })}
    </div>
  )
}
