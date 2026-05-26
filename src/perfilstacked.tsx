import type { InformeApplicant } from './types'

/**
 * N≥4 fallback: per-person stacked Perfil sections. No forced page breaks
 * between people; `break-inside: avoid` keeps each person's block whole when
 * possible. Used when the matrix layout breaks down past 3 columns on A4
 * portrait.
 */
export function PerfilStacked({ applicants }: { applicants: InformeApplicant[] }) {
  return (
    <div className='informe-perfil informe-perfil--stacked'>
      {applicants.map((applicant, ai) => (
        <div key={ai} className='informe-perfil__personblock'>
          <h3 className='informe-perfil__personlabel'>
            {applicant.role === 'titular' ? 'Titular' : `Codeudor ${ai}`} — {applicant.label}
          </h3>
          {applicant.perfil.map((sub, si) => (
            <div key={si} className='informe-perfil__subsection'>
              {sub.subsection && (
                <p className='informe-perfil__subtitle'>{sub.section} — {sub.subsection}</p>
              )}
              <dl className='informe-perfil__stackedlist'>
                {sub.fields.map((f, fi) => (
                  <div key={fi} className='informe-perfil__stackeditem'>
                    <dt className='informe-perfil__stackedlabel'>{f.label}</dt>
                    <dd className='informe-perfil__stackedvalue'>{f.value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
