import type { InformeInput } from './types'

/**
 * Format an ISO date string in Chile timezone, short form.
 * Inlined so the satellite has no @/lib/dates dependency.
 */
function formatChileDateShort(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

function formatUFDate(value: string | undefined): string | null {
  if (!value) return null
  // ufDate arrives as "YYYY-MM-DD"; render in es-CL short form.
  const d = new Date(value + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

function formatUF(uf: number | null): string {
  if (uf == null) return '—'
  return uf.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export interface HeaderBandProps {
  meta: InformeInput['meta']
  brand: InformeInput['brand']
  cliente: InformeInput['cliente']
}

/**
 * Compact header band. Replaces the full-page cover. Logo + request title row
 * on the left, cliente + generated date + UF block on the right. Hairline
 * primary rule below.
 */
export function HeaderBand({ meta, brand, cliente }: HeaderBandProps) {
  const generated = formatChileDateShort(meta.generatedAt)
  const ufDateStr = formatUFDate(meta.ufDate)
  return (
    <header className='informe-header'>
      <div className='informe-header__top'>
        <div className='informe-header__brand'>
          {brand.logoUrl
            ? <img src={brand.logoUrl} alt={brand.companyName || 'Logo'} className='informe-header__logo' />
            : <span className='informe-header__company'>{brand.companyName ?? 'Jogi'}</span>}
        </div>
        <dl className='informe-header__meta'>
          <div className='informe-header__metaitem'>
            <dt>Generado</dt>
            <dd>{generated}</dd>
          </div>
          {meta.ufValue != null && (
            <div className='informe-header__metaitem'>
              <dt>UF{ufDateStr ? ` · ${ufDateStr}` : ''}</dt>
              <dd>{formatUF(meta.ufValue)}</dd>
            </div>
          )}
        </dl>
      </div>
      <h1 className='informe-header__title'>{meta.requestLabel}</h1>
      {cliente && (
        <p className='informe-header__cliente'>
          <span className='informe-header__cliente-name'>{cliente.nombre}</span>
          <span className='informe-header__cliente-sep' aria-hidden> · </span>
          <span className='informe-header__cliente-rut'>{cliente.rut}</span>
        </p>
      )}
      <span className='informe-header__rule' aria-hidden />
    </header>
  )
}

export interface RosterChipsProps {
  applicants: InformeInput['applicants']
}

/**
 * Applicant roster chips below the header (one per applicant). Helpful at N>1
 * to give the reader a quick read of who's in the informe before they hit the
 * Perfil matrix. Suppressed at N=1.
 */
export function RosterChips({ applicants }: RosterChipsProps) {
  if (applicants.length <= 1) return null
  return (
    <ul className='informe-roster'>
      {applicants.map((a, i) => (
        <li key={`${a.role}-${i}`} className={`informe-roster__chip informe-roster__chip--${a.role}`}>
          <span className='informe-roster__role'>{a.role === 'titular' ? 'Titular' : `Codeudor ${i}`}</span>
          <span className='informe-roster__name'>{a.label}</span>
        </li>
      ))}
    </ul>
  )
}
