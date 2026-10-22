import { permanentRedirect } from "next/navigation";

/** The section was called "Gear" until it became "Assets": keep old links working. */
export function GET() {
  permanentRedirect("/assets");
}
