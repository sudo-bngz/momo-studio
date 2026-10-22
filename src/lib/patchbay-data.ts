/** Server side: every patchbay as a view, with the issues that touch it. */
import "server-only";

import { getCables, getDevices } from "@/lib/data";
import { findIssues } from "@/lib/patch";
import { patchbayView, type PatchbayView } from "@/lib/patchbay";
import { toPlanCable, toPlanDevice } from "@/lib/plan-data";
import type { Issue } from "@/lib/patch";

export async function getPatchbays(): Promise<{ views: PatchbayView[]; issues: Map<number, Issue[]>; loops: Issue[] }> {
  const [devices, cables] = await Promise.all([getDevices(), getCables()]);
  const planDevices = devices.map(toPlanDevice);
  const planCables = cables.map(toPlanCable);
  const all = findIssues(planDevices, planCables);
  const views: PatchbayView[] = [];
  const issues = new Map<number, Issue[]>();
  for (const d of devices) {
    if (d.category !== "patchbay" || d.state === "sold") continue;
    const view = patchbayView(toPlanDevice(d), d.patch_points ?? [], planDevices, planCables, all);
    views.push(view);
    // Issues whose cables plug into this patchbay.
    const here = new Set(view.rows.flatMap((r) => [...r.top.ends, ...r.bottom.ends].map((e) => e.cableId)));
    issues.set(
      d.id,
      all.filter((i) => [i.cable, ...(i.others ?? [])].some((c) => here.has(c.id))),
    );
  }
  return { views, issues, loops: all.filter((i) => i.kind === "loop") };
}
