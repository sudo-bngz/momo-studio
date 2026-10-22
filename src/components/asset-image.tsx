import type { Media } from "@gohead-cms/client";

import { DeviceFigure, type Figure } from "@/components/device-figure";
import type { DeviceEntry } from "@/lib/data";
import { mediaSrc } from "@/lib/media";
import type { Category } from "@/lib/vocab";

/** What the figure needs to know about a machine to draw it. */
export function figureOf(d: Pick<DeviceEntry, "category" | "code" | "rack_height" | "patch_columns" | "console_channels">): Figure {
  return {
    category: d.category as Category,
    units: d.rack_height ?? undefined,
    columns: d.patch_columns ?? d.console_channels ?? undefined,
    code: d.code,
  };
}

export const coverOf = (d: Pick<DeviceEntry, "photo" | "photos">): Media | number | null | undefined =>
  d.photo ?? (d.photos ?? []).find((m) => m !== null && m !== undefined);

/**
 * A machine's cover photograph, or the drawing of its category when there is
 * none. `fit` is "cover" in a grid of equal tiles and "contain" when the
 * whole machine should be visible.
 */
export function AssetImage({
  device,
  className = "",
  fit = "cover",
}: {
  device: Pick<DeviceEntry, "category" | "code" | "name" | "rack_height" | "patch_columns" | "console_channels" | "photo" | "photos">;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const src = mediaSrc(coverOf(device));
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={device.name} className={`${className} ${fit === "cover" ? "object-cover" : "object-contain"}`} />;
  }
  return (
    <div className={`${className} grid place-items-center bg-[#15171a] p-3`}>
      <DeviceFigure figure={figureOf(device)} className="max-h-full w-full" title={`${device.name}: drawing, no photo yet`} />
    </div>
  );
}
