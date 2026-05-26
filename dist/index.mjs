import { displayCurrencyCompact } from '@jogi/reports';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';

// src/informe.tsx

// src/contrast.ts
var HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
function parseHex(hex) {
  if (!hex) return null;
  const m = hex.match(HEX_RE);
  if (!m) return null;
  let body = m[1];
  if (body.length === 3) body = body.split("").map((c) => c + c).join("");
  const num = parseInt(body, 16);
  return { r: num >> 16 & 255, g: num >> 8 & 255, b: num & 255 };
}
function channel(v) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function relativeLuminance(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return 1;
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}
function pickForeground(hex) {
  const lum = relativeLuminance(hex);
  if (lum > 0.5) return "#000000";
  return "#ffffff";
}
function isAccentOnly(hex) {
  const lum = relativeLuminance(hex);
  return lum >= 0.2 && lum <= 0.55;
}
function analyzeColor(hex) {
  const fallback = "#1a4d5c";
  const safeHex = parseHex(hex) ? hex : fallback;
  return {
    hex: safeHex,
    foreground: pickForeground(safeHex),
    accentOnly: isAccentOnly(safeHex)
  };
}
function formatChileDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(d);
}
function InformePage({ children, first }) {
  return /* @__PURE__ */ jsx("section", { className: `informe-page${first ? " informe-page--first" : ""}`, children });
}
function Cover({ title, subtitle, cliente, generatedAt, logoUrl, companyName }) {
  const dateStr = formatChileDate(generatedAt);
  return /* @__PURE__ */ jsx(InformePage, { first: true, children: /* @__PURE__ */ jsxs("div", { className: "informe-cover", children: [
    /* @__PURE__ */ jsx("div", { className: "informe-cover__header", children: logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: companyName || "Logo", className: "informe-cover__logo" }) : /* @__PURE__ */ jsx("span", { className: "informe-cover__brand", children: companyName ?? "Jogi" }) }),
    /* @__PURE__ */ jsx("div", { className: "informe-cover__rule", "aria-hidden": true }),
    /* @__PURE__ */ jsx("h1", { className: "informe-cover__title", children: title }),
    subtitle && /* @__PURE__ */ jsx("p", { className: "informe-cover__subtitle", children: subtitle }),
    cliente && /* @__PURE__ */ jsxs("div", { className: "informe-cover__cliente", children: [
      /* @__PURE__ */ jsx("p", { className: "informe-cover__cliente-name", children: cliente.nombre }),
      /* @__PURE__ */ jsx("p", { className: "informe-cover__cliente-rut", children: cliente.rut })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "informe-cover__date", children: [
      "Generado el ",
      dateStr
    ] })
  ] }) });
}
function SectionTitle({ children, eyebrow }) {
  return /* @__PURE__ */ jsxs("header", { className: "informe-section-title", children: [
    eyebrow && /* @__PURE__ */ jsx("span", { className: "informe-section-title__eyebrow", children: eyebrow }),
    /* @__PURE__ */ jsx("h2", { className: "informe-section-title__title", children }),
    /* @__PURE__ */ jsx("span", { className: "informe-section-title__rule", "aria-hidden": true })
  ] });
}
function DataTable({
  columns,
  rows,
  emptyLabel,
  footer
}) {
  if (rows.length === 0 && emptyLabel) {
    return /* @__PURE__ */ jsx("p", { className: "informe-empty", children: emptyLabel });
  }
  return /* @__PURE__ */ jsxs("table", { className: "informe-table", children: [
    /* @__PURE__ */ jsx("colgroup", { children: columns.map((c) => /* @__PURE__ */ jsx("col", { style: c.width ? { width: c.width } : void 0 }, c.key)) }),
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: columns.map((c) => /* @__PURE__ */ jsx("th", { className: `informe-table__th informe-table__th--${c.align ?? "left"}`, children: c.label }, c.key)) }) }),
    /* @__PURE__ */ jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsx("tr", { className: "informe-table__row", children: columns.map((c) => /* @__PURE__ */ jsx("td", { className: `informe-table__td informe-table__td--${c.align ?? "left"}`, children: c.render ? c.render(row) : formatCell(row[c.key]) }, c.key)) }, i)) }),
    footer && /* @__PURE__ */ jsx("tfoot", { children: footer })
  ] });
}
function formatCell(v) {
  if (v == null) return "\u2014";
  if (typeof v === "number") return v.toLocaleString("es-CL");
  return String(v);
}
function currencyCell(v) {
  if (typeof v !== "number") return "\u2014";
  return displayCurrencyCompact(v);
}
function FieldGrid({ rows }) {
  return /* @__PURE__ */ jsx("dl", { className: "informe-fieldgrid", children: rows.map(({ label, value }, i) => /* @__PURE__ */ jsxs("div", { className: "informe-fieldgrid__item", children: [
    /* @__PURE__ */ jsx("dt", { className: "informe-fieldgrid__label", children: label }),
    /* @__PURE__ */ jsx("dd", { className: "informe-fieldgrid__value", children: value == null || value === "" ? "\u2014" : value })
  ] }, `${label}-${i}`)) });
}
function Footer({ companyName }) {
  return /* @__PURE__ */ jsx("footer", { className: "informe-footer", children: /* @__PURE__ */ jsxs("span", { children: [
    companyName ? `${companyName} \xB7 ` : "",
    "Powered by Jogi"
  ] }) });
}
function brandStyle(brand) {
  const primary = analyzeColor(brand.primary);
  const secondary = analyzeColor(brand.secondary);
  const accent = analyzeColor(brand.accent);
  const effectivePrimary = primary.accentOnly ? secondary : primary;
  return {
    ["--informe-primary"]: effectivePrimary.hex,
    ["--informe-secondary"]: secondary.hex,
    ["--informe-accent"]: accent.hex,
    ["--informe-on-primary"]: effectivePrimary.foreground,
    ["--informe-on-accent"]: accent.foreground
  };
}
function PerfilForPerson({ applicant }) {
  const sections = /* @__PURE__ */ new Map();
  for (const sub of applicant.perfil) {
    if (!sections.has(sub.section)) sections.set(sub.section, []);
    sections.get(sub.section).push(sub);
  }
  return /* @__PURE__ */ jsx(Fragment, { children: Array.from(sections.entries()).map(([sectionTitle, subs]) => /* @__PURE__ */ jsxs("div", { className: "informe-section-block", children: [
    /* @__PURE__ */ jsx("h3", { className: "informe-section-block__title", children: sectionTitle }),
    subs.map((sub, i) => /* @__PURE__ */ jsxs("div", { className: "informe-section-block", children: [
      sub.subsection && sub.subsection !== sectionTitle && /* @__PURE__ */ jsx("p", { className: "informe-person-header", children: sub.subsection }),
      /* @__PURE__ */ jsx(FieldGrid, { rows: sub.fields.map((f) => ({ label: f.label, value: f.value })) })
    ] }, `${sectionTitle}-${i}`))
  ] }, sectionTitle)) });
}
function mapColumns(cols) {
  return cols.map((c) => ({
    key: c.key,
    label: c.label,
    width: c.width,
    align: c.align ?? (c.format === "currency" || c.format === "integer" ? "right" : "left"),
    render: c.format === "currency" ? (row) => currencyCell(row[c.key]) : void 0
  }));
}
function SituacionTablesForPerson({ applicant }) {
  const { deudas, propiedades, vehiculos, inversiones } = applicant.situacion;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "informe-section-block", children: [
      /* @__PURE__ */ jsx("h3", { className: "informe-section-block__title", children: "Deudas" }),
      /* @__PURE__ */ jsx(
        DataTable,
        {
          columns: mapColumns(deudas.columns),
          rows: deudas.rows,
          emptyLabel: "Sin deudas registradas."
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "informe-section-block", children: [
      /* @__PURE__ */ jsx("h3", { className: "informe-section-block__title", children: "Propiedades" }),
      /* @__PURE__ */ jsx(
        DataTable,
        {
          columns: mapColumns(propiedades.columns),
          rows: propiedades.rows,
          emptyLabel: "Sin propiedades registradas."
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "informe-section-block", children: [
      /* @__PURE__ */ jsx("h3", { className: "informe-section-block__title", children: "Veh\xEDculos" }),
      /* @__PURE__ */ jsx(
        DataTable,
        {
          columns: mapColumns(vehiculos.columns),
          rows: vehiculos.rows,
          emptyLabel: "Sin veh\xEDculos registrados."
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "informe-section-block", children: [
      /* @__PURE__ */ jsx("h3", { className: "informe-section-block__title", children: "Inversiones" }),
      /* @__PURE__ */ jsx(
        DataTable,
        {
          columns: mapColumns(inversiones.columns),
          rows: inversiones.rows,
          emptyLabel: "Sin inversiones registradas."
        }
      )
    ] })
  ] });
}
function ResumenSection({ tables }) {
  return /* @__PURE__ */ jsx(Fragment, { children: tables.map((table, i) => /* @__PURE__ */ jsxs("div", { className: "informe-section-block", children: [
    /* @__PURE__ */ jsx("h3", { className: "informe-section-block__title", children: table.title }),
    /* @__PURE__ */ jsx(ResumenRowsTable, { rows: table.rows, headers: table.headers })
  ] }, `${table.title}-${i}`)) });
}
function ResumenRowsTable({ rows, headers }) {
  return /* @__PURE__ */ jsxs("table", { className: "informe-resumen-table", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: headers.map((h) => /* @__PURE__ */ jsx("th", { children: h }, h)) }) }),
    /* @__PURE__ */ jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsx(ResumenRow, { row, colCount: headers.length - 1 }, i)) })
  ] });
}
function ResumenRow({ row, colCount }) {
  if (row.type === "subheader") {
    return /* @__PURE__ */ jsx("tr", { className: "informe-resumen-row--subheader", children: /* @__PURE__ */ jsx("td", { colSpan: colCount + 1, children: row.label }) });
  }
  const cls = row.type === "grandtotal" ? "informe-resumen-row--grandtotal" : row.type === "total" ? "informe-resumen-row--total" : "";
  return /* @__PURE__ */ jsxs("tr", { className: cls, children: [
    /* @__PURE__ */ jsx("td", { children: row.label }),
    Array.from({ length: colCount }).map((_, i) => {
      const v = row.values?.[i];
      return /* @__PURE__ */ jsx("td", { className: "informe-resumen-cell--right", children: formatResumenCell(v, row) }, i);
    })
  ] });
}
function formatResumenCell(v, row) {
  if (v == null) return "\u2014";
  if (typeof v === "number") {
    if (row.format === "percent") return `${(v * 100).toFixed(1)}%`;
    if (row.format === "integer") return v.toLocaleString("es-CL");
    return displayCurrencyCompact(v);
  }
  return String(v);
}
function Informe({ input }) {
  return /* @__PURE__ */ jsxs("article", { className: "informe-root", style: brandStyle(input.brand), children: [
    /* @__PURE__ */ jsx(
      Cover,
      {
        title: input.meta.requestLabel,
        subtitle: input.cliente?.nombre ?? null,
        cliente: input.cliente,
        generatedAt: input.meta.generatedAt,
        logoUrl: input.brand.logoUrl ?? null,
        companyName: input.brand.companyName ?? null
      }
    ),
    input.applicants.map((applicant, i) => /* @__PURE__ */ jsxs(InformePage, { children: [
      /* @__PURE__ */ jsx(SectionTitle, { eyebrow: `Perfil \u2014 ${applicant.role === "titular" ? "Titular" : "Codeudor"}`, children: applicant.label }),
      /* @__PURE__ */ jsx(PerfilForPerson, { applicant })
    ] }, `perfil-${i}`)),
    input.applicants.map((applicant, i) => /* @__PURE__ */ jsxs(InformePage, { children: [
      /* @__PURE__ */ jsx(SectionTitle, { eyebrow: `Situaci\xF3n \u2014 ${applicant.role === "titular" ? "Titular" : "Codeudor"}`, children: applicant.label }),
      /* @__PURE__ */ jsx(SituacionTablesForPerson, { applicant })
    ] }, `situacion-${i}`)),
    /* @__PURE__ */ jsxs(InformePage, { children: [
      /* @__PURE__ */ jsx(SectionTitle, { eyebrow: "Resumen", children: "Resumen Financiero" }),
      /* @__PURE__ */ jsx(ResumenSection, { tables: input.resumen.tables })
    ] }),
    /* @__PURE__ */ jsx(Footer, { companyName: input.brand.companyName ?? null })
  ] });
}

export { Informe };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map