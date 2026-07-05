import { displayCurrencyCompact } from '@edictus/reports'
import type { InformeCallout } from './types'

function formatCallout(callout: InformeCallout): string {
  const v = callout.value
  if (v == null) return '—'
  switch (callout.format) {
    case 'percent':
      return `${(v * 100).toFixed(1)}%`
    case 'uf':
      return `UF ${v.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    case 'currency':
    default:
      return displayCurrencyCompact(v)
  }
}

export interface CalloutsProps {
  callouts: InformeCallout[]
}

/**
 * Page-1 numeric callouts (Dividendo / Carga financiera / Patrimonio neto by
 * convention). Big right-aligned figure, uppercase label, hairline divider.
 * One "accent moment" per page: the hairline above the figure uses --informe-accent.
 */
export function Callouts({ callouts }: CalloutsProps) {
  if (!callouts.length) return null
  return (
    <ul className='informe-callouts'>
      {callouts.map((c, i) => (
        <li key={`${c.label}-${i}`} className='informe-callouts__item'>
          <span className='informe-callouts__rule' aria-hidden />
          <span className='informe-callouts__label'>{c.label}</span>
          <span className='informe-callouts__value'>{formatCallout(c)}</span>
        </li>
      ))}
    </ul>
  )
}
