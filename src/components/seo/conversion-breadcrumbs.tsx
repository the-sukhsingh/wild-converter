import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ConversionBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function ConversionBreadcrumbs({ items }: ConversionBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs font-mono text-(--muted-foreground) py-2 overflow-x-auto no-scrollbar"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.label} className="flex items-center gap-1.5 shrink-0">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-(--muted-foreground)/40" aria-hidden="true" />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-(--foreground) transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className={isLast ? "text-(--foreground) font-medium" : ""}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
