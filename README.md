# CalMate

CalMate is a calorie and nutrition tracker for logging meals and workouts, tracking daily calorie and macro goals, and reviewing progress over time. Data is stored in the browser using `localStorage`.

## Features

- Log meals and workouts manually or describe an entry for AI-assisted parsing.
- Track daily calorie intake, calories burned, and meal macros.
- Set personal calorie and macro goals, with an AI macro calculator.
- Review daily details, history, and weekly summaries.
- Use the app in light or dark theme, with installable PWA support.

## Getting started

Requirements: Node.js and npm.

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:3000`. To use the serverless API routes locally, run Vercel's development server in a second terminal:

```bash
npx vercel dev
```

## Environment variables

Set these variables in the server environment that runs the API routes:

| Variable | Used by |
| --- | --- |
| `GEMINI_API_KEY` | `/api/parse-entry` |
| `MISTRAL_API_KEY` | `/api/calculate-macros` |

For local development, put the keys in `.env.local`. In production, configure them as environment variables in the Vercel project settings.

**Never prefix API keys with `VITE_` or expose them in client-side code.** Vite embeds `VITE_` variables in the browser bundle. The previously exposed Mistral key must be revoked and replaced.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the production frontend |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Deployment

The project uses Vercel serverless functions in the root `api/` directory. Deploy the project to Vercel and configure `GEMINI_API_KEY` and `MISTRAL_API_KEY` in the project's environment settings before using AI features.

## Data and privacy

Meals, workouts, and goals are stored in the browser's local storage. They are not synced between browsers or devices. AI-assisted features send the relevant entry text or macro-calculation inputs to the configured AI provider through the serverless API routes.
