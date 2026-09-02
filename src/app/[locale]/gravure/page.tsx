import { setRequestLocale } from "next-intl/server";
import { getGravureFeatures } from "@/lib/data";
import { Navigation } from "@/components/ui/Navigation";
import { Footer } from "@/components/ui/Footer";
import { GravureSection } from "@/components/home/GravureSection";

export default async function GravurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const features = getGravureFeatures();
  const agencies = Array.from(
    new Set(features.map((item) => item.agency ?? "Independent")),
  );
  const title =
    locale === "ko"
      ? "그라비아·사진집"
      : locale === "ja"
        ? "グラビア・写真集"
        : "Gravure & photobooks";
  const note =
    locale === "ko"
      ? "공식 개별 원문·발매일·인물 연결을 확인한 항목만 이미지 없이 링크부터 제공합니다."
      : locale === "ja"
        ? "公式の個別原文・発売日・人物の一致を確認した項目を、まず画像なしのリンクで掲載します。"
        : "Entries require an individual official source, release date and identity match; publication begins with image-free links.";
  return (
    <div className="relative min-h-screen">
      <Navigation />
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-[10px] font-bold tracking-[.18em] text-pink-400">
          VERIFIED EDITORIAL
        </p>
        <h1 className="mt-3 text-3xl font-bold text-star-white">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-star-dim">{note}</p>
        {features.length ? (
          <div className="mt-10 space-y-14">
            {agencies.map((agency) => (
              <section key={agency}>
                <div className="mb-5 flex items-end justify-between border-b border-white/10 pb-3">
                  <div>
                    <p className="text-[10px] tracking-[.16em] text-star-dim">
                      AGENCY / LABEL
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white">
                      {agency}
                    </h2>
                  </div>
                  <span className="text-xs text-star-dim">
                    {
                      features.filter(
                        (item) => (item.agency ?? "Independent") === agency,
                      ).length
                    }
                  </span>
                </div>
                <GravureSection
                  gravures={features.filter(
                    (item) => (item.agency ?? "Independent") === agency,
                  )}
                  locale={locale}
                  showHeader={false}
                />
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-10 border-y border-white/10 py-10 text-sm text-star-dim">
            {locale === "ko"
              ? "현재 공개 항목은 0건입니다. 검토 중인 후보는 공개하지 않으며, 공식 개별 원문이 확인된 항목부터 이미지 없이 연결합니다."
              : locale === "ja"
                ? "現在の公開項目は0件です。審査中の候補は公開せず、公式の個別原文を確認できた項目から画像なしで案内します。"
                : "There are currently 0 public entries. Review candidates remain private until an individual official source is verified for image-free linking."}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
