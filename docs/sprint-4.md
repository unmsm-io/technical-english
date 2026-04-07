# Sprint 4: FSRS-6 + feedback corto para repaso

## Resumen

En este sprint la plataforma añadió un módulo nuevo de repaso espaciado para el vocabulario técnico. El catálogo de palabras de Sprint 2 sigue siendo global y de solo lectura; Sprint 4 agrega una capa `review/` que modela el estado de aprendizaje de cada usuario sobre cada término. Así, un mismo `VocabularyItem` puede tener distinta estabilidad, dificultad y fecha de siguiente repaso según el historial de cada estudiante.

## Qué es FSRS-6

FSRS-6 es un algoritmo de spaced repetition más moderno que SM-2. En lugar de usar reglas fijas, estima la siguiente fecha de repaso con tres variables:

- estabilidad
- dificultad
- retrievability

Ye et al. (2022, KDD) y Ye et al. (2023, IEEE TKDE) describen este enfoque como una optimización basada en memoria y probabilidad de recuerdo. En términos prácticos, la plataforma programa el siguiente repaso para maximizar la probabilidad de recordar justo cuando conviene volver a practicar.

## Por qué importa para inglés técnico

Kim y Webb (2022) reportan en meta-análisis un tamaño de efecto `d = 0.56` para práctica espaciada frente a práctica masiva en adquisición de vocabulario L2. Eso vuelve al repaso un componente central del proyecto: las tareas TBLT de Sprint 3 introducen lenguaje auténtico y Sprint 4 consolida ese aprendizaje para retención de largo plazo.

Nakata (2015) también respalda que los sistemas SRS funcionan mejor cuando el repaso mantiene contexto rico. Por eso cada tarjeta conserva definición, capa léxica y ejemplo de uso, y el flujo opcional de "practicar producción" permite escribir una frase propia antes de calificar la tarjeta.

## Dos políticas de retención

Sprint 4 separa dos tiers:

- `GENERAL`
  Para vocabulario de `GSL` y `AWL`. Usa retención objetivo `0.90`.
- `TECHNICAL_CORE`
  Para vocabulario de `EEWL` y `CSAWL`. Usa retención objetivo `0.95`.

La decisión se apoya en Nation (2013) para la estratificación léxica y en Cepeda et al. (2008), quienes muestran que el intervalo óptimo cambia según el horizonte de retención requerido. Los términos técnicos críticos deben mantenerse más frescos, así que el sistema les da intervalos más cortos.

## Ejemplo numérico simple

Si una tarjeta queda con estabilidad `8.29` días:

- en `GENERAL`, el próximo intervalo queda cerca de `8` días
- en `TECHNICAL_CORE`, el mismo estado cae cerca de `4` días

Es la misma memoria estimada, pero con una exigencia de retención mayor para términos técnicos centrales.

## Flujo funcional del sprint

1. El usuario completa el diagnóstico CEFR.
2. Al enviarlo, `DiagnosticService` hace bootstrap automático del deck.
3. Se crean tarjetas para todos los términos cuyo nivel CEFR sea menor o igual al placement.
4. La sesión `/review/session` muestra tarjetas vencidas, permite girarlas y calificarlas con `Again`, `Hard`, `Good` o `Easy`.
5. Si el estudiante activa "Practicar producción", puede escribir una frase y recibir feedback corto con `gpt-4o-mini`.
6. `/review/deck` muestra el deck completo con filtros.
7. `/review/stats` resume estabilidad, retención reciente, racha y tarjetas con más fallos.

## Endpoints nuevos

- `GET /api/v1/reviews/due`
- `POST /api/v1/reviews/{cardId}/grade`
- `POST /api/v1/reviews/{cardId}/grade-with-example`
- `POST /api/v1/reviews/bootstrap`
- `GET /api/v1/reviews/stats`
- `GET /api/v1/reviews/deck`
- `GET /api/v1/reviews/{cardId}`
- `POST /api/v1/reviews/{cardId}/reset`

## Cómo correr el demo

1. Levantar la base de datos.
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

4. Flujo sugerido para el profesor:

- Crear un usuario.
- Completar el diagnóstico.
- Ir a `/review/session?userId={id}`.
- Calificar varias tarjetas.
- Ir a `/review/deck?userId={id}` para ver el estado del deck.
- Ir a `/review/stats?userId={id}` para revisar retención y estabilidad.

## Mantenimiento

Se añadió `ReviewMaintenanceJob`, un cron diario a las `03:00` que elimina `ReviewLog` con más de 90 días. En pruebas se desactiva con `review.maintenance.enabled=false`.
