import { LayerBadge } from "../../vocabulary/components/LayerBadge"
import { CefrBadge } from "../../vocabulary/components/CefrBadge"
import type { ReviewCard as ReviewCardItem } from "../../../types/review"

interface ReviewCardProps {
  card: ReviewCardItem
  flipped: boolean
  productionMode: boolean
  exampleSentence: string
  onFlip: () => void
  onExampleSentenceChange: (value: string) => void
}

export function ReviewCard({
  card,
  flipped,
  productionMode,
  exampleSentence,
  onFlip,
  onExampleSentenceChange,
}: ReviewCardProps) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onFlip}
        className="group block w-full text-left [perspective:1600px]"
      >
        <div
          className={`relative min-h-[380px] rounded-[2rem] transition duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <article className="absolute inset-0 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-8 text-white shadow-xl [backface-visibility:hidden]">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.25em] text-blue-200">
                  Frente
                </p>
                <h2 className="text-3xl font-semibold sm:text-4xl">
                  {card.vocabularyItem.term}
                </h2>
                <p className="text-sm text-blue-100">{card.vocabularyItem.partOfSpeech}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <LayerBadge layer={card.vocabularyItem.layer} />
                <CefrBadge level={card.vocabularyItem.cefrLevel} />
              </div>
            </div>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-blue-50">
              Piensa en la definición, una traducción mental o una frase breve. Luego
              presiona espacio para girar la tarjeta.
            </div>
            <div className="absolute bottom-8 left-8 text-xs text-blue-200">
              Click o espacio para girar
            </div>
          </article>

          <article className="absolute inset-0 rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-900 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Reverso
                </p>
                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                  {card.vocabularyItem.definition}
                </h2>
              </div>
              <div className="flex flex-col items-end gap-2">
                <LayerBadge layer={card.vocabularyItem.layer} />
                <CefrBadge level={card.vocabularyItem.cefrLevel} />
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Ejemplo</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {card.vocabularyItem.exampleSentence}
              </p>
            </div>

            {productionMode ? (
              <label className="mt-6 block">
                <span className="text-sm font-medium text-slate-700">
                  Escribe una frase con este término
                </span>
                <textarea
                  value={exampleSentence}
                  onChange={(event) => onExampleSentenceChange(event.target.value)}
                  placeholder="Write your own technical example..."
                  className="mt-2 min-h-28 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </label>
            ) : null}
          </article>
        </div>
      </button>
    </div>
  )
}
