import { CircleHelp } from "lucide-react"
import { EmptyState } from "../../../components/ui/empty-state"
import { Button } from "../../../components/ui/button"

export function UnknownTermsList({
  terms,
  onSelect,
}: {
  terms: string[]
  onSelect: (term: string) => void
}) {
  if (terms.length === 0) {
    return (
      <EmptyState
        className="py-8"
        description="No se detectaron términos desconocidos en el texto analizado."
        icon={CircleHelp}
        title="Todo el vocabulario está reconocido"
      />
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {terms.map((term) => (
        <Button
          key={term}
          onClick={() => onSelect(term)}
          size="sm"
          variant="outline"
        >
          {term}
        </Button>
      ))}
    </div>
  )
}
