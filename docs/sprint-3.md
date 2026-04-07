# Sprint 3: Motor TBLT

## Que es TBLT

Task-Based Language Teaching convierte el aprendizaje en ejecucion de tareas autenticas en vez de ejercicios aislados. En este sprint, el estudiante deja de "practicar ingles tecnico" de forma abstracta y pasa a leer errores, resumir documentacion, redactar commits, describir PRs y comentar code review como lo haria en un equipo de software real, siguiendo el modelo de tres fases de Ellis (2003, 2009) y Long (2015), reforzado para entornos mediados por tecnologia por Bhandari et al. (2025).

## Las 3 fases con un ejemplo concreto

Ejemplo: tarea `Explicar un NullPointerException en Spring Boot`.

1. Pre-task
   El sistema muestra un contexto corto en ingles, micro-glosses sobre terminos como `stack trace` o `null check`, y vocabulario de apoyo si existe.
2. During-task
   El estudiante lee el stack trace real y escribe en ingles una explicacion breve de la causa raiz, la linea del fallo y la primera accion recomendada.
3. Post-task
   El backend genera feedback con puntaje, fortalezas, errores concretos, una version mejorada de la respuesta y una explicacion didactica en espanol.

## Como se calibra el feedback por CEFR

El feedback sigue una estrategia CEFR-calibrated: mas guiado y simple en niveles iniciales, mas holistico y multidimensional desde B1 en adelante. Segun Mohamed et al. (2025), el mayor efecto del feedback asistido por IA en escritura ESP aparece en A2, por eso el sistema mantiene ayudas mas explicitas en A2, un equilibrio entre precision y autonomia en B1, y comentarios mas completos sobre claridad, registro y cohesion en B2. Ademas, se privilegia GEF sobre GEC: no solo corrige, tambien explica por que una formulacion funciona mejor.

Referencia usada en el proyecto:
- Mohamed, A.M. et al. (2025). ChatGPT's Impact on ESP Writing Proficiency and Learner Autonomy: An Experimental Study. Teaching and Learning the Language of the Trades, 7(3).

## Como correr el demo

1. Levantar la base de datos del proyecto como en los sprints anteriores.
2. Iniciar backend:

```bash
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
./mvnw spring-boot:run
```

3. Iniciar frontend:

```bash
cd frontend
bun install
bun run dev
```

4. Flujo recomendado para la demo:
   - Crear o elegir un usuario.
   - Verificar que tenga `englishLevel` en el perfil o completar el diagnostico.
   - Ir a `/tasks`.
   - Abrir una tarea.
   - Ejecutar las fases pre-task, during-task y post-task.
   - Revisar el resultado y luego el historial TBLT en `/users/:id`.

## Endpoints expuestos

- `GET /api/v1/tasks`
- `GET /api/v1/tasks/{id}`
- `GET /api/v1/tasks/types`
- `GET /api/v1/tasks/stats`
- `POST /api/v1/task-attempts?userId={id}&taskId={id}`
- `PATCH /api/v1/task-attempts/{id}/phase`
- `POST /api/v1/task-attempts/{id}/submit`
- `PATCH /api/v1/task-attempts/{id}/complete`
- `GET /api/v1/task-attempts?userId={id}`
- `GET /api/v1/task-attempts/{id}`
