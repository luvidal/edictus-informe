import type { CSSProperties, ReactNode } from 'react'
import { displayCurrencyCompact } from '@jogi/reports'
import type {
  InformeApplicant, ColumnConfig, SituacionRow,
} from './types'

const PERSONA_KEY = '__persona__'

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

interface MergedRowsResult {
  rows: SituacionRow[]
  columns: ColumnConfig[]
}

/**
 * Merge rows for a category across all applicants. Inserts a leading `Persona`
 * column when N>1; the column is suppressed at N=1. The first applicant's
 * column config wins (analyst-defined column order across applicants is
 * identical — they all come from the same `buildDeudas`/`buildPropiedades`/etc.
 * preset).
 */
function mergeRowsForCategory(
  applicants: InformeApplicant[],
  category: Category,
): MergedRowsResult {
  // Base columns from the first applicant that has them.
  const baseColumns = applicants[0]?.situacion[category].columns ?? []
  const mergedRows: SituacionRow[] = []
  applicants.forEach((a) => {
    const rows = a.situacion[category].rows
    for (const row of rows) {
      mergedRows.push({ ...row, [PERSONA_KEY]: a.label })
    }
  })
  const showPersona = applicants.length > 1
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
  rows: SituacionRow[]
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
          ) : rows.map((row, ri) => (
            <tr key={ri} className='informe-table__row'>
              {columns.map(c => {
                const align = c.align ?? (c.format === 'currency' || c.format === 'integer' ? 'right' : 'left')
                const numeric = c.format === 'currency' || c.format === 'integer'
                return (
                  <td
                    key={c.key}
                    className={`informe-table__td informe-table__td--${align}${numeric ? ' informe-table__td--num' : ''}`}
                  >
                    {formatCell(row[c.key], c.format)}
                  </td>
                )
              })}
            </tr>
          ))}
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
        const merged = mergeRowsForCategory(applicants, cat.key)
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
