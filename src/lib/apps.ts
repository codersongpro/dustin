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
  repositoryUrl: string;
  updatedAt: string;
}

const DESCRIPTION_FALLBACK = "소개가 아직 등록되지 않았습니다";

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
    .map((repository) => ({
      name: repository.name,
      description: repository.description || DESCRIPTION_FALLBACK,
      homepage: repository.homepage as string,
      repositoryUrl: repository.html_url,
      updatedAt: repository.updated_at,
    }))
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
