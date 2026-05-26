import type { ReactNode, CSSProperties } from 'react'
import { displayCurrencyCompact } from '@jogi/reports'

/**
 * Format an ISO date string in Chile timezone, long form.
 * Inlined so the satellite has no @/lib/dates dependency.
 */
function formatChileDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function InformePage({ children, first }: { children: ReactNode; first?: boolean }) {
  return (
    <section className={`informe-page${first ? ' informe-page--first' : ''}`}>
      {children}
    </section>
  )
}

export interface CoverProps {
  title: string
  subtitle?: string | null
  cliente?: { nombre: string; rut: string } | null
  generatedAt: string
  logoUrl?: string | null
  companyName?: string | null
}

export function Cover({ title, subtitle, cliente, generatedAt, logoUrl, companyName }: CoverProps) {
  const dateStr = formatChileDate(generatedAt)
  return (
    <InformePage first>
      <div className='informe-cover'>
        <div className='informe-cover__header'>
          {logoUrl
            ? <img src={logoUrl} alt={companyName || 'Logo'} className='informe-cover__logo' />
            : <span className='informe-cover__brand'>{companyName ?? 'Jogi'}</span>}
        </div>
        <div className='informe-cover__rule' aria-hidden />
        <h1 className='informe-cover__title'>{title}</h1>
        {subtitle && <p className='informe-cover__subtitle'>{subtitle}</p>}
        {cliente && (
          <div className='informe-cover__cliente'>
            <p className='informe-cover__cliente-name'>{cliente.nombre}</p>
            <p className='informe-cover__cliente-rut'>{cliente.rut}</p>
          </div>
        )}
        <p className='informe-cover__date'>Generado el {dateStr}</p>
      </div>
    </InformePage>
  )
}

export function SectionTitle({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return (
    <header className='informe-section-title'>
      {eyebrow && <span className='informe-section-title__eyebrow'>{eyebrow}</span>}
      <h2 className='informe-section-title__title'>{children}</h2>
      <span className='informe-section-title__rule' aria-hidden />
    </header>
  )
}

export interface DataTableColumn<T> {
  key: string
  label: string
  /** Cell formatter — when omitted, the raw cell value is rendered as a string. */
  render?: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  width?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns, rows, emptyLabel, footer,
}: {
  columns: DataTableColumn<T>[]
  rows: T[]
  emptyLabel?: string
  footer?: ReactNode
}) {
  if (rows.length === 0 && emptyLabel) {
    return <p className='informe-empty'>{emptyLabel}</p>
  }
  return (
    <table className='informe-table'>
      <colgroup>
        {columns.map(c => <col key={c.key} style={c.width ? { width: c.width } as CSSProperties : undefined} />)}
      </colgroup>
      <thead>
        <tr>
          {columns.map(c => (
            <th key={c.key} className={`informe-table__th informe-table__th--${c.align ?? 'left'}`}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className='informe-table__row'>
            {columns.map(c => (
              <td key={c.key} className={`informe-table__td informe-table__td--${c.align ?? 'left'}`}>
                {c.render ? c.render(row) : formatCell(row[c.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {footer && <tfoot>{footer}</tfoot>}
    </table>
  )
}

function formatCell(v: unknown): ReactNode {
  if (v == null) return '—'
  if (typeof v === 'number') return v.toLocaleString('es-CL')
  return String(v)
}

export function currencyCell(v: unknown): ReactNode {
  if (typeof v !== 'number') return '—'
  return displayCurrencyCompact(v)
}

export function FieldGrid({ rows }: { rows: Array<{ label: string; value: string | number | null | undefined }> }) {
  return (
    <dl className='informe-fieldgrid'>
      {rows.map(({ label, value }, i) => (
        <div key={`${label}-${i}`} className='informe-fieldgrid__item'>
          <dt className='informe-fieldgrid__label'>{label}</dt>
          <dd className='informe-fieldgrid__value'>{value == null || value === '' ? '—' : value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Footer({ companyName }: { companyName?: string | null }) {
  return (
    <footer className='informe-footer'>
      <span>{companyName ? `${companyName} · ` : ''}Powered by Jogi</span>
    </footer>
  )
}
