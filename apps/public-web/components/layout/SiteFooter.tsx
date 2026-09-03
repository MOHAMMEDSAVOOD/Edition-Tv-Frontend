import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = {
  Sections: [
    { label: "World", href: "/categories/world" },
    { label: "Business", href: "/categories/business" },
    { label: "Technology", href: "/categories/technology" },
    { label: "Politics", href: "/categories/politics" },
    { label: "Science", href: "/categories/science" },
    { label: "Health", href: "/categories/health" },
    { label: "Energy", href: "/categories/energy" },
    { label: "Opinion", href: "/categories/opinion" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Advertise", href: "/advertise" },
    { label: "Contact", href: "/contact" },
    { label: "Newsletters", href: "/newsletters" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Cookie Settings", href: "/cookies" },
    { label: "Corrections", href: "/corrections" },
  ],
  Follow: [
    { label: "RSS Feed", href: "/rss.xml" },
    { label: "Twitter / X", href: "https://x.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-16">
      <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-16">
        {/* Logo row */}
        <div className="flex items-start justify-between gap-8 pb-10 border-b border-border">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="Edition TV Logo" width={180} height={40} className="h-9 max-h-9 w-auto object-contain dark:invert" />
            </Link>
            <p className="text-xs text-muted-foreground max-w-xs">
              Trusted journalism. Breaking news. In-depth reporting. Available 24/7.
            </p>
          </div>
          <Link
            href="/auth/register"
            className="hidden sm:inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
          >
            Subscribe Free
          </Link>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-10">
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="section-label mb-4">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Edition TV. All rights reserved.</span>
          <span className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">Sitemap</Link>
            <Link href="/rss.xml" className="hover:text-foreground transition-colors">RSS</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
