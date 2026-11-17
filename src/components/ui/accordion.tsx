import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"

/**
 * shadcn/ui Accordion, built on the native <details> element instead of Radix: it needs no
 * JavaScript to open, it works in the prerendered HTML that crawlers read, and the answers stay
 * in the page text either way.
 */
function Accordion({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("divide-y divide-[#26262E] rounded-xl border border-[#26262E]", className)} {...props} />
}

function AccordionItem({ question, children, className }: { question: string; children: React.ReactNode; className?: string }) {
  return (
    <details className={cn("group bg-[#111111] first:rounded-t-xl last:rounded-b-xl open:bg-[#18181D]", className)}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-left text-base font-medium text-white sm:px-5 [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-[#8E8E99] transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 text-[15px] leading-relaxed text-[#D4D4DC] sm:px-5">{children}</div>
    </details>
  )
}

export { Accordion, AccordionItem }
