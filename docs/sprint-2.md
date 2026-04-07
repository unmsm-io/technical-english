# Sprint 2: motor de vocabulario y diagnóstico

## Resumen funcional

Durante este sprint la plataforma dejó de ser un CRUD general y pasó a tener dos capacidades nucleares para inglés técnico:

1. Un motor de vocabulario con 800 términos clasificados en capas `GSL`, `AWL`, `EEWL` y `CSAWL`, además de nivel CEFR.
2. Un diagnóstico de 15 ítems que ubica al usuario entre `A1` y `C1`, guarda el placement en su perfil y estima tamaño vocabular.

## Flujo principal que ahora funciona

1. El docente o estudiante crea un usuario en la plataforma.
2. Desde el perfil puede definir intereses de aprendizaje (`targetSkills`) y lanzar el diagnóstico.
3. El sistema genera un intento, muestra 15 preguntas con contexto de ingeniería y guarda las respuestas.
4. Al enviar el test, el backend calcula el nivel CEFR alcanzado, actualiza `englishLevel`, `diagnosticCompleted`, `diagnosticCompletedAt` y `vocabularySize`.
5. El usuario puede navegar el vocabulario filtrando por capa y nivel o perfilar un texto técnico para estimar cobertura léxica.

## Módulo de vocabulario

- Se añadieron seeds idempotentes para cuatro capas léxicas.
- Cada término tiene definición, frecuencia, parte de la oración, ejemplo y nivel CEFR.
- La vista `/vocabulary` permite:
  - buscar por término o definición
  - filtrar por capa
  - filtrar por nivel CEFR
  - navegar páginas desde el backend
- La vista `/vocabulary/:id` muestra el detalle completo del término.

## Perfilador de textos

La ruta `/profiler` recibe texto técnico y separa:

- tokens protegidos como `NullPointerException`, `--verbose` o `config.yml`
- tokens aprendibles
- términos desconocidos
- porcentaje de cobertura conocida

El usuario puede abrir un término desconocido directamente en el navegador de vocabulario.

## Diagnóstico CEFR

El flujo de diagnóstico fue diseñado para onboarding técnico:

- 15 ítems en total
- distribución por nivel: `3xA1`, `3xA2`, `3xB1`, `3xB2`, `3xC1`
- distribución por skill: `READING`, `VOCAB`, `GRAMMAR`
- regla de placement:
  - se asigna el mayor nivel con al menos `2/3` respuestas correctas
  - si ningún nivel supera el umbral, el usuario queda en `A1`

## Dashboard y perfil

El dashboard ahora muestra datos reales:

- usuarios activos
- diagnósticos completados
- promedio de tamaño vocabular
- conteo de vocabulario por capa

El perfil de usuario ahora incluye:

- nivel CEFR
- tamaño vocabular estimado
- fecha del último diagnóstico
- intereses de aprendizaje
- historial de intentos diagnósticos

## Validación técnica

El sprint quedó verificado con:

- `./mvnw compile`
- `./mvnw test`
- `bun run build`
- `bun test`

Las rutas nuevas aparecen también en Swagger UI con descripciones en español.
