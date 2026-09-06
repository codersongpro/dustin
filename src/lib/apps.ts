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

const EXCLUDED_REPOSITORIES = new Set(["dustin", "jiggu"]);

const CURATED_METADATA: Record<
  string,
  Pick<AppSummary, "name" | "description"> & Partial<Pick<AppSummary, "homepage">>
> = {
  specialedu: {
    name: "한아름",
    description: "특별실 예약·결보강·학사일정에 IEP·수업자료까지 담은 특수교사 업무 지원 앱",
  },
  cbgeg: {
    name: "충북 GEG",
    description: "충북 교원들의 Google 학습공동체와 소모임 활동을 소개하는 커뮤니티 페이지",
  },
  trade: {
    name: "세계로 무역 게임",
    description: "교사가 연 방에 학생들이 접속해 자원을 생산·거래·가공하는 실시간 수업 게임",
  },
  neonescape: {
    name: "NEON ESCAPE",
    description: "폐쇄된 연구시설에서 생존과 보스전을 반복하는 2D 탑다운 로그라이크 게임",
  },
  calender: {
    name: "월별 행사계획",
    description: "학교별 페이지로 월간 행사와 공휴일을 함께 관리하는 학사일정 웹앱",
  },
  ss: {
    name: "티처 메이커",
    description: "학생 지도·민원·행정을 30일간 선택하며 교직을 체험하는 로그라이크 게임",
  },
  touchgame: {
    name: "TouchGame",
    description: "속도·두뇌·수학·협동 등 터치 미니게임 60종을 모은 교실용 게임 모음",
  },
  simcity: {
    name: "배움도시 시뮬레이터",
    description: "도시를 건설하며 사회·경제·교통·환경 개념을 학년별 미션으로 배우는 교육 게임",
  },
  sportsmanager: {
    name: "스포츠매니저",
    description: "감독이 되어 선수단과 전술을 운영하고 팀을 정상으로 이끄는 스포츠 경영 게임",
    homepage: "https://sportsmanager.vercel.app/",
  },
  stockgame: {
    name: "유니콘 시티",
    description: "회사를 키우고 주식·채권·부동산에 투자해 순자산 1위에 도전하는 경제 교육 게임",
    homepage: "https://stockgame-alpha.vercel.app/",
  },
  vibecoderlab: {
    name: "VibeCoder Lab",
    description: "단계별 강의와 실습으로 바이브코딩을 배우고 진도까지 확인하는 수업용 코스웨어",
  },
  jianpython: {
    name: "우주 파이썬 탐험대",
    description: "우주 미션과 미니게임으로 출력·변수·자료형을 익히는 파이썬 입문 앱",
  },
  bookquiz: {
    name: "골든벨 퀴즈 연습",
    description: "위인전과 독도 이야기를 읽고 매일 10문제로 복습하는 골든벨 퀴즈 앱",
  },
  jianpython2: {
    name: "달려라 파이썬",
    description: "영상 강의와 코딩 실습, 미니게임으로 파이썬을 처음부터 익히는 학습 앱",
  },
  sotong: {
    name: "소통픽",
    description: "충북 소통메신저에서 수신 대상을 빠르게 골라 주는 사용자 선택 자동화 도구",
  },
  youquiz: {
    name: "유퀴즈",
    description: "유튜브 공개 영상을 수준에 맞는 영어 퀴즈로 바꿔 주는 학습 웹앱",
  },
  vocamaster: {
    name: "보카마스터",
    description: "단어 목록만 넣으면 예문까지 채워 인쇄용 학습지를 만들어 주는 영단어 도구",
  },
  edunote: {
    name: "에듀노트",
    description: "학생기록·교무행정·수업자료 작성을 AI로 돕는 교사용 프로그램 안내 페이지",
  },
  travel: {
    name: "여행 코스 플래너",
    description: "예산과 테마를 고르면 식당·액티비티·숙소를 날짜별 동선으로 짜 주는 여행 계획 앱",
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
        !EXCLUDED_REPOSITORIES.has(repository.name) &&
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
