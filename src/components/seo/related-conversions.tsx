import Link from "next/link";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import type { ConversionLinkItem, FormatHubLinkItem } from "@/lib/seo/types";

interface RelatedConversionsProps {
  fromExt: string;
  toExt: string;
  reversePair?: ConversionLinkItem;
  relatedFromConversions: ConversionLinkItem[];
  relatedToConversions: ConversionLinkItem[];
  siblingFormats: FormatHubLinkItem[];
}

export function RelatedConversions({
  fromExt,
  toExt,
  reversePair,
  relatedFromConversions,
  relatedToConversions,
  siblingFormats,
}: RelatedConversionsProps) {
  return (
    <div className="w-full space-y-10 my-10 border-t border-(--border)/40 pt-10">
      {/* Reverse Conversion Hub Link */}
      {reversePair && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-(--card)/40 rounded-lg">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-(--muted-foreground) block">
              Two-Way Conversion
            </span>
            <p className="font-medium text-sm text-(--foreground) mt-0.5">
              Need to convert in reverse? Switch back from {toExt.toUpperCase()} to {fromExt.toUpperCase()}
            </p>
          </div>
          <Link
            href={`/convert/${reversePair.slug}`}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-(--foreground) hover:text-(--accent) transition-colors py-1.5 px-3 rounded bg-(--background) shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{reversePair.label}</span>
          </Link>
        </div>
      )}

      {/* Grid of Hub-and-Spoke Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Outbound Spokes */}
        {relatedFromConversions && relatedFromConversions.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-(--foreground) font-medium">
                More {fromExt.toUpperCase()} Converters
              </h4>
              <Link
                href={`/convert/${fromExt.toLowerCase()}`}
                className="text-xs font-mono text-(--muted-foreground) hover:text-(--foreground) transition-colors"
              >
                All {fromExt.toUpperCase()} →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {relatedFromConversions.slice(0, 9).map((item) => (
                <Link
                  key={item.slug}
                  href={`/convert/${item.slug}`}
                  className="p-2 rounded font-mono text-xs text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--card)/60 transition-colors truncate block"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Inbound Spokes */}
        {relatedToConversions && relatedToConversions.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-(--foreground) font-medium">
                Convert to {toExt.toUpperCase()} From
              </h4>
              <Link
                href={`/convert/${toExt.toLowerCase()}`}
                className="text-xs font-mono text-(--muted-foreground) hover:text-(--foreground) transition-colors"
              >
                All → {toExt.toUpperCase()}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {relatedToConversions.slice(0, 9).map((item) => (
                <Link
                  key={item.slug}
                  href={`/convert/${item.slug}`}
                  className="p-2 rounded font-mono text-xs text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--card)/60 transition-colors truncate block"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sibling Format Hubs */}
      {siblingFormats && siblingFormats.length > 0 && (
        <div className="pt-4 border-t border-(--border)/30">
          <h4 className="font-mono text-xs uppercase tracking-wider text-(--muted-foreground) mb-3 font-medium">
            Related Formats in this Category
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            {siblingFormats.map((sibling) => (
              <Link
                key={sibling.slug}
                href={`/convert/${sibling.slug}`}
                className="font-mono text-xs px-2.5 py-1 rounded bg-(--card)/50 hover:bg-(--card) text-(--muted-foreground) hover:text-(--foreground) transition-colors"
              >
                .{sibling.extension} ({sibling.name})
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
