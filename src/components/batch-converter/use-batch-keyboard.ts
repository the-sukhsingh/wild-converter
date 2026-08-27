"use client";

import { useEffect } from "react";

interface BatchKeyboardOptions {
  onConvertAll: () => void;
  onDownloadZip: () => void;
  onClearAll: () => void;
  onCloseModal: () => void;
  isConvertingAll: boolean;
  hasIdleItems: boolean;
  hasDoneItems: boolean;
  hasItems: boolean;
}

/**
 * Global keyboard shortcuts for the batch converter table.
 *
 * Ctrl+Enter  — Convert All (when idle items exist)
 * Ctrl+D      — Download ZIP (when done items exist)
 * Ctrl+K      — Focus/search filter
 * Escape      — Close modals / clear search
 */
export function useBatchKeyboard({
  onConvertAll,
  onDownloadZip,
  onClearAll,
  onCloseModal,
  isConvertingAll,
  hasIdleItems,
  hasDoneItems,
}: BatchKeyboardOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs, textareas, selects
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      const isEditing = tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;

      // Escape always works (close modals)
      if (e.key === "Escape") {
        onCloseModal();
        return;
      }

      if (isEditing) return;

      // Ctrl+Enter → Convert All
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        if (!isConvertingAll && hasIdleItems) {
          onConvertAll();
        }
        return;
      }

      // Ctrl+D → Download ZIP
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        if (hasDoneItems) {
          onDownloadZip();
        }
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onConvertAll, onDownloadZip, onClearAll, onCloseModal, isConvertingAll, hasIdleItems, hasDoneItems]);
}

/** Returns human-readable shortcut label for the current OS */
export function shortcutLabel(key: string): string {
  const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);
  const mod = isMac ? "⌘" : "Ctrl";
  return `${mod}+${key}`;
}
