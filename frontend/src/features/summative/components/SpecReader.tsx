import { CodeBlock } from "../../task/components/CodeBlock"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"

interface SpecReaderProps {
  instructionEs: string
  specEn: string
  title: string
}

export function SpecReader({ instructionEs, specEn, title }: SpecReaderProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
      <Card className="h-fit xl:sticky xl:top-24">
        <CardHeader>
          <CardTitle className="text-base">Contenido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <a className="block rounded-md border border-border bg-muted/20 px-3 py-2 hover:bg-accent" href="#summative-reader-brief">
            Brief
          </a>
          <a className="block rounded-md border border-border bg-muted/20 px-3 py-2 hover:bg-accent" href="#summative-reader-spec">
            Technical input
          </a>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card id="summative-reader-brief">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted-foreground">{instructionEs}</p>
          </CardContent>
        </Card>

        <Card id="summative-reader-spec">
          <CardHeader>
            <CardTitle>Technical input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border">
              <CodeBlock code={specEn} language="Technical input" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
