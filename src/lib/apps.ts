export interface GithubRepository {
  name: string;
  description: string | null;
  homepage: string | null;
  html_url: string;
  updated_at: string;
  private: boolean;
  archived: boolean;
  fork: boolean;
}

export interface AppSummary {
  name: string;
  description: string;
  homepage: string;
  updatedAt: string;
}

const DESCRIPTION_FALLBACK = "소개가 아직 등록되지 않았습니다";

const CURATED_METADATA: Record<
  string,
  Pick<AppSummary, "name" | "description"> & Partial<Pick<AppSummary, "homepage">>
> = {
  specialedu: {
    name: "한아름",
    description: "특별실 예약·결보강·학사일정을 한곳에서 관리하는 특수학교 업무 지원 앱",
  },
  cbgeg: {
    name: "충북 GEG",
    description: "충북 Google Educator Group과 소모임 활동을 소개하는 커뮤니티 페이지",
  },
  trade: {
    name: "세계로 무역 게임",
    description: "생산·거래·가공을 직접 체험하며 무역을 배우는 실시간 수업 게임",
  },
  neonescape: {
    name: "NEON ESCAPE",
    description: "미래 연구시설의 스테이지와 보스를 돌파하는 2D 로그라이크 게임",
  },
  calender: {
    name: "월별 행사계획",
    description: "학교의 월간 행사와 공휴일을 한눈에 관리하는 일정 웹앱",
  },
  ss: {
    name: "티처 메이커",
    description: "신규 교사의 30일 학교생활을 선택과 성장으로 풀어낸 교직 로그라이크 게임",
  },
  touchgame: {
    name: "TouchGame",
    description: "교실에서 빠르게 즐길 수 있는 터치 친화형 미니게임 60종 모음",
  },
  simcity: {
    name: "배움도시 시뮬레이터",
    description: "도시를 건설하며 사회·경제·교통·환경 개념을 배우는 교육 게임",
  },
  sportsmanager: {
    name: "스포츠매니저",
    description: "감독이 되어 선수단과 전술을 운영하고 팀을 정상으로 이끄는 스포츠 게임",
    homepage: "https://sportsmanager.vercel.app/",
  },
  stockgame: {
    name: "유니콘 시티",
    description: "회사를 경영하고 다양한 자산에 투자해 순자산을 키우는 경제 교육 게임",
    homepage: "https://stockgame-alpha.vercel.app/",
  },
  vibecoderlab: {
    name: "VibeCoder Lab",
    description: "단계별 강의와 실습으로 바이브코딩을 배우는 인터랙티브 코스웨어",
  },
  jianpython: {
    name: "우주 파이썬 탐험대",
    description: "우주 탐험 이야기와 코딩 실습으로 파이썬 기초를 배우는 학습 앱",
  },
  bookquiz: {
    name: "골든벨 퀴즈 연습",
    description: "한국 위인과 독도 이야기를 읽고 퀴즈로 복습하는 학습 앱",
  },
  jianpython2: {
    name: "달려라 파이썬",
    description: "영상·코딩 실습·미니게임으로 파이썬을 단계별로 익히는 학습 앱",
  },
  sotong: {
    name: "소통픽",
    description: "충북 소통메신저에서 수신 대상을 빠르게 선택하도록 돕는 자동화 도구",
  },
  youquiz: {
    name: "유퀴즈",
    description: "유튜브 공개 영상을 영어 학습용 퀴즈로 바꿔주는 가족용 학습 웹앱",
  },
  vocamaster: {
    name: "보카마스터",
    description: "원하는 단어 목록으로 인쇄용 어휘 학습지를 자동으로 만들어주는 영단어 학습 도구",
  },
  edunote: {
    name: "에듀노트",
    description: "학생기록·교무 업무·수업자료 작성을 돕는 교사용 AI 어시스턴트",
  },
  travel: {
    name: "여행 코스 플래너",
    description: "예산과 테마를 고르면 식당·액티비티·숙소를 날짜별 동선으로 짜주는 여행 계획 웹앱",
  },
};

export function formatUpdatedAt(updatedAt: string): string {
  return updatedAt.slice(0, 10).replaceAll("-", ".");
}

export function isPublicWebUrl(value: string | null): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeApps(repositories: GithubRepository[]): AppSummary[] {
  return repositories
    .filter(
      (repository) =>
        !repository.private &&
        !repository.archived &&
        !repository.fork &&
        isPublicWebUrl(repository.homepage),
    )
    .map((repository) => {
      const metadata = CURATED_METADATA[repository.name];

      return {
        name: metadata?.name || repository.name,
        description:
          metadata?.description || repository.description || DESCRIPTION_FALLBACK,
        homepage: metadata?.homepage || (repository.homepage as string),
        updatedAt: repository.updated_at,
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getApps(): Promise<AppSummary[]> {
  const response = await fetch(
    "https://api.github.com/users/codersongpro/repos?type=owner&sort=updated&per_page=100",
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    throw new Error("GitHub repository request failed");
  }

  const repositories = (await response.json()) as GithubRepository[];
  return normalizeApps(repositories);
}
