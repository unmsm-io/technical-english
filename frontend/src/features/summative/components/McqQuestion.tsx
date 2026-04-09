import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group"
import { cn } from "../../../lib/utils"
import type { SummativeQuestionReview } from "../../../types/summative"

interface McqQuestionProps {
  index: number
  onChange: (answerIdx: number) => void
  question: SummativeQuestionReview
  selectedAnswerIdx: number | null
  showReview?: boolean
}

export function McqQuestion({
  index,
  onChange,
  question,
  selectedAnswerIdx,
  showReview = false,
}: McqQuestionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {index + 1}. {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          onValueChange={(value) => onChange(Number(value))}
          value={selectedAnswerIdx !== null ? String(selectedAnswerIdx) : ""}
        >
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => {
              const isSelected = selectedAnswerIdx === optionIndex
              const isCorrect = showReview && question.correctAnswerIdx === optionIndex
              const isIncorrectSelected =
                showReview && isSelected && question.correctAnswerIdx !== optionIndex

              return (
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition",
                    isCorrect && "border-foreground bg-accent text-foreground",
                    isIncorrectSelected && "border-border bg-muted/50 text-foreground",
                    !isCorrect && !isIncorrectSelected && isSelected && "border-foreground bg-accent/60",
                    !isCorrect && !isIncorrectSelected && !isSelected && "border-border bg-card hover:bg-accent/30"
                  )}
                  key={`${question.question}-${optionIndex}`}
                >
                  <RadioGroupItem
                    checked={isSelected}
                    className="mt-0.5"
                    disabled={showReview}
                    id={`mcq-${index}-${optionIndex}`}
                    value={String(optionIndex)}
                  />
                  <span className="flex-1 leading-6">{option}</span>
                  {showReview && isCorrect ? <Badge variant="secondary">Correcta</Badge> : null}
                  {showReview && isIncorrectSelected ? <Badge variant="outline">Tu respuesta</Badge> : null}
                </label>
              )
            })}
          </div>
        </RadioGroup>
        {showReview ? (
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
            {question.explanation}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
