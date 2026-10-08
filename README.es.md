# @edictus/informe

[English](README.md) · **Español**

Un informe de análisis de crédito imprimible, en un solo componente de React.
Recibe un `InformeInput` ya calculado con los solicitantes, sus perfiles, sus
activos y deudas, y las cifras de resumen. Con eso genera un documento de
varias páginas, con la marca de la empresa, listo para imprimir a PDF.

## Lo destacado

- **Solo presentación.** No consulta datos, no calcula y no tiene estado: la
  aplicación calcula las cifras y este paquete las diagrama.
- **CSS pensado para imprimir.**
  - Reglas `@page` con un encabezado continuo que lleva el nombre del cliente
    en el margen de cada página.
  - Cada sección empieza en una página nueva.
  - Reglas `@media print` para el resto.
  - Todas las clases llevan el prefijo `.informe-*`, así que se integra en
    cualquier aplicación sin choques de estilos.
- **Cuatro secciones:**
  - **Resumen**: banda de encabezado, cifras clave (dividendo, carga
    financiera, patrimonio), chips de los solicitantes y tablas de resumen.
  - **Perfil**: una matriz lado a lado para hasta tres solicitantes (titular y
    codeudores). Con cuatro o más, pasa a una sección por persona.
  - **Situación**: deudas, propiedades, vehículos e inversiones, con una
    columna de persona cuando hay más de un solicitante.
  - **Políticas** (opcional): revisión de políticas de crédito por
    inversionista.
- **Adaptable a la marca.** El nombre de la empresa, el logo y hasta tres
  colores se convierten en variables CSS. Una revisión de luminancia elige
  texto negro o blanco, y los colores muy oscuros solo se usan como acentos
  finos en vez de bandas de color completas.
- **29 tests**, incluidos snapshots de la estructura HTML para uno a cuatro
  solicitantes.

## Instalación

```bash
npm i github:luvidal/edictus-informe#<sha-del-commit>
```

Dependencias peer: `react` y `react-dom` ≥ 18.

## Uso

```tsx
import { Informe, type InformeInput } from '@edictus/informe'
import '@edictus/informe/dist/index.css'

export function ReportPage({ input }: { input: InformeInput }) {
  return <Informe input={input} />
}
```

Para obtener el documento final, imprime la página desde el navegador o con
cualquier herramienta de impresión a PDF sin interfaz.
[`src/fixtures.ts`](src/fixtures.ts) tiene un ejemplo completo de entrada, con
datos ficticios.

## Desarrollo

```bash
npm test        # Vitest + happy-dom, incluidos los snapshots de HTML
npm run build   # tsup → dist/ (ESM + CJS + declaraciones de tipos + CSS)
```
