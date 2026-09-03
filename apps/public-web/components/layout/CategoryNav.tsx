"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem { label: string; href: string; }

export function CategoryNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <div className="border-t border-border bg-background overflow-x-auto no-scrollbar">
      <div className="container mx-auto max-w-[1200px] px-4 md:px-6">
        <nav className="flex items-center gap-0">
          {items.map((item) => {
            const currentPath = pathname || "";
            const active = currentPath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-none px-4 py-2.5 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors hover:text-primary whitespace-nowrap",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/70 hover:border-primary/40"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
