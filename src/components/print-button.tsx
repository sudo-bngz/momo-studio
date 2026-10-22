"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-md bg-amber px-3 py-1.5 text-sm font-medium text-amber-ink hover:brightness-110">
      Print
    </button>
  );
}
