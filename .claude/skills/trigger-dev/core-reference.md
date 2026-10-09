# Trigger.dev Core Reference

## Tasks

### task() — Basic Task
```typescript
import { task } from "@trigger.dev/sdk";

export const myTask = task({
  id: "my-task",                    // unique identifier
  queue: { concurrencyLimit: 5 },   // optional queue config
  machine: "small-1x",             // optional machine preset
  maxDuration: 300,                // max seconds before TIMED_OUT
  retry: {
    maxAttempts: 10,
    factor: 1.8,
    minTimeoutInMs: 500,
    maxTimeoutInMs: 30_000,
    randomize: false,
    outOfMemory: { machine: "large-1x" }, // retry with bigger machine on OOM
  },
  run: async (payload: { msg: string }, { ctx, signal }) => {
    // ctx.run.id, ctx.run.tags, ctx.run.attempt.number
    // ctx.environment.type ("DEVELOPMENT"|"PRODUCTION"|"STAGING"|"PREVIEW")
    // ctx.task.id, ctx.project.ref
    // signal: AbortSignal for cancellation
    return { result: "done" }; // must be JSON serializable
  },
});
```

### schemaTask() — With Runtime Validation
```typescript
import { schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";

export const validated = schemaTask({
  id: "validated-task",
  schema: z.object({
    name: z.string().default("John"),
    age: z.number(),
    dob: z.coerce.date(),
  }),
  run: async (payload) => {
    // payload is typed AND validated at runtime
    // Note: tasks.trigger("validated-task", data) does NOT validate
  },
});
```

### Hidden Tasks (not exported)
```typescript
const internal = task({
  id: "internal",
  run: async (payload: any) => { /* only callable from other tasks */ },
});

export const public = task({
  id: "public",
  run: async (payload) => {
    await internal.triggerAndWait(payload);
  },
});
```

## Triggering Tasks

### From Backend (no task import needed)
```typescript
import { tasks } from "@trigger.dev/sdk";
import type { myTask } from "~/trigger/my-task"; // TYPE-ONLY import

const handle = await tasks.trigger<typeof myTask>("my-task", { msg: "hello" });
// handle.id — run ID
// handle.publicAccessToken — for frontend realtime subscriptions
```

### From Inside a Task
```typescript
// Fire and forget
const handle = await otherTask.trigger({ data: "foo" });

// Trigger and wait for result
const result = await otherTask.triggerAndWait({ data: "foo" });
if (result.ok) {
  console.log(result.output);
} else {
  console.error(result.error);
}

// Unwrap (throws SubtaskUnwrapError on failure)
const output = await otherTask.triggerAndWait({ data: "foo" }).unwrap();
```

### Trigger Options (all trigger functions)
```typescript
await myTask.trigger(payload, {
  delay: "1h",                  // delay before execution (string or Date)
  ttl: "10m",                   // time-to-live; expires if not started in time
  idempotencyKey: "unique-key", // prevent duplicate runs
  idempotencyKeyTTL: "24h",    // key validity (s, m, h, d)
  queue: "my-queue",            // override queue
  concurrencyKey: "user_123",   // per-key concurrency
  tags: ["user_123", "org_456"],// up to 10 tags
  metadata: { userId: "123" },  // initial metadata
  machine: "large-1x",          // override machine
});
```

### Batch Triggering
```typescript
import { batch } from "@trigger.dev/sdk";

// Same task, multiple payloads
const batchHandle = await myTask.batchTrigger([
  { payload: { item: "a" } },
  { payload: { item: "b" } },
]);

// Same task, wait for all results
const results = await myTask.batchTriggerAndWait([
  { payload: { item: "a" } },
  { payload: { item: "b" } },
]);
for (const run of results.runs) {
  if (run.ok) console.log(run.output);
}

// Different tasks in one batch
const result = await batch.triggerByTaskAndWait([
  { task: taskA, payload: { foo: "bar" } },
  { task: taskB, payload: { baz: "qux" } },
]);

// Max 1000 items per batch (SDK 4.3.1+)
// Do NOT wrap in Promise.all — not supported
```

## Runs

### Run Statuses
- `QUEUED` — waiting for worker
- `DELAYED` — scheduled for future
- `EXECUTING` — running
- `REATTEMPTING` — failed, waiting for retry
- `FROZEN` — paused (wait/checkpoint)
- `COMPLETED` — success
- `CANCELED` — canceled by user
- `FAILED` — all attempts exhausted
- `CRASHED` — OOM or worker crash
- `TIMED_OUT` — exceeded maxDuration
- `EXPIRED` — TTL passed before execution

### Run Management
```typescript
import { runs } from "@trigger.dev/sdk";

const run = await runs.retrieve("run_1234");
await runs.cancel("run_1234");
await runs.replay("run_1234");
await runs.reschedule("run_1234", { delay: "2h" });

// List runs
for await (const run of runs.list({ limit: 20 })) { console.log(run); }

// Subscribe to real-time updates
for await (const run of runs.subscribeToRun(runId)) { console.log(run.status); }
```

## Queues & Concurrency

### Task-Level Queue
```typescript
export const sequential = task({
  id: "sequential",
  queue: { concurrencyLimit: 1 }, // one at a time
  run: async (payload) => {},
});
```

### Named Queues (shared across tasks)
```typescript
import { queue } from "@trigger.dev/sdk";

const myQueue = queue({ name: "shared-queue", concurrencyLimit: 10 });

export const taskA = task({ id: "a", queue: myQueue, run: async () => {} });
export const taskB = task({ id: "b", queue: myQueue, run: async () => {} });
```

### Per-Tenant Concurrency
```typescript
await myTask.trigger(data, {
  queue: "free-users",
  concurrencyKey: data.userId, // separate queue per user
});
```

### Override at Runtime
```typescript
import { queues } from "@trigger.dev/sdk";
await queues.overrideConcurrencyLimit("queue_1234", 5);
await queues.overrideConcurrencyLimit({ type: "task", name: "my-task" }, 20);
```

## Errors & Retrying

### Default Retry Config
3 retries with exponential backoff. Configure per-task or globally in trigger.config.ts.

### AbortTaskRunError — Skip Retries
```typescript
import { AbortTaskRunError } from "@trigger.dev/sdk";

throw new AbortTaskRunError("Invalid API key — permanent failure");
```

### catchError — Control Retry Behavior
```typescript
export const myTask = task({
  id: "my-task",
  catchError: async ({ error, retry, retryAt, retryDelayInMs }) => {
    if (error.message.includes("PERMANENT")) return { skipRetrying: true };
    return { retryAt: new Date(Date.now() + 60000) };
    // or: return { retry: { maxAttempts: 5 } };
    // or: return undefined; // use default behavior
  },
  run: async (payload) => {},
});
```

### retry.fetch() — Smart HTTP Retrying
```typescript
import { retry } from "@trigger.dev/sdk";

const response = await retry.fetch("https://api.example.com/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "value" }),
  retry: {
    byStatus: {
      "429": {
        strategy: "headers",
        limitHeader: "x-ratelimit-limit",
        remainingHeader: "x-ratelimit-remaining",
        resetHeader: "x-ratelimit-reset",
        resetFormat: "unix_timestamp_in_ms",
      },
      "500-599": {
        strategy: "backoff",
        maxAttempts: 10,
        factor: 2,
        minTimeoutInMs: 1000,
        maxTimeoutInMs: 30000,
      },
    },
  },
  timeoutInMs: 5000,
});
```

## Idempotency

### Basic Usage
```typescript
await myTask.trigger(payload, {
  idempotencyKey: "unique-key",
  idempotencyKeyTTL: "24h", // default 30 days
});
```

### Inside Tasks (prevent duplicates during retries)
```typescript
import { idempotencyKeys } from "@trigger.dev/sdk";

// Scoped to current run (prevents duplicates across retries)
const key = await idempotencyKeys.create("child-trigger");
await childTask.trigger(payload, { idempotencyKey: key });

// Global scope (unique across ALL runs)
const globalKey = await idempotencyKeys.create("global-key", { scope: "global" });
```

### Reset a Key
```typescript
await idempotencyKeys.reset("child-task", "my-idempotency-key");
```

## Wait Functions

All waits checkpoint the task — **no compute charges** during waits.

### wait.for / wait.until
```typescript
import { wait } from "@trigger.dev/sdk";

await wait.for({ seconds: 30 });
await wait.for({ minutes: 5 });
await wait.for({ hours: 1 });
await wait.for({ days: 1 });
await wait.until({ date: new Date("2025-01-01") });

// With idempotency (safe across retries)
await wait.for({ seconds: 10 }, { idempotencyKey: "my-wait", idempotencyKeyTTL: "1h" });
```

### wait.forToken — Human-in-the-Loop / External Completion
```typescript
// Create a waitpoint token
const token = await wait.createToken({
  timeout: "24h",
  idempotencyKey: `approval-${id}`,
  idempotencyKeyTTL: "24h",
  tags: ["user:123"],
});

// token.id — token ID
// token.url — pre-signed URL for HTTP POST (no API key needed)

// Wait for external completion
const result = await wait.forToken<{ approved: boolean }>(token);
if (result.ok) console.log(result.output); // { approved: true }

// Complete from SDK
await wait.completeToken(token.id, { data: { approved: true } });

// Complete via HTTP POST to token.url (body is the data)
```
