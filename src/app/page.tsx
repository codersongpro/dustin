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
      </header>
      <AppGrid apps={apps} hasError={hasError} />
    </main>
  );
}
