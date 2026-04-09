export type GlossaryCategory =
  | "evaluacion"
  | "vocabulario"
  | "memoria"
  | "modelado"
  | "metodologia"
  | "feedback"
  | "general"

export interface GlossaryLink {
  label: string
  url: string
}

export interface GlossaryEntry {
  /** Acronym or short label as it appears in the UI */
  term: string
  /** Long expansion (English usually, since acronyms are English) */
  expansion: string
  /** One-line description in Spanish, shown in list view */
  shortDescription: string
  /** 2–4 paragraph deep explanation in Spanish for detail view */
  longDescription: string
  /** Category for grouping */
  category: GlossaryCategory
  /** Where this term is used inside the platform */
  usedIn: string[]
  /** Curated external resources to dive deeper */
  externalLinks: GlossaryLink[]
  /** Other glossary terms cross-referenced */
  related?: string[]
}

export const GLOSSARY_CATEGORIES: Record<GlossaryCategory, string> = {
  evaluacion: "Evaluación",
  vocabulario: "Vocabulario",
  memoria: "Memoria y repaso",
  modelado: "Modelado del aprendizaje",
  metodologia: "Metodología pedagógica",
  feedback: "Retroalimentación",
  general: "General",
}

export const GLOSSARY: GlossaryEntry[] = [
  // ─── Metodología ──────────────────────────────────────────────
  {
    term: "CEFR",
    expansion: "Common European Framework of Reference for Languages",
    shortDescription:
      "Marco europeo que define seis niveles de dominio de un idioma: A1, A2, B1, B2, C1 y C2.",
    longDescription:
      "El Marco Común Europeo de Referencia para las Lenguas (MCER, en español; CEFR en inglés) es un estándar internacional publicado por el Consejo de Europa en 2001 y actualizado en su Companion Volume de 2020. Define seis niveles ordenados —A1 (acceso), A2 (plataforma), B1 (umbral), B2 (avanzado), C1 (dominio operativo eficaz) y C2 (maestría)— a partir de descriptores funcionales del tipo \"puede entender\" o \"puede producir\".\n\nEn esta plataforma usamos CEFR como columna vertebral: el diagnóstico inicial coloca al estudiante en un nivel, las tareas TBLT y los ítems de vocabulario se etiquetan por nivel, y la retroalimentación GEF se calibra distinto para cada banda. La actualización de 2020 también introdujo descriptores de mediación (resumir, parafrasear, explicar) que son particularmente útiles para inglés técnico.",
    category: "metodologia",
    usedIn: ["Diagnóstico", "Vocabulario", "Tareas TBLT", "Pruebas finales"],
    externalLinks: [
      {
        label: "CEFR Companion Volume 2020 (PDF, Council of Europe)",
        url: "https://rm.coe.int/common-european-framework-of-reference-for-languages-learning-teaching/16809ea0d4",
      },
      {
        label: "Resumen oficial del Consejo de Europa",
        url: "https://www.coe.int/en/web/common-european-framework-reference-languages",
      },
    ],
    related: ["ESP", "TBLT"],
  },
  {
    term: "TBLT",
    expansion: "Task-Based Language Teaching",
    shortDescription:
      "Enseñanza basada en tareas auténticas: el estudiante aprende haciendo trabajo real, no ejercicios abstractos.",
    longDescription:
      "Task-Based Language Teaching (Ellis 2003, Long 2015) propone que el idioma se adquiere mejor cuando los estudiantes resuelven tareas auténticas que requieren comunicación real, en lugar de practicar formas gramaticales aisladas. Cada tarea tiene tres fases: pre-task (contexto y vocabulario clave), during-task (ejecución de la tarea real) y post-task (foco lingüístico explícito y retroalimentación).\n\nEn nuestro motor TBLT trabajamos seis tipos de tareas auténticas de ingeniería: leer mensajes de error, interpretar documentación de API, escribir mensajes de commit, redactar descripciones de pull request, hacer code review y producir reportes técnicos. La elección viene del análisis de necesidades de Long: las tareas se derivan observando lo que los ingenieros realmente hacen en inglés, no de un currículo abstracto.",
    category: "metodologia",
    usedIn: ["Tareas TBLT", "Pruebas finales"],
    externalLinks: [
      {
        label: "Ellis (2003) — Task-Based Language Learning and Teaching (Oxford)",
        url: "https://global.oup.com/academic/product/task-based-language-learning-and-teaching-9780194421591",
      },
      {
        label: "Long (2015) — SLA and Task-Based Language Teaching (Wiley)",
        url: "https://www.wiley.com/en-us/Second+Language+Acquisition+and+Task+Based+Language+Teaching-p-9780470658932",
      },
      {
        label: "Bhandari et al. (2025) — Tech-mediated TBLT systematic review",
        url: "https://www.tandfonline.com/doi/full/10.1080/2331186X.2025.2560051",
      },
    ],
    related: ["CEFR", "ESP", "GEF"],
  },
  {
    term: "ESP",
    expansion: "English for Specific Purposes",
    shortDescription:
      "Inglés enfocado en una profesión o disciplina concreta, como ingeniería de software.",
    longDescription:
      "English for Specific Purposes (Hutchinson y Waters 1987, Dudley-Evans y St John 1998) parte de la idea de que el inglés general no sirve a profesionales que necesitan resolver problemas reales en su disciplina. ESP se construye sobre un análisis de necesidades que identifica tres ejes: necesidades objetivo (qué tiene que hacer el estudiante en su trabajo), carencias (qué le falta hoy) y deseos (qué quiere aprender).\n\nEsta plataforma es ESP puro: cada decisión está optimizada para ingenieros de software hispanohablantes que necesitan leer documentación, entender stack traces, escribir commits y participar en revisiones de código en inglés. No enseñamos a pedir un café en Londres, enseñamos a explicarle a tu on-call por qué falló el deploy.",
    category: "metodologia",
    usedIn: ["Diagnóstico", "Tareas TBLT", "Vocabulario"],
    externalLinks: [
      {
        label: "Hutchinson & Waters (1987) — ESP: A Learning-Centred Approach",
        url: "https://www.cambridge.org/core/books/english-for-specific-purposes/3F8F7C19F2EB6E8C5B5DB95FC5C7E6E0",
      },
      {
        label: "Dudley-Evans & St John (1998) — Developments in ESP",
        url: "https://www.cambridge.org/core/books/developments-in-english-for-specific-purposes/F8B5D2D5B26FBD52DC1F6D2A26D9DBD3",
      },
    ],
    related: ["CEFR", "TBLT"],
  },

  // ─── Vocabulario ──────────────────────────────────────────────
  {
    term: "GSL",
    expansion: "General Service List",
    shortDescription:
      "Lista de las ~2,000 palabras más frecuentes del inglés general.",
    longDescription:
      "El General Service List, publicado originalmente por Michael West en 1953 y actualizado por Browne, Culligan y Phillips en 2013, contiene las aproximadamente 2,284 familias de palabras más útiles del inglés general. Estas palabras cubren cerca del 80–90% del texto cotidiano y forman la base sobre la que se construye cualquier vocabulario más especializado.\n\nEn nuestra arquitectura por capas, GSL es el primer nivel del modelo i+1 de Krashen: cualquier estudiante debe dominar GSL antes de avanzar a vocabulario académico (AWL), de ingeniería (EEWL) o específico de ciencias de la computación (CSAWL). El profiler de texto verifica que el estudiante conoce al menos el 95% del vocabulario de un texto antes de considerarlo apto para aprender de él (Nation 2013).",
    category: "vocabulario",
    usedIn: ["Navegador de vocabulario", "Perfilador", "Repaso FSRS"],
    externalLinks: [
      {
        label: "New General Service List (Browne, Culligan & Phillips 2013)",
        url: "http://www.newgeneralservicelist.org/",
      },
      {
        label: "Nation (2013) — Learning Vocabulary in Another Language",
        url: "https://www.cambridge.org/core/books/learning-vocabulary-in-another-language/E04BCBE5C9D3F08C91A9A7B7F7C7F1C9",
      },
    ],
    related: ["AWL", "EEWL", "CSAWL"],
  },
  {
    term: "AWL",
    expansion: "Academic Word List",
    shortDescription:
      "570 familias de palabras académicas frecuentes en cualquier disciplina universitaria.",
    longDescription:
      "Coxhead (2000) compiló el Academic Word List a partir de un corpus de 3.5 millones de palabras de textos académicos en cuatro grandes áreas: artes, comercio, derecho y ciencia. El resultado fueron 570 familias de palabras (no incluidas en el GSL) que aparecen recurrentemente en escritura académica universitaria, organizadas en 10 sublistas por frecuencia.\n\nEjemplos: analyze, approach, concept, function, identify, methodology, significant. Esta lista cubre alrededor del 10% del vocabulario en textos académicos. En nuestra plataforma, AWL es la segunda capa después de GSL: una vez que un estudiante de ingeniería domina las palabras generales más frecuentes, AWL es el siguiente paso natural antes de entrar al vocabulario técnico especializado.",
    category: "vocabulario",
    usedIn: ["Navegador de vocabulario", "Perfilador", "Repaso FSRS"],
    externalLinks: [
      {
        label: "Coxhead (2000) — A New Academic Word List (TESOL Quarterly)",
        url: "https://onlinelibrary.wiley.com/doi/10.2307/3587951",
      },
      {
        label: "AWL completa con sublistas (Victoria University)",
        url: "https://www.wgtn.ac.nz/lals/resources/academicwordlist",
      },
    ],
    related: ["GSL", "EEWL", "CSAWL"],
  },
  {
    term: "EEWL",
    expansion: "Engineering English Word List",
    shortDescription:
      "Vocabulario académico específico de textos universitarios de ingeniería.",
    longDescription:
      "Hsu (2014) construyó el Engineering English Word List a partir de un corpus de 4.57 millones de palabras de 100 libros de texto de ingeniería. Después de excluir las palabras del GSL y del AWL, identificó las palabras más frecuentes y útiles para estudiantes de ingeniería. El conjunto GSL + AWL + EEWL alcanza el umbral del 95% de cobertura léxica que Nation considera necesario para aprender de manera efectiva a partir de un texto.\n\nEjemplos: parameter, signal, voltage, equation, calibration, tolerance. En nuestra plataforma EEWL es la tercera capa, justo antes del CSAWL. Es lo que separa a un estudiante que entiende un manual de física de uno que entiende un manual de ingeniería sin recurrir a un diccionario constantemente.",
    category: "vocabulario",
    usedIn: ["Navegador de vocabulario", "Perfilador"],
    externalLinks: [
      {
        label: "Hsu (2014) — Measuring engineering vocabulary load (ESP Journal)",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0889490613000598",
      },
    ],
    related: ["GSL", "AWL", "CSAWL"],
  },
  {
    term: "CSAWL",
    expansion: "Computer Science Academic Word List",
    shortDescription:
      "Vocabulario académico específico de ciencias de la computación e ingeniería de software.",
    longDescription:
      "Susanto y Fazlinda (2023) extendieron la metodología de Coxhead a un corpus específico de ciencias de la computación, identificando palabras frecuentes que no aparecen en GSL ni en AWL ni en EEWL pero que son fundamentales para leer literatura técnica de software, papers de algoritmos y documentación de sistemas distribuidos.\n\nEjemplos: algorithm, asynchronous, buffer, compile, latency, recursion, throughput. En nuestra plataforma CSAWL es la cuarta y última capa de vocabulario. Junto con GSL+AWL+EEWL forma la pirámide léxica completa que un ingeniero de software hispanohablante necesita para operar profesionalmente en inglés.",
    category: "vocabulario",
    usedIn: ["Navegador de vocabulario", "Perfilador"],
    externalLinks: [
      {
        label: "Susanto & Fazlinda (2023) — A New Computer Science Academic Word List",
        url: "https://www.researchgate.net/publication/375423247_A_New_Computer_Science_Academic_Word_List",
      },
    ],
    related: ["GSL", "AWL", "EEWL"],
  },

  // ─── Memoria y repaso ─────────────────────────────────────────
  {
    term: "FSRS",
    expansion: "Free Spaced Repetition Scheduler",
    shortDescription:
      "Algoritmo moderno de repetición espaciada que predice cuándo vas a olvidar una tarjeta y la programa antes.",
    longDescription:
      "FSRS (Ye 2022, 2023) es un algoritmo de repetición espaciada de última generación que reemplaza a SM-2, el algoritmo clásico de Anki. Modela la memoria humana con tres parámetros por tarjeta: estabilidad (cuánto durará el recuerdo), dificultad (qué tan complicada es esa tarjeta para ese estudiante) y recuperabilidad (probabilidad de recordarla en este momento).\n\nDespués de cada repaso, FSRS actualiza la estabilidad y la dificultad usando una optimización por descenso de gradiente entrenada sobre millones de revisiones reales. El meta-análisis de Kim y Webb (2022) reporta un tamaño de efecto d = 0.56 a favor de la práctica espaciada sobre la práctica masiva en aprendizaje de L2. En nuestra plataforma usamos dos niveles de retención objetivo: 0.95 para vocabulario técnico crítico (intervalos cortos) y 0.90 para vocabulario general (intervalos largos).",
    category: "memoria",
    usedIn: ["Sesión de repaso", "Estadísticas de repaso", "Mi deck"],
    externalLinks: [
      {
        label: "Ye (2022) — Stochastic shortest path algorithm for SRS (KDD)",
        url: "https://dl.acm.org/doi/10.1145/3534678.3539081",
      },
      {
        label: "ts-fsrs — implementación de referencia",
        url: "https://github.com/open-spaced-repetition/ts-fsrs",
      },
      {
        label: "Kim & Webb (2022) — Spaced practice meta-analysis (Language Learning)",
        url: "https://onlinelibrary.wiley.com/doi/10.1111/lang.12479",
      },
    ],
    related: ["SRS", "BKT"],
  },
  {
    term: "SRS",
    expansion: "Spaced Repetition System",
    shortDescription:
      "Sistema que programa repasos justo antes de que olvides, maximizando retención con mínimo esfuerzo.",
    longDescription:
      "Un sistema de repetición espaciada explota la curva del olvido descrita por Hermann Ebbinghaus en 1885: la información se olvida exponencialmente a menos que la repases en el momento adecuado. El SRS programa cada repaso justo antes del olvido predicho, lo que produce intervalos crecientes (1 día, 3 días, 7 días, 14 días, 30 días, etc.).\n\nLos SRS modernos como FSRS (que usamos aquí), SM-2 (Anki clásico) o SuperMemo están entre los algoritmos de aprendizaje más estudiados empíricamente. Una sesión diaria de 10–20 minutos puede mantener miles de tarjetas activas con tasas de retención superiores al 90%.",
    category: "memoria",
    usedIn: ["Sesión de repaso", "Mi deck"],
    externalLinks: [
      {
        label: "Spaced Repetition (Wikipedia)",
        url: "https://en.wikipedia.org/wiki/Spaced_repetition",
      },
      {
        label: "Augmenting Long-term Memory (Michael Nielsen)",
        url: "http://augmentingcognition.com/ltm.html",
      },
    ],
    related: ["FSRS"],
  },

  // ─── Modelado del aprendizaje ─────────────────────────────────
  {
    term: "IRT",
    expansion: "Item Response Theory",
    shortDescription:
      "Teoría psicométrica que estima la dificultad de cada ítem y la habilidad del estudiante en una misma escala.",
    longDescription:
      "Item Response Theory (Lord 1980) es el marco psicométrico moderno para diseñar y calibrar tests. A diferencia de la puntuación clásica (donde solo cuentas aciertos), IRT modela la probabilidad de que un estudiante con habilidad theta responda correctamente un ítem con dificultad b mediante una función logística.\n\nEsto permite cosas que el puntaje clásico no puede: tests adaptativos que escogen el siguiente ítem según la habilidad estimada, comparación de estudiantes que no tomaron exactamente el mismo test, y métricas de cuán informativo es cada ítem en cada nivel de habilidad. En esta plataforma usamos el modelo Rasch (1-parameter logistic IRT) para calibrar los ítems del diagnóstico y producir un theta por usuario que reemplaza al placement fijo.",
    category: "modelado",
    usedIn: ["Diagnóstico", "Calibración (admin)", "Mi dominio"],
    externalLinks: [
      {
        label: "Lord (1980) — Applications of IRT to Practical Testing Problems",
        url: "https://www.routledge.com/Applications-of-Item-Response-Theory-To-Practical-Testing-Problems/Lord/p/book/9780898590067",
      },
      {
        label: "Sharpnack et al. (2024) — AutoIRT (arXiv)",
        url: "https://arxiv.org/abs/2409.08823",
      },
      {
        label: "Item Response Theory (Wikipedia)",
        url: "https://en.wikipedia.org/wiki/Item_response_theory",
      },
    ],
    related: ["Rasch", "BKT"],
  },
  {
    term: "Rasch",
    expansion: "Rasch model (1-Parameter Logistic IRT)",
    shortDescription:
      "Modelo IRT más simple: solo modela dificultad del ítem y habilidad del estudiante, sin discriminación.",
    longDescription:
      "Georg Rasch propuso en 1960 un modelo logístico de un solo parámetro: la probabilidad de respuesta correcta depende solo de la diferencia entre la habilidad del estudiante (theta) y la dificultad del ítem (b). La fórmula es P(correcto) = 1 / (1 + e^-(theta - b)).\n\nA pesar de su simplicidad, el modelo Rasch tiene propiedades matemáticas hermosas: la habilidad y la dificultad están en la misma escala (logits), permitiendo comparaciones directas, y los parámetros del ítem son independientes de qué estudiantes lo tomaron (objetividad específica). Es lo que usamos en el diagnóstico: cada respuesta actualiza el theta del usuario via EAP (expected a posteriori) y, periódicamente, recalibra los b de cada ítem.",
    category: "modelado",
    usedIn: ["Diagnóstico", "Calibración"],
    externalLinks: [
      {
        label: "Rasch model (Wikipedia)",
        url: "https://en.wikipedia.org/wiki/Rasch_model",
      },
    ],
    related: ["IRT"],
  },
  {
    term: "BKT",
    expansion: "Bayesian Knowledge Tracing",
    shortDescription:
      "Modelo bayesiano que estima la probabilidad de que hayas aprendido cada habilidad concreta.",
    longDescription:
      "Bayesian Knowledge Tracing (Corbett y Anderson 1995) modela el aprendizaje como un proceso oculto en el que cada estudiante tiene una probabilidad P(L) de haber aprendido un componente de conocimiento (KC). Cada vez que el estudiante responde un ítem etiquetado con ese KC, BKT actualiza P(L) usando la regla de Bayes con cuatro parámetros: P(L0) inicial, P(T) transición (aprender), P(G) guess (acertar sin saber) y P(S) slip (fallar sabiendo).\n\nCuando P(L) cruza el umbral de 0.95, el KC se considera dominado. En esta plataforma usamos BKT con un mapeo polimórfico: cada ítem del diagnóstico, cada tarea TBLT y cada palabra del vocabulario está etiquetada con uno o más KCs. Después de cada respuesta, MasteryService dispara la actualización BKT y guarda el log inmutable. El radar de \"Mi dominio\" visualiza el P(L) actual por cada KC.",
    category: "modelado",
    usedIn: ["Mi dominio", "Cohort analytics (admin)"],
    externalLinks: [
      {
        label: "Corbett & Anderson (1995) — Knowledge Tracing (User Modeling)",
        url: "https://link.springer.com/article/10.1007/BF01099821",
      },
      {
        label: "Piech et al. (2015) — Deep Knowledge Tracing (NeurIPS)",
        url: "https://arxiv.org/abs/1506.05908",
      },
    ],
    related: ["KC", "IRT"],
  },
  {
    term: "KC",
    expansion: "Knowledge Component",
    shortDescription:
      "Habilidad atómica medible (ej. 'voz pasiva', 'lectura de stack traces', 'modal verbs').",
    longDescription:
      "Un Knowledge Component es la unidad mínima de habilidad o conocimiento que un sistema de tutorización inteligente puede modelar y rastrear. La idea viene de John Anderson y la cognitive tutor tradition de Carnegie Mellon. Un buen KC es atómico (no se descompone más sin perder utilidad), medible (puedes saber con certeza si el estudiante lo dominó) y combinable (varios KCs explican la performance en un ítem complejo).\n\nEn esta plataforma cada item del catálogo (DiagnosticItem, Task, VocabularyItem) se mapea a uno o más KCs vía ItemKcMapping. El BKT actualiza P(L) por cada KC tocado. Los KCs se generaron extrayéndolos con un LLM a partir del contenido de los items y luego se revisaron a mano. Ejemplos en uso: passive_voice, error_messages_reading, rest_api_documentation, commit_messages_writing.",
    category: "modelado",
    usedIn: ["Mi dominio", "Detalle de KC"],
    externalLinks: [
      {
        label: "Koedinger et al. — KLI Framework",
        url: "https://onlinelibrary.wiley.com/doi/10.1111/j.1551-6709.2012.01245.x",
      },
    ],
    related: ["BKT"],
  },

  // ─── Feedback ─────────────────────────────────────────────────
  {
    term: "GEF",
    expansion: "Grammatical Error Feedback",
    shortDescription:
      "Retroalimentación que explica POR QUÉ algo está mal, no solo lo corrige.",
    longDescription:
      "Grammatical Error Feedback (Banno et al. 2024) es la propuesta de evaluar la retroalimentación de modelos de lenguaje no solo por la corrección que hacen (\"GEC: Grammatical Error Correction\") sino por la explicación que dan: ¿enseña la regla?, ¿menciona el patrón general?, ¿puede el estudiante extrapolar a otros casos?\n\nEn esta plataforma, todo el feedback de tareas TBLT y de revisión de vocabulario es GEF: el LLM no solo te dice \"escribiste 'have went' en lugar de 'have gone'\", sino que te explica que \"el participio pasado de 'go' es 'gone', no 'went' que es el simple past\". Mohamed et al. (2025) demostraron en un estudio con 176 estudiantes que el feedback calibrado por nivel CEFR tiene mayor efecto en estudiantes A2 cuando es focalizado (un error a la vez), mientras que B1+ se benefician más de retroalimentación holística.",
    category: "feedback",
    usedIn: ["Tareas TBLT", "Repaso con producción", "Pruebas finales"],
    externalLinks: [
      {
        label: "Banno et al. (2024) — Grammatical Error Feedback (arXiv)",
        url: "https://arxiv.org/abs/2408.09565",
      },
      {
        label: "Mohamed et al. (2025) — ChatGPT impact on ESP writing",
        url: "https://www.researchgate.net/publication/388123456",
      },
    ],
    related: ["CEFR", "TBLT"],
  },

  // ─── Evaluación ───────────────────────────────────────────────
  {
    term: "EAP",
    expansion: "Expected A Posteriori",
    shortDescription:
      "Método bayesiano para estimar la habilidad theta de un estudiante a partir de sus respuestas.",
    longDescription:
      "EAP es una técnica de estimación bayesiana usada en psicometría IRT. En lugar de buscar el máximo de la verosimilitud (que puede ser inestable con pocos ítems), calcula la media de la distribución posterior de theta dado un prior normal y los datos observados. Numéricamente se implementa con cuadratura: se evalúa la posterior en 41 puntos en el intervalo [-4, 4] y se aproxima la media con suma ponderada.\n\nEn esta plataforma EAP es lo que actualiza el theta del usuario después de cada diagnóstico: tomamos sus respuestas binarias, los parámetros calibrados de los items, y calculamos theta + error estándar. El error estándar es importante porque indica qué tan confiable es la estimación: con pocos ítems el SE es alto, con muchos baja.",
    category: "evaluacion",
    usedIn: ["Diagnóstico", "Calibración (admin)"],
    externalLinks: [
      {
        label: "Bock & Mislevy (1982) — Adaptive EAP estimation",
        url: "https://journals.sagepub.com/doi/10.1177/014662168200600405",
      },
    ],
    related: ["IRT", "Rasch"],
  },
  {
    term: "Cohen's d",
    expansion: "Cohen's d effect size",
    shortDescription:
      "Tamaño del efecto estandarizado: cuántas desviaciones estándar separan a dos grupos.",
    longDescription:
      "Cohen's d es la métrica más usada para reportar tamaño del efecto en estudios cuantitativos. Se calcula como la diferencia de medias entre dos grupos dividida por la desviación estándar combinada (pooled SD). Las convenciones de Cohen son: d = 0.2 efecto pequeño, d = 0.5 efecto mediano, d = 0.8+ efecto grande.\n\nEn esta plataforma calculamos Cohen's d para los pilotos: comparamos el desempeño pre-intervención vs post-intervención de un cohorte de estudiantes en vocabulario, comprensión y producción. El meta-análisis de Kim y Webb (2022) que respalda nuestro motor FSRS reporta d = 0.56 a favor de la repetición espaciada sobre la práctica masiva. Si nuestro piloto produce d > 0.5 ya tenemos evidencia publicable.",
    category: "evaluacion",
    usedIn: ["Estudios piloto", "Resultados de cohorte"],
    externalLinks: [
      {
        label: "Cohen's d (Wikipedia)",
        url: "https://en.wikipedia.org/wiki/Effect_size#Cohen's_d",
      },
    ],
    related: ["IRT"],
  },
  {
    term: "MCQ",
    expansion: "Multiple Choice Question",
    shortDescription:
      "Pregunta de selección múltiple con una respuesta correcta entre varias opciones.",
    longDescription:
      "Las preguntas de opción múltiple son el formato más común en evaluación porque son fáciles de calificar automáticamente y permiten cobertura amplia en poco tiempo. En esta plataforma usamos MCQs en dos lugares: el diagnóstico inicial (15 items, 4 opciones cada uno) y la fase de comprensión de las pruebas finales (3 MCQs después de leer un spec).\n\nEl trade-off del MCQ es que mide reconocimiento más que producción. Por eso lo combinamos con tareas TBLT abiertas (donde el estudiante escribe inglés real) y producción libre (donde el LLM evalúa el output). Bien diseñados, los MCQs pueden medir comprensión profunda; mal diseñados, solo memoria superficial.",
    category: "evaluacion",
    usedIn: ["Diagnóstico", "Pruebas finales"],
    externalLinks: [
      {
        label: "Best practices for MCQ design (Vanderbilt)",
        url: "https://cft.vanderbilt.edu/guides-sub-pages/writing-good-multiple-choice-test-questions/",
      },
    ],
    related: ["CEFR"],
  },
  {
    term: "FISI",
    expansion: "Facultad de Ingeniería de Sistemas e Informática (UNMSM)",
    shortDescription:
      "Facultad de la Universidad Nacional Mayor de San Marcos donde se desarrolla y pilotará la plataforma.",
    longDescription:
      "La Facultad de Ingeniería de Sistemas e Informática (FISI) es una de las facultades de ingeniería de la Universidad Nacional Mayor de San Marcos en Lima, Perú. Forma ingenieros de sistemas y de software desde 1969 y es una de las escuelas de computación más antiguas del país. Esta plataforma se desarrolla como tesis bajo la asesoría del profesor Herminio Paucar y será pilotada con estudiantes de FISI.",
    category: "general",
    usedIn: ["Pilotos", "Documentación del proyecto"],
    externalLinks: [
      {
        label: "FISI UNMSM (sitio oficial)",
        url: "https://sistemas.unmsm.edu.pe/",
      },
    ],
  },
  {
    term: "UNMSM",
    expansion: "Universidad Nacional Mayor de San Marcos",
    shortDescription:
      "Universidad pública peruana, fundada en 1551, la más antigua de América.",
    longDescription:
      "La Universidad Nacional Mayor de San Marcos, fundada en Lima el 12 de mayo de 1551, es la universidad más antigua del continente americano en funcionamiento continuo. Es una universidad pública y en ella se desarrolla esta plataforma de inglés técnico como proyecto académico de la Facultad de Ingeniería de Sistemas e Informática (FISI).",
    category: "general",
    usedIn: ["Documentación del proyecto"],
    externalLinks: [
      {
        label: "UNMSM (sitio oficial)",
        url: "https://www.unmsm.edu.pe/",
      },
    ],
    related: ["FISI"],
  },
]

export function findGlossaryEntry(term: string): GlossaryEntry | undefined {
  const normalized = term.trim().toLowerCase()
  return GLOSSARY.find((entry) => entry.term.toLowerCase() === normalized)
}

export function searchGlossary(query: string): GlossaryEntry[] {
  if (!query.trim()) return GLOSSARY
  const q = query.trim().toLowerCase()
  return GLOSSARY.filter(
    (entry) =>
      entry.term.toLowerCase().includes(q) ||
      entry.expansion.toLowerCase().includes(q) ||
      entry.shortDescription.toLowerCase().includes(q),
  )
}
