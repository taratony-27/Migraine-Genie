# Migraine Genie — Client

React 19 + TypeScript single-page app (Create React App), styled with MUI 6 and
charted with Chart.js. Talks to the [API](../server/README.md) over REST, attaching a
Firebase ID token to every request.

See the [root README](../README.md) for setup and environment variables.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Dev server at http://localhost:3000 |
| `npm run build` | Production build to `build/` |
| `npm test` | Run tests |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

Set `REACT_APP_API_BASE` in `client/.env` to point at the API (defaults to
`http://localhost:5001` in local development). It is baked in at build time, so
rebuild after changing it.

## Layout

```
src/
├── components/   # DailyLog, Visualization, AIAssistant, Medication, …
├── pages/        # Dashboard, Account, Home, VerifyEmail
├── services/     # Axios client (token interceptor), Firebase init
└── utils/        # Timezone-safe date helpers
```
