export function UnknownTermsList({
  terms,
  onSelect,
}: {
  terms: string[]
  onSelect: (term: string) => void
}) {
  if (terms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-5 text-sm text-emerald-700">
        No se detectaron terminos desconocidos.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {terms.map((term) => (
        <button
          key={term}
          type="button"
          onClick={() => onSelect(term)}
          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
        >
          {term}
        </button>
      ))}
    </div>
  )
}
