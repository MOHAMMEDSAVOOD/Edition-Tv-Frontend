import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              EDITION TV
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enterprise Live News, Editorial Intelligence, and Streaming Platform. Built for investigative clarity and real-time journalism.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Editorial</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Breaking News</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Live Coverage</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Digital Editions</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Analysis & Opinion</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Studio & CMS</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Reporter Studio</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Edition Planner</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Audience Analytics</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Moderation Queue</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Platform & APIs</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">OpenAPI Spec</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">RSS Feeds</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Sitemap</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">llms.txt Specification</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Edition TV Inc. All rights reserved. WCAG AA Compliant • Production Grade Architecture.
        </div>
      </div>
    </footer>
  );
}
