"use client";

/** The photographs of a machine: one large, the others as thumbnails. */
import { useState } from "react";

export function PhotoGallery({ photos, alt }: { photos: Array<{ id: number; src: string; name?: string }>; alt: string }) {
  const [shown, setShown] = useState(0);
  const main = photos[Math.min(shown, photos.length - 1)];
  if (!main) return null;
  return (
    <div>
      <a href={main.src} target="_blank" rel="noreferrer" title="Open the full size">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={main.src} alt={alt} className="w-full rounded-md border border-line object-cover" />
      </a>
      {photos.length > 1 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {photos.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setShown(i)} aria-label={`Photo ${i + 1}`} aria-current={i === shown}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" className={`size-14 rounded border object-cover ${i === shown ? "border-amber" : "border-line hover:border-line-strong"}`} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
