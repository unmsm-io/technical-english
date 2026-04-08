# UX Overhaul

## Resumen

Se renovó la interfaz de `technical-english` para darle una estética más cercana a Vercel/Linear: tipografía Geist, escala visual más consistente, navegación superior simplificada, paleta monocromática con color semántico puntual, soporte de tema claro/oscuro y un set de componentes reutilizables.

## Qué cambió

- Se incorporó `Geist Sans` y `Geist Mono` como tipografías base.
- Se reemplazó la base visual por tokens de diseño en `frontend/src/index.css` usando Tailwind 4 y variables `oklch`.
- Se creó una librería de componentes UI bajo `frontend/src/components/ui/` para botones, tarjetas, tablas, diálogos, selects, comandos, alerts, badges, métricas y estados vacíos.
- Se agregó proveedor de tema con persistencia en `localStorage`.
- Se rediseñó la cabecera principal con navegación priorizada, menú móvil y acceso rápido a comandos.
- Se activó una paleta de comandos con `Cmd+K` para navegar entre módulos y cambiar el tema.
- Se refactoraron las pantallas principales de panel, usuarios, vocabulario, tareas, dominio, portafolio, diagnóstico inicial y contenido.

## Filosofía visual

- Monocromo primero, color semántico después.
- Menos decoración y más jerarquía.
- Bordes finos, sombras mínimas, tipografía densa y legible.
- Estados vacíos explícitos en lugar de contenedores rotos o gráficos vacíos.
- Mejor lectura en escritorio y móvil.

## Nuevas funciones para usar

### Cambio de tema

- En la esquina superior derecha hay un selector de tema.
- Puedes alternar entre `Claro`, `Oscuro` y `Sistema`.
- La preferencia se guarda automáticamente.

### Paleta de comandos

- Presiona `Cmd+K` para abrir la paleta.
- Desde ahí puedes navegar a módulos, abrir páginas administrativas, cambiar el tema y saltar a términos de vocabulario.

### Navegación superior

- Las rutas principales quedaron visibles en la barra superior.
- Las rutas secundarias y administrativas se agrupan en `Más`.
- En móvil se reemplazó el scroll horizontal por un drawer.

## Catálogo de componentes

### Componentes base

- `Button`
- `Input`
- `Textarea`
- `Label`
- `Card`
- `Badge`
- `Alert`
- `Avatar`
- `Separator`
- `Skeleton`
- `Kbd`

### Navegación y overlays

- `Dialog`
- `AlertDialog`
- `Sheet`
- `DropdownMenu`
- `Popover`
- `Tooltip`
- `HoverCard`
- `Tabs`
- `Accordion`
- `Command`
- `Breadcrumb`

### Datos y estados

- `Table`
- `Progress`
- `ProgressRing`
- `ScrollArea`
- `EmptyState`
- `MetricCard`
- `Toaster`

## Recomendaciones de uso

- Para nuevas pantallas, usar `PageShell` como envoltorio.
- Evitar colores hardcodeados; usar siempre los tokens globales.
- Para nuevas tablas, usar los componentes de `Table`.
- Para métricas, usar `MetricCard` y números tabulares.
- Para estados vacíos o sin datos, usar `EmptyState`.

## Estado actual

- La base visual y el shell principal ya están unificados.
- El sistema de componentes ya está operativo.
- El tema oscuro ya está integrado.
- Quedan iteraciones finas sobre algunas pantallas secundarias para llevar todo al mismo nivel de pulido.
