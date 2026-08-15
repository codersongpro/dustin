import { afterEach, describe, expect, it, vi } from "vitest";

import { getApps, normalizeApps, type GithubRepository } from "@/lib/apps";

const baseRepository: GithubRepository = {
  name: "sample-app",
  description: "Sample description",
  homepage: "https://sample-app.vercel.app",
  html_url: "https://github.com/codersongpro/sample-app",
  updated_at: "2026-08-14T08:00:00Z",
  private: false,
  archived: false,
  fork: false,
};

function repository(overrides: Partial<GithubRepository> = {}): GithubRepository {
  return { ...baseRepository, ...overrides };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("normalizeApps", () => {
  it("returns only approved fields for an eligible repository", () => {
    const input = {
      ...repository({
        name: "new-app",
        description: "A newly updated app",
        homepage: "https://new-app.vercel.app",
        html_url: "https://github.com/codersongpro/new-app",
        updated_at: "2026-08-15T08:00:00Z",
      }),
      owner: { login: "codersongpro", avatar_url: "https://example.com/avatar.png" },
      email: "private@example.com",
      location: "Private location",
    };

    expect(normalizeApps([input])).toEqual([
      {
        name: "new-app",
        description: "A newly updated app",
        homepage: "https://new-app.vercel.app",
        repositoryUrl: "https://github.com/codersongpro/new-app",
        updatedAt: "2026-08-15T08:00:00Z",
      },
    ]);

    expect(JSON.stringify(normalizeApps([input]))).not.toMatch(
      /email|avatar|location|owner|private/i,
    );
  });

  it.each([
    ["private repository", { private: true }],
    ["archived repository", { archived: true }],
    ["forked repository", { fork: true }],
    ["missing homepage", { homepage: null }],
    ["JavaScript URL", { homepage: "javascript:alert(1)" }],
    ["file URL", { homepage: "file:///tmp/app" }],
    ["malformed URL", { homepage: "not a url" }],
  ])("excludes a %s", (_label, overrides) => {
    expect(normalizeApps([repository(overrides)])).toEqual([]);
  });

  it("uses the approved fallback when the description is missing", () => {
    expect(normalizeApps([repository({ description: null })])[0].description).toBe(
      "소개가 아직 등록되지 않았습니다",
    );
  });

  it("uses curated public metadata while preserving the deployed address", () => {
    const [app] = normalizeApps([
      repository({
        name: "specialedu",
        description: null,
        homepage: "https://spedu-xi.vercel.app",
      }),
    ]);

    expect(app).toMatchObject({
      name: "한아름",
      description:
        "특별실 예약·결보강·학사일정을 한곳에서 관리하는 특수학교 업무 지원 앱",
      homepage: "https://spedu-xi.vercel.app",
    });
  });

  it("removes personal names from curated catalog copy", () => {
    const apps = normalizeApps([
      repository({ name: "jianpython", description: null }),
      repository({ name: "bookquiz", description: null }),
    ]);

    expect(apps.map(({ name, description }) => `${name} ${description}`).join(" ")).not.toMatch(
      /지안|송동석/,
    );
  });

  it("sorts apps by the latest repository update", () => {
    const older = repository({ name: "older", updated_at: "2026-08-13T08:00:00Z" });
    const newer = repository({ name: "newer", updated_at: "2026-08-15T08:00:00Z" });

    expect(normalizeApps([older, newer]).map((app) => app.name)).toEqual([
      "newer",
      "older",
    ]);
  });
});

describe("getApps", () => {
  it("requests the public owner feed and returns normalized apps", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([repository()]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getApps()).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/users/codersongpro/repos?type=owner&sort=updated&per_page=100",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        next: { revalidate: 3600 },
      },
    );
  });

  it("throws a generic error when GitHub rejects the request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("sensitive", { status: 403 })));

    await expect(getApps()).rejects.toThrow("GitHub repository request failed");
    await expect(getApps()).rejects.not.toThrow("sensitive");
  });
});
