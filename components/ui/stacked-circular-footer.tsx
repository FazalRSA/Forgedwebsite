import * as React from "react"
import { Facebook, Instagram } from "lucide-react"
import { SITE, telLink, whatsappLink } from "@/src/config/site"
import { Link } from "@/src/utils/router"
import { LogoPlaceholder } from "@/src/components/shared/LogoPlaceholder"

export interface StackedCircularFooterProps {
  /** Accepted so existing callers still compile; links now navigate through <Link>. */
  onNavigate?: (path: string) => void;
  /** Accepted so existing callers still compile; there is one set of links. */
  useBrandLinks?: boolean;
}

const FOOTER_LINKS = [
  { label: "Wheels", to: "/#catalogue" },
  { label: "Installs", to: "/installs" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy policy", to: "/privacy-policy" },
] as const

const linkClass =
  "inline-flex items-center min-h-11 text-sm text-neutral-300 hover:text-white transition-colors"

/** Footer: the same three pages as the header, the privacy policy, and whichever contact details are set. */
function StackedCircularFooter(_props: StackedCircularFooterProps) {
  const phoneHref = telLink()
  const whatsappHref = whatsappLink()

  // Only channels that are filled in src/config/site.ts appear.
  const contactItems: { key: string; label: string; href: string; external?: boolean }[] = []
  if (whatsappHref) contactItems.push({ key: "whatsapp", label: "WhatsApp", href: whatsappHref, external: true })
  if (phoneHref && SITE.phoneDisplay) contactItems.push({ key: "phone", label: SITE.phoneDisplay, href: phoneHref })
  if (SITE.tradeEmail) contactItems.push({ key: "email", label: SITE.tradeEmail, href: `mailto:${SITE.tradeEmail}` })

  return (
    <footer className="bg-[#0A0A0A] text-[#F5F5F7] border-t border-[#26262E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 grid gap-10 md:grid-cols-[1fr_auto_auto] md:gap-16">
        <div className="space-y-3">
          <Link to="/" aria-label="FORGED Custom Wheels, home" className="inline-flex items-center min-h-11">
            <LogoPlaceholder variant="dark" />
          </Link>
          <p className="text-sm text-neutral-400 max-w-xs">
            Forged wheels for BMW M cars, supplied in {SITE.country}.
          </p>
        </div>

        {/* Side by side on a phone so the footer stays short */}
        <div className="grid grid-cols-2 gap-6 md:contents">
        <nav aria-label="Footer">
          <ul>
            {FOOTER_LINKS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {(contactItems.length > 0 || SITE.addressLine || SITE.instagramUrl || SITE.facebookUrl) && (
          <div>
            <ul>
              {contactItems.map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={linkClass}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              {SITE.instagramUrl && (
                <li>
                  <a
                    href={SITE.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} gap-2`}
                  >
                    <Instagram aria-hidden="true" className="w-4 h-4" />
                    Instagram
                  </a>
                </li>
              )}
              {SITE.facebookUrl && (
                <li>
                  <a
                    href={SITE.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} gap-2`}
                  >
                    <Facebook aria-hidden="true" className="w-4 h-4" />
                    Facebook
                  </a>
                </li>
              )}
            </ul>
            {SITE.addressLine && (
              <p className="mt-2 text-sm text-neutral-400 max-w-xs">{SITE.addressLine}</p>
            )}
          </div>
        )}
        </div>
      </div>

      <div className="border-t border-[#1E1E26]">
        <p className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-5 text-xs text-neutral-500">
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>
    </footer>
  )
}

export { StackedCircularFooter }
