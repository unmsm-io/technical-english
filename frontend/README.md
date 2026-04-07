# Frontend Sprint 2

Frontend React + Vite para el Sprint 2 de `technical-english`.

## Requisitos

- Bun

## Desarrollo

```bash
bun install
bun run dev
```

La app se sirve en `http://localhost:5173` y proxyea `/api` hacia el backend local.

## Verificación

```bash
bun run build
bun test
```

## Rutas nuevas de Sprint 2

- `/vocabulary`
  Navegador de vocabulario con filtros por capa, CEFR, búsqueda y paginación.
- `/vocabulary/:id`
  Detalle de término con badges, definición y ejemplo.
- `/profiler`
  Perfilador de textos con cobertura conocida, tokens protegidos y modal para abrir vocabulario.
- `/diagnostic/start`
  Selección de usuario e inicio de diagnóstico.
- `/diagnostic/test`
  Flujo secuencial de 15 preguntas con barra de progreso.
- `/diagnostic/result`
  Resultado del placement CEFR con desglose por nivel y CTA hacia vocabulario.

## Componentes relevantes

- `src/features/vocabulary/`
  API, badges y componentes de resaltado del profiler.
- `src/features/diagnostic/`
  API y store Zustand para el flujo diagnóstico.
- `src/components/layout/`
  Header responsive y breadcrumbs del sprint.

## Pruebas incluidas

- `src/pages/VocabularyPage.test.tsx`
- `src/pages/DiagnosticTestPage.test.tsx`
