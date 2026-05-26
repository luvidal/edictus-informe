// Frozen fixtures used by snapshot tests. Plain JSON shape — no Date.now(),
// no randomness. Mirrors the shape `toinformeinput.ts` emits in the host.

import type {
  InformeInput, InformeApplicant, InformePerfilSubsection,
  ColumnConfig, SituacionRow,
} from './types'

const SAMPLE_PERFIL: InformePerfilSubsection[] = [
  {
    section: 'Antecedentes Personales',
    subsection: 'Info Personal',
    fields: [
      { label: 'Tipo Persona', value: 'Persona Natural' },
      { label: 'Nacionalidad', value: 'Chilena' },
      { label: 'Estado Civil / Régimen', value: 'Casado / Soc. Conyugal' },
      { label: 'Fecha Nacimiento / Edad', value: '15-03-1980 (45 años)' },
      { label: 'Sexo', value: 'M' },
      { label: 'Profesión', value: 'Ingeniero Civil' },
      { label: 'Nº Hijos', value: '2' },
    ],
  },
  {
    section: 'Antecedentes Personales',
    subsection: 'Domicilio',
    fields: [
      { label: 'Dirección / Sit. Vivienda', value: 'Av. Apoquindo 4501, Las Condes, Santiago', longText: true },
      { label: 'Valor Arriendo', value: '450.000' },
    ],
  },
  {
    section: 'Antecedentes Laborales',
    subsection: 'Empleo Actual',
    fields: [
      { label: 'Empresa', value: 'Constructora Acme Latinoamérica S.A.', longText: true },
      { label: 'Giro', value: 'Construcción de edificios residenciales', longText: true },
      { label: 'Cargo', value: 'Gerente de Proyecto' },
      { label: 'Fecha Ingreso', value: '01-01-2020' },
      { label: 'Tipo Contrato', value: 'Indefinido' },
    ],
  },
  {
    section: 'Antecedentes Comerciales',
    subsection: 'Boletín Comercial',
    fields: [
      { label: 'Morosidades Vigentes', value: '0' },
      { label: 'Protestos Vigentes', value: '0' },
      { label: 'Puntaje', value: '850' },
    ],
  },
]

const DEUDAS_COLS: ColumnConfig[] = [
  { key: 'institucion', label: 'Institución', align: 'left', format: 'text' },
  { key: 'tipo', label: 'Tipo', align: 'left', format: 'text' },
  { key: 'monto', label: 'Monto', align: 'right', format: 'currency' },
  { key: 'cuota', label: 'Cuota', align: 'right', format: 'currency' },
]

const PROPS_COLS: ColumnConfig[] = [
  { key: 'direccion', label: 'Dirección', align: 'left', format: 'text' },
  { key: 'comuna', label: 'Comuna', align: 'left', format: 'text' },
  { key: 'avaluo', label: 'Avalúo', align: 'right', format: 'currency' },
]

const VEHICULOS_COLS: ColumnConfig[] = [
  { key: 'marca', label: 'Marca', align: 'left', format: 'text' },
  { key: 'modelo', label: 'Modelo', align: 'left', format: 'text' },
  { key: 'patente', label: 'Patente', align: 'left', format: 'text' },
  { key: 'valor', label: 'Valor', align: 'right', format: 'currency' },
]

const INVERSIONES_COLS: ColumnConfig[] = [
  { key: 'institucion', label: 'Institución', align: 'left', format: 'text' },
  { key: 'tipo', label: 'Tipo', align: 'left', format: 'text' },
  { key: 'monto', label: 'Monto', align: 'right', format: 'currency' },
]

function makeApplicant(
  role: 'titular' | 'codeudor',
  label: string,
  deudasRows: SituacionRow[],
  propRows: SituacionRow[],
): InformeApplicant {
  return {
    role,
    label,
    perfil: SAMPLE_PERFIL,
    situacion: {
      deudas:      { columns: DEUDAS_COLS,      rows: deudasRows },
      propiedades: { columns: PROPS_COLS,       rows: propRows },
      vehiculos:   { columns: VEHICULOS_COLS,   rows: [] },
      inversiones: { columns: INVERSIONES_COLS, rows: [] },
    },
  }
}

const BASE_META: InformeInput['meta'] = {
  requestLabel: 'Crédito Hipotecario — Juan Pérez',
  generatedAt: '2026-05-26T12:00:00.000Z',
  ufValue: 39842.15,
  ufDate: '2026-05-26',
}

const BASE_BRAND: InformeInput['brand'] = {
  companyName: 'Acme Financiera',
  logoUrl: undefined,
  primary: '#1a4d5c',
  secondary: '#2d6d85',
  accent: '#4a9bb0',
}

const BASE_CLIENTE: InformeInput['cliente'] = {
  nombre: 'Juan Pérez González',
  rut: '12.345.678-9',
}

const BASE_RESUMEN: InformeInput['resumen'] = {
  callouts: [
    { label: 'Dividendo',        value: 720000,    format: 'currency' },
    { label: 'Carga financiera', value: 0.28,      format: 'percent' },
    { label: 'Patrimonio neto',  value: 145000000, format: 'currency' },
  ],
  tables: [
    {
      title: 'Resumen de Ingresos',
      headers: ['Concepto', 'Titular', 'Codeudor', 'Conjunto'],
      rows: [
        { label: 'Renta líquida',  values: [2500000, 1200000, 3700000], type: 'data',  format: 'currency' },
        { label: 'Otros ingresos', values: [300000,  100000,  400000],  type: 'data',  format: 'currency' },
        { label: 'Total ingresos', values: [2800000, 1300000, 4100000], type: 'total', format: 'currency' },
      ],
    },
    {
      title: 'Resumen de Patrimonio',
      headers: ['Concepto', 'Titular', 'Codeudor', 'Total'],
      rows: [
        { label: 'Activos',          values: [180000000, 40000000, 220000000], type: 'data',       format: 'currency' },
        { label: 'Pasivos',          values: [55000000,  20000000, 75000000],  type: 'data',       format: 'currency' },
        { label: 'Patrimonio neto',  values: [125000000, 20000000, 145000000], type: 'grandtotal', format: 'currency' },
      ],
    },
    {
      title: 'Indicadores',
      headers: ['Concepto', 'Individual', 'Conjunto'],
      rows: [
        { label: 'Dividendo',        values: [720000, 720000], type: 'data', format: 'currency' },
        { label: 'Carga financiera', values: [0.288, 0.176],   type: 'data', format: 'percent' },
        { label: 'Patrimonio neto',  values: [125000000, 145000000], type: 'data', format: 'currency' },
      ],
    },
  ],
}

export function fixtureN1(): InformeInput {
  return {
    meta: BASE_META,
    brand: BASE_BRAND,
    cliente: BASE_CLIENTE,
    applicants: [
      makeApplicant(
        'titular',
        'Juan Pérez González',
        [{ institucion: 'Banco Estado', tipo: 'Consumo',   monto: 5000000, cuota: 180000 }],
        [{ direccion: 'Av. Apoquindo 4501', comuna: 'Las Condes', avaluo: 180000000 }],
      ),
    ],
    resumen: BASE_RESUMEN,
  }
}

export function fixtureN2(): InformeInput {
  return {
    meta: BASE_META,
    brand: BASE_BRAND,
    cliente: BASE_CLIENTE,
    applicants: [
      makeApplicant(
        'titular',
        'Juan Pérez González',
        [{ institucion: 'Banco Estado', tipo: 'Consumo', monto: 5000000, cuota: 180000 }],
        [{ direccion: 'Av. Apoquindo 4501', comuna: 'Las Condes', avaluo: 180000000 }],
      ),
      makeApplicant(
        'codeudor',
        'María Soto Vargas',
        [{ institucion: 'Banco BCI', tipo: 'Tarjeta', monto: 1500000, cuota: 65000 }],
        [],
      ),
    ],
    resumen: BASE_RESUMEN,
  }
}

export function fixtureN3(): InformeInput {
  return {
    meta: BASE_META,
    brand: BASE_BRAND,
    cliente: BASE_CLIENTE,
    applicants: [
      makeApplicant(
        'titular',
        'Juan Pérez González',
        [{ institucion: 'Banco Estado', tipo: 'Consumo', monto: 5000000, cuota: 180000 }],
        [{ direccion: 'Av. Apoquindo 4501', comuna: 'Las Condes', avaluo: 180000000 }],
      ),
      makeApplicant(
        'codeudor',
        'María Soto Vargas',
        [{ institucion: 'Banco BCI', tipo: 'Tarjeta', monto: 1500000, cuota: 65000 }],
        [],
      ),
      makeApplicant(
        'codeudor',
        'Pedro Soto Vargas',
        [],
        [{ direccion: 'Calle Las Flores 123', comuna: 'Ñuñoa', avaluo: 95000000 }],
      ),
    ],
    resumen: BASE_RESUMEN,
  }
}

export function fixtureN4(): InformeInput {
  return {
    meta: BASE_META,
    brand: BASE_BRAND,
    cliente: BASE_CLIENTE,
    applicants: [
      makeApplicant('titular', 'Juan Pérez González', [], []),
      makeApplicant('codeudor', 'María Soto Vargas', [], []),
      makeApplicant('codeudor', 'Pedro Soto Vargas', [], []),
      makeApplicant('codeudor', 'Ana Pérez Soto', [], []),
    ],
    resumen: BASE_RESUMEN,
  }
}
