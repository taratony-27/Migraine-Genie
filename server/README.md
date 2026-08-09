# Migraine Genie — API

Express + TypeScript REST API backing the Migraine Genie client. Auth is handled by
Firebase (verified server-side with the Admin SDK); data lives in MongoDB via Mongoose.

See the [root README](../README.md) for setup, environment variables, and the full
API reference.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run with nodemon + ts-node, watching `src/` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server from `dist/server.js` |

Listens on `PORT` (default `5001`).

## Layout

```
src/
├── controllers/   # Request handling and business logic
├── models/        # Mongoose schemas
├── routes/        # Route definitions
├── middleware/    # Firebase ID token verification
├── services/      # Firebase Admin, mailer, YouTube
├── db/            # MongoDB connection
└── server.ts      # App entry point
```
