import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Page from "@/app/page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Dustin Apps page", () => {
  it("renders the approved introduction and eligible GitHub apps", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              name: "lesson-kit",
              description: "교실 활동 도구",
              homepage: "https://lesson-kit.vercel.app",
              html_url: "https://github.com/codersongpro/lesson-kit",
              updated_at: "2026-08-15T08:00:00Z",
              private: false,
              archived: false,
              fork: false,
            },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    render(await Page());

    expect(screen.getByRole("heading", { level: 1, name: "Dustin Apps" })).toBeInTheDocument();
    expect(screen.getByText("직접 만든 웹 앱을 한곳에서 만나보세요")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "lesson-kit" })).toBeInTheDocument();
  });

  it("shows the safe error state without exposing the GitHub response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("private upstream detail", { status: 500 })),
    );

    render(await Page());

    expect(screen.getByRole("alert")).toHaveTextContent("잠시 후 다시 시도");
    expect(screen.queryByText("private upstream detail")).not.toBeInTheDocument();
  });
});
