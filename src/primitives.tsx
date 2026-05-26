import type { ReactNode } from 'react'

/**
 * Editorial section title. Eyebrow (uppercase, muted) above the title; optional
 * subtitle below it in muted 9pt italic; primary hairline rule under.
 */
export function SectionTitle({
  children, eyebrow, subtitle,
}: {
  children: ReactNode
  eyebrow?: string
  subtitle?: string
}) {
  return (
    <header className='informe-section-title'>
      {eyebrow && <span className='informe-section-title__eyebrow'>{eyebrow}</span>}
      <h2 className='informe-section-title__title'>{children}</h2>
      {subtitle && <p className='informe-section-title__subtitle'>{subtitle}</p>}
      <span className='informe-section-title__rule' aria-hidden />
    </header>
  )
}

/**
 * On-screen footer fallback. Print uses the `@page @bottom-right` margin box.
 */
export function Footer({ companyName }: { companyName?: string | null }) {
  return (
    <footer className='informe-footer'>
      <span>{companyName ? `${companyName} · ` : ''}Powered by Jogi</span>
    </footer>
  )
}
