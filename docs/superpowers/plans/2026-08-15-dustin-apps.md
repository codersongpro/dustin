# Dustin Apps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a privacy-conscious catalog that automatically lists deployed public apps from the `codersongpro` GitHub account.

**Architecture:** A Next.js App Router server page fetches the public GitHub repositories endpoint with a 3,600-second revalidation window. A focused normalization module filters repositories and exposes only approved fields; a presentational component renders normal, empty, and error states without client-side data fetching.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS, Vitest, Testing Library, Vercel

## Global Constraints

- Package version starts at `1.0.0`.
- Fetch only public repositories owned by `codersongpro`; exclude archived repositories and forks.
- Display only repositories whose `homepage` is a valid `http://` or `https://` URL.
- Revalidate GitHub data every 3,600 seconds.
- Do not collect, store, render, or forward email, real name, location, avatar, commit author, follower, or private-repository data.
- Do not use a GitHub token or a database.
- Render GitHub descriptions as text, never injected HTML.
- External links open safely with `noopener noreferrer`.
- The first release includes no search, categories, admin UI, or preview images.
- Deploy to Vercel Production and request `https://dustin.vercel.app`; confirm availability during deployment.

---

## File Structure

- `package.json`: project metadata, version `1.0.0`, scripts, and dependencies.
- `tsconfig.json`: strict TypeScript and Next.js compiler settings.
- `next-env.d.ts`: Next.js TypeScript declarations.
- `next.config.ts`: minimal Next.js configuration.
- `eslint.config.mjs`: Next.js lint configuration.
- `vitest.config.ts`: jsdom test environment and path alias.
- `vitest.setup.ts`: Testing Library DOM matchers.
- `.gitignore`: build, dependency, environment, and Vercel-local files.
- `src/lib/apps.ts`: GitHub response boundary, URL validation, privacy-safe normalization, sorting, and cached fetch.
- `src/lib/apps.test.ts`: filtering, normalization, privacy, sorting, and request tests.
- `src/components/app-grid.tsx`: card list plus empty and error states.
- `src/components/app-grid.test.tsx`: accessible UI and safe-link tests.
- `src/app/layout.tsx`: root metadata, font setup, and page shell.
- `src/app/page.tsx`: server-side orchestration between GitHub fetch and `AppGrid`.
- `src/app/globals.css`: responsive visual system and card interactions.
- `README.md`: repository metadata convention, privacy behavior, local commands, and deployment notes.

### Task 1: Project foundation and repository normalization

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.gitignore`
- Create: `src/lib/apps.test.ts`
- Create: `src/lib/apps.ts`

**Interfaces:**
- Consumes: GitHub `GET https://api.github.com/users/codersongpro/repos?type=owner&sort=updated&per_page=100` JSON.
- Produces: `AppSummary`, `normalizeApps(repositories)`, and `getApps()` for later tasks.

- [ ] **Step 1: Create the minimal project and test configuration**

Create `package.json` with version `1.0.0` and scripts `dev`, `build`, `start`, `lint`, `test`, and `test:run`. Install and lock the current stable packages at execution time with:

```powershell
npm.cmd install next@latest react@latest react-dom@latest
npm.cmd install --save-dev typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest eslint@latest eslint-config-next@latest vitest@latest jsdom@latest @testing-library/react@latest @testing-library/jest-dom@latest
```

Expected: `package-lock.json` records exact resolved versions and `npm.cmd audit --omit=dev` reports no known production vulnerability.

Create strict TypeScript settings with `@/*` mapped to `./src/*`, a jsdom Vitest environment, and `@testing-library/jest-dom/vitest` in `vitest.setup.ts`. Ignore `.next`, `node_modules`, coverage, `.env*` except examples, and `.vercel`.

- [ ] **Step 2: Write failing repository-normalization tests**

Create fixtures that contain extra owner and private metadata and assert:

```ts
expect(normalizeApps(repositories)).toEqual([
  {
    name: "new-app",
    description: "A newly updated app",
    homepage: "https://new-app.vercel.app",
    repositoryUrl: "https://github.com/codersongpro/new-app",
    updatedAt: "2026-08-15T08:00:00Z",
  },
]);
```

Add individual tests proving that private, archived, forked, missing-homepage, `javascript:`, malformed, and non-HTTP URLs are excluded; missing descriptions use `소개가 아직 등록되지 않았습니다`; sorting is newest first; and serialized results contain none of `email`, `avatar`, `location`, `owner`, or `private`.

- [ ] **Step 3: Run the tests and verify the expected failure**

Run: `npm.cmd run test:run -- src/lib/apps.test.ts`

Expected: FAIL because `@/lib/apps` does not exist.

- [ ] **Step 4: Implement the minimal privacy-safe data module**

Define only the input fields needed for filtering:

```ts
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
```

Implement `isPublicWebUrl(value: string | null): value is string` with the platform `URL` parser and an explicit `http:`/`https:` protocol check. Implement `normalizeApps(repositories: GithubRepository[]): AppSummary[]` to filter, select only the five output fields, apply the Korean description fallback, and sort by `updatedAt` descending.

Implement `getApps(): Promise<AppSummary[]>` with:

```ts
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
```

Throw a generic `GitHub repository request failed` error when `response.ok` is false. Do not include the response body or account metadata in the error.

- [ ] **Step 5: Run focused tests, lint, and type checks**

Run: `npm.cmd run test:run -- src/lib/apps.test.ts`

Expected: all normalization tests PASS.

Run: `npm.cmd run lint`

Expected: exit code 0.

- [ ] **Step 6: Commit the data boundary**

```bash
git add package.json package-lock.json tsconfig.json next-env.d.ts next.config.ts eslint.config.mjs vitest.config.ts vitest.setup.ts .gitignore src/lib/apps.ts src/lib/apps.test.ts
git commit -m "feat: add privacy-safe GitHub app feed"
```

### Task 2: Accessible app cards and states

**Files:**
- Create: `src/components/app-grid.test.tsx`
- Create: `src/components/app-grid.tsx`

**Interfaces:**
- Consumes: `AppSummary[]` from `src/lib/apps.ts` and `hasError: boolean`.
- Produces: `AppGrid({ apps, hasError })` for the server page.

- [ ] **Step 1: Write failing component tests**

Render one known app and assert its accessible heading, description, visible host, repository link, and `앱 열기` link. Assert both external links have `target="_blank"` and a `rel` value containing `noopener` and `noreferrer`.

Add tests for:

```ts
render(<AppGrid apps={[]} hasError={false} />);
expect(screen.getByText(/Website/)).toBeInTheDocument();

render(<AppGrid apps={[]} hasError />);
expect(screen.getByRole("alert")).toHaveTextContent("잠시 후 다시 시도");
```

- [ ] **Step 2: Run the component tests and verify the expected failure**

Run: `npm.cmd run test:run -- src/components/app-grid.test.tsx`

Expected: FAIL because `AppGrid` does not exist.

- [ ] **Step 3: Implement the minimal component**

Implement:

```ts
interface AppGridProps {
  apps: AppSummary[];
  hasError: boolean;
}
```

Use this state and card structure:

```tsx
export function AppGrid({ apps, hasError }: AppGridProps) {
  if (hasError) {
    return <p role="alert">앱 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>;
  }

  if (apps.length === 0) {
    return <p>등록된 앱이 없습니다. 공개 저장소의 Website에 배포 주소를 등록해 주세요.</p>;
  }

  return (
    <section aria-label="배포된 앱" className="app-grid">
      {apps.map((app) => (
        <article className="app-card" key={app.repositoryUrl}>
          <h2>{app.name}</h2>
          <p className="app-description">{app.description}</p>
          <p className="app-host">{new URL(app.homepage).host}</p>
          <div className="app-links">
            <a href={app.homepage} target="_blank" rel="noopener noreferrer">앱 열기</a>
            <a href={app.repositoryUrl} target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </article>
      ))}
    </section>
  );
}
```

Use semantic `article` elements and headings. Display `new URL(app.homepage).host` as the compact address. Use plain JSX text for descriptions.

- [ ] **Step 4: Run focused component tests**

Run: `npm.cmd run test:run -- src/components/app-grid.test.tsx`

Expected: all component tests PASS.

- [ ] **Step 5: Commit the accessible UI behavior**

```bash
git add src/components/app-grid.tsx src/components/app-grid.test.tsx
git commit -m "feat: render accessible app cards"
```

### Task 3: Responsive page and visual styling

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

**Interfaces:**
- Consumes: `getApps()` and `AppGrid` from Tasks 1 and 2.
- Produces: the complete server-rendered `/` page and responsive styling.

- [ ] **Step 1: Write the server-page orchestration**

Implement `src/app/page.tsx` so it calls `getApps()` in a `try` block, renders `AppGrid` with results, and catches failures without exposing error details:

```tsx
let apps: AppSummary[] = [];
let hasError = false;

try {
  apps = await getApps();
} catch {
  hasError = true;
}

return <AppGrid apps={apps} hasError={hasError} />;
```

Add the approved heading `Dustin Apps` and introduction `직접 만든 웹 앱을 한곳에서 만나보세요`.

- [ ] **Step 2: Add root metadata and layout**

Set title `Dustin Apps` and a concise Korean description. Import `globals.css`. Use a system font stack so no third-party font request or tracking is introduced.

- [ ] **Step 3: Implement the responsive visual system**

Use CSS custom properties for neutral background, white cards, dark text, muted text, border, accent, radius, and shadow. Implement one column by default, two columns from `min-width: 640px`, and three columns from `min-width: 960px`.

Clamp descriptions to two lines. Add subtle card lift on hover only where hover is supported. Add visible `:focus-visible` outlines. Respect `prefers-reduced-motion: reduce` by removing transitions and transforms.

- [ ] **Step 4: Run the complete local quality gate**

Run: `npm.cmd run test:run`

Expected: all tests PASS.

Run: `npm.cmd run lint`

Expected: exit code 0.

Run: `npm.cmd run build`

Expected: production build succeeds and `/` is generated without TypeScript errors.

- [ ] **Step 5: Run privacy and output checks**

Search source and generated page output for forbidden personal fields and ensure none are serialized by application code:

```powershell
rg -n "email|avatar_url|location|followers|commit.author" src
```

Expected: no matches outside negative test fixtures.

Verify the page at mobile, tablet, and desktop widths, keyboard navigation, empty state, error state, and outbound links.

- [ ] **Step 6: Commit the finished page**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat: build Dustin Apps landing page"
```

### Task 4: Documentation, publication, and Vercel verification

**Files:**
- Create: `README.md`
- Modify: project files only if deployment verification reveals a directly related defect.

**Interfaces:**
- Consumes: the verified Next.js application from Tasks 1–3.
- Produces: a public GitHub repository and verified Vercel Production deployment.

- [ ] **Step 1: Document operation without personal data**

Write `README.md` with:

- purpose and privacy boundary;
- automatic registration rule using public repository `Description` and `Website`;
- one-hour refresh expectation;
- `npm install`, `npm run dev`, `npm run test:run`, `npm run lint`, and `npm run build` commands;
- Vercel deployment behavior and the requested domain.

Do not include local paths, internal validation commentary, personal email, or generated-agent references.

- [ ] **Step 2: Re-run all verification before publication**

Run: `npm.cmd run test:run`

Run: `npm.cmd run lint`

Run: `npm.cmd run build`

Expected: every command exits 0.

- [ ] **Step 3: Commit documentation**

```bash
git add README.md
git commit -m "docs: explain app catalog workflow"
```

- [ ] **Step 4: Create and push the public GitHub repository**

Create `codersongpro/dustin` as a public repository, set the local default branch to `main`, add the remote, and push the verified commits. Do not create a pull request, tag, version bump, or GitHub release.

Verify the remote default branch and confirm that only intended project files are present.

- [ ] **Step 5: Deploy to Vercel Production**

Create or link a Vercel project named `dustin`, deploy the verified checkout to Production, and request the project domain `dustin.vercel.app`. If the name is already allocated to another account, stop and report the exact conflict rather than silently choosing a different public name.

- [ ] **Step 6: Verify production behavior**

Confirm the Vercel deployment state is Ready and fetch the Production URL over HTTPS. Check that:

- the response status is 200;
- the page title and approved Korean introduction are present;
- only eligible public repositories appear;
- no forbidden personal or private-repository data appears in HTML;
- at least one displayed app link resolves if eligible repositories currently exist;
- `https://dustin.vercel.app` points to the verified Production deployment.

- [ ] **Step 7: Record final repository and deployment URLs**

Return the GitHub repository URL, Production URL, test/build results, current number of displayed apps, and any repositories excluded for missing or invalid `Website`. Do not create a release unless the user separately authorizes it.
