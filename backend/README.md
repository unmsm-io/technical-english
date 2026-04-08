# Backend Sprint 2

Backend Spring Boot para el Sprint 2 de `technical-english`.

## Requisitos

- Java 21
- Maven Wrapper (`./mvnw`)
- PostgreSQL si se ejecuta fuera del perfil de pruebas

## Ejecución

```bash
./mvnw spring-boot:run
```

Swagger UI queda disponible en `http://localhost:8080/swagger-ui.html`.

## Verificación

```bash
./mvnw compile
./mvnw test
```

## Endpoints nuevos de Sprint 2

### Vocabulario

- `GET /api/v1/vocabulary`
  Lista vocabulario con filtros `layer`, `cefrLevel`, `q`, `page`, `size`.
- `GET /api/v1/vocabulary/{id}`
  Devuelve el detalle de un término.
- `POST /api/v1/vocabulary/profile`
  Perfila un texto técnico y responde cobertura conocida, tokens protegidos y términos desconocidos.

### Diagnóstico

- `POST /api/v1/diagnostic/attempts`
  Inicia un intento para un usuario y devuelve los 15 ítems del test.
- `POST /api/v1/diagnostic/attempts/{attemptId}/submit`
  Evalúa respuestas, calcula placement CEFR y actualiza el perfil del usuario.
- `GET /api/v1/diagnostic/attempts?userId={id}`
  Lista historial diagnóstico del usuario.
- `GET /api/v1/diagnostic/items`
  Devuelve los ítems sembrados del diagnóstico.

### Perfil de usuario

- `PATCH /api/v1/users/{id}/profile`
  Actualiza `targetSkills`, `vocabularySize`, `diagnosticCompleted` y `diagnosticCompletedAt`.

### Analítica

- `GET /api/v1/analytics/dashboard`
  Devuelve usuarios activos, diagnósticos completos, promedio vocabular y conteo de vocabulario por capa.

## Task module (TBLT)

- `GET /api/v1/tasks`
  Lista tareas TBLT con filtros `type`, `cefr`, `q`, `page`, `size`.
- `GET /api/v1/tasks/{id}`
  Devuelve el detalle completo de una tarea con micro-glosses y vocabulario relacionado.
- `GET /api/v1/tasks/types`
  Lista los tipos de tarea disponibles con su etiqueta en español.
- `GET /api/v1/tasks/stats`
  Devuelve conteos agregados por tipo y nivel CEFR.
- `POST /api/v1/task-attempts?userId={id}&taskId={id}`
  Inicia un intento TBLT en fase `PRE_TASK`.
- `PATCH /api/v1/task-attempts/{id}/phase`
  Avanza el intento a la siguiente fase válida.
- `POST /api/v1/task-attempts/{id}/submit`
  Envía la respuesta del estudiante y genera feedback calibrado por CEFR.
- `PATCH /api/v1/task-attempts/{id}/complete`
  Marca el intento como completado después de revisar el feedback.
- `GET /api/v1/task-attempts?userId={id}`
  Lista el historial de tareas TBLT de un usuario.
- `GET /api/v1/task-attempts/{id}`
  Recupera el estado actual del intento, incluido el feedback almacenado si ya existe.

## Review module (FSRS-6)

El módulo de repaso implementa scheduling FSRS-6 sobre el catálogo de vocabulario de Sprint 2. La tarjeta se crea por usuario, no por término global, y mantiene `stability`, `difficulty`, `due`, `reps`, `lapses` y `retentionTier`.

Base científica usada en el código y la documentación:

- Ye et al. (2022 KDD, 2023 IEEE TKDE) para el algoritmo FSRS y el modelo de memoria con estabilidad, dificultad y retrievability.
- Kim y Webb (2022) para el efecto agregado `d=0.56` de práctica espaciada sobre vocabulario L2.
- Cepeda et al. (2008) para la relación entre retención objetivo e intervalo óptimo.
- Nation (2013) para separar `GENERAL` (`GSL`, `AWL`) de `TECHNICAL_CORE` (`EEWL`, `CSAWL`).

Políticas de retención:

- `GENERAL`
  Usa `requestRetention = 0.90`.
- `TECHNICAL_CORE`
  Usa `requestRetention = 0.95`, lo que genera intervalos más cortos para términos críticos del dominio.

Endpoints expuestos:

- `GET /api/v1/reviews/due?userId={id}&limit=20`
  Devuelve tarjetas vencidas para la sesión actual.
- `POST /api/v1/reviews/{cardId}/grade`
  Reprograma la tarjeta con `AGAIN`, `HARD`, `GOOD` o `EASY`.
- `POST /api/v1/reviews/{cardId}/grade-with-example`
  Reprograma la tarjeta y genera feedback corto sobre una oración producida por el estudiante.
- `POST /api/v1/reviews/bootstrap?userId={id}`
  Crea manualmente el deck inicial si el hook del diagnóstico no corrió.
- `GET /api/v1/reviews/stats?userId={id}`
  Devuelve métricas agregadas del deck.
- `GET /api/v1/reviews/deck?userId={id}&state=&tier=&layer=&q=&page=&size=`
  Lista el deck completo con filtros.
- `GET /api/v1/reviews/{cardId}`
  Recupera una tarjeta puntual.
- `POST /api/v1/reviews/{cardId}/reset`
  Reinicia una tarjeta al estado `NEW`.

Mantenimiento:

- `ReviewMaintenanceJob` limpia `ReviewLog` con más de 90 días a las `03:00`.
- Se puede desactivar con `review.maintenance.enabled=false`.

## Calibration module (IRT)

Sprint 5 agrega un módulo independiente `calibration/` para calibrar el diagnóstico con el modelo Rasch de un parámetro. La dificultad de cada `DiagnosticItem` ya no es solo editorial: se estima a partir de respuestas reales y se persiste en la entidad junto con `responseCount`, `lastCalibratedAt` y `calibrationStatus`. En paralelo, cada `User` ahora guarda `abilityTheta`, `abilityStandardError` y `lastAbilityUpdate`.

Componentes principales:

- `RaschScorer`
  Probabilidad, información y log-likelihood del modelo Rasch.
- `AbilityEstimator`
  Estimación EAP con 41 puntos en `[-4, 4]` y prior normal `N(0,1)`.
- `ItemCalibrator`
  Calibración JML iterativa con tope de `50` iteraciones y convergencia `0.001`.
- `CalibrationService`
  Actualiza theta al cerrar un intento y puede ejecutar ciclos completos sobre todo el histórico.
- `CalibrationJob`
  Cron diario a las `03:30`, activado con `calibration.enabled=true`.

Endpoints expuestos:

- `GET /api/v1/calibration/stats`
  Devuelve conteos por estado, medias Rasch y último timestamp de calibración.
- `GET /api/v1/calibration/items`
  Lista items diagnósticos con dificultad, discriminación y volumen de respuestas.
- `POST /api/v1/calibration/run`
  Fuerza una corrida manual del calibrador.
- `GET /api/v1/calibration/users/{id}/ability`
  Devuelve theta, error estándar y CEFR predicho para un usuario.

Integración con diagnóstico:

- `DiagnosticService.submitAttempt(...)` sigue calculando el placement legacy por regla editorial.
- Si ya existen ítems calibrados y el usuario obtuvo una estimación válida de theta, el placement final puede sobrescribirse por umbrales Rasch.
- `DiagnosticResultResponse` ahora incluye `placedLevelLegacy`, `abilityTheta`, `abilityStandardError` y `predictedCefr`.

Base teórica usada en Javadoc y diseño:

- Rasch (1960) y Lord (1980) para el modelo IRT.
- Bock y Mislevy (1982) para EAP por cuadratura numérica.
- Sharpnack et al. (2024) AutoIRT como referencia moderna de automatización.

## Verification module

Sprint 5 también incorpora un módulo nuevo `verification/` separado del legado `llm/`. La razón es arquitectónica: la generación de ítems y su verificación requieren entidades, logs, estados y políticas de aprobación propias, no una simple extensión de prompts existentes.

Flujo del pipeline:

1. `GeneratorAgent` produce un ítem en JSON usando `gpt-4o-mini`, prompt CEFR y `8` ejemplos few-shot.
2. `SolvabilityVerifier` resuelve el ejercicio sin ver la respuesta esperada.
3. `FactualChecker` busca errores factuales y penaliza el score.
4. `ReasoningValidator` comprueba que la explicación realmente soporte la opción correcta.
5. `TokenPreservationGuard` reutiliza `TokenClassifier` del módulo de vocabulario para asegurar que tokens protegidos como `NullPointerException` o flags CLI no sean alterados literalmente.

Modelo de datos:

- `GeneratedItem`
  Estado `PENDING_GENERATION -> GENERATING -> VERIFYING -> PENDING_REVIEW -> APPROVED|REJECTED|FAILED`.
- `VerificationLog`
  Historial completo de llamadas de agentes y notas administrativas.

Servicios principales:

- `VerificationPipeline`
  Ejecuta la secuencia completa, hace short-circuit cuando un verificador rechaza y deja el estado en `FAILED` ante errores no controlados.
- `GeneratedItemService`
  Solicita generación, lista pendientes, aprueba, rechaza, promueve a `DiagnosticItem` y agrega métricas.

Endpoints expuestos:

- `POST /api/v1/verification/generate`
  Ejecuta generación + verificación.
- `GET /api/v1/verification/items`
  Lista items filtrables por estado.
- `GET /api/v1/verification/items/{id}`
  Devuelve detalle completo y logs.
- `POST /api/v1/verification/items/{id}/approve`
  Promueve el ítem a diagnóstico real.
- `POST /api/v1/verification/items/{id}/reject`
  Rechaza el ítem con razón administrativa.
- `GET /api/v1/verification/metrics`
  Resume aprobación, rechazos y score promedio.

Base teórica usada en el sprint:

- Wang y Katsaggelos (2026) para el enfoque multi-agente de verificación.
- Maity et al. (2025) para el efecto de few-shot prompting en calidad de generación escolar.
- Krashen (1985) y Nguyen y Doan (2025) para justificar preservación literal de tokens técnicos dentro de input comprensible.

## Seeds del sprint

- `src/main/resources/seeds/vocabulary/`
  Carga 800 términos distribuidos en `GSL`, `AWL`, `EEWL` y `CSAWL`.
- `src/main/resources/seeds/diagnostic/items.json`
  Carga 15 ítems con distribución `3xA1`, `3xA2`, `3xB1`, `3xB2`, `3xC1`.
- `src/main/resources/seeds/tasks/items.json`
  Carga 30 tareas TBLT con distribución `6xA2`, `12xB1`, `12xB2` y `5` tareas por tipo.

Los seeders son idempotentes: si la tabla ya contiene datos, no vuelven a insertar.

## KC module (BKT)

Sprint 6 agrega un módulo independiente `kc/` para modelar knowledge components y trazar dominio por estudiante con Bayesian Knowledge Tracing. La separación es intencional: el sistema necesitaba entidades, repositorios, servicios, logs y endpoints propios para trabajar con KCs sin contaminar `diagnostic/`, `task/` o `review/`.

Base teórica usada:

- Corbett y Anderson (1995) para BKT con el modelo de 4 parámetros `P(L0)`, `P(T)`, `P(G)` y `P(S)`.
- Piech et al. (2015) como contexto moderno sobre tracing neuronal, útil para justificar por qué aquí se eligió un enfoque interpretable.
- Nagatani et al. (2019) como respaldo del valor de modelar aprendizaje/olvido por oportunidad de práctica.

Componentes principales:

- `KnowledgeComponent`
  Catálogo de habilidades o microcompetencias como `passive_voice` o `api_documentation_reading`.
- `ItemKcMapping`
  Relación polimórfica entre cualquier item (`DIAGNOSTIC`, `TASK`, `VOCABULARY`) y uno o más KCs.
- `KcMasteryState`
  Estado por usuario y KC con `pLearned`, rachas, conteos y `masteredAt`.
- `KcResponseLog`
  Log histórico de cada actualización BKT.
- `BktUpdater`
  Núcleo matemático puro que calcula el posterior y luego aplica transición hacia adelante.
- `MasteryService`
  Punto único de escritura cuando llegan respuestas desde diagnóstico, tareas o repaso.
- `KcMappingExtractor`
  Extrae KCs candidatos con LLM y genera semillas consumidas por `KcSeedRunner`.

Hooks integrados:

- `DiagnosticService.submitAttempt(...)`
  Registra un evento de mastery por respuesta del diagnóstico después de actualizar calibración.
- `TaskAttemptService.submit(...)`
  Registra mastery cuando el score de la tarea es `>= 70`.
- `ReviewCardService.gradeCard(...)`
  Registra mastery cuando la nota de FSRS es `GOOD` o `EASY`.

Endpoints expuestos:

- `GET /api/v1/kc`
  Lista KCs con filtros y paginación.
- `GET /api/v1/kc/{id}`
  Devuelve detalle de un KC, conteos y items relacionados.
- `GET /api/v1/kc/items`
  Lista mappings por tipo de item e id.
- `POST /api/v1/kc/extract`
  Ejecuta extracción/siembra de KCs desde el extractor.
- `GET /api/v1/kc/stats`
  Resume conteos por categoría y CEFR.
- `GET /api/v1/mastery/users/{userId}/radar`
  Devuelve el radar completo de mastery BKT.
- `GET /api/v1/mastery/users/{userId}/kcs/{kcId}`
  Devuelve detalle, historial y mappings de un KC para un usuario.
- `GET /api/v1/mastery/users/{userId}/mastered-count`
  Cuenta KCs con `P(L) >= 0.95`.
- `POST /api/v1/mastery/users/{userId}/recompute`
  Reconstruye el estado del usuario desde los logs guardados.

Seeds y extracción:

- `src/main/resources/seeds/kc/extracted-kcs-fallback.json`
  Contiene `10` KCs iniciales y mappings base si todavía no existe extracción real.
- `src/main/resources/seeds/kc/extracted-kcs.json`
  Se genera cuando corre la extracción LLM y luego se reutiliza de forma idempotente.

## Analytics extensions

Sprint 6 también extiende `analytics/` para exponer una capa de mastery y cohort dashboards sin introducir gamificación superficial.

Base teórica usada:

- Csikszentmihalyi (1990) para flow como equilibrio entre reto y habilidad.
- Ryan y Deci (2000) para mantener foco en motivación autodeterminada y progreso significativo.
- Almeida et al. (2023) para evitar leaderboards y badges desconectados del aprendizaje real.

Componentes nuevos:

- `FlowDetector`
  Heurística simple sobre `ReviewLog` y `KcResponseLog` de las últimas `24h` para clasificar `FRUSTRATION`, `BOREDOM`, `FLOW`, `INACTIVE` o `NEUTRAL`.
- Extensiones en `AnalyticsService`
  Radar de mastery, heatmap de estabilidad, ritmo de adquisición, alertas de flow y agregados de cohorte.
- Extensiones en `AnalyticsController`
  Endpoints dedicados para paneles de estudiante y panel admin.

Heurísticas de flow:

- `consecutiveAgains >= 3` → `FRUSTRATION`
- `consecutiveEasys >= 10` → `BOREDOM`
- `0.60 <= recent24hCorrectRate <= 0.85` → `FLOW`
- `recent24hAttemptCount == 0` → `INACTIVE`
- caso contrario → `NEUTRAL`

Endpoints expuestos:

- `GET /api/v1/analytics/users/{userId}/mastery-radar`
- `GET /api/v1/analytics/users/{userId}/stability-heatmap`
- `GET /api/v1/analytics/users/{userId}/acquisition-rate`
- `GET /api/v1/analytics/users/{userId}/flow-alert`
- `GET /api/v1/analytics/cohort/mastery`
- `GET /api/v1/analytics/cohort/acquisition`
