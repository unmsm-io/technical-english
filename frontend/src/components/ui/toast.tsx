import { Toaster as Sonner, toast } from "sonner"

export { toast }

export function Toaster() {
  return (
    <Sonner
      closeButton
      position="top-right"
      richColors={false}
      toastOptions={{
        classNames: {
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-secondary !text-secondary-foreground",
          description: "!text-muted-foreground",
          toast:
            "!rounded-lg !border !border-border !bg-card !text-card-foreground !shadow-sm",
          title: "!text-sm !font-medium",
        },
      }}
    />
  )
}
