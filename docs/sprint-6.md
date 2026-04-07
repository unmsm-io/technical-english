# Sprint 6: BKT Knowledge Tracing + Mastery Analytics Dashboard

## Resumen

Sprint 6 implementa las partes A6 y A9 del shaping del proyecto: trazado de dominio por knowledge components usando Bayesian Knowledge Tracing y un dashboard de mastery para estudiante y cohorte. La meta no es gamificar, sino hacer visible qué microhabilidades del inglés técnico ya están consolidadas, cuáles siguen frágiles y cuándo la dificultad percibida parece entrar en flow, frustración o aburrimiento.

## Qué es BKT

Bayesian Knowledge Tracing es un modelo probabilístico clásico para estimar si un estudiante ya domina una habilidad específica a partir de una secuencia de respuestas correctas e incorrectas. Corbett y Anderson (1995) lo formulan como un HMM de 4 parámetros: conocimiento inicial `P(L0)`, transición de aprendizaje por oportunidad `P(T)`, acierto por adivinación `P(G)` y error por descuido `P(S)`. En este sprint cada `KnowledgeComponent` usa exactamente esos parámetros y se actualiza en cada respuesta proveniente de diagnóstico, tareas TBLT o repaso FSRS.

## Cómo se actualiza P(L) con cada respuesta

Si la respuesta observada es correcta, primero calculamos el posterior por Bayes:

`P(Ln | Correct) = (P(Ln) * (1 - P(S))) / (P(Ln) * (1 - P(S)) + (1 - P(Ln)) * P(G))`

Si la respuesta observada es incorrecta:

`P(Ln | Incorrect) = (P(Ln) * P(S)) / (P(Ln) * P(S) + (1 - P(Ln)) * (1 - P(G)))`

Después del posterior, aplicamos la transición hacia adelante:

`P(Ln+1) = P(Ln | Obs) + (1 - P(Ln | Obs)) * P(T)`

Ese orden importa: primero se infiere el estado dado lo observado y luego se modela la posibilidad de haber aprendido durante esa oportunidad. Es exactamente la actualización descrita por Corbett y Anderson (1995).

## Por qué mastery threshold = 0.95

Se usa `P(L) >= 0.95` como umbral de mastery porque en BKT ese valor se ha vuelto una convención práctica para considerar una habilidad suficientemente consolidada como para dejar de tratarla como frágil. No significa perfección absoluta; significa que, dadas las evidencias observadas, la probabilidad de dominio ya es lo bastante alta para considerar la habilidad confiable. En la implementación, cuando un `KcMasteryState` cruza por primera vez ese umbral, se guarda `masteredAt`.

## Qué es flow detection y nuestra simplificación

Csikszentmihalyi (1990) describe flow como el estado donde reto y habilidad están equilibrados. En un sistema real eso requeriría señales más ricas, pero para este sprint se implementó una simplificación operativa útil para demo:

- `consecutiveAgains >= 3` sugiere zona de frustración.
- `consecutiveEasys >= 10` sugiere aburrimiento.
- `0.60 <= recent24hCorrectRate <= 0.85` sugiere flow.
- `recent24hAttemptCount == 0` indica inactividad.

Esto no pretende ser una medición clínica del estado psicológico; es una heurística pedagógica para ajustar la experiencia de práctica y detectar desajustes de dificultad.

## Por qué NO leaderboards

Se evitó deliberadamente añadir leaderboards, badges arbitrarios o rachas descontextualizadas. Almeida et al. (2023), en su systematic mapping sobre gamificación educativa, advierten que muchos sistemas terminan premiando actividad superficial y no progreso significativo. Además, desde la Self-Determination Theory de Ryan y Deci (2000), el dashboard debía reforzar autonomía, competencia y sentido de avance real, no comparación social vacía. Por eso el panel muestra mastery por skill, recomendaciones y estado de flow, no rankings.

## Cómo correr el demo

1. Levantar PostgreSQL local.
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
- Completar diagnóstico en `/diagnostic/start`.
- Resolver una tarea en `/tasks`.
- Hacer una sesión de repaso en `/review/session`.
- Abrir `/mastery?userId={id}` para ver el dashboard individual.
- Abrir `/mastery/kcs/{kcId}?userId={id}` para ver el detalle de un KC.
- Como admin, abrir `/admin/cohort-analytics` para la vista agregada.

## Endpoints expuestos

### KC + Mastery

- `GET /api/v1/kc`
- `GET /api/v1/kc/{id}`
- `GET /api/v1/kc/items`
- `POST /api/v1/kc/extract`
- `GET /api/v1/kc/stats`
- `GET /api/v1/mastery/users/{userId}/radar`
- `GET /api/v1/mastery/users/{userId}/kcs/{kcId}`
- `GET /api/v1/mastery/users/{userId}/mastered-count`
- `POST /api/v1/mastery/users/{userId}/recompute`

### Analytics extensions

- `GET /api/v1/analytics/users/{userId}/mastery-radar`
- `GET /api/v1/analytics/users/{userId}/stability-heatmap`
- `GET /api/v1/analytics/users/{userId}/acquisition-rate`
- `GET /api/v1/analytics/users/{userId}/flow-alert`
- `GET /api/v1/analytics/cohort/mastery`
- `GET /api/v1/analytics/cohort/acquisition`

## Notas de implementación

- El módulo nuevo vive en `backend/src/main/java/pe/edu/unmsm/fisi/techeng/kc`.
- No se modificaron entidades de `diagnostic/`, `task/`, `review/`, `calibration/` o `verification/`; solo se añadieron hooks en servicios.
- El frontend usa SVG nativo para el radar y las gráficas ligeras, sin depender de librerías como Recharts.
- Los seeds iniciales incluyen 10 knowledge components manuales y mappings base para diagnóstico, tareas y vocabulario.
