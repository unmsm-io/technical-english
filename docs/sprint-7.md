# Sprint 7 — Assessment System + Portafolio + Piloto local

## Resumen

Sprint 7 cierra el shaping principal del proyecto con el bloque A10: un sistema de evaluación de 4 tipos que ya corre end-to-end en local sobre Spring Boot + React.

Los cuatro tipos quedan así:

1. Diagnóstico
   Ya existía desde Sprint 2 y ubica al estudiante por nivel y brechas.
2. Formativo
   Son las tareas TBLT con feedback explicativo y ahora también rewrite.
3. Portafolio
   Auto-colecta evidencia longitudinal sin carga manual del estudiante.
4. Sumativo
   Integra lectura técnica, producción escrita y comprensión.

## Qué es el 4-type assessment system

La idea no es medir inglés con un solo examen, sino con evidencia distribuida a lo largo del uso real del lenguaje técnico.

- Douglas (2000) sostiene que la evaluación para fines específicos debe parecerse al contexto real donde ese lenguaje será usado. Por eso las pruebas sumativas aquí usan especificaciones, mensajes de error, PRs, reportes y documentación auténtica.
- rEFLections 31(3), 2024 muestra que la evaluación de aula en educación superior funciona mejor cuando combina peer review, reflective writing, case analysis, projects y problem-solving. El sistema de Sprint 7 adopta esa misma lógica: no depende de un único puntaje, sino de varias formas de evidencia.

En el proyecto, la combinación queda así:

- diagnóstico para línea base
- tareas con feedback para práctica continua
- portafolio para evidencia acumulada
- summatives para cierre de módulo

## Cómo funciona el portfolio auto-collect

El portafolio no pide al estudiante subir archivos manualmente. En cambio, el backend reconstruye snapshots a partir de la actividad ya registrada:

- `TaskAttempt` completados
- rewrites enviados y aceptados
- crecimiento de vocabulario medido con `TextProfiler`
- KCs dominados por BKT
- summatives aprobados y promedio
- trayectoria de `abilityTheta`

Esto sigue la lógica de ePortfolio descrita por ASEE Zone 1 (2014): el valor del portafolio está en reunir evidencia auténtica y acumulativa del desempeño, no solo en presentar un artefacto final aislado.

Lo que se muestra en frontend:

- resumen general del estudiante
- growth highlights comparando intentos tempranos vs recientes
- timeline de actividades
- tendencia de habilidad
- crecimiento de vocabulario
- exportación a markdown vía `Blob`

## Cómo correr un piloto local end-to-end

### 1. Levantar backend y frontend

```bash
cd /Users/raillyhugo/Programming/technical-english/backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
./mvnw spring-boot:run
```

```bash
cd /Users/raillyhugo/Programming/technical-english/frontend
bun run dev
```

### 2. Crear o ubicar usuarios

Usa la UI de `/users` para crear estudiantes y al menos un admin. El piloto usa `user.role == ADMIN` para mostrar las rutas administrativas.

### 3. Crear la cohorte

Entra a:

- `http://localhost:5173/admin/pilot`

Luego:

- llena nombre, descripción y tamaño objetivo
- selecciona el admin responsable
- crea la cohorte

### 4. Inscribir estudiantes

En el detalle de la cohorte:

- agrega estudiantes uno por uno
- cada inscripción crea:
  - 1 intento diagnóstico de pre-test
  - 6 intentos summative de pre-test, uno por `TaskType`

### 5. Ejecutar pre-test

Cada estudiante debe completar:

- su diagnóstico
- una o más summatives pre-test

La cohorte puede moverse a `INTERVENTION_PHASE` desde el botón "Avanzar fase".

### 6. Periodo de intervención

Durante esta fase el estudiante trabaja normalmente con:

- tareas TBLT
- rewrites
- repaso FSRS
- summatives si se desea

Los hooks de Sprint 7 registran:

- `firstActionAt`
- `lastActionAt`
- `actionsCount`

cuando el estudiante envía tareas o cierra comprensión de una summative.

### 7. Generar post-test

Cuando termine la intervención:

- usa el botón `Disparar post-test`

Eso crea para cada enrollment:

- 1 intento diagnóstico post-test
- 6 intentos summative post-test

### 8. Calcular resultados

Entra a:

- `/admin/pilot/cohorts/:id/results`

o llama:

```bash
curl http://localhost:8080/api/v1/pilot/cohorts/1/results
```

El backend calcula métricas agregadas y por estudiante, además de `d` de Cohen para vocabulario y comprensión.

## Qué métricas reporta el pilot y cómo interpretarlas

Los targets vienen del proyecto formal, sección 1.3 fase 5:

- aceptación de rewrite `>= 60%`
- reducción de tiempo a primera acción `>= 20%`
- retorno a 7 días `>= 25%`
- tamaño de efecto medible en vocabulario técnico

### Métricas de cohorte

- `vocabularySizeDelta`
  Cambio promedio entre pre y post. Si es positivo, la cohorte terminó reconociendo más vocabulario técnico.
- `vocabularyCohenD`
  Tamaño de efecto en vocabulario. Aproximación usual:
  - `0.2` pequeño
  - `0.5` mediano
  - `0.8+` grande
- `comprehensionScoreDelta`
  Cambio promedio en score sumativo entre pre y post.
- `comprehensionCohenD`
  Tamaño de efecto para comprensión.
- `rewriteAcceptanceRate`
  Porcentaje de intentos con rewrite aceptado. Si supera `60%`, el objetivo formal queda cumplido.
- `avgTimeToFirstActionMinutes`
  Tiempo medio entre enrollment y primera acción registrada. Debe bajar respecto a cohortes anteriores o a la línea base.
- `return7dRate`
  Proporción de estudiantes con actividad entre día 1 y día 7. La meta mínima formal es `25%`.
- `summativePassRate`
  Porcentaje de estudiantes con post-test sumativo aprobado.

### Desglose por estudiante

El reporte también incluye:

- delta de vocabulario por usuario
- delta de comprensión
- aceptación de rewrite
- tiempo a primera acción
- retorno dentro de 7 días
- pass rate sumativo

Eso sirve para identificar estudiantes que mejoran en vocabulario pero no en comprensión, o cohortes con buena actividad pero bajo cierre sumativo.

## Por qué NO hay deploy cloud

Hunter dejó el alcance explícito como local-first. El sprint no agrega Railway, Render, Fly, Vercel, Terraform, CI/CD ni configuración de producción.

La razón es metodológica y económica:

- primero se necesita validar que el piloto realmente produce señal útil
- recién después tiene sentido pagar y mantener infraestructura
- el profe puede correr este sprint completo en su laptop con PostgreSQL local, Spring Boot y Vite

En otras palabras: Sprint 7 sí entrega piloto, pero entrega piloto local reproducible, no despliegue cloud.

## Referencias

- Douglas, D. (2000). *Assessing Languages for Specific Purposes*. Cambridge University Press.
- Tam, N. T. T., & Tien, T. N. (2024). *Unveiling Critical Thinking Pedagogy: Classroom-Based Assessment Strategies in Higher Education*. rEFLections, 31(3), 1178–1195. https://doi.org/10.61508/refl.v31i3.276846
- Wilkerson, S., & Knecht, R. (2014). *Enhancing Assessment of Experiential Learning in Engineering Education through Electronic Portfolios*. ASEE Zone 1 Conference. https://peer.asee.org/enhancing-assessment-of-experiential-learning-in-engineering-education-through-electronic-portfolios.pdf
- Proyecto formal `docs/proyecto-formal.md`, secciones 1.3 y 1.6.
