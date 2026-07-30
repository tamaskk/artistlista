"use client";

import { useEffect, useRef, useState } from "react";
import { inputCls } from "./ui";

/**
 * Szabad szöveges autocomplete: gépelésre szűrt találati lista, kattintásra
 * kitölt — de tetszőleges új érték is beírható (új helyszínhez).
 */
export function AutocompleteInput({
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const q = value.trim().toLowerCase();
  const filtered = (
    q ? options.filter((o) => o.toLowerCase().includes(q) && o.toLowerCase() !== q) : options
  ).slice(0, 8);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        name={name}
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || !filtered.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            choose(filtered[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={`${inputCls} ${error ? "border-bad" : ""}`}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-xl">
          {filtered.map((o, i) => (
            <button
              key={o}
              type="button"
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(o);
              }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-[13px] ${
                i === active ? "bg-accent/10 text-accent" : "hover:bg-chip"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
