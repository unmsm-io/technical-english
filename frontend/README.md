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
- `/tasks`
  Navegador de tareas TBLT con filtros por tipo, nivel y búsqueda.
- `/tasks/:id`
  Detalle de una tarea con contexto pre-task y métricas rápidas.
- `/tasks/:id/run`
  Flujo de ejecución en tres fases con micro-glosses y envío de respuesta.
- `/tasks/:id/result/:attemptId`
  Resultado de la tarea con feedback, explicación didáctica y acciones de cierre.
- `/review/session`
  Sesión diaria de repaso con flip card, teclas `1/2/3/4`, modo de producción y cierre de sesión.
- `/review/deck`
  Deck completo con filtros por estado, tier, capa y acción de reset.
- `/review/stats`
  Métricas agregadas, heatmap de estabilidad, racha y top de tarjetas con más fallos.

## Rutas admin de Sprint 5

- `/admin/generated-items`
  Bandeja de items generados con tabs por estado, formulario de generación manual y acceso al detalle.
- `/admin/generated-items/:id`
  Detalle del item con scores por agente, logs de verificación y acciones de aprobar o rechazar.
- `/admin/calibration`
  Vista administrativa de métricas IRT, tabla de dificultad y disparo manual de calibración.
- `/admin/verification-metrics`
  Panel de aprobación, razones de rechazo y volumen de items generados en el tiempo.

## Integraciones nuevas de Sprint 5

- `src/features/admin/AdminApi.ts`
  Cliente axios para calibration y verification.
- `src/features/admin/components/`
  Badges y cards para score, dificultad y habilidad theta.
- `src/components/layout/Header.tsx`
  Dropdown admin y navegación móvil para las nuevas vistas.
- `src/components/layout/Breadcrumbs.tsx`
  Breadcrumbs extendidos para rutas admin.
- `src/pages/DiagnosticTestPage.tsx`
  Muestra dificultad calibrada cuando el ítem ya fue estimado.
- `src/pages/DiagnosticResultPage.tsx`
  Muestra theta, error estándar y CEFR predicho.
- `src/pages/Dashboard.tsx`
  Añade el KPI "Items pendientes de revisión".

## Componentes relevantes

- `src/features/vocabulary/`
  API, badges y componentes de resaltado del profiler.
- `src/features/diagnostic/`
  API y store Zustand para el flujo diagnóstico.
- `src/features/task/`
  API, store Zustand y componentes del flujo TBLT.
- `src/features/review/`
  API, store Zustand y componentes del flujo FSRS-6.
- `src/components/layout/`
  Header responsive y breadcrumbs del sprint.

## Pruebas incluidas

- `src/pages/VocabularyPage.test.tsx`
- `src/pages/DiagnosticTestPage.test.tsx`
- `src/pages/TaskListPage.test.tsx`
- `src/pages/TaskRunnerPage.test.tsx`
- `src/features/task/taskStore.test.ts`
- `src/pages/ReviewSessionPage.test.tsx`
- `src/features/review/reviewStore.test.ts`
