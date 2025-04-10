import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const t = useTranslations("Home");
  return (
    <header className="w-full p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">{t("title")}</h1>
      <div className="flex items-center gap-4">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
