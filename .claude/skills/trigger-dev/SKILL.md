---
name: trigger-dev
description: Write, configure and deploy Trigger.dev background jobs (tasks, cron schedules, delays, waits, retries, queues, realtime). Use when the owner mentions Trigger.dev, background jobs, delayed or scheduled tasks, or a multi-step email sequence.
---

# Trigger.dev

Read only the reference you need:

- `core-reference.md`: tasks, triggering, batch, runs, queues, retries, idempotency, `wait.for` and `wait.forToken`.
- `config-reference.md`: `trigger.config.ts`, install, CLI (`dev`, `deploy`), env vars, build extensions, GitHub Actions deploys.
- `advanced-reference.md`: lifecycle hooks, middleware, tags, metadata, `schedules.task` (cron), realtime, streams, webhooks, delay and TTL.

## Rules for this repo

- Keep Trigger.dev code in its own folder (for example `jobs/`) with its own `package.json` and `trigger.config.ts`. Do not add npm dependencies to `growth-framework/`, which builds with plain `node build.mjs`.
- Secrets (`TRIGGER_SECRET_KEY`, `TRIGGER_ACCESS_TOKEN`, email API keys) go in the Trigger.dev dashboard or GitHub secrets, never in the repo.
- Blog routines (PSX brief, Success Story Mondays, Wednesday articles, Friday carousels) already run as Claude routines. Do not duplicate them on Trigger.dev unless the owner asks.
- Use `wait.for` for multi-day gaps (no compute cost while waiting) and an idempotency key per recipient so a retry never sends the same email twice.
- Check the free-tier limits on trigger.dev before planning anything that runs often.
- New jobs go to a branch and preview first, like every other manual change.
