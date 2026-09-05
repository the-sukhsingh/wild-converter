import type { FAQItem } from "@/lib/seo/types";

interface FAQAccordionProps {
  faqs: FAQItem[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="w-full space-y-4 my-6">
      {faqs.map((faq, index) => (
        <details
          key={faq.question}
          open={index === 0}
          className="group border-b border-(--border)/40 pb-4 transition-colors"
        >
          <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-sans font-medium text-sm sm:text-base text-(--foreground) hover:text-(--foreground)/80 select-none py-1">
            <span>{faq.question}</span>
            <span className="font-mono text-xs text-(--muted-foreground) shrink-0 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="pt-2 text-xs sm:text-sm font-sans text-(--muted-foreground) leading-relaxed">
            <p>{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
