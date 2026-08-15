import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AppGrid } from "@/components/app-grid";
import type { AppSummary } from "@/lib/apps";

const app: AppSummary = {
  name: "classroom-tools",
  description: "수업에 바로 쓰는 도구 모음",
  homepage: "https://classroom-tools.vercel.app/path",
  repositoryUrl: "https://github.com/codersongpro/classroom-tools",
  updatedAt: "2026-08-15T08:00:00Z",
};

afterEach(cleanup);

describe("AppGrid", () => {
  it("renders an accessible app card with safe external links", () => {
    render(<AppGrid apps={[app]} hasError={false} />);

    expect(screen.getByRole("heading", { name: "classroom-tools" })).toBeInTheDocument();
    expect(screen.getByText("수업에 바로 쓰는 도구 모음")).toBeInTheDocument();
    expect(screen.getByText("classroom-tools.vercel.app")).toBeInTheDocument();

    const appLink = screen.getByRole("link", { name: "앱 열기" });
    expect(appLink).toHaveAttribute("href", app.homepage);
    expect(appLink).toHaveAttribute("target", "_blank");
    expect(appLink).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(appLink).toHaveAttribute("rel", expect.stringContaining("noreferrer"));

    const repositoryLink = screen.getByRole("link", { name: "GitHub" });
    expect(repositoryLink).toHaveAttribute("href", app.repositoryUrl);
    expect(repositoryLink).toHaveAttribute("target", "_blank");
    expect(repositoryLink).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(repositoryLink).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
  });

  it("explains how to register an app when the list is empty", () => {
    render(<AppGrid apps={[]} hasError={false} />);

    expect(screen.getByText(/Website/)).toBeInTheDocument();
  });

  it("shows a retry message when the initial GitHub request fails", () => {
    render(<AppGrid apps={[]} hasError />);

    expect(screen.getByRole("alert")).toHaveTextContent("잠시 후 다시 시도");
  });
});
