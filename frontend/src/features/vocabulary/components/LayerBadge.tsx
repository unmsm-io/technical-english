import type { VocabularyLayer } from "../../../types/vocabulary"

const layerStyles: Record<VocabularyLayer, string> = {
  GSL: "bg-slate-100 text-slate-700",
  AWL: "bg-blue-100 text-blue-700",
  EEWL: "bg-emerald-100 text-emerald-700",
  CSAWL: "bg-amber-100 text-amber-700",
}

export function LayerBadge({ layer }: { layer: VocabularyLayer }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${layerStyles[layer]}`}>
      {layer}
    </span>
  )
}
