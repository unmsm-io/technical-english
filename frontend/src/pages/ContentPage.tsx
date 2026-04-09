import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Code2,
  FileText,
  GitCommitHorizontal,
  GitPullRequest,
  Layers,
  ListChecks,
  MessageSquareWarning,
  Repeat,
  Target,
} from "lucide-react"
import type { ComponentType } from "react"
import { Link } from "react-router"
import { PageShell } from "../components/layout/page-shell"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Separator } from "../components/ui/separator"

type IconType = ComponentType<{ className?: string }>

interface ModuleLink {
  label: string
  to: string
}

interface ExternalResource {
  label: string
  url: string
  source: string
}

interface Module {
  id: string
  order: number
  icon: IconType
  title: string
  description: string
  cefrRange: string
  outcomes: string[]
  platformLinks: ModuleLink[]
  externalResources: ExternalResource[]
  relatedTerms: string[]
}

const modules: Module[] = [
  {
    id: "foundations",
    order: 1,
    icon: Layers,
    title: "Fundamentos y diagnóstico",
    description:
      "Conoce la plataforma, mide tu nivel CEFR inicial y descubre cómo se organiza el vocabulario técnico por capas.",
    cefrRange: "A1 – C1",
    outcomes: [
      "Tomas el test diagnóstico calibrado con IRT y obtienes un nivel inicial.",
      "Entiendes cómo se organiza el vocabulario en GSL, AWL, EEWL y CSAWL.",
      "Aprendes a leer el perfilador de texto y por qué importa la cobertura del 95%.",
    ],
    platformLinks: [
      { label: "Tomar diagnóstico", to: "/diagnostic/start" },
      { label: "Explorar vocabulario", to: "/vocabulary" },
      { label: "Perfilar un texto", to: "/profiler" },
    ],
    externalResources: [
      {
        label: "CEFR Companion Volume 2020",
        source: "Council of Europe",
        url: "https://rm.coe.int/common-european-framework-of-reference-for-languages-learning-teaching/16809ea0d4",
      },
      {
        label: "Nation (2013) — Learning Vocabulary in Another Language",
        source: "Cambridge",
        url: "https://www.cambridge.org/core/books/learning-vocabulary-in-another-language/E04BCBE5C9D3F08C91A9A7B7F7C7F1C9",
      },
    ],
    relatedTerms: ["CEFR", "GSL", "AWL", "EEWL", "CSAWL"],
  },
  {
    id: "error-messages",
    order: 2,
    icon: MessageSquareWarning,
    title: "Leer mensajes de error",
    description:
      "Entiende stack traces, excepciones y logs en inglés para diagnosticar incidentes en producción.",
    cefrRange: "A2 – B2",
    outcomes: [
      "Lees un NullPointerException y lo explicas en 2-3 frases en inglés claro.",
      "Identificas el patrón present simple para descripciones técnicas.",
      "Usas marcadores de discurso (because, first, before) para ordenar causa y efecto.",
    ],
    platformLinks: [
      { label: "Tareas de tipo ERROR_MESSAGE", to: "/tasks?type=ERROR_MESSAGE" },
      { label: "Vocabulario técnico CSAWL", to: "/vocabulary?layer=CSAWL" },
    ],
    externalResources: [
      {
        label: "Java — Understanding Exceptions",
        source: "Oracle",
        url: "https://docs.oracle.com/javase/tutorial/essential/exceptions/",
      },
      {
        label: "Python — Errors and Exceptions",
        source: "python.org",
        url: "https://docs.python.org/3/tutorial/errors.html",
      },
      {
        label: "Debugging tips for Node.js",
        source: "Node.js docs",
        url: "https://nodejs.org/en/learn/getting-started/debugging",
      },
    ],
    relatedTerms: ["TBLT", "GEF"],
  },
  {
    id: "api-documentation",
    order: 3,
    icon: FileText,
    title: "Documentación de APIs",
    description:
      "Interpreta specs REST, OpenAPI y GraphQL y escribe resúmenes claros en inglés técnico.",
    cefrRange: "B1 – C1",
    outcomes: [
      "Lees un endpoint REST y explicas su contrato en 3 frases.",
      "Diferencias entre request body, query params y headers en inglés.",
      "Escribes descripciones claras para un endpoint nuevo siguiendo convenciones de OpenAPI.",
    ],
    platformLinks: [
      { label: "Tareas de tipo API_DOC", to: "/tasks?type=API_DOC" },
      { label: "Vocabulario CS académico", to: "/vocabulary?layer=CSAWL" },
    ],
    externalResources: [
      {
        label: "OpenAPI Specification",
        source: "openapis.org",
        url: "https://spec.openapis.org/oas/latest.html",
      },
      {
        label: "REST API Tutorial",
        source: "restfulapi.net",
        url: "https://restfulapi.net/",
      },
      {
        label: "GraphQL Introduction",
        source: "graphql.org",
        url: "https://graphql.org/learn/",
      },
    ],
    relatedTerms: ["TBLT", "ESP"],
  },
  {
    id: "commit-messages",
    order: 4,
    icon: GitCommitHorizontal,
    title: "Escribir mensajes de commit",
    description:
      "Redacta commits en inglés siguiendo Conventional Commits: imperativo, claros y accionables.",
    cefrRange: "A2 – B2",
    outcomes: [
      "Usas imperativo presente: 'Add user service', no 'Added' ni 'Adding'.",
      "Estructuras tipo + scope + descripción: 'feat(auth): add password reset flow'.",
      "Distingues entre fix, feat, refactor, chore, docs y sabes cuándo usar cada uno.",
    ],
    platformLinks: [
      { label: "Tareas de tipo COMMIT_MSG", to: "/tasks?type=COMMIT_MSG" },
    ],
    externalResources: [
      {
        label: "Conventional Commits v1.0.0",
        source: "conventionalcommits.org",
        url: "https://www.conventionalcommits.org/en/v1.0.0/",
      },
      {
        label: "How to Write a Git Commit Message",
        source: "cbea.ms (Chris Beams)",
        url: "https://cbea.ms/git-commit/",
      },
    ],
    relatedTerms: ["TBLT"],
  },
  {
    id: "pull-requests",
    order: 5,
    icon: GitPullRequest,
    title: "Descripciones de Pull Request",
    description:
      "Escribe PRs que tu equipo entienda a la primera: contexto, cambios, testing y breaking changes.",
    cefrRange: "B1 – C1",
    outcomes: [
      "Estructuras un PR con secciones Summary / Changes / Testing / Screenshots.",
      "Explicas breaking changes sin ambigüedad en inglés.",
      "Usas pasiva apropiadamente para descripciones neutrales de cambios.",
    ],
    platformLinks: [
      { label: "Tareas de tipo PR_DESC", to: "/tasks?type=PR_DESC" },
    ],
    externalResources: [
      {
        label: "GitHub — About pull requests",
        source: "GitHub Docs",
        url: "https://docs.github.com/en/pull-requests",
      },
      {
        label: "The Anatomy of a Perfect Pull Request",
        source: "hugooodias/the-art-of-pull-request",
        url: "https://github.com/hugooodias/the-art-of-pull-request",
      },
    ],
    relatedTerms: ["TBLT", "GEF"],
  },
  {
    id: "code-review",
    order: 6,
    icon: Code2,
    title: "Revisión de código (Code Review)",
    description:
      "Da feedback técnico claro y respetuoso en inglés: pragmática, modal verbs y tono profesional.",
    cefrRange: "B1 – C1",
    outcomes: [
      "Usas 'could' / 'might' / 'consider' para suavizar sugerencias sin perder claridad.",
      "Distingues entre nit, suggestion, question y blocker en un review.",
      "Das feedback positivo sin sonar falso: 'nice catch', 'clever use of X'.",
    ],
    platformLinks: [
      { label: "Tareas de tipo CODE_REVIEW", to: "/tasks?type=CODE_REVIEW" },
    ],
    externalResources: [
      {
        label: "Google — Engineering Practices: Code Review",
        source: "Google Eng",
        url: "https://google.github.io/eng-practices/review/",
      },
      {
        label: "Conventional Comments",
        source: "conventionalcomments.org",
        url: "https://conventionalcomments.org/",
      },
    ],
    relatedTerms: ["TBLT", "GEF", "CEFR"],
  },
  {
    id: "tech-reports",
    order: 7,
    icon: FileText,
    title: "Reportes técnicos y RFCs",
    description:
      "Produce documentos largos: postmortems, ADRs, design docs y RFCs en inglés profesional.",
    cefrRange: "B2 – C2",
    outcomes: [
      "Estructuras un postmortem con Impact, Root Cause, Timeline, Action Items.",
      "Escribes un ADR siguiendo el template Status / Context / Decision / Consequences.",
      "Usas voz activa para decisiones y voz pasiva para descripciones neutrales.",
    ],
    platformLinks: [
      { label: "Tareas de tipo TECH_REPORT", to: "/tasks?type=TECH_REPORT" },
      { label: "Pruebas finales por tipo", to: "/summative" },
    ],
    externalResources: [
      {
        label: "ADR GitHub Organization",
        source: "github.com/adr",
        url: "https://adr.github.io/",
      },
      {
        label: "Google SRE — Postmortem Culture",
        source: "Google SRE Book",
        url: "https://sre.google/sre-book/postmortem-culture/",
      },
      {
        label: "Stripe — Writing an Engineering Design Doc",
        source: "stripe.com/blog",
        url: "https://stripe.com/blog/writing-good-design-documents",
      },
    ],
    relatedTerms: ["TBLT", "CEFR", "ESP"],
  },
  {
    id: "spaced-repetition",
    order: 8,
    icon: Repeat,
    title: "Repaso espaciado y retención",
    description:
      "Usa FSRS para mantener vivo el vocabulario técnico a largo plazo con sesiones cortas diarias.",
    cefrRange: "Todos los niveles",
    outcomes: [
      "Entiendes por qué 10 minutos al día de repaso vale más que 2 horas semanales.",
      "Sabes cuándo usar AGAIN / HARD / GOOD / EASY para que el algoritmo aprenda de ti.",
      "Lees el heatmap de estabilidad para saber qué términos necesitan refuerzo.",
    ],
    platformLinks: [
      { label: "Sesión de repaso", to: "/review/session" },
      { label: "Mi deck", to: "/review/deck" },
      { label: "Estadísticas", to: "/review/stats" },
    ],
    externalResources: [
      {
        label: "Augmenting Long-term Memory",
        source: "Michael Nielsen",
        url: "http://augmentingcognition.com/ltm.html",
      },
      {
        label: "ts-fsrs — implementación de referencia",
        source: "open-spaced-repetition",
        url: "https://github.com/open-spaced-repetition/ts-fsrs",
      },
    ],
    relatedTerms: ["FSRS", "SRS"],
  },
  {
    id: "mastery-tracking",
    order: 9,
    icon: BrainCircuit,
    title: "Seguimiento de dominio (BKT)",
    description:
      "Observa cómo crece tu dominio por componente de conocimiento gracias al modelo bayesiano.",
    cefrRange: "Todos los niveles",
    outcomes: [
      "Entiendes qué es un Knowledge Component y cómo se mide el P(L).",
      "Lees el radar de dominio y sabes qué KCs necesitan más práctica.",
      "Distingues entre dominio de vocabulario y dominio de tarea compleja.",
    ],
    platformLinks: [
      { label: "Mi dominio", to: "/mastery" },
      { label: "Portafolio", to: "/portfolio" },
    ],
    externalResources: [
      {
        label: "Corbett & Anderson (1995) — Knowledge Tracing",
        source: "User Modeling",
        url: "https://link.springer.com/article/10.1007/BF01099821",
      },
      {
        label: "Deep Knowledge Tracing (Piech 2015)",
        source: "arXiv",
        url: "https://arxiv.org/abs/1506.05908",
      },
    ],
    relatedTerms: ["BKT", "KC", "IRT"],
  },
  {
    id: "final-assessment",
    order: 10,
    icon: Target,
    title: "Evaluación final (Pruebas integradas)",
    description:
      "Cierra cada módulo con una prueba integrada: leer spec, producir texto y responder comprensión.",
    cefrRange: "A2 – C1",
    outcomes: [
      "Lees un spec en inglés y demuestras comprensión.",
      "Produces 2-3 frases que capturan la idea central del spec.",
      "Respondes 3 MCQs de comprensión con justificación razonada.",
    ],
    platformLinks: [
      { label: "Ver pruebas finales", to: "/summative" },
    ],
    externalResources: [
      {
        label: "Douglas (2000) — Assessing LSP",
        source: "Cambridge",
        url: "https://www.cambridge.org/core/books/assessing-languages-for-specific-purposes/D59CDB1EF5F35BF6BE9C5D0CBAEF3C93",
      },
    ],
    relatedTerms: ["TBLT", "CEFR", "MCQ"],
  },
]

function openGlossaryWith(term: string) {
  // Dispatch to the global glossary dialog and pre-seed the search via sessionStorage hook.
  // For now just open the glossary; future enhancement: pass term directly.
  window.dispatchEvent(new Event("glossary:open"))
  // eslint-disable-next-line no-console -- debug breadcrumb
  console.info("[content] glossary hint:", term)
}

export function ContentPage() {
  return (
    <PageShell
      subtitle="Un mapa del curso de inglés técnico para ingeniería de software. Cada módulo combina tareas reales, vocabulario, repaso y evaluación."
      title="Contenido del curso"
    >
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                <BookOpen className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl tracking-tight">Cómo usar este contenido</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Esta plataforma no es un curso lineal tradicional. Cada módulo apunta a tareas,
                  vocabulario y evaluaciones concretas que ya están cargadas en el sistema. Sigue el
                  orden sugerido o salta al tipo de contenido que más te interese. Las siglas del
                  glosario (CEFR, FSRS, BKT, etc.) están siempre disponibles en{" "}
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                    ⌘/
                  </kbd>
                  .
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-0">
            <Button asChild variant="outline">
              <Link to="/diagnostic/start">
                <ListChecks className="size-4" />
                Empezar con el diagnóstico
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/tasks">
                <Code2 className="size-4" />
                Ir a tareas
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/review/session">
                <Repeat className="size-4" />
                Sesión de repaso
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/mastery">
                <BrainCircuit className="size-4" />
                Mi dominio
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Card key={module.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {String(module.order).padStart(2, "0")}
                        </span>
                        <Badge variant="outline">{module.cefrRange}</Badge>
                      </div>
                      <CardTitle className="text-lg tracking-tight">{module.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-4 pt-0">
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Lo que aprendes
                    </h4>
                    <ul className="space-y-1.5 text-sm text-foreground">
                      {module.outcomes.map((outcome) => (
                        <li key={outcome} className="flex items-start gap-2">
                          <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      En la plataforma
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {module.platformLinks.map((link) => (
                        <Button key={link.to} asChild size="sm" variant="secondary">
                          <Link to={link.to}>
                            {link.label}
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Lecturas externas recomendadas
                    </h4>
                    <ul className="space-y-1.5 text-sm">
                      {module.externalResources.map((resource) => (
                        <li key={resource.url}>
                          <a
                            className="group inline-flex items-start gap-1.5 text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
                            href={resource.url}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            <span>{resource.label}</span>
                            <ArrowUpRight
                              aria-hidden
                              className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                            />
                          </a>
                          <p className="ml-0 text-xs text-muted-foreground">{resource.source}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {module.relatedTerms.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Términos del glosario
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {module.relatedTerms.map((term) => (
                          <button
                            key={term}
                            className="rounded-md border border-border px-2 py-0.5 font-mono text-xs font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => openGlossaryWith(term)}
                            type="button"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </PageShell>
  )
}
