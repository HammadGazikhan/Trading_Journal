"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Market } from "@/types";
import {
  highlightMatch,
  instrumentService,
} from "@/lib/instruments/instrument-service";
import type { InstrumentDefinition } from "@/lib/instruments/types";

interface InstrumentComboboxProps {
  market: Market;
  value: string;
  onChange: (symbol: string) => void;
  onInstrumentSelect?: (instrument: InstrumentDefinition | null) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  placeholder?: string;
}

export function InstrumentCombobox({
  market,
  value,
  onChange,
  onInstrumentSelect,
  disabled = false,
  loading = false,
  error,
  placeholder = "Search symbol...",
}: InstrumentComboboxProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const results = instrumentService.searchInstruments({
    market,
    query,
    limit: 60,
  });

  const selectedInstrument = value
    ? instrumentService.getInstrument(value, market)
    : null;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, market]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery(value);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, value]);

  const selectInstrument = useCallback(
    (instrument: InstrumentDefinition) => {
      onChange(instrument.symbol);
      onInstrumentSelect?.(instrument);
      setQuery(instrument.symbol);
      setOpen(false);
      inputRef.current?.blur();
    },
    [onChange, onInstrumentSelect]
  );

  const handleClear = () => {
    onChange("");
    onInstrumentSelect?.(null);
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          results.length === 0 ? 0 : (prev + 1) % results.length
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          results.length === 0
            ? 0
            : (prev - 1 + results.length) % results.length
        );
        break;
      case "Enter":
        event.preventDefault();
        if (results[highlightedIndex]) {
          selectInstrument(results[highlightedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        setQuery(value);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "group flex h-10 items-center gap-2 rounded-[4px] border bg-surface px-3 transition-all duration-200",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          error ? "border-destructive" : "border-border hover:border-primary/40",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          role="combobox"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (!event.target.value) {
              onChange("");
              onInstrumentSelect?.(null);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Clear instrument"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        )}
      </div>

      {open && !disabled && (
        <div
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border border-border",
            "bg-card/95 shadow-2xl backdrop-blur-md",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
          )}
        >
          <ul
            id={listboxId}
            role="listbox"
            className="max-h-64 overflow-y-auto overscroll-contain py-1"
          >
            {results.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                No instruments found for &quot;{query}&quot;
              </li>
            ) : (
              results.map((instrument, index) => {
                const isHighlighted = index === highlightedIndex;
                const isSelected = instrument.symbol === value;

                return (
                  <li key={instrument.symbol} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => selectInstrument(instrument)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors",
                        isHighlighted
                          ? "bg-primary/10 text-foreground"
                          : "text-foreground hover:bg-secondary/60",
                        isSelected && "border-l-2 border-primary bg-primary/5"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm font-semibold tracking-wide">
                          {highlightMatch(instrument.symbol, query).map(
                            (part, partIndex) => (
                              <span
                                key={`${instrument.symbol}-${partIndex}`}
                                className={cn(
                                  part.match && "text-primary"
                                )}
                              >
                                {part.text}
                              </span>
                            )
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {instrument.name}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {instrument.assetClass}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {selectedInstrument && !open && (
        <p className="mt-1.5 truncate text-xs text-muted-foreground">
          {selectedInstrument.name}
        </p>
      )}

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
