import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

/** shadcn/ui Alert, used for the callouts inside articles. */
const alertVariants = cva("relative w-full rounded-xl border p-4 sm:p-5", {
  variants: {
    variant: {
      note: "border-[#26262E] bg-[#18181D] text-[#EDEBE4]",
      tip: "border-[#1D4ED8]/50 bg-[#1D4ED8]/10 text-[#EDEBE4]",
      warning: "border-[#F43F5E]/50 bg-[#F43F5E]/10 text-[#EDEBE4]",
    },
  },
  defaultVariants: { variant: "note" },
})

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="note" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("mb-1 text-sm font-semibold tracking-tight text-white", className)} {...props} />
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm leading-relaxed text-[#D4D4DC]", className)} {...props} />
  )
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
