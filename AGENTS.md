# Agent Instructions

## Required AI Workflow Review

Before beginning AI-assisted implementation, debugging, refactoring, migration, or production fix work in this repository, review [docs/AI_WORKFLOW_GUARDRAILS.md](./docs/AI_WORKFLOW_GUARDRAILS.md).

All implementation, audit, debugging, migration, and refactor work must follow those guardrails.

Default behavior:

- Smallest safe change.
- Lowest blast radius.
- No unrelated file edits.
- No speculative rewrites.
- No refactors during production fixes unless directly required.
- Consider scale, queues, caching, indexes, retries, idempotency, rollback, and operational safety.
