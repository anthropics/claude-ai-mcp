# Trigger.dev Advanced Features Reference

## Lifecycle Hooks

All hooks receive a single destructured object parameter.

### Per-Task Hooks
```typescript
export const myTask = task({
  id: "my-task",
  onStart: async ({ payload, ctx }) => {},
  onStartAttempt: async ({ payload, ctx }) => {},
  onSuccess: async ({ payload, output, ctx }) => {},
  onFailure: async ({ payload, error, ctx }) => {},
  onComplete: async ({ payload, result, ctx }) => {
    // result.ok for success/failure check
  },
  onWait: async ({ wait }) => {
    // task paused — clean up resources (DB connections, etc.)
  },
  onResume: async ({ wait }) => {
    // task resuming — reinitialize resources
  },
  onCancel: async ({ runPromise, signal }) => {
    // cleanup on cancellation
  },
  catchError: async ({ error, retry, retryAt, retryDelayInMs }) => {
    // control retry: return { skipRetrying: true } or { retryAt: Date }
  },
  run: async (payload, { ctx, signal }) => {},
});
```

### Global Hooks (apply to all tasks)
```typescript
import { tasks } from "@trigger.dev/sdk";

tasks.onStart(({ ctx, payload }) => {});
tasks.onSuccess(({ ctx, output }) => {});
tasks.onFailure(({ ctx, error }) => {});
tasks.onCancel(({ ctx, signal }) => {});
tasks.onWait("name", async ({ ctx }) => {});
tasks.onResume("name", async ({ ctx }) => {});
tasks.onStartAttempt(({ ctx, payload }) => {});
```

## Middleware & Locals

### Middleware (wraps entire task execution)
```typescript
import { locals, tasks, logger, task } from "@trigger.dev/sdk";

// Define a local value type
const DbLocal = locals.create<DbClient>("db");

// Global middleware
tasks.middleware("db-middleware", async ({ ctx, payload, next }) => {
  const db = locals.set(DbLocal, createDbClient());
  await db.connect();
  await next(); // run the task
  await db.disconnect();
});

// Clean up on wait, reinitialize on resume
tasks.onWait("db", async () => {
  const db = locals.getOrThrow(DbLocal);
  await db.disconnect();
});
tasks.onResume("db", async () => {
  const db = locals.getOrThrow(DbLocal);
  await db.connect();
});

// Access in tasks
export const myTask = task({
  id: "my-task",
  run: async (payload) => {
    const db = locals.getOrThrow(DbLocal);
    await db.query("SELECT * FROM users");
  },
});
```

### Per-Task Middleware
```typescript
export const myTask = task({
  id: "my-task",
  middleware: async ({ payload, ctx, next }) => {
    console.log("Before task");
    await next();
    console.log("After task");
  },
  run: async (payload) => {},
});
```

## Tags

Max 10 per run. Format: strings like `"user_123"`, `"org_456"`.

```typescript
import { tags } from "@trigger.dev/sdk";

// Set when triggering
await myTask.trigger(payload, { tags: ["user_123", "org_456"] });

// Add inside a run
await tags.add("product_789");
await tags.add(["tag1", "tag2"]);

// Read in run
const currentTags = ctx.run.tags;

// Subscribe to runs by tag
for await (const run of runs.subscribeToRunsWithTag("user:1234")) {}
```

## Metadata

Up to 256KB per run. Sync operations (non-blocking except `flush`).

```typescript
import { metadata } from "@trigger.dev/sdk";

// Set when triggering
await myTask.trigger(payload, { metadata: { userId: "123" } });

// Inside a run
metadata.set("progress", 0.1);
metadata.set("status", "processing");
metadata.increment("processedRows", 1);
metadata.decrement("remaining", 1);
metadata.append("logs", "Step 1 done");
metadata.remove("logs", "Step 1 done");
metadata.get("progress");
metadata.current(); // get all metadata
await metadata.flush(); // force persist to DB

// Update parent task's metadata (from child task)
metadata.parent.increment("processedRows", 1);
metadata.parent.append("rowRuns", ctx.run.id);
```

## Scheduled Tasks (Cron)

### Declarative (syncs on dev/deploy)
```typescript
import { schedules } from "@trigger.dev/sdk";

export const dailyReport = schedules.task({
  id: "daily-report",
  cron: "0 0 * * *", // midnight UTC
  run: async (payload) => {
    // payload.timestamp — scheduled time (UTC)
    // payload.lastTimestamp — last run time
    // payload.timezone — IANA timezone
    // payload.scheduleId — schedule ID
    // payload.externalId — optional external ID
    // payload.upcoming — next 5 scheduled times
  },
});
```

### Imperative (dynamic schedule creation)
```typescript
const schedule = await schedules.create({
  task: "daily-report",
  cron: "0 0 * * *",
  timezone: "America/New_York", // IANA format, handles DST
  externalId: "user_123456",
  deduplicationKey: "user_123456-reminder",
});
```

## AI Integration

### ai.tool() — Vercel AI SDK Compatible
```typescript
import { ai, schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const searchTask = schemaTask({
  id: "web-search",
  schema: z.object({ query: z.string() }),
  run: async (payload) => {
    return { results: ["result1", "result2"] };
  },
});

const searchTool = ai.tool(searchTask);

export const aiAgent = task({
  id: "ai-agent",
  run: async (payload: { prompt: string }) => {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: payload.prompt,
      tools: { search: searchTool },
    });
    return { text };
  },
});
```

### ai.currentToolOptions()
Access tool execution options inside a schema task wrapped with `ai.tool()`.

## Realtime API

### Backend Subscriptions
```typescript
import { runs } from "@trigger.dev/sdk";

for await (const run of runs.subscribeToRun(runId)) { /* live updates */ }
for await (const run of runs.subscribeToRunsWithTag("user:1234")) {}
for await (const run of runs.subscribeToBatch(batchId)) {}
```

### Public Access Tokens (for frontend)
```typescript
import { auth } from "@trigger.dev/sdk";
const publicToken = await auth.createPublicToken();

// Or use auto-generated token from trigger handle:
const handle = await myTask.trigger(payload);
// handle.publicAccessToken
```

### React Hooks (@trigger.dev/react-hooks)
```typescript
import {
  useRealtimeRun,
  useRealtimeBatch,
  useRealtimeRunsWithTag,
  useRealtimeStream,
  useTaskTrigger,
  useRealtimeTaskTrigger,
  useRealtimeTaskTriggerWithStreams,
  useRealtimeRunWithStreams,
} from "@trigger.dev/react-hooks";

// Subscribe to a run
const { run, error } = useRealtimeRun(runId, { accessToken });

// Trigger from frontend
const { trigger, handle } = useTaskTrigger("my-task", { accessToken });

// Trigger and subscribe
const { trigger, run } = useRealtimeTaskTrigger("my-task", { accessToken });

// Skip columns to reduce data
const { run } = useRealtimeRun(runId, {
  accessToken,
  skipColumns: ["payload", "output"],
});
```

## Realtime Streams

### Define Output Streams
```typescript
import { streams } from "@trigger.dev/sdk";

export const aiStream = streams.output<string>({ id: "ai-output" });
export const progressStream = streams.output<{ step: string; percent: number }>({ id: "progress" });
```

### Write to Streams (inside tasks)
```typescript
await aiStream.append("Hello ");
await aiStream.append("World");

// Or direct:
await streams.append("logs", "Processing started");
```

### Pipe AI SDK to Stream
```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const result = streamText({
  model: openai("gpt-4o"),
  prompt: "Hello",
});
result.textStream.pipeTo(aiStream.writable());
```

### Define Input Streams (bidirectional)
```typescript
export const cancelSignal = streams.input<{ reason?: string }>({ id: "cancel" });
export const approval = streams.input<{ approved: boolean }>({ id: "approval" });

// Consume in task
const result = await cancelSignal.wait();
// or event-based:
cancelSignal.on((data) => { /* handle */ });

// Send from outside
await cancelSignal.send(runId, { reason: "User stopped" });
```

### Read Streams from Backend
```typescript
const stream = await aiStream.read(runId, { timeoutInSeconds: 300 });
for await (const chunk of stream) { console.log(chunk); }
```

## Webhook Handling

### Alert Webhooks
```typescript
import { webhooks } from "@trigger.dev/sdk";

const event = await webhooks.constructEvent(request, process.env.ALERT_WEBHOOK_SECRET!);
// event.type: "alert.run.failed" | "alert.deployment.success" | "alert.deployment.failed"
```

### Stripe Webhook → Task
```typescript
export async function POST(req: Request) {
  const event = stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature")!,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
  await tasks.trigger("handle-stripe-event", event.data.object);
  return new Response("OK");
}
```

## Python Integration

```typescript
import { python } from "@trigger.dev/python";

// Run inline Python
const result = await python.runInline(`print("Hello")`);

// Run a script file
const result = await python.runScript("./python/script.py", ["arg1"]);

// Stream output
const stream = python.stream.runScript("./python/script.py");
for await (const chunk of stream) { console.log(chunk); }
```

Requires `pythonExtension` in build extensions.

## Logging

```typescript
import { logger } from "@trigger.dev/sdk";

logger.debug("Debug", { key: "value" });
logger.info("Info", { key: "value" });
logger.warn("Warning", { key: "value" });
logger.error("Error", { key: "value" });

// console.log/error also work and appear in dashboard
```

## TRQL Query

```typescript
import { query } from "@trigger.dev/sdk";
const result = await query.execute("SELECT run_id, status FROM runs WHERE status = 'Failed' LIMIT 10");
```

## Delay & TTL

```typescript
// Delay execution
await myTask.trigger(payload, { delay: "1h" });
await myTask.trigger(payload, { delay: new Date("2025-01-01") });

// Reschedule a delayed run
await runs.reschedule("run_1234", { delay: "2h" });

// TTL — expire if not started in time
await myTask.trigger(payload, { ttl: "10m" });
```

## Disable maxDuration
```typescript
import { timeout } from "@trigger.dev/sdk";

export const longTask = task({
  id: "long-task",
  maxDuration: timeout.None,
  run: async (payload) => {},
});
```
