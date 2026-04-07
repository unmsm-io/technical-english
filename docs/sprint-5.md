# Sprint 5: IRT calibration + verificación multi-agente

## Resumen

Sprint 5 agrega dos capacidades nuevas al proyecto `technical-english`. La primera es calibración IRT sobre el diagnóstico para pasar de reglas editoriales fijas a parámetros estimados desde respuestas reales. La segunda es un pipeline de generación y verificación multi-agente para crear nuevos ítems diagnósticos con revisión administrativa antes de promoverlos al banco oficial.

## Qué es IRT / Rasch

La Teoría de Respuesta al Ítem modela la probabilidad de que un estudiante responda bien una pregunta según dos variables: habilidad del estudiante y dificultad del ítem. En este sprint se implementó la versión Rasch de un parámetro, donde `P(correcta) = 1 / (1 + exp(-(theta - b)))`. Lord (1980) resume cómo este marco permite pasar de puntajes crudos a mediciones comparables entre usuarios e ítems, mientras que Rasch (1960) da la formulación base del modelo.

## Cómo se calibra automáticamente

El backend ahora guarda dificultad, discriminación, conteo de respuestas y estado de calibración en `DiagnosticItem`, y theta con error estándar en `User`. Cada vez que un estudiante envía su diagnóstico, `CalibrationService` recalcula su habilidad usando EAP con 41 puntos de cuadratura. Además, un cron diario `CalibrationJob` corre a las `03:30 AM` y ejecuta una corrida global JML para recalibrar todos los ítems usando el histórico completo de intentos. Si el sistema ya tiene suficientes ítems calibrados, el placement final del diagnóstico puede sobrescribirse con umbrales basados en theta.

## Qué es el pipeline 4-stage

El pipeline de verificación sigue una lógica multi-agente inspirada en Wang y Katsaggelos (2026): un agente genera el ejercicio, luego otros agentes intentan romperlo antes de que llegue al administrador. En esta implementación, el flujo real es `Generator -> SolvabilityVerifier -> FactualChecker -> ReasoningValidator -> TokenPreservationGuard`. La idea central es reducir drásticamente ejercicios mal formados, con respuesta inconsistente o con tokens técnicos corrompidos antes de que entren al banco. Maity et al. (2025) también respalda el uso de few-shot prompting con al menos ocho ejemplos para mejorar la calidad de generación educativa.

## Cómo aprueba items el admin

El admin entra a `/admin/generated-items`, filtra por estado y puede abrir el detalle de cualquier ítem. En `/admin/generated-items/:id` ve el enunciado, opciones, explicación, scores por agente y logs de verificación. Si el ítem pasa revisión humana, lo aprueba y el sistema lo promueve a `DiagnosticItem`; si no, lo rechaza con una razón explícita y el ítem queda fuera del banco oficial. Las métricas agregadas se revisan en `/admin/verification-metrics`, mientras que la salud Rasch del banco se ve en `/admin/calibration`.

## Cómo correr el demo

1. Levantar la base de datos PostgreSQL local.
2. Ejecutar backend:

```bash
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
./mvnw spring-boot:run
```

3. Ejecutar frontend:

```bash
cd frontend
bun install
bun run dev
```

4. Flujo sugerido:

- Crear o elegir un usuario.
- Completar `/diagnostic/start -> /diagnostic/test -> /diagnostic/result`.
- Revisar theta y error estándar en el resultado.
- Ir a `/admin/calibration` para ver dificultad y correr una calibración manual.
- Ir a `/admin/generated-items` para generar un ítem nuevo.
- Abrir el detalle, revisar scores y aprobar o rechazar.
- Ver resumen agregado en `/admin/verification-metrics`.

## Endpoints nuevos

### Calibration

- `GET /api/v1/calibration/stats`
- `GET /api/v1/calibration/items`
- `POST /api/v1/calibration/run`
- `GET /api/v1/calibration/users/{id}/ability`

### Verification

- `POST /api/v1/verification/generate`
- `GET /api/v1/verification/items`
- `GET /api/v1/verification/items/{id}`
- `POST /api/v1/verification/items/{id}/approve`
- `POST /api/v1/verification/items/{id}/reject`
- `GET /api/v1/verification/metrics`

## Notas de implementación

- El módulo nuevo vive en `backend/src/main/java/pe/edu/unmsm/fisi/techeng/calibration` y `.../verification`.
- No se tocó el módulo legado `llm/`; la verificación nueva se construyó por separado.
- `TokenPreservationGuard` reutiliza `TokenClassifier` de Sprint 2 para proteger identificadores, flags CLI y nombres de excepciones.
- El frontend añade navegación admin, breadcrumbs y vistas responsivas para escritorio y móvil.
