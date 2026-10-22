import type { overview as en } from "../en/overview";

export const overview: Record<keyof typeof en, string> = {
  "overview.title": "Vue d'ensemble",
  "overview.subtitle": "Ce qu'il y a dans le studio, comment c'est câblé, et qui vient.",
  "overview.newBooking": "Nouvelle réservation",
  "overview.addAsset": "Ajouter du matériel",

  "overview.stat.assets": "Matériel",
  "overview.stat.assets.hint": "{count} en service",
  "overview.stat.value": "Valeur totale",
  "overview.stat.value.hint": "valeur actuelle, ou prix d'achat",
  "overview.stat.cables": "Câbles",
  "overview.stat.cables.hint": "branchés · {spare} en réserve ou défectueux",
  "overview.stat.cables.hintBroken": "branchés · {spare} en réserve ou défectueux (dont {broken} HS)",
  "overview.stat.issues": "Anomalies de patch",
  "overview.stat.issues.some": "points occupés, points inconnus, incohérences",
  "overview.stat.issues.none": "le plan est cohérent",

  "overview.next14": "14 prochains jours",
  "overview.calendar": "Calendrier →",
  "overview.assetsUsed": "Matériel : {list}",
  "overview.noSessions": "Aucune session réservée dans les deux prochaines semaines.",

  "overview.attention": "À surveiller",
  "overview.warrantyEnds": "garantie jusqu'au {date}",
  "overview.moreIssues.one": "{count} autre anomalie →",
  "overview.moreIssues.other": "{count} autres anomalies →",
  "overview.allWell": "Rien : toutes les machines sont là et le plan est cohérent.",

  "overview.maintenance": "Maintenance récente",
  "overview.unknownDevice": "Machine inconnue",
  "overview.noMaintenance": "Aucune maintenance enregistrée. Note les réparations et les révisions depuis la fiche d'une machine.",
};
