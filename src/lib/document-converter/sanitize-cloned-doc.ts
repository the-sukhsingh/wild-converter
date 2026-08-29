/**
 * Sanitize cloned document before html2canvas processes it.
 * Modern CSS (Tailwind CSS v4, Next.js themes) uses modern color functions
 * like `lab()`, `oklch()`, `oklab()`, `color-mix()`, `color(srgb ...)`,
 * which cause html2canvas to fail with:
 * "Attempting to parse an unsupported color function 'lab'"
 */
export function sanitizeClonedDoc(clonedDoc: Document) {
  // 1. Remove all external <link rel="stylesheet"> tags from cloned DOM so html2canvas doesn't parse main app CSS
  const linkTags = clonedDoc.querySelectorAll("link[rel='stylesheet']");
  linkTags.forEach((tag) => tag.remove());

  // 2. Sanitize and replace modern color functions in all <style> tags
  const styleTags = clonedDoc.querySelectorAll("style");
  styleTags.forEach((tag) => {
    if (tag.textContent) {
      tag.textContent = tag.textContent
        .replace(/lab\([^)]+\)/gi, "rgb(15, 23, 42)")
        .replace(/oklch\([^)]+\)/gi, "rgb(15, 23, 42)")
        .replace(/oklab\([^)]+\)/gi, "rgb(15, 23, 42)")
        .replace(/color-mix\([^)]+\)/gi, "rgb(15, 23, 42)")
        .replace(/color\([^)]+\)/gi, "rgb(15, 23, 42)");
    }
  });

  // 3. Clean up computed / inline styles on all elements
  const allElements = clonedDoc.querySelectorAll("*");
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.style && htmlEl.style.cssText) {
      const css = htmlEl.style.cssText;
      if (
        css.includes("lab(") ||
        css.includes("oklch(") ||
        css.includes("oklab(") ||
        css.includes("color-mix(") ||
        css.includes("color(")
      ) {
        htmlEl.style.cssText = css
          .replace(/lab\([^)]+\)/gi, "rgb(15, 23, 42)")
          .replace(/oklch\([^)]+\)/gi, "rgb(15, 23, 42)")
          .replace(/oklab\([^)]+\)/gi, "rgb(15, 23, 42)")
          .replace(/color-mix\([^)]+\)/gi, "rgb(15, 23, 42)")
          .replace(/color\([^)]+\)/gi, "rgb(15, 23, 42)");
      }
    }
  });
}
