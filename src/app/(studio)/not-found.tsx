import { ButtonLink } from "@/components/ui";
import { getI18n } from "@/lib/i18n";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="py-20 text-center">
      <h1 className="text-xl font-semibold">{t("notFound.title")}</h1>
      <p className="mt-2 text-sm text-dim">{t("notFound.body")}</p>
      <div className="mt-6">
        <ButtonLink href="/">{t("notFound.back")}</ButtonLink>
      </div>
    </div>
  );
}
