# Research Foundation

Scientific basis for the Technical English Learning Platform. 67 papers across 3 research streams.

## Evidence Summary

| Intervention | Effect Size | Source | N |
|---|---|---|---|
| Spaced vs massed practice | d = 0.56 | Kim & Webb 2022 | 3,411 |
| Chatbot for L2 learning | g = 0.608 | Lyu 2025 | 31 studies |
| Gamification on learning | g = 0.822 | Li et al. 2023 | 5,071 |
| Technology-enhanced L2 | d = 0.993 | Chang & Hung 2019 | 6,296 |
| AI in L2 learning | d > 0.8 | Wu et al. 2024 | meta |
| LLM hallucination reduction | >90% | Wang & Katsaggelos 2026 | - |
| FSRS vs SM-2 superiority | 99.6% | Ye benchmark 2024 | 10K users |

## Core Algorithms

### 1. FSRS-6 for Spaced Repetition
- **Paper**: Ye, J. (2022). KDD; Ye et al. (2023). IEEE TKDE
- **Why**: 21-parameter model, 99.6% superiority over SM-2 on 350M reviews
- **Library**: `ts-fsrs` (TypeScript, production-ready)
- **Key**: Power forgetting curve R = (1 + factor*t/S)^(-decay), target 90% retention
- **Spacing rule**: Optimal gap = 10-20% of retention interval (Cepeda et al. 2008)

### 2. Rasch/2PL IRT for Difficulty Calibration
- **Paper**: Lord (1980), Rasch (1960), Sharpnack et al. (2024) AutoIRT
- **Why**: Calibrate exercise difficulty to learner ability
- **Start**: Rasch (1 param per item), upgrade to 2PL with data
- **Need**: ~200+ responses per item for stable estimates

### 3. BKT for Knowledge Tracing
- **Paper**: Corbett & Anderson (1995), 3500+ citations
- **Why**: Track per-skill mastery (grammar rules, vocabulary clusters)
- **Upgrade path**: DKT (Piech 2015) when >100K interactions available

### 4. Multi-Agent LLM Verification
- **Paper**: Wang & Katsaggelos (2026). arXiv:2601.14280
- **Why**: >90% hallucination reduction in educational MCQs
- **Pipeline**: Generate -> verify solvability -> check facts -> validate reasoning
- **Guard**: 4 hallucination types: reasoning, insolvability, factual, math errors

## Design Principles (from 67 papers)

### 1. Needs-First Architecture
**Sources**: Hutchinson & Waters 1987, Dudley-Evans & St John 1998, Basturkmen 2010

Onboarding diagnostic determines: current CEFR level, target professional context, specific skill gaps. The platform adapts to the learner, not the other way around.

### 2. Task-Based Curriculum (TBLT)
**Sources**: Ellis 2003/2009, Long 2015, Bhandari et al. 2025

Authentic engineering tasks ARE the curriculum. Three-phase model:
- **Pre-task**: Show engineering context + key vocabulary
- **During-task**: Perform authentic task (parse error, write commit, review PR)
- **Post-task**: AI feedback + explicit language focus

Real-world tasks for software engineers:

| Task | CEFR Entry | Skills |
|------|------------|--------|
| Read error messages | A2 | Reading |
| Write commit messages | A2 | Writing |
| Stand-up meeting updates | A2 | Speaking |
| Read API documentation | B1 | Reading |
| Write PR descriptions | B1 | Writing |
| Code review comments | B1 | Writing, pragmatics |
| Technical reports/RFCs | B2 | Writing, argumentation |
| Technical presentations | B2 | Speaking |
| Research papers | C1 | Reading, critical thinking |

### 3. i+1 Content Calibration
**Sources**: Krashen 1985, Nation 2013, VanPatten & Cadierno 1993

- Vocabulary profiling: 95% known words + 5% new = comprehensible input
- Four-layer vocabulary model: GSL (2K) > AWL (570 families, Coxhead 2000) > EEWL (engineering, Hsu 2014) > CSAWL (CS, Susanto 2023)
- ~10-12 encounters per vocabulary item for reliable acquisition (Uchihara et al. 2019)

### 4. Input-Output Pairing
**Sources**: Bailey 2021, Nguyen & Doan 2025, Swain Output Hypothesis

Every receptive task paired with a productive task:
- Read a README -> Write a summary
- Listen to standup -> Give your own status
- Read error message -> Write the fix description

### 5. CEFR-Calibrated AI Feedback
**Sources**: Mohamed et al. 2025 (n=176, 8 weeks), Kohnke et al. 2025

- **A1**: Simple, one-error-at-a-time, focused feedback
- **A2**: Moderate complexity, highest effect size for AI feedback
- **B1-B2**: Multi-dimensional, holistic feedback
- **C1+**: Style, register, nuance feedback
- GEF (explain WHY) > GEC (just correct) -- Banno et al. 2024

### 6. Conversation-First Design
**Sources**: Plonsky & Ziegler 2016, Tyen et al. 2024, Lyu 2025

- CMC has strongest sub-effect in CALL literature
- Chatting > reading for enjoyment (p < 0.001)
- Adaptive difficulty prevents boredom (p < 0.00009)
- Default immediate feedback (better UX, similar learning gains)

### 7. FSRS-6 Spaced Repetition
**Sources**: Ye 2022/2023, Kim & Webb 2022, Cepeda et al. 2008

- Context-rich SRS: review vocabulary in sentences from tasks, not isolated words
- Personalize parameters per user after ~100 reviews
- Target 90% retention rate (adjustable)

### 8. SDT-Aligned Motivation
**Sources**: Ryan & Deci 2000, Sailer & Homner 2020, Almeida et al. 2023

- **Autonomy**: User chooses topics, scenarios, difficulty. No forced linear path
- **Competence**: Mastery-based progression, clear progress signals
- **Relatedness**: Community features, shared goals

### 9. Gamification Anti-Patterns
**Source**: Almeida et al. 2023 (87 papers, cited 209x)

DO NOT build:
- Public leaderboards without skill matching
- Mandatory competitions
- Points/badges disconnected from mastery
- Extrinsic rewards that crowd out intrinsic motivation

DO build:
- Progress tracking tied to real mastery (BKT threshold P(L) >= 0.95)
- Streak mechanics for habit formation
- Portfolio showing concrete growth over time

### 10. Four-Type Assessment
**Sources**: Douglas 2000, ASEE Portfolios, REFLECTIONS 2024

| Type | When | Format |
|------|------|--------|
| Diagnostic | Onboarding | Adaptive test: vocab size + reading + production |
| Formative | Every task | AI-scored performance (accuracy, vocab, discourse) |
| Portfolio | Monthly | Best work collection with growth visualization |
| Summative | End of module | Integrated task: read spec + write notes + present |

## Recommended Architecture

```
User answers exercise
        |
        v
+------------------+     +------------------+     +------------------+
|   IRT Layer      |     |  Knowledge       |     |  SRS Layer       |
|  (Rasch/2PL)     |---->|  Tracing (BKT)   |---->|  (FSRS-6)        |
|  Item difficulty  |     |  Skill mastery   |     |  Review schedule |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
   Exercise Pool          Learner Model            Review Queue
   (calibrated)           (per-skill P(L))         (next dates)
        |                        |                        |
        +----------+-------------+------------------------+
                   |
                   v
          Exercise Selection
          (IRT + KT + SRS combined)
                   |
                   v
          LLM Generation Pipeline
          (few-shot + multi-agent verification)
```

## Key Libraries

| Component | Library | Language |
|-----------|---------|----------|
| SRS | ts-fsrs v6 | TypeScript |
| SRS (alternative) | py-fsrs v6 | Python |
| IRT | pyirt, mirt (R) | Python/R |
| Knowledge Tracing | pyBKT | Python |
| DKT | PyTorch custom | Python |
| Vocabulary Profiling | AntWordProfiler | Desktop |

## Full Citation List (67 papers)

### SRS & Adaptive Learning (20 papers)
1. Wozniak, P.A. (1990). Optimization of learning. Master's Thesis.
2. Ye, J. (2022). A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Scheduling. KDD.
3. Ye, J. et al. (2023). Optimizing Spaced Repetition Schedule. IEEE TKDE.
4. Settles, B. & Meeder, B. (2016). A Trainable Spaced Repetition Model. ACL.
5. Bicknell, K. & Brust, C. (2020). Birdbrain. Duolingo Blog.
6. Corbett, A.T. & Anderson, J.R. (1995). Knowledge Tracing. UMUAI.
7. Piech, C. et al. (2015). Deep Knowledge Tracing. NeurIPS.
8. Zhang, J. et al. (2017). DKVMN for Knowledge Tracing. WWW.
9. Nagatani, K. et al. (2019). Knowledge Tracing with Forgetting. WWW.
10. Liu, Q. et al. (2021). A Survey of Knowledge Tracing. arXiv:2105.15106.
11. Lord, F.M. (1980). Applications of IRT. Lawrence Erlbaum.
12. Rasch, G. (1960). Probabilistic Models. Danish Institute.
13. Sharpnack, J. et al. (2024). AutoIRT. arXiv:2409.08823.
14. Sharpnack, J. et al. (2024). BanditCAT and AutoIRT. arXiv:2410.21033.
15. Kim, S.K. & Webb, S. (2022). Spacing Effect in L2 Learning Meta-Analysis. Language Learning.
16. Uchihara, T. et al. (2019). Repetition and Incidental Vocabulary Learning. Language Learning.
17. (2025). SRS in Medical Education Meta-Analysis. PubMed.
18. Cepeda, N.J. et al. (2008). Spacing Effects Optimal Gap. Psychological Science.
19. Murre, J.M.J. & Dros, J. (2015). Ebbinghaus Forgetting Curve Replication. PLoS ONE.
20. Expertium & Ye, J. (2024-2026). SRS Algorithm Benchmark.

### LLM, Gamification & Motivation (21 papers)
21. Maity, S. et al. (2025). LLM Question Generation Quality. Computers and Education: AI.
22. Wang, N.X. & Katsaggelos, A.K. (2026). Hallucination-Free Educational QA. arXiv:2601.14280.
23. Fang, T. et al. (2024). LLMCL-GEC. arXiv:2412.12541.
24. Banno, S. et al. (2024). Grammatical Error Feedback. arXiv:2408.09565.
25. Omelianchuk, K. et al. (2020). GECToR. BEA Workshop at ACL.
26. Kamelabad, A.M. et al. (2026). LLM Chatbot Feedback Timing. Frontiers in Education.
27. Tyen, G. et al. (2024). LLM Chatbots as Language Practice Tool. NLP4CALL.
28. Lyu, B. (2025). Chatbot L2 Learning Meta-Analysis. IJAL.
29. Wu, X.Y. et al. (2024). AI in L2 Learning Meta-Analysis. System.
30. Ryan, R.M. & Deci, E.L. (2000). Self-Determination Theory. American Psychologist.
31. Sailer, M. & Homner, L. (2020). Gamification of Learning Meta-Analysis. EPR.
32. Li, K. et al. (2023). Gamification in Education Meta-Analysis. Educational Research Review.
33. Almeida, F. et al. (2023). Negative Effects of Gamification. Computers & Education.
34. Csikszentmihalyi, M. (1990). Flow. Harper & Row.
35. Chang, C.Y. & Hung, Y.S. (2019). TELL Meta-Analysis. Language Learning.
36. Plonsky, L. & Ziegler, N. (2016). CALL Meta-Analysis.
37. Golonka, E.M. et al. (2014). Technologies for FL Learning. CALICO.

### ESP, TBLT & CEFR (26 papers)
38. Hutchinson, T. & Waters, A. (1987). ESP: A Learning-Centred Approach. CUP.
39. Dudley-Evans, T. & St John, M.J. (1998). Developments in ESP. CUP.
40. Basturkmen, H. (2010). Developing Courses in ESP. Palgrave.
41. Kim, H. (2013). Needs Analysis for ESP in Engineering. IJMUE.
42. (2025). Integrating ESP in Engineering Education. IJEATS.
43. Ellis, R. (2003). Task-Based Language Learning and Teaching. OUP.
44. Ellis, R. (2009). Task-based language teaching: Sorting out misunderstandings. IJAL.
45. Long, M. (2015). SLA and Task-Based Language Teaching. Wiley.
46. Bhandari, L.P. et al. (2025). Technology-mediated TBLT Systematic Review. Cogent Education.
47. Krashen, S. (1985). The Input Hypothesis. Longman.
48. Nguyen, T.T.H. & Doan, T.T. (2025). Neuro-ecological critique of Krashen. CEFR Journal.
49. VanPatten, B. & Cadierno, T. (1993). Processing Instruction. Studies in SLA.
50. Bailey, F. (2021). Krashen Revisited. Language Teaching Research Quarterly.
51. Council of Europe (2020). CEFR Companion Volume.
52. Coxhead, A. (2000). Academic Word List. TESOL Quarterly.
53. Hsu, W. (2014). Engineering English Word List. ESP Journal.
54. Ward, J. (2009). Minimum Vocabulary Size for Reading Engineering. ESP Journal.
55. Susanto, R.D. (2023). Computer Science Academic Word List.
56. Nation, I.S.P. (2013). Learning Vocabulary in Another Language. CUP.
57. Douglas, D. (2000). Assessing Languages for Specific Purposes. CUP.
58. (2024). Technical Description Writing Assessment. REFLECTIONS.
59. ASEE. Using Portfolios to Assess Engineering Communication.
60. Kohnke, L. et al. (2025). GenAI for Personalised English Teaching. Computers & Education: AI.
61. Mohamed, A.M. et al. (2025). ChatGPT's Impact on ESP Writing. Teaching and Learning.
62. Namaziandost, E. & Rezai, A. (2024). AI-driven personalized language learning.
63. Nakata, T. (2015). SRS and Vocabulary Retention. Language Teaching Research.
