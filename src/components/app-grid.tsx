import { formatUpdatedAt, type AppSummary } from "@/lib/apps";

interface AppGridProps {
  apps: AppSummary[];
  hasError: boolean;
}

const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function AppGrid({ apps, hasError }: AppGridProps) {
  if (hasError) {
    return (
      <p className="status-message" role="alert">
        앱 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  if (apps.length === 0) {
    return (
      <p className="status-message">
        등록된 앱이 없습니다. 공개 저장소의 Website에 배포 주소를 등록해 주세요.
      </p>
    );
  }

  return (
    <section aria-label="배포된 앱" className="app-grid">
      {apps.map((app) => (
        <article className="app-card" key={app.homepage}>
          <h2>{app.name}</h2>
          <p className="app-description">{app.description}</p>
          <div className="app-meta">
            <span className="app-host">{new URL(app.homepage).host}</span>
            <time className="app-updated" dateTime={app.updatedAt}>
              {formatUpdatedAt(app.updatedAt)}
            </time>
          </div>
          <div className="app-links">
            <a className="primary-link" href={app.homepage} {...externalLinkProps}>
              앱 열기
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}
