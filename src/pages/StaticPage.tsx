import { useLanguage } from "../context/LanguageContext";

type StaticPageProps = {
  pageKey: string;
};

export default function StaticPage({ pageKey }: StaticPageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] bg-background flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center bg-white border border-border rounded-3xl shadow-sm p-8 sm:p-12">
        <h1 className="text-3xl font-bold mb-4">{t(`static.${pageKey}.title`)}</h1>
        <p className="text-muted-foreground">{t(`static.${pageKey}.description`)}</p>
      </div>
    </div>
  );
}
