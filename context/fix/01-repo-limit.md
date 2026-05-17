# Task: Temporarily Disable Free Plan Restrictions

## Context

DaemonDoc has a freemium model with a 5-active-repo limit for free users enforced at activation
time. The upgrade/payment flow exists in the codebase but is not ready for users yet. Free users
are hitting the wall with no way out. This task removes all plan-based restrictions temporarily
via an env flag so the product remains fully usable while feature flag infrastructure is built
separately.

**Do not delete any restriction logic. Do not touch the schema. Only wrap existing checks with
an env guard.**

---

## Pre-Task: Read Before Touching Anything

1. Read `server/src/controllers/github.controller.js` — find the `addRepoActivity` handler and
   locate the block that checks `activeRepoLimit` against the current active repo count.
2. Read `client/src/lib/pages/Home.jsx` — find where the repo toggle is disabled or an upgrade
   nudge is shown when the free plan limit is reached.
3. Read `server/src/utils/git.worker.js` — check if any plan limit is enforced inside the worker
   (likely not, but verify).
4. Read `client/src/lib/pages/Upgrade.jsx` — check if any UI is gated or conditionally hidden
   based on plan status that would confuse a free user seeing the page.

---

## Implementation Tasks

### 1. Server env flag

In `server/.env`, add:

```
DISABLE_PLAN_RESTRICTIONS=true
```

### 2. Client env flag

In `client/.env`, add:

```
VITE_DISABLE_PLAN_RESTRICTIONS=true
```

### 3. Server — repo activation limit check

In `server/src/controllers/github.controller.js`, inside the `addRepoActivity` handler, find the
block that returns a 403 when the user has hit their `activeRepoLimit`. Wrap it with the flag
guard:

```js
const restrictionsDisabled = process.env.DISABLE_PLAN_RESTRICTIONS === "true";
if (
  !restrictionsDisabled &&
  user.activeRepoLimit !== null &&
  activeCount >= user.activeRepoLimit
) {
  return res
    .status(403)
    .json({ message: "Repo limit reached. Upgrade to Pro." });
}
```

Do not change any other logic in this handler.

### 4. Server — worker (if applicable)

In `server/src/utils/git.worker.js`, search for any block that checks `activeRepoLimit` or
`plan`. If found, wrap it with the same guard:

```js
const restrictionsDisabled = process.env.DISABLE_PLAN_RESTRICTIONS === "true";
if (!restrictionsDisabled) {
  // existing limit check block here, unchanged
}
```

If no such block exists, skip this step and note that in a comment.

### 5. Client — repo toggle disabled state

In `client/src/lib/pages/Home.jsx`, find where the activation toggle on a `RepoCard` is set to
`disabled` because the user is at the free plan limit. Add the flag guard:

```js
const restrictionsDisabled =
  import.meta.env.VITE_DISABLE_PLAN_RESTRICTIONS === "true";
```

Then change the disabled condition from:

```js
disabled={isAtLimit && !repo.active}
```

to:

```js
disabled={!restrictionsDisabled && isAtLimit && !repo.active}
```

The exact variable names may differ — read the file first and match the actual condition.

### 6. Client — upgrade nudge / limit banner

In `client/src/lib/pages/Home.jsx`, find any banner, tooltip, or inline message that tells the
user they have hit their repo limit or need to upgrade. Wrap the render with the flag guard:

```jsx
{!restrictionsDisabled && isAtLimit && (
  <UpgradeNudge /> {/* or whatever the actual component/JSX is */}
)}
```

If the `reposDeactivatedNotification` banner in the same file is driven by the free plan limit
(not by an actual admin-triggered deactivation event), apply the same guard to it. If it is
driven by the `reposDeactivatedNotification` field on the user object from the server, leave it
alone — that is a real server-side event, not a client-side limit gate.

### 7. No other files to touch

- Do not modify `server/src/schema/user.schema.js` — `activeRepoLimit` stays on the model.
- Do not modify `applyProPlan()` or any payment logic.
- Do not modify `components/ui/*` or `components/animate-ui/*`.
- Do not modify the Upgrade page unless a specific element actively blocks or confuses a free
  user (read it first and use judgment).
- Do not introduce TypeScript anywhere.

---

## Test Cases

### Server

| #   | What to test                                                                              | Expected result                                                                          |
| --- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| S1  | Free user (plan: "free", activeRepoLimit: 5) activates a 6th repo via the toggle          | Activation succeeds — no 403 returned                                                    |
| S2  | Free user activates a 6th repo and checks MongoDB                                         | `ActiveRepo` document created, `webhookId` populated                                     |
| S3  | Pro user activates a repo                                                                 | Unchanged behaviour — still works                                                        |
| S4  | Set `DISABLE_PLAN_RESTRICTIONS=false` in server env, free user tries to activate 6th repo | 403 returned — confirms the flag actually controls the gate                              |
| S5  | Restart server without the env var present (undefined)                                    | Restrictions stay active — `undefined === "true"` is false, so gate is closed by default |

### Client

| #   | What to test                                                                         | Expected result                                                                               |
| --- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| C1  | Free user with 5 active repos visits `/home`                                         | Repo toggles are all enabled — none are greyed out or disabled                                |
| C2  | Free user with 5 active repos — no upgrade nudge or limit banner visible on the page | No "upgrade to Pro" prompt appears                                                            |
| C3  | Free user toggles a 6th repo on                                                      | Toggle fires, no client-side block, activation request sent to server                         |
| C4  | Set `VITE_DISABLE_PLAN_RESTRICTIONS=false` in client env and rebuild                 | Upgrade nudge reappears, toggles are disabled at limit — confirms the flag controls client UI |
| C5  | Pro user visits `/home`                                                              | Unchanged — no regressions in pro user rendering                                              |

### Regression

| #   | What to test                                | Expected result                                                                                   |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| R1  | Any user deactivates a repo                 | Deactivation still works — no change to that path                                                 |
| R2  | GitHub push webhook fires on an active repo | README generation job enqueues and runs normally                                                  |
| R3  | Admin revokes Pro plan for a user           | `activeRepoLimit` is set back to 5 on the user, excess repos deactivated — this path is untouched |
| R4  | Payment flow runs end to end (if testable)  | Razorpay order created, plan applied — payment logic is untouched                                 |
| R5  | Logs page renders and log rows expand       | Convex subscription unaffected — no regressions                                                   |

---

## Definition of Done

- [ ] `DISABLE_PLAN_RESTRICTIONS=true` in `server/.env`
- [ ] `VITE_DISABLE_PLAN_RESTRICTIONS=true` in `client/.env`
- [ ] Free user can activate more than 5 repos without a 403
- [ ] No upgrade nudge or disabled toggle visible to free users on `/home`
- [ ] Setting either flag to `false` restores the original behaviour
- [ ] No schema changes, no payment logic changes, no component library changes
- [ ] `progress-tracker.md` updated to note this temporary flag was added and that feature flag
      infrastructure is the next step to replace it

---

## Note for Future Feature Flag Work

Every restriction check is now wrapped in:

```js
// server
const restrictionsDisabled = process.env.DISABLE_PLAN_RESTRICTIONS === "true";
if (!restrictionsDisabled) {
  /* limit check */
}

// client
const restrictionsDisabled =
  import.meta.env.VITE_DISABLE_PLAN_RESTRICTIONS === "true";
```

When the feature flag system is ready, replace the env reads with your flag client call and
delete the env vars. The wrapping structure is already the correct shape for a flag check —
no further refactoring needed at the restriction sites.
