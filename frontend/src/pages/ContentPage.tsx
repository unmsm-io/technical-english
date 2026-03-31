import { BookOpen } from "lucide-react"

export function ContentPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Course Content</h1>
        <p className="mt-1 text-sm text-gray-500">
          Technical English syllabus, modules, and lessons
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Coming in Phase 2
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Course modules, lessons, and learning materials will be available here.
        </p>
      </div>
    </div>
  )
}
