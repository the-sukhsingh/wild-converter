import type { TechnicalComparisonDimension } from "@/lib/seo/types";

interface ComparisonTableProps {
  fromName: string;
  toName: string;
  dimensions: TechnicalComparisonDimension[];
}

export function ComparisonTable({ fromName, toName, dimensions }: ComparisonTableProps) {
  return (
    <div className="w-full my-8">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-(--border)/60 text-xs font-mono uppercase tracking-wider text-(--muted-foreground)">
              <th scope="col" className="py-3 pr-4 font-medium">Technical Dimension</th>
              <th scope="col" className="py-3 px-4 font-semibold text-(--foreground)">{fromName}</th>
              <th scope="col" className="py-3 pl-4 font-semibold text-(--foreground)">{toName}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)/30 text-xs sm:text-sm font-sans">
            {dimensions.map((dim) => (
              <tr key={dim.feature} className="hover:bg-(--card)/40 transition-colors">
                <td className="py-3.5 pr-4 align-top">
                  <span className="font-mono text-xs text-(--muted-foreground) block">
                    {dim.feature}
                  </span>
                  <span className="text-[11px] sm:text-xs text-(--muted-foreground)/80 block mt-0.5 leading-relaxed">
                    {dim.explanation}
                  </span>
                </td>
                <td className="py-3.5 px-4 align-top font-mono text-xs sm:text-sm text-(--foreground)/90">
                  {dim.fromValue}
                </td>
                <td className="py-3.5 pl-4 align-top font-mono text-xs sm:text-sm text-(--foreground) font-medium">
                  {dim.toValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
