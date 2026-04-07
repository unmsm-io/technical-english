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

## Seeds del sprint

- `src/main/resources/seeds/vocabulary/`
  Carga 800 términos distribuidos en `GSL`, `AWL`, `EEWL` y `CSAWL`.
- `src/main/resources/seeds/diagnostic/items.json`
  Carga 15 ítems con distribución `3xA1`, `3xA2`, `3xB1`, `3xB2`, `3xC1`.
- `src/main/resources/seeds/tasks/items.json`
  Carga 30 tareas TBLT con distribución `6xA2`, `12xB1`, `12xB2` y `5` tareas por tipo.

Los seeders son idempotentes: si la tabla ya contiene datos, no vuelven a insertar.
