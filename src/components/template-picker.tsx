"use client";

/**
 * "Start from a template": fills the port list (and brand, model, category,
 * notes, console size) of the device form from a known piece of gear or a
 * generic console / interface / patchbay sized by a few numbers.
 */
import { useState } from "react";

import type { Port } from "@/gohead";
import { PortsEditor } from "@/components/ports-editor";
import { expandTemplate, TEMPLATES } from "@/lib/templates";

export function PortsWithTemplate({ initial, isNew }: { initial: Port[]; isNew: boolean }) {
  const [templateId, setTemplateId] = useState("");
  const [params, setParams] = useState<Record<string, number>>({});
  const [applied, setApplied] = useState<{ key: number; ports: Port[]; consoleChannels?: number; patchColumns?: number } | null>(null);
  const template = TEMPLATES.find((t) => t.id === templateId);
  const values = { ...(template?.params ?? {}), ...params };

  const apply = (form: HTMLFormElement | null) => {
    if (!template) return;
    const e = expandTemplate(template.id, values);
    setApplied({ key: Date.now(), ports: e.ports as Port[], consoleChannels: e.console?.channels, patchColumns: e.patch_columns });
    // Fill the identity fields that are still empty.
    const set = (name: string, v: string | undefined, force = false) => {
      const el = form?.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (!el || v === undefined) return;
      if (force || !el.value) el.value = v;
    };
    set("brand", e.brand);
    set("model", e.model);
    set("category", e.category, true);
    set("notes", e.notes);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-md border border-line bg-raised/50 p-3">
        <label className="block min-w-64 flex-1">
          <span className="mb-1 block text-xs font-medium text-dim">{isNew ? "Start from a template" : "Replace the ports with a template"}</span>
          <select className="control" value={templateId} onChange={(e) => { setTemplateId(e.target.value); setParams({}); }}>
            <option value="">— type the ports by hand —</option>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        {template
          ? Object.entries(template.params).map(([k, v]) => (
              <label key={k} className="block">
                <span className="mb-1 block text-xs text-dim">{k.replace(/_/g, " ")}</span>
                <input
                  className="control w-24"
                  type="number"
                  min={0}
                  max={128}
                  value={values[k] ?? v}
                  onChange={(e) => setParams({ ...params, [k]: Math.max(0, Math.min(128, Number(e.target.value) || 0)) })}
                />
              </label>
            ))
          : null}
        <button type="button" disabled={!template} onClick={(e) => apply(e.currentTarget.form)} className="rounded-md border border-line-strong px-3 py-1.5 text-sm hover:bg-raised disabled:opacity-40">
          Fill the ports
        </button>
        {template?.notes ? <p className="basis-full text-[11px] text-faint">{template.notes}</p> : null}
      </div>
      {applied?.consoleChannels ? <input type="hidden" name="console_channels" value={applied.consoleChannels} /> : null}
      {applied?.patchColumns ? <input type="hidden" name="patch_columns" value={applied.patchColumns} /> : null}
      <PortsEditor key={applied?.key ?? "initial"} initial={applied?.ports ?? initial} />
      {applied ? (
        <p className="mt-2 text-xs text-ok">
          {applied.ports.length} ports filled in. Check them, then save: the device will have every socket of the template.
        </p>
      ) : null}
    </div>
  );
}
