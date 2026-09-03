import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionDividerProps {
  label: string;
  href?: string;
}

export function SectionDivider({ label, href }: SectionDividerProps) {
  return (
    <div className="flex items-center justify-between border-b-2 border-primary pb-2 mb-6">
      <h2 className="headline-lg text-lg uppercase tracking-wider font-extrabold text-foreground">
        {label}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
        >
          See All <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
