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

## Seeds del sprint

- `src/main/resources/seeds/vocabulary/`
  Carga 800 términos distribuidos en `GSL`, `AWL`, `EEWL` y `CSAWL`.
- `src/main/resources/seeds/diagnostic/items.json`
  Carga 15 ítems con distribución `3xA1`, `3xA2`, `3xB1`, `3xB2`, `3xC1`.

Los seeders son idempotentes: si la tabla ya contiene datos, no vuelven a insertar.
