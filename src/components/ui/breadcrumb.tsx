import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "../../lib/utils"
import { Link } from "../../utils/router"

/**
 * shadcn/ui Breadcrumb. The last item is the current page; the others are real links. The page's
 * BreadcrumbList structured data is built separately in src/utils/blogSeo.ts from the same trail.
 */
export interface BreadcrumbTrailItem {
  label: string
  /** Omit on the current page. */
  to?: string
}

function Breadcrumb({ items, className }: { items: BreadcrumbTrailItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-[#8E8E99]">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5 min-w-0">
              {item.to && !last ? (
                <Link
                  to={item.to}
                  className="inline-flex items-center min-h-8 hover:text-white underline-offset-4 hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last && "text-[#C2C2CC]")}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight aria-hidden="true" className="w-3.5 h-3.5 shrink-0 text-[#55555F]" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { Breadcrumb }
