import type { FormatSpec } from "@/lib/seo/types";

interface FormatSpecCardProps {
  spec: FormatSpec;
  role?: "source" | "target" | "standalone";
}

export function FormatSpecCard({ spec, role = "standalone" }: FormatSpecCardProps) {
  const roleLabel = role === "source" ? "Source Format" : role === "target" ? "Target Format" : "Format Specification";

  return (
    <div className="flex-1 py-4">
      <div className="flex items-baseline justify-between gap-2 border-b border-(--border)/40 pb-2 mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-(--muted-foreground) block">
            {roleLabel}
          </span>
          <h3 className="text-base sm:text-lg font-semibold text-(--foreground) tracking-tight">
            {spec.name} <span className="font-mono text-sm font-normal text-(--muted-foreground)">(.{spec.extension})</span>
          </h3>
        </div>
        <span className="font-mono text-xs text-(--muted-foreground) px-2 py-0.5 rounded-sm bg-(--card)">
          {spec.category}
        </span>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs font-mono mb-4">
        <div>
          <dt className="text-(--muted-foreground)">MIME Type</dt>
          <dd className="text-(--foreground) truncate mt-0.5" title={spec.mimeType}>
            {spec.mimeType}
          </dd>
        </div>
        <div>
          <dt className="text-(--muted-foreground)">Developer</dt>
          <dd className="text-(--foreground) truncate mt-0.5">
            {spec.developer}
          </dd>
        </div>
        <div>
          <dt className="text-(--muted-foreground)">Compression</dt>
          <dd className="text-(--foreground) mt-0.5">
            {spec.lossless ? "Lossless" : "Lossy"}
          </dd>
        </div>
        <div>
          <dt className="text-(--muted-foreground)">Color / Bit Depth</dt>
          <dd className="text-(--foreground) truncate mt-0.5" title={spec.colorDepth}>
            {spec.colorDepth}
          </dd>
        </div>
        <div>
          <dt className="text-(--muted-foreground)">Alpha Channel</dt>
          <dd className="text-(--foreground) mt-0.5">
            {spec.supportsAlpha ? "Supported" : "No"}
          </dd>
        </div>
        <div>
          <dt className="text-(--muted-foreground)">Standard</dt>
          <dd className="text-(--foreground) truncate mt-0.5" title={spec.standard || "N/A"}>
            {spec.standard || "De facto"}
          </dd>
        </div>
      </dl>

      <div className="space-y-3 text-xs sm:text-sm font-sans pt-2">
        <div>
          <h4 className="font-mono text-xs uppercase tracking-wider text-(--foreground) mb-1.5 font-medium">
            Key Strengths
          </h4>
          <ul className="space-y-1 text-(--muted-foreground)">
            {spec.strengths.slice(0, 3).map((strength) => (
              <li key={strength} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-emerald-500 shrink-0 select-none">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {spec.limitations && spec.limitations.length > 0 && (
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-(--muted-foreground) mb-1.5 font-medium">
              Limitations
            </h4>
            <ul className="space-y-1 text-(--muted-foreground)/80">
              {spec.limitations.slice(0, 2).map((limitation) => (
                <li key={limitation} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-(--muted-foreground)/50 shrink-0 select-none">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
