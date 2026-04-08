import type { SummativeQuestionReview } from "../../../types/summative"

interface McqQuestionProps {
  index: number
  question: SummativeQuestionReview
  selectedAnswerIdx: number | null
  onChange: (answerIdx: number) => void
  showReview?: boolean
}

export function McqQuestion({
  index,
  question,
  selectedAnswerIdx,
  onChange,
  showReview = false,
}: McqQuestionProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">
        {index + 1}. {question.question}
      </h3>
      <div className="mt-4 space-y-3">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedAnswerIdx === optionIndex
          const isCorrect = showReview && question.correctAnswerIdx === optionIndex
          const isIncorrectSelected =
            showReview && isSelected && question.correctAnswerIdx !== optionIndex

          return (
            <label
              key={`${question.question}-${optionIndex}`}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : isIncorrectSelected
                    ? "border-red-300 bg-red-50 text-red-900"
                    : isSelected
                      ? "border-blue-300 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name={`mcq-${index}`}
                className="mt-1"
                checked={isSelected}
                disabled={showReview}
                onChange={() => onChange(optionIndex)}
              />
              <span className="leading-6">{option}</span>
            </label>
          )
        })}
      </div>
      {showReview ? (
        <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
          {question.explanation}
        </p>
      ) : null}
    </section>
  )
}
