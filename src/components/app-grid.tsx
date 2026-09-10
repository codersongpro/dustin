import { Icon } from "@/components/icon";
import { formatUpdatedAt, type AppSummary } from "@/lib/apps";

interface AppGridProps {
  apps: AppSummary[];
  hasError: boolean;
}

const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

// Display-only categorization for the badge on each card. Purely cosmetic —
// it does not touch the data fetched/normalized in src/lib/apps.ts.
const CATEGORY_BY_NAME: Record<string, string> = {
  한아름: "학교 업무",
  "충북 GEG": "커뮤니티",
  "세계로 무역 게임": "교육 게임",
  "NEON ESCAPE": "게임",
  "월별 행사계획": "학교 업무",
  "티처 메이커": "게임",
  TouchGame: "게임",
  "배움도시 시뮬레이터": "교육 게임",
  스포츠매니저: "게임",
  "유니콘 시티": "교육 게임",
  "VibeCoder Lab": "학습 도구",
  "우주 파이썬 탐험대": "학습 도구",
  "골든벨 퀴즈 연습": "학습 도구",
  "달려라 파이썬": "학습 도구",
  소통픽: "업무 자동화",
  유퀴즈: "학습 도구",
  보카마스터: "학습 도구",
  에듀노트: "업무 자동화",
  "여행 코스 플래너": "생활 도구",
};
const DEFAULT_CATEGORY = "웹 앱";

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
    <>
      <div className="section-header">
        <p className="section-title">
          <Icon name="apps" size={18} aria-hidden="true" />
          전체 앱
        </p>
        <span className="section-count">{apps.length}개</span>
      </div>
      <section aria-label="배포된 앱" className="app-grid">
        {apps.map((app) => (
          <article className="app-card" key={app.homepage}>
            <span className="app-badge">
              <Icon name="tag" size={12} aria-hidden="true" />
              {CATEGORY_BY_NAME[app.name] ?? DEFAULT_CATEGORY}
            </span>
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
                <Icon name="externalLink" size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
