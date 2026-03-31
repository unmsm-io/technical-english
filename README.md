# Technical English Platform

Sistema de recomendacion para el Aprendizaje de Ingles Tecnico Basico para Profesionales de Ciencias e Ingenieria mediante Arquitectura de Microservicios e Integracion con Modelos de Lenguaje (LLM).

## Stack

- **Backend**: Spring Boot 3.4, Java 21, PostgreSQL
- **Frontend**: React 19, TypeScript, Tailwind CSS (coming soon)
- **Database**: PostgreSQL 17

## Quick Start

### Prerequisites

- Java 21
- Maven 3.9+
- Docker (for PostgreSQL)

### Run

```bash
# Start database
make db

# Run backend
make dev

# Run tests
make test
```

### API Docs

Once running, open [http://localhost:8080/swagger-ui](http://localhost:8080/swagger-ui)

## Project Structure

```
technical-english/
├── backend/                  # Spring Boot API
│   └── src/main/java/pe/edu/unmsm/fisi/techeng/
│       ├── config/           # CORS, OpenAPI
│       ├── shared/           # BaseEntity, ApiResponse, exceptions
│       ├── user/             # User profile CRUD
│       ├── content/          # Syllabus, lessons (Phase 2)
│       ├── practice/         # Exercises, quizzes (Phase 3)
│       ├── llm/              # LLM integration (Phase 4)
│       ├── analytics/        # Dashboard (Phase 5)
│       └── recommendation/   # Engine (Phase 5)
├── frontend/                 # React app (coming soon)
├── docs/                     # Architecture, API spec
└── docker-compose.yml        # PostgreSQL
```

## API Endpoints (Phase 1)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/users | Create user |
| GET | /api/v1/users | List users (paginated) |
| GET | /api/v1/users/{id} | Get user by ID |
| PUT | /api/v1/users/{id} | Update user |
| DELETE | /api/v1/users/{id} | Soft delete user |
| GET | /api/v1/users/search?q= | Search users |

## Team

UNMSM - Facultad de Ingenieria de Sistemas e Informatica

## License

MIT
