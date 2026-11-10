import * as React from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Facebook, Instagram, Linkedin, Twitter, ArrowUpRight, CheckCircle2 } from "lucide-react"
import { SITE } from "@/src/config/site"
import { Link } from "@/src/utils/router"
import { LogoPlaceholder } from "@/src/components/shared/LogoPlaceholder"

export interface StackedCircularFooterProps {
  onNavigate?: (path: string) => void;
  useBrandLinks?: boolean;
}

function StackedCircularFooter({ onNavigate, useBrandLinks = false }: StackedCircularFooterProps) {
  const [email, setEmail] = React.useState("")
  const [subscribed, setSubscribed] = React.useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 4000)
    }
  }

  return (
    <footer className="bg-[#0A0A0A] text-[#F5F5F7] border-t border-[#26262E] py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          
          {/* Minimal Brand Mark */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-bold text-sm tracking-wider font-mono">
                F
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-200 block">FORGED</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">Custom Wheels</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mb-8 flex flex-wrap justify-center items-center gap-6 text-xs text-neutral-400">
            {useBrandLinks && onNavigate ? (
              <>
                <Link
                  to="/#catalogue"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Catalogue
                </Link>
                <Link
                  to="/sixnine-wheels"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Official Dealer of Sixnine Wheels
                </Link>
                <Link
                  to="/client-fitments"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Installations
                </Link>
                <Link
                  to="/dealer-application"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Dealer Application
                </Link>
                <Link
                  to="/store"
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Vehicle Configurator</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500" />
                </Link>
                <Link
                  to="/privacy-policy"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy
                </Link>
              </>
            ) : (
              <>
                <a href="#" className="hover:text-white transition-colors">Home</a>
                <a href="#catalogue" className="hover:text-white transition-colors">Collection</a>
                <a href="/client-fitments" className="hover:text-white transition-colors">Fitments</a>
                <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
              </>
            )}
          </nav>

          {/* Social Icons: rendered only for channels configured in src/config/site.ts */}
          {(SITE.facebookUrl || SITE.instagramUrl) && (
            <div className="mb-8 flex space-x-3">
              {SITE.facebookUrl && (
                <a
                  href={SITE.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="FORGED Custom Wheels on Facebook"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition-colors"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </a>
              )}
              {SITE.instagramUrl && (
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="FORGED Custom Wheels on Instagram"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition-colors"
                >
                  <Instagram className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Email Subscription Form */}
          <div className="mb-8 w-full max-w-sm">
            {subscribed ? (
              <div className="p-2.5 bg-neutral-900/80 border border-neutral-800 text-neutral-300 text-xs font-mono rounded-lg flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Thank you for subscribing.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="flex-grow">
                  <Label htmlFor="email" className="sr-only">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email for allocation alerts"
                    type="email"
                    required
                    className="h-9 text-xs rounded-lg bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-600 focus-visible:border-neutral-600"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  Join
                </Button>
              </form>
            )}
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-[11px] font-mono text-neutral-600">
              © {new Date().getFullYear()} FORGED Custom Wheels. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { StackedCircularFooter }
