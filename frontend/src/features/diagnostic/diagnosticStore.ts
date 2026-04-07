import { create } from "zustand"
import type {
  DiagnosticItem,
  DiagnosticAttemptStartResponse,
  DiagnosticResult,
} from "../../types/diagnostic"

interface DiagnosticState {
  selectedUserId: number | null
  attemptId: number | null
  items: DiagnosticItem[]
  responses: Array<number | null>
  result: DiagnosticResult | null
  setSelectedUserId: (userId: number | null) => void
  startAttempt: (payload: DiagnosticAttemptStartResponse) => void
  answerQuestion: (index: number, answer: number) => void
  setResult: (result: DiagnosticResult) => void
  reset: () => void
}

export const useDiagnosticStore = create<DiagnosticState>((set) => ({
  selectedUserId: null,
  attemptId: null,
  items: [],
  responses: [],
  result: null,
  setSelectedUserId: (selectedUserId) => set({ selectedUserId }),
  startAttempt: (payload) =>
    set({
      selectedUserId: payload.userId,
      attemptId: payload.attemptId,
      items: payload.items,
      responses: payload.items.map(() => null),
      result: null,
    }),
  answerQuestion: (index, answer) =>
    set((state) => ({
      responses: state.responses.map((current, currentIndex) =>
        currentIndex === index ? answer : current
      ),
    })),
  setResult: (result) => set({ result }),
  reset: () =>
    set({
      selectedUserId: null,
      attemptId: null,
      items: [],
      responses: [],
      result: null,
    }),
}))
