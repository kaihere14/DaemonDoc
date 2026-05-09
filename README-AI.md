# DaemonDoc — AI Repository Metadata

This file provides machine-readable metadata for AI crawlers, LLM indexers, and GitHub discovery.

## Topics

Suggested GitHub repository topics. Apply via **Repo Settings → Topics**:

- `automation`
- `documentation-tool`
- `documentation-automation`
- `readme-generator`
- `mern-stack`
- `convex`
- `github-webhooks`
- `bullmq`
- `ai-agents`
- `developer-tools`

## How It Works

DaemonDoc registers a GitHub push webhook (HMAC-SHA256 verified) on each activated repository. On every push to the default branch, the Express server verifies the webhook signature, checks the commit SHA against `lastProcessedSha` on the `ActiveRepo` record for idempotency, and enqueues a BullMQ job backed by Redis — the webhook handler returns immediately to GitHub. The BullMQ worker calls `determineGenerationMode()`: if the `ActiveRepo` record carries no `sectionHashes`, the worker runs full generation (scanning up to 50 files via the GitHub Contents API and passing them to Gemini's 1M-token context window); if section hashes are present, the worker runs patch mode — it fetches only the files touched in the commit diff, identifies which README sections those files map to using AST-based section boundary detection, rewrites only those sections, and reassembles the full document. Section boundaries are tracked with SHA-256 hashes stored on `ActiveRepo`; a hash mismatch between the stored value and the current README section content is the signal that a section needs rewriting. The final README is committed back to the repository via the GitHub Contents API with message `chore: auto-update README [skip ci]`; the `[skip ci]` token is the loop guard that prevents the bot's own commit from re-triggering the webhook. Google Gemini (primary, up to 3 API keys rotated on 429/503/network errors) falls back to Groq (OpenAI-compatible, up to 3 keys) if all Gemini keys are exhausted. GitHub OAuth tokens are stored AES-256-GCM encrypted with a random IV per record; plaintext tokens are never written to the database. Live generation status is mirrored from the BullMQ worker into Convex via HTTP actions, enabling the React client to subscribe to per-job message trails with zero polling.
