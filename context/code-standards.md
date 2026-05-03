# Code Standards

## General

- Keep files small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- Respect the system boundaries defined in `architecture-context.md`.

## Language

- **Client**: JSX (not TSX). No TypeScript on the frontend. ESLint is configured for React.
- **Server**: Plain JavaScript (ESM via `"type": "module"` in `package.json`). No TypeScript.
- Both sides use `import`/`export` — no CommonJS `require()`.

## React (Client)

- All components are function components with hooks. No class components.
- Co-locate closely related state — prefer `useState` in the component that owns it.
- Move shared state to context only when it crosses many components (`AuthContext`).
- `useCallback` and `useMemo` are used to stabilize references passed to children or used in `useEffect` dependency arrays — not as a premature optimization everywhere.
- Custom hooks live in `client/src/hooks/`. Name them `useXxx`.
- Page-level components live in `client/src/lib/pages/`. One file per route.
- Shared UI components live in `client/src/components/`.
- `components/ui/` is shadcn/ui generated output — do not modify these files unless a task explicitly requires it.

## Express (Server)

- Route files in `routes/` only register paths and call controller functions.
- Controllers in `controllers/` handle request/response: parse input, auth check, DB ops, queue enqueuing.
- Services in `services/` encapsulate external API calls (GitHub, Gemini, Groq, email).
- The BullMQ worker in `utils/git.worker.js` is the only place long-running AI work runs.
- Middleware in `middlewares/` is shared logic (auth verification) applied via `app.use()` or per-router.
- Utility modules in `utils/` are stateless pure helpers (crypto, prompt building, readme parsing, etc.).

## Styling

- Tailwind CSS v4. Configuration is in `client/src/index.css` only — no `tailwind.config.js`.
- Use `@theme inline` variables via their Tailwind utility names (`bg-primary`, `text-foreground`, etc.).
- For the brand blue, `bg-[#1d4ed8]` is acceptable since it appears verbatim across components — do not introduce a new variable for it.
- No inline `style={{}}` objects for colors or layout — use Tailwind classes.
- Custom animation classes (`animate-float`, `animate-float-slow`, etc.) are defined in `index.css` and are the only custom CSS allowed beyond `@theme`.
- Border radius scale: `rounded-xl` (buttons/tabs), `rounded-2xl` (stat cards), `rounded-[2rem]` (content cards), `rounded-3xl` (modals).

## API Communication (Client)

- All HTTP calls go through the `api` Axios instance in `client/src/lib/api.js`.
- Use named constants from `ENDPOINTS` — no hardcoded URL strings in components.
- Handle errors in the calling component. Do not swallow errors silently unless explicitly non-critical (e.g., the repos-notification dismiss call).

## API Routes (Server)

- Validate request input before any logic.
- Call `auth.middleware.js` before any route that touches user data.
- Return consistent JSON shapes: `{ message }` for errors, structured objects for data.
- Keep route handlers thin — push complexity into services or the queue worker.

## Data and Storage

- MongoDB is the single datastore. Mongoose schemas are the authoritative contracts.
- GitHub access tokens are stored AES-GCM encrypted. Never log or return them plaintext.
- Section hashes on `ActiveRepo` drive generation mode selection — treat them as first-class data.
- Payment amounts are always in paise (₹1 = 100 paise). Never store fractional amounts.

## Security

- HMAC signatures are verified for both GitHub webhooks and Razorpay webhooks before processing.
- Payment idempotency is enforced by checking `razorpayPaymentId` uniqueness in `PaymentLedger` before crediting a plan.
- Admin routes check `user.admin === true` in the middleware chain.
- JWT secret must be set via `process.env.JWT_SECRET`. Do not hardcode secrets.

## File Naming

- Client: PascalCase for component files (`RepoCard.jsx`, `Home.jsx`), camelCase for hooks and utilities (`useRepos.js`, `api.js`).
- Server: kebab-case with `.type.js` suffix (`github.controller.js`, `user.schema.js`, `gemini.service.js`).
- Name files after the responsibility they contain, not the technology.
