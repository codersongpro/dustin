import { AppGrid } from "@/components/app-grid";
import { getApps, type AppSummary } from "@/lib/apps";

export default async function Page() {
  let apps: AppSummary[] = [];
  let hasError = false;

  try {
    apps = await getApps();
  } catch {
    hasError = true;
  }

  return (
    <main className="site-shell">
      <header className="hero">
        <p className="eyebrow">web_app_collection</p>
        <h1>Dustin Apps</h1>
        <p className="hero-copy">직접 만든 웹 앱을 한곳에서 만나보세요</p>
        <p className="hero-intro">
          학교 업무 도구부터 교육 게임, 학습 도구까지 카테고리와 최근 업데이트 날짜를 함께 확인할
          수 있습니다.
        </p>
      </header>
      <AppGrid apps={apps} hasError={hasError} />
    </main>
  );
}
