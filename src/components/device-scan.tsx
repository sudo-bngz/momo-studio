"use client";

/**
 * Finding the gear that is already plugged in.
 *
 * Two things the browser can see without any help: the MIDI ports (Web MIDI,
 * which Chrome, Edge and Firefox have and Safari has not), and the audio
 * devices the operating system lists. Neither tells us what sockets a machine
 * has on its back — that comes from a template when one matches — but both
 * know its name, which is the part that is tedious to type.
 *
 * Nothing is created until you tick it and press the button.
 */
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useState } from "react";

import { createScannedDevices } from "@/app/actions";
import { Card, Empty, Input, Select } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";
import { certainPorts, gather, suggestCode, type Found, type RawPort } from "@/lib/scan";
import { TEMPLATES } from "@/lib/templates";
import { CATEGORIES, categoryLabel, translatedOptions } from "@/lib/vocab";

interface Row extends Found {
  take: boolean;
  code: string;
  location: string;
}

type State = "idle" | "working" | "done";

export function DeviceScan({ locations, existingCodes }: { locations: Array<{ id: number; name: string }>; existingCodes: string[] }) {
  const { t, p } = useI18n();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [midiState, setMidiState] = useState<State>("idle");
  const [audioState, setAudioState] = useState<State>("idle");
  const [problem, setProblem] = useState<string>("");
  const [state, run, pending] = useActionState(createScannedDevices, {});

  const add = (ports: RawPort[]) => {
    setRows((current) => {
      const have = new Set(current.map((r) => r.key));
      const codes = new Set([...existingCodes, ...current.map((r) => r.code)]);
      const fresh = gather(ports)
        .filter((f) => !have.has(f.key))
        .map((f) => {
          const code = suggestCode(f.name, codes);
          codes.add(code);
          return { ...f, take: true, code, location: "" } satisfies Row;
        });
      return [...current, ...fresh];
    });
  };

  const scanMidi = async () => {
    setProblem("");
    if (typeof navigator === "undefined" || !("requestMIDIAccess" in navigator)) {
      setMidiState("done");
      setProblem(t("scan.midi.unsupported"));
      return;
    }
    setMidiState("working");
    try {
      const access = await (navigator as Navigator & { requestMIDIAccess: (o?: { sysex: boolean }) => Promise<MIDIAccess> }).requestMIDIAccess({
        sysex: false,
      });
      const ports: RawPort[] = [];
      access.inputs.forEach((i) => ports.push({ source: "midi", name: i.name ?? "", manufacturer: i.manufacturer ?? undefined, direction: "in" }));
      access.outputs.forEach((o) => ports.push({ source: "midi", name: o.name ?? "", manufacturer: o.manufacturer ?? undefined, direction: "out" }));
      add(ports);
      if (!ports.length) setProblem(t("scan.midi.empty"));
    } catch {
      setProblem(t("scan.midi.refused"));
    }
    setMidiState("done");
  };

  const scanAudio = async () => {
    setProblem("");
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      setAudioState("done");
      setProblem(t("scan.audio.unsupported"));
      return;
    }
    setAudioState("working");
    try {
      // Without permission the operating system hides the names, which are
      // the only thing we are after. The stream is stopped immediately.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        // Refused: carry on, and show whatever names are available anyway.
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const ports: RawPort[] = devices
        .filter((d) => (d.kind === "audioinput" || d.kind === "audiooutput") && d.label && !/^default|^communications/i.test(d.label))
        .map((d) => ({ source: "audio" as const, name: d.label, direction: d.kind === "audioinput" ? ("in" as const) : ("out" as const) }));
      add(ports);
      if (!ports.length) setProblem(t("scan.audio.empty"));
    } catch {
      setProblem(t("scan.audio.refused"));
    }
    setAudioState("done");
  };

  const patch = (key: string, next: Partial<Row>) => setRows((cur) => cur.map((r) => (r.key === key ? { ...r, ...next } : r)));
  const chosen = rows.filter((r) => r.take && r.name.trim() && r.code.trim());

  const save = () => {
    const data = new FormData();
    data.set(
      "found",
      JSON.stringify(
        chosen.map((r) => ({
          name: r.name.trim(),
          brand: r.brand,
          code: r.code.trim(),
          category: r.category,
          location: r.location || undefined,
          templateId: r.templateId,
          ports: certainPorts(r),
        })),
      ),
    );
    startTransition(() => run(data));
  };

  const categoryOptions = translatedOptions(t, CATEGORIES, categoryLabel);

  return (
    <div className="space-y-6">
      <Card title={t("scan.find")}>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={scanMidi}
            disabled={midiState === "working"}
            className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-amber-ink hover:brightness-110 disabled:opacity-60"
          >
            {midiState === "working" ? t("scan.scanning") : t("scan.midi.button")}
          </button>
          <button
            type="button"
            onClick={scanAudio}
            disabled={audioState === "working"}
            className="rounded-md border border-line-strong px-4 py-2 text-sm hover:bg-raised disabled:opacity-60"
          >
            {audioState === "working" ? t("scan.scanning") : t("scan.audio.button")}
          </button>
        </div>
        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-faint">{t("scan.explain")}</p>
        {problem ? (
          <p role="alert" data-scan-problem className="mt-3 rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
            {problem}
          </p>
        ) : null}
      </Card>

      {rows.length ? (
        <Card
          title={p("scan.found", rows.length)}
          actions={<span className="text-xs text-dim">{p("scan.selected", chosen.length)}</span>}
        >
          <div className="overflow-x-auto">
            <table className="data">
              <thead>
                <tr>
                  <th />
                  <th>{t("scan.col.detected")}</th>
                  <th>{t("scan.col.name")}</th>
                  <th>{t("scan.col.code")}</th>
                  <th>{t("scan.col.category")}</th>
                  <th>{t("scan.col.ports")}</th>
                  <th>{t("scan.col.location")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const tpl = r.templateId ? TEMPLATES.find((x) => x.id === r.templateId) : undefined;
                  return (
                    <tr key={r.key} className={r.take ? "" : "opacity-50"}>
                      <td>
                        <input
                          type="checkbox"
                          className="mt-2 size-4 accent-amber"
                          checked={r.take}
                          onChange={(e) => patch(r.key, { take: e.target.checked })}
                          aria-label={t("scan.aria.take", { name: r.name })}
                        />
                      </td>
                      <td className="max-w-56 text-xs text-faint">
                        <span className="rounded bg-raised px-1 py-0.5 font-mono text-[10px] uppercase tracking-wider">{t(`scan.source.${r.source}`)}</span>{" "}
                        {r.ports.join(", ")}
                      </td>
                      <td className="min-w-40">
                        <Input value={r.name} onChange={(e) => patch(r.key, { name: e.target.value })} aria-label={t("scan.col.name")} />
                        {r.brand ? <span className="mt-0.5 block text-[11px] text-faint">{r.brand}</span> : null}
                      </td>
                      <td className="w-28">
                        <Input value={r.code} onChange={(e) => patch(r.key, { code: e.target.value })} aria-label={t("scan.col.code")} />
                      </td>
                      <td className="w-44">
                        <Select
                          value={r.category}
                          onChange={(e) => patch(r.key, { category: e.target.value as Row["category"] })}
                          options={categoryOptions}
                          aria-label={t("scan.col.category")}
                        />
                      </td>
                      <td className="max-w-48 text-xs">
                        {tpl ? (
                          <span className="text-ok">{t("scan.ports.template", { name: tpl.name })}</span>
                        ) : certainPorts(r).length ? (
                          <span className="text-dim">{t("scan.ports.midiOnly")}</span>
                        ) : (
                          <span className="text-faint">{t("scan.ports.none")}</span>
                        )}
                      </td>
                      <td className="w-44">
                        <Select
                          value={r.location}
                          onChange={(e) => patch(r.key, { location: e.target.value })}
                          options={locations.map((l) => ({ value: l.id, label: l.name }))}
                          empty={t("state.none")}
                          aria-label={t("scan.col.location")}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {state.error ? (
            <p role="alert" data-form-error className="mt-4 rounded-md border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
              {state.error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={pending || !chosen.length}
              className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-amber-ink hover:brightness-110 disabled:opacity-60"
            >
              {pending ? t("action.saving") : p("scan.add", chosen.length)}
            </button>
            <button type="button" onClick={() => router.push("/assets")} className="rounded-md border border-line-strong px-3 py-2 text-sm hover:bg-raised">
              {t("action.cancel")}
            </button>
            <span className="text-xs text-faint">{t("scan.afterwards")}</span>
          </div>
        </Card>
      ) : midiState === "done" || audioState === "done" ? (
        <Empty>{t("scan.nothing")}</Empty>
      ) : null}
    </div>
  );
}
