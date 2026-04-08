<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into DaemonDoc. PostHog was already installed and partially instrumented; this session verified the existing setup, set correct environment variable values, supplemented event tracking with error capture and two new engagement events, and created a PostHog dashboard with five insights covering the full user lifecycle.

## Summary of changes

| File                        | Change                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `.env`                      | Set `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` and `VITE_PUBLIC_POSTHOG_HOST` to correct values                            |
| `src/pages/OauthVerify.jsx` | Added `posthog?.captureException(error)` in auth error catch block; added `posthog` to `useEffect` dependency array |
| `src/pages/Upgrade.jsx`     | Added `posthog?.captureException(error)` in payment error catch block                                               |
| `src/pages/Home.jsx`        | Added `usePostHog` import, `posthog` instance, and `repos_refreshed` capture on refresh button click                |
| `src/pages/Logs.jsx`        | Added `usePostHog` import, `posthog` instance, and `logs_refreshed` capture on refresh button click                 |

## Events instrumented

| Event                 | Description                                                                                    | File                                  |
| --------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------- |
| `user_logged_in`      | Fired when a user successfully authenticates via GitHub OAuth; also calls `posthog.identify()` | `src/pages/OauthVerify.jsx`           |
| `user_logged_out`     | Fired when the user clicks Logout; calls `posthog.reset()`                                     | `src/components/AuthNavigation.jsx`   |
| `repo_activated`      | Fired when the user enables AI README updates for a repo                                       | `src/components/RepoCard.jsx`         |
| `repo_deactivated`    | Fired when the user disables AI README updates for a repo                                      | `src/components/RepoCard.jsx`         |
| `plan_limit_reached`  | Fired when a user hits the free-plan active repo limit                                         | `src/components/RepoCard.jsx`         |
| `upgrade_initiated`   | Fired when the user opens the Razorpay checkout                                                | `src/pages/Upgrade.jsx`               |
| `payment_completed`   | Fired when Razorpay payment is verified and the plan is upgraded to Pro                        | `src/pages/Upgrade.jsx`               |
| `payment_failed`      | Fired when a Razorpay payment fails                                                            | `src/pages/Upgrade.jsx`               |
| `pricing_cta_clicked` | Fired when a landing page visitor clicks "Upgrade to Pro" in the pricing section               | `src/components/features/Pricing.jsx` |
| `account_deleted`     | Fired when a user permanently deletes their account                                            | `src/pages/Profile.jsx`               |
| `repos_refreshed`     | Fired when the user manually refreshes the repositories list                                   | `src/pages/Home.jsx`                  |
| `logs_refreshed`      | Fired when the user manually refreshes the activity logs feed                                  | `src/pages/Logs.jsx`                  |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/373947/dashboard/1443796
- **Upgrade conversion funnel** (pricing CTA → checkout → payment): https://us.posthog.com/project/373947/insights/bhBA7fQu
- **Daily active users (logins)**: https://us.posthog.com/project/373947/insights/TNYItRU4
- **Repository activation vs deactivation**: https://us.posthog.com/project/373947/insights/TS2eL8uh
- **Plan limit → upgrade funnel**: https://us.posthog.com/project/373947/insights/1dzFMhLR
- **Churn signals (logouts & deletions)**: https://us.posthog.com/project/373947/insights/dH9uehBU

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
