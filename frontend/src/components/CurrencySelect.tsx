import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getCurrencyCountryCode } from "@/lib/currency-flags";
import type { Currency } from "@/types/currency";

interface CurrencySelectProps {
  currencies: Currency[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/** Country flag icon for a currency code. Renders nothing if the code is unknown. */
function CurrencyFlag({ code }: { code: string }) {
  const cc = getCurrencyCountryCode(code);
  if (!cc) return null;
  return (
    <ReactCountryFlag
      countryCode={cc}
      svg
      style={{ width: "1.1em", height: "1.1em", borderRadius: "2px", flexShrink: 0 }}
      aria-hidden
    />
  );
}

/**
 * A searchable currency picker built on Popover + Input.
 * Supports filtering by ISO code or full currency name.
 * Shows a country flag beside each currency code.
 */
export function CurrencySelect({
  currencies,
  value,
  onChange,
  disabled,
  placeholder = "Select currency",
}: CurrencySelectProps) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const inputRef            = useRef<HTMLInputElement>(null);

  const selected = currencies.find((c) => c.iso_code === value);

  const filtered = currencies.filter(
    (c) =>
      c.iso_code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Auto-focus search field when popover opens; clear it when it closes.
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-1.5 truncate min-w-0">
            {selected ? (
              <>
                <CurrencyFlag code={selected.iso_code} />
                <span className="font-mono font-semibold">{selected.iso_code}</span>
                <span className="text-muted-foreground text-xs truncate">{selected.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0" align="start">
        {/* Search field */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search currencies…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Currency list */}
        <div className="max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              No currencies found
            </p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.iso_code}
                onClick={() => {
                  onChange(c.iso_code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors ${
                  c.iso_code === value ? "bg-accent/60" : ""
                }`}
              >
                <CurrencyFlag code={c.iso_code} />
                <span className="font-mono font-semibold w-10 shrink-0 text-xs">
                  {c.iso_code}
                </span>
                <span className="text-muted-foreground truncate">{c.name}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
