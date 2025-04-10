import { useTranslations } from "next-intl";

export function MainSection(){
    const t = useTranslations("Home");
    return (
        <main className="p-4">
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">{t("title")}</h2>
          <p>{t("content")}</p>
        </div>
      </main>
    )
}
