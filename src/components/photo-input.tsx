"use client";

/**
 * Photographs of a machine. Pictures taken with a phone are 3–5 MB each and
 * would fill the server's disk (and a Server Action's body limit) in no time,
 * so each one is drawn into a canvas, scaled down to fit 1600 px and
 * re-encoded as JPEG before it leaves the browser — about 200–400 KB, plenty
 * for a front, a rear panel and a serial plate.
 *
 * The file input the form submits is rebuilt from the resized files, so the
 * server receives only what is shown here.
 */
import { useEffect, useMemo, useRef, useState } from "react";

import type { Media } from "@gohead-cms/client";
import { useI18n } from "@/lib/i18n/client";
import { mediaSrc } from "@/lib/media";

const MAX_SIDE = 1600;
const QUALITY = 0.82;

interface Kept {
  id: number;
  url?: string;
  name?: string;
}

async function downscale(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  // A small picture that is already a JPEG is left alone.
  if (scale === 1 && file.type === "image/jpeg") {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

export function PhotoInput({ existing, max = 8 }: { existing: Array<Media | number>; max?: number }) {
  const { t, p, d } = useI18n();
  const [kept, setKept] = useState<Kept[]>(() =>
    existing.map((m) => (typeof m === "number" ? { id: m } : { id: m.id, url: mediaSrc(m), name: m.name })),
  );
  const [added, setAdded] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Keep the form's file input in step with the list shown.
  useEffect(() => {
    if (!fileRef.current) return;
    const dt = new DataTransfer();
    for (const f of added) dt.items.add(f);
    fileRef.current.files = dt.files;
  }, [added]);

  // Object URLs for what is waiting to be uploaded, released when the list changes.
  const previews = useMemo(() => added.map((f) => URL.createObjectURL(f)), [added]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const room = max - kept.length - added.length;

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const list = [...files].slice(0, Math.max(0, room));
      const resized = await Promise.all(list.map(downscale));
      setAdded((a) => [...a, ...resized]);
    } finally {
      setBusy(false);
    }
  };

  const makeCover = (i: number) => setKept((k) => (i === 0 ? k : [k[i]!, ...k.filter((_, j) => j !== i)]));

  return (
    <div>
      <input type="hidden" name="photo_ids" value={kept.map((k) => k.id).join(",")} />
      <input ref={fileRef} type="file" name="photos" accept="image/*" multiple className="hidden" />

      <div className="flex flex-wrap gap-2">
        {kept.map((k, i) => (
          <figure key={k.id} className="relative w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={k.url} alt={k.name ?? ""} className="h-20 w-28 rounded border border-line object-cover" />
            {i === 0 ? (
              <figcaption className="absolute top-1 left-1 rounded bg-amber px-1 text-[10px] font-medium text-amber-ink">
                {t("assets.photos.cover")}
              </figcaption>
            ) : null}
            <div className="mt-1 flex justify-between text-[11px]">
              {i === 0 ? (
                <span className="text-faint">{t("assets.photos.everywhere")}</span>
              ) : (
                <button type="button" onClick={() => makeCover(i)} className="text-dim hover:text-amber">
                  {t("assets.photos.makeCover")}
                </button>
              )}
              <button type="button" onClick={() => setKept((ks) => ks.filter((_, j) => j !== i))} className="text-faint hover:text-bad">
                {t("assets.remove")}
              </button>
            </div>
          </figure>
        ))}
        {added.map((f, i) => (
          <figure key={`${f.name}-${i}`} className="w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previews[i]} alt="" className="h-20 w-28 rounded border border-amber/60 object-cover" />
            <div className="mt-1 flex justify-between text-[11px]">
              <span className="text-ok">{t("assets.photos.kb", { size: d.number(Math.round(f.size / 1024)) })}</span>
              <button type="button" onClick={() => setAdded((a) => a.filter((_, j) => j !== i))} className="text-faint hover:text-bad">
                {t("assets.remove")}
              </button>
            </div>
          </figure>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className={`rounded-md border border-line-strong px-3 py-1.5 text-sm ${room > 0 ? "cursor-pointer hover:bg-raised" : "opacity-40"}`}>
          {busy ? t("assets.photos.preparing") : kept.length + added.length ? t("assets.photos.addMore") : t("assets.photos.add")}
          <input type="file" accept="image/*" multiple disabled={room <= 0 || busy} className="hidden" onChange={(e) => { void pick(e.target.files); e.target.value = ""; }} />
        </label>
        <span className="text-[11px] text-faint">
          {room > 0 ? p("assets.photos.room", room) : t("assets.photos.limit", { max })} ·{" "}
          {t("assets.photos.hint", { px: MAX_SIDE })}
        </span>
      </div>
    </div>
  );
}
