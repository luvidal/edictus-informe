import { PerfilStacked } from './perfilstacked'
import type { InformeApplicant, InformePerfilField } from './types'

/**
 * Visual cap: past 3 columns on A4 portrait the matrix breaks down (≤30mm/column).
 * Above this, the satellite falls back to per-person stacked sections.
 */
const MATRIX_COL_CAP = 3

interface CellByApplicant {
  field: InformePerfilField
  /** Values for this label across all applicants, indexed by applicant index. */
  values: Array<{ value: string; longText: boolean }>
  /** True when any applicant's field is marked longText — render outside matrix. */
  anyLongText: boolean
}

interface SubsectionGroup {
  section: string
  subsection: string | undefined
  /** Field rows keyed by label (preserves first-seen order). */
  rows: CellByApplicant[]
}

/**
 * Build per-subsection groups: one row per (label) across all applicants.
 * Long-text fields are pulled into their own list rendered below the matrix.
 */
function buildSubsectionGroups(applicants: InformeApplicant[]): SubsectionGroup[] {
  const groups = new Map<string, SubsectionGroup>()
  const order: string[] = []
  applicants.forEach((applicant, ai) => {
    for (const sub of applicant.perfil) {
      const key = `${sub.section}|||${sub.subsection ?? ''}`
      let group = groups.get(key)
      if (!group) {
        group = { section: sub.section, subsection: sub.subsection, rows: [] }
        groups.set(key, group)
        order.push(key)
      }
      for (const field of sub.fields) {
        let row = group.rows.find(r => r.field.label === field.label)
        if (!row) {
          row = {
            field,
            values: applicants.map(() => ({ value: '', longText: false })),
            anyLongText: false,
          }
          group.rows.push(row)
        }
        row.values[ai] = { value: field.value, longText: !!field.longText }
        if (field.longText) row.anyLongText = true
      }
    }
  })
  return order.map(k => groups.get(k)!)
}

function PerfilMatrixTable({
  applicants, group,
}: {
  applicants: InformeApplicant[]
  group: SubsectionGroup
}) {
  const matrixRows = group.rows.filter(r => !r.anyLongText)
  if (matrixRows.length === 0) return null
  const showPersonHeaders = applicants.length > 1
  return (
    <table className='informe-perfilmatrix'>
      <colgroup>
        <col className='informe-perfilmatrix__col--label' />
        {applicants.map((_, i) => <col key={i} className='informe-perfilmatrix__col--value' />)}
      </colgroup>
      {showPersonHeaders && (
        <thead>
          <tr>
            <th scope='col' className='informe-perfilmatrix__th informe-perfilmatrix__th--label'>Campo</th>
            {applicants.map((a, i) => (
              <th key={i} scope='col' className='informe-perfilmatrix__th'>
                {a.role === 'titular' ? 'Titular' : `Cod. ${i}`}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {matrixRows.map((row, ri) => (
          <tr key={ri} className='informe-perfilmatrix__row'>
            <th scope='row' className='informe-perfilmatrix__rowlabel'>{row.field.label}</th>
            {row.values.map((v, vi) => (
              <td key={vi} className='informe-perfilmatrix__cell'>
                {v.value && v.value !== '' ? v.value : '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function LongTextList({
  applicants, group,
}: {
  applicants: InformeApplicant[]
  group: SubsectionGroup
}) {
  const longRows = group.rows.filter(r => r.anyLongText)
  if (longRows.length === 0) return null
  const showPersonHeaders = applicants.length > 1
  return (
    <div className='informe-perfilmatrix__longtext'>
      {longRows.map((row, ri) => (
        <div key={ri} className='informe-perfilmatrix__longitem'>
          <p className='informe-perfilmatrix__longlabel'>{row.field.label}</p>
          <ul className='informe-perfilmatrix__longvalues'>
            {row.values.map((v, vi) => (
              <li key={vi} className='informe-perfilmatrix__longvalue'>
                {showPersonHeaders && (
                  <span className='informe-perfilmatrix__longperson'>
                    {applicants[vi].role === 'titular' ? 'Titular' : `Cod. ${vi}`}:
                  </span>
                )}
                <span className='informe-perfilmatrix__longtxt'>
                  {v.value && v.value !== '' ? v.value : '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export interface PerfilMatrixProps {
  applicants: InformeApplicant[]
}

/**
 * Per-subsection Perfil matrix.
 *
 * - N ≤ MATRIX_COL_CAP: matrix layout. At N=1, the matrix renders as a
 *   2-column label/value list (the header row is suppressed).
 * - N > MATRIX_COL_CAP: falls back to per-person stacked Perfil blocks.
 *   No forced page breaks between them; `break-inside: avoid` keeps each
 *   person's block whole when possible.
 *
 * `longText: true` fields are pulled below the matrix into a stacked list.
 */
export function PerfilMatrix({ applicants }: PerfilMatrixProps) {
  if (applicants.length > MATRIX_COL_CAP) {
    return <PerfilStacked applicants={applicants} />
  }
  const groups = buildSubsectionGroups(applicants)
  // Group by section so we can render one section block with its subsections.
  const sectionOrder: string[] = []
  const bySection = new Map<string, SubsectionGroup[]>()
  for (const g of groups) {
    if (!bySection.has(g.section)) {
      bySection.set(g.section, [])
      sectionOrder.push(g.section)
    }
    bySection.get(g.section)!.push(g)
  }
  return (
    <div className='informe-perfil'>
      {sectionOrder.map(sectionTitle => {
        const subs = bySection.get(sectionTitle)!
        return (
          <div key={sectionTitle} className='informe-perfil__section'>
            <h3 className='informe-perfil__sectiontitle'>{sectionTitle}</h3>
            {subs.map((sub, si) => (
              <div key={si} className='informe-perfil__subsection'>
                {sub.subsection && sub.subsection !== sectionTitle && (
                  <p className='informe-perfil__subtitle'>{sub.subsection}</p>
                )}
                <PerfilMatrixTable applicants={applicants} group={sub} />
                <LongTextList applicants={applicants} group={sub} />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

