# Trigger.dev Configuration Reference

## trigger.config.ts — Full Reference

```typescript
import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // REQUIRED: Project ref from dashboard
  project: "<project-ref>",

  // Directories containing task files (default: ["./trigger"])
  dirs: ["./src/trigger"],

  // Runtime: "node" (default) or "bun"
  runtime: "node",

  // Log level: "debug" | "log" | "info" | "warn" | "error"
  logLevel: "log",

  // Max duration for all tasks (seconds, default: 3600)
  maxDuration: 3600,

  // Default machine preset
  machine: "small-1x",

  // Global retry config
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },

  // Build configuration
  build: {
    external: ["header-generator"],   // packages to NOT bundle
    autoDetectExternal: true,          // auto-detect native packages (default: true)
    keepNames: true,                   // keep function/class names (default: true)
    minify: false,                     // experimental
    extensions: [],                    // build extensions array
  },

  // OpenTelemetry instrumentations
  telemetry: {
    instrumentations: [
      // new PrismaInstrumentation(),
      // new OpenAIInstrumentation(),
    ],
  },

  // Global lifecycle hooks
  onStart: async ({ payload, ctx }) => {},
  onSuccess: async ({ payload, output, ctx }) => {},
  onFailure: async ({ payload, error, ctx }) => {},
  init: async ({ payload, ctx }) => {},
});
```

## Package Installation

```bash
# Required
npm add @trigger.dev/sdk@latest
npm add -D @trigger.dev/build@latest

# Optional: React hooks for realtime
npm add @trigger.dev/react-hooks@latest

# Optional: Python support
npm add @trigger.dev/python@latest
```

Recommended package.json scripts:
```json
{
  "scripts": {
    "dev:trigger": "trigger dev",
    "deploy:trigger": "trigger deploy"
  }
}
```

## Project Structure

```
project-root/
  trigger.config.ts          # MUST be at project root
  .env                       # TRIGGER_SECRET_KEY here
  src/trigger/               # task files (configurable via dirs)
    my-task.ts
  .trigger/                  # build cache (gitignore this)
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `TRIGGER_SECRET_KEY` | Auth with Trigger.dev (per-environment: dev/staging/prod/preview) |
| `TRIGGER_API_URL` | Only for self-hosting (default: https://api.trigger.dev) |
| `TRIGGER_PREVIEW_BRANCH` | Required for preview branch environments |

### Manual SDK Configuration (edge runtimes)
```typescript
import { configure } from "@trigger.dev/sdk";
configure({ secretKey: "tr_preview_xxx", previewBranch: "my-branch" });
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `npx trigger.dev@latest init` | Initialize project |
| `npx trigger.dev@latest dev` | Run local dev server |
| `npx trigger.dev@latest deploy` | Deploy to production |
| `npx trigger.dev@latest deploy --env staging` | Deploy to staging |
| `npx trigger.dev@latest deploy --env preview` | Deploy to preview |
| `npx trigger.dev@latest login` | Authenticate |
| `npx trigger.dev@latest whoami` | Show current user/project |

### Dev Command Options
```bash
npx trigger.dev@latest dev \
  --config trigger.config.ts \
  --project-ref proj_xxx \
  --env-file .env \
  --skip-update-check \
  --analyze-build-output    # debug cold start times
```

### Deploy Command Options
```bash
npx trigger.dev@latest deploy \
  --env prod \              # prod (default), staging, or preview
  --branch my-branch \      # preview branch name
  --dry-run \               # build without deploying
  --skip-promotion \        # don't auto-promote
  --skip-sync-env-vars \
  --local-build             # build Docker locally
```

## Build Extensions

Install `@trigger.dev/build` as devDependency. Add to `build.extensions` array in trigger.config.ts.

### Prisma
```typescript
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

prismaExtension({
  mode: "legacy",
  schema: "prisma/schema.prisma",
  migrate: true,
  directUrlEnvVarName: "DATABASE_URL_UNPOOLED",
})
```

### FFmpeg
```typescript
import { ffmpeg } from "@trigger.dev/build/extensions/core";
ffmpeg()
```

### System Packages (apt-get)
```typescript
import { aptGet } from "@trigger.dev/build/extensions/core";
aptGet({ packages: ["ffmpeg", "libreoffice"] })
```

### Puppeteer
```typescript
import { puppeteer } from "@trigger.dev/build/extensions/puppeteer";
puppeteer()
// Set PUPPETEER_EXECUTABLE_PATH env var in dashboard
```

### Additional Files
```typescript
import { additionalFiles } from "@trigger.dev/build/extensions/core";
additionalFiles({ files: ["./assets/**", "wrangler/wrangler.toml"] })
```

### Additional Packages
```typescript
import { additionalPackages } from "@trigger.dev/build/extensions/core";
additionalPackages({ packages: ["wrangler@1.19.0"] })
```

### Sync Vercel Env Vars
```typescript
import { syncVercelEnvVars } from "@trigger.dev/build/extensions/core";
syncVercelEnvVars()
// Requires: VERCEL_ACCESS_TOKEN, VERCEL_PROJECT_ID, optionally VERCEL_TEAM_ID
```

### Sync Supabase Env Vars
```typescript
import { syncSupabaseEnvVars } from "@trigger.dev/build/extensions/core";
syncSupabaseEnvVars()
// Requires: SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_ID
```

### Python
```typescript
import { pythonExtension } from "@trigger.dev/python/extension";
pythonExtension({
  requirementsFile: "./requirements.txt",
  devPythonBinaryPath: "venv/bin/python",
  scripts: ["src/python/**/*.py"],
})
```

### Custom Build Extension
```typescript
{
  name: "my-extension",
  onBuildComplete: async (context) => {
    if (context.target === "deploy") {
      context.addLayer({
        id: "my-layer",
        image: { pkgs: ["curl"], instructions: ["RUN ..."] },
        dependencies: { "my-pkg": "^1.0.0" },
      });
    }
  },
  externalsForTarget: async (target) => ["my-native-dep"],
}
```

## Deployment

### GitHub Actions (Production)
```yaml
name: Deploy to Trigger.dev
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20.x" }
      - run: npm install
      - run: npx trigger.dev@latest deploy
        env:
          TRIGGER_ACCESS_TOKEN: ${{ secrets.TRIGGER_ACCESS_TOKEN }}
```

### GitHub Actions (Preview)
```yaml
name: Deploy Preview
on:
  pull_request:
    types: [opened, synchronize, reopened, closed]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20.x" }
      - run: npm install
      - run: npx trigger.dev@latest deploy --env preview
        env:
          TRIGGER_ACCESS_TOKEN: ${{ secrets.TRIGGER_ACCESS_TOKEN }}
```

**TRIGGER_ACCESS_TOKEN** is a Personal Access Token (`tr_pat_*`), different from TRIGGER_SECRET_KEY.

## Framework Integration

### Next.js Server Action
```typescript
"use server";
import { myTask } from "@/trigger/my-task";

export async function triggerMyTask(data: any) {
  await myTask.trigger(data);
}
```

### Next.js Route Handler
```typescript
import type { myTask } from "@/trigger/my-task";
import { tasks } from "@trigger.dev/sdk";

export async function POST(req: Request) {
  const payload = await req.json();
  const handle = await tasks.trigger<typeof myTask>("my-task", payload);
  return Response.json(handle);
}
```

### Remix Action
```typescript
import { tasks } from "@trigger.dev/sdk";
import type { myTask } from "src/trigger/example";

export async function action({ request }: ActionFunctionArgs) {
  const payload = await request.json();
  await tasks.trigger<typeof myTask>("my-task", payload);
  return new Response("OK");
}
```

## Monorepo Setup

### Approach 1: Tasks as a Package (recommended)
```
packages/tasks/
  trigger.config.ts
  src/trigger/index.ts    # exports all tasks
  package.json            # @repo/tasks
```

### Approach 2: Tasks in App
```
apps/web/
  trigger.config.ts       # config lives in the app
  src/trigger/
  package.json
```

## Environments

| Environment | Key Prefix | Usage |
|-------------|-----------|-------|
| dev | `tr_dev_*` | Local `trigger dev` |
| staging | `tr_stg_*` | Pre-production testing |
| prod | `tr_prod_*` | Production |
| preview | `tr_preview_*` | Branch-based isolation |
