"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { searchSymbols } from "@/services/market-service";
import type { SymbolSearchResult } from "@/types/market";

interface StockSearchProps {
  /** Called when the user picks a result from the dropdown. */
  onSelect: (result: SymbolSearchResult) => void;
  /** Optional placeholder text for the input. */
  placeholder?: string;
  /** Additional class names applied to the root container. */
  className?: string;
}

export default function StockSearch({
  onSelect,
  placeholder = "Search symbol or company…",
  className,
}: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounced search ──────────────────────────────────────────────────────
  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await searchSymbols(q.trim());
      setResults(data);
      setActiveIndex(-1);
      setIsOpen(true);
    } catch {
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  // ── Scroll active item into view ──────────────────────────────────────────
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as
      | HTMLElement
      | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const root = inputRef.current?.closest("[data-stocksearch]");
      if (root && !root.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) commitSelection(results[activeIndex]);
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }

  function commitSelection(result: SymbolSearchResult) {
    setQuery(result.symbol);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect(result);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div data-stocksearch className={cn("relative w-full", className)}>
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="stocksearch-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `stocksearch-option-${activeIndex}` : undefined
          }
          className="stoxly-input w-full pr-8"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Spinner / clear */}
        <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
          ) : query.length > 0 ? (
            <button
              type="button"
              className="pointer-events-auto text-muted transition-colors hover:text-text-secondary"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              tabIndex={-1}
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L8 6.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L9.06 8l4.72 4.72a.75.75 0 1 1-1.06 1.06L8 9.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L6.94 8 2.22 3.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-small mt-1 text-danger">{error}</p>}

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <ul
          id="stocksearch-listbox"
          ref={listRef}
          role="listbox"
          aria-label="Symbol suggestions"
          className="absolute z-50 mt-1 w-full overflow-auto rounded-xl border border-border bg-card shadow-sm"
          style={{ maxHeight: "260px" }}
        >
          {results.map((result, index) => (
            <li
              key={result.symbol}
              id={`stocksearch-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={cn(
                "flex cursor-pointer items-center justify-between px-3 py-2.5 transition-colors duration-150",
                index === activeIndex
                  ? "bg-primary/10 text-text-primary"
                  : "text-text-primary hover:bg-surface",
                index !== results.length - 1 && "border-b border-border",
              )}
              onPointerDown={(e) => {
                // prevent the input blur from firing before the click
                e.preventDefault();
              }}
              onClick={() => commitSelection(result)}
            >
              <div className="min-w-0">
                <p className="text-body truncate font-medium">
                  {result.name || result.symbol}
                </p>
                <p className="text-small text-text-secondary mt-0.5">
                  <span className="font-semibold text-text-primary">
                    {result.symbol}
                  </span>
                  {result.exchange && (
                    <span className="text-muted"> • {result.exchange}</span>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* No results state */}
      {isOpen &&
        !isLoading &&
        query.trim().length > 0 &&
        results.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card px-3 py-4 text-center shadow-sm">
            <p className="text-small text-muted">
              No results for &ldquo;{query}&rdquo;
            </p>
          </div>
        )}
    </div>
  );
}
