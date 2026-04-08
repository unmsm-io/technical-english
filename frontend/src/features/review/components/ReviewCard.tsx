import { RotateCw } from "lucide-react"
import { Textarea } from "../../../components/ui/textarea"
import { Kbd } from "../../../components/ui/kbd"
import type { ReviewCard as ReviewCardItem } from "../../../types/review"
import { CefrBadge } from "../../vocabulary/components/CefrBadge"
import { LayerBadge } from "../../vocabulary/components/LayerBadge"

interface ReviewCardProps {
  card: ReviewCardItem
  exampleSentence: string
  flipped: boolean
  onExampleSentenceChange: (value: string) => void
  onFlip: () => void
  productionMode: boolean
}

export function ReviewCard({
  card,
  exampleSentence,
  flipped,
  onExampleSentenceChange,
  onFlip,
  productionMode,
}: ReviewCardProps) {
  return (
    <div className="space-y-3">
      <button
        className="group block w-full text-left [perspective:1800px]"
        onClick={onFlip}
        type="button"
      >
        <div
          className={`relative min-h-[420px] rounded-[28px] transition duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <article className="absolute inset-0 flex flex-col rounded-[28px] border border-border bg-card p-6 shadow-sm [backface-visibility:hidden] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-4">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Frente
                </span>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {card.vocabularyItem.term}
                  </h2>
                  <p className="text-sm text-muted-foreground">{card.vocabularyItem.partOfSpeech}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <LayerBadge layer={card.vocabularyItem.layer} />
                <CefrBadge level={card.vocabularyItem.cefrLevel} />
              </div>
            </div>
            <div className="mt-8 flex-1 rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-sm leading-7 text-muted-foreground">
              Piensa en la definición, relaciónalo con tu contexto técnico y gira la tarjeta cuando tengas una respuesta mental clara.
            </div>
            <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <RotateCw className="size-3.5" />
                Click o espacio para girar
              </span>
              <Kbd>Space</Kbd>
            </div>
          </article>

          <article className="absolute inset-0 rounded-[28px] border border-border bg-card p-6 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Reverso
                  </span>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {card.vocabularyItem.definition}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {card.vocabularyItem.partOfSpeech}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <LayerBadge layer={card.vocabularyItem.layer} />
                  <CefrBadge level={card.vocabularyItem.cefrLevel} />
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5">
                <p className="text-sm font-medium">Ejemplo</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {card.vocabularyItem.exampleSentence}
                </p>
              </div>

              {productionMode ? (
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium">Escribe una frase con este término</p>
                  <Textarea
                    onChange={(event) => onExampleSentenceChange(event.target.value)}
                    placeholder="Write your own technical example..."
                    value={exampleSentence}
                  />
                </div>
              ) : null}

              <div className="mt-auto pt-6 text-xs text-muted-foreground">
                Gira de nuevo si quieres revisar la tarjeta antes de calificar.
              </div>
            </div>
          </article>
        </div>
      </button>
    </div>
  )
}
