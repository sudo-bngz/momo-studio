import type { Media } from "@gohead-cms/client";

/**
 * Where the browser loads a file from. Local uploads go through this app's
 * /media route (signed-in users only, and GoHead needn't be reachable from
 * the browser); S3 or CDN URLs are used as they are.
 */
export function mediaSrc(media: Media | number | null | undefined): string | undefined {
  if (!media || typeof media === "number" || !media.url) return undefined;
  if (/^[a-z][a-z0-9+.-]*:/i.test(media.url) || media.url.startsWith("//")) return media.url;
  return `/media${media.url.startsWith("/") ? "" : "/"}${media.url}`;
}
