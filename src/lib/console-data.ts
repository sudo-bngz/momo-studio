/** Server side: every console as a view, with the issues that touch it. */
import "server-only";

import { consoleView, isConsole, type ConsoleView } from "@/lib/console";
import { getCables, getDevices } from "@/lib/data";
import { findIssues, type Issue } from "@/lib/patch";
import { toPlanCable, toPlanDevice } from "@/lib/plan-data";

export async function getConsoles(): Promise<{ views: ConsoleView[]; issues: Map<number, Issue[]> }> {
  const [devices, cables] = await Promise.all([getDevices(), getCables()]);
  const planDevices = devices.map(toPlanDevice);
  const planCables = cables.map(toPlanCable);
  const all = findIssues(planDevices, planCables);
  const views: ConsoleView[] = [];
  const issues = new Map<number, Issue[]>();
  for (const d of devices) {
    const pd = toPlanDevice(d);
    if (d.state === "sold" || !(isConsole(pd) || (d.category === "mixer" && d.channel_strips?.length))) continue;
    const view = consoleView(pd, d.channel_strips ?? [], planDevices, planCables, all);
    views.push(view);
    const here = new Set([...view.strips.flatMap((s) => s.sockets), ...view.sections.flatMap((s) => s.sockets)].flatMap((k) => k.ends.map((e) => e.cableId)));
    issues.set(d.id, all.filter((i) => [i.cable, ...(i.others ?? [])].some((c) => here.has(c.id))));
  }
  return { views, issues };
}
