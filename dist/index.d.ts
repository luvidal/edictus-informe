interface InformePerfilField {
    label: string;
    value: string;
    /** Hints "render outside the matrix as a stacked list" (Design layer; lift-and-shift ignores). */
    longText?: boolean;
}
interface InformePerfilSubsection {
    section: string;
    subsection?: string;
    fields: InformePerfilField[];
}
interface ColumnConfig {
    key: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    width?: string;
    format?: 'currency' | 'integer' | 'text';
}
interface SituacionRow {
    [columnKey: string]: string | number | null | undefined;
}
interface InformeApplicant {
    role: 'titular' | 'codeudor';
    label: string;
    perfil: InformePerfilSubsection[];
    situacion: {
        deudas: {
            columns: ColumnConfig[];
            rows: SituacionRow[];
        };
        propiedades: {
            columns: ColumnConfig[];
            rows: SituacionRow[];
        };
        vehiculos: {
            columns: ColumnConfig[];
            rows: SituacionRow[];
        };
        inversiones: {
            columns: ColumnConfig[];
            rows: SituacionRow[];
        };
    };
}
interface InformeCallout {
    label: string;
    value: number | null;
    format: 'currency' | 'percent' | 'uf';
}
interface InformeResumenRow {
    label: string;
    values: Array<number | string | null>;
    type?: 'data' | 'subheader' | 'total' | 'grandtotal';
    format?: 'currency' | 'percent' | 'integer';
}
interface InformeResumenTable {
    title: string;
    headers: string[];
    rows: InformeResumenRow[];
}
interface InformeInput {
    meta: {
        requestLabel: string;
        generatedAt: string;
        ufValue: number | null;
        ufDate?: string;
    };
    brand: {
        companyName?: string;
        logoUrl?: string;
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    cliente: {
        nombre: string;
        rut: string;
    } | null;
    applicants: InformeApplicant[];
    resumen: {
        callouts: InformeCallout[];
        tables: InformeResumenTable[];
    };
}

interface InformeProps {
    input: InformeInput;
}
declare function Informe({ input }: InformeProps): JSX.Element;

export { type ColumnConfig, Informe, type InformeApplicant, type InformeCallout, type InformeInput, type InformePerfilField, type InformePerfilSubsection, type InformeProps, type InformeResumenRow, type InformeResumenTable, type SituacionRow };
