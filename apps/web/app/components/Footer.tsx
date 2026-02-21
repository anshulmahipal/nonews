"use client";

import Link from "next/link";

const TWITTER_HANDLE = "mr_mahipal2802";
const TWITTER_URL = `https://twitter.com/${TWITTER_HANDLE}`;

const exploreLinks = [
  { label: "Economy", href: "/topic/economy" },
  { label: "Politics", href: "/topic/politics" },
  { label: "Tech", href: "/topic/tech" },
  { label: "Authors", href: "/library" },
] as const;

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Careers", href: "/careers" },
] as const;

const legalLinks = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "AI Ethics", href: "/about#ai-ethics" },
] as const;

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300" role="contentinfo">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo, mission, social */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block text-xl font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "Georgia, serif" }}
            >
              NoNews
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Informing India&apos;s decision makers with concise editorial summaries—so you can stay informed without the noise.
            </p>
            <div className="flex items-center gap-2">
              <a
                href={TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label={`Follow us on X (Twitter): @${TWITTER_HANDLE}`}
              >
                <TwitterIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Explore
            </h3>
            <ul className="space-y-3">
              {exploreLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-500">
            © {currentYear} NoNews · nonews.in. Made with 🇮🇳 for the world.
          </p>
        </div>
      </div>
    </footer>
  );
}
