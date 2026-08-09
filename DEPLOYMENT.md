# Deployment — Migraine Genie

Publishing **migraine-genie.com** on Render, with DNS managed at GoDaddy.

The order matters: add the domain in Render *first*, because Render shows you the exact
DNS values to paste into GoDaddy.

---

## 1. Render services

You need two services from this repo:

| Service | Type | Root directory | Build command | Publish / start |
|---|---|---|---|---|
| `migraine-genie-web` | Static Site | `client` | `npm install && npm run build` | Publish dir: `build` |
| `migraine-genie-api` | Web Service | `server` | `npm install && npm run build` | Start: `npm start` |

**Static Site rewrite (required).** This is a single-page app, so any deep link like
`/dashboard` would 404 on a hard refresh without a rewrite rule. On the web service, add
under **Redirects/Rewrites**:

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | Rewrite |

---

## 2. Environment variables

**Web (static site):**

```bash
REACT_APP_API_BASE=https://api.migraine-genie.com
```

⚠️ This is baked in at **build time**, not read at runtime. Any change to it requires a
redeploy of the client — not just a restart.

**API (web service):**

```bash
MONGO_URI=mongodb+srv://...
PORT=5001
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_SITE_URL=https://migraine-genie.com
OPENROUTER_APP_NAME=Migraine Genie
YOUTUBE_API_KEY=...
```

`FIREBASE_SERVICE_ACCOUNT_JSON` accepts the raw service-account JSON or base64-encoded
JSON. If pasting raw JSON into Render, keep the entire value on one line.

---

## 3. Add the domains in Render

Do this before touching GoDaddy.

**On the web service** → Settings → Custom Domains → add **both**:

- `migraine-genie.com` (apex)
- `www.migraine-genie.com`

**On the API service** → add:

- `api.migraine-genie.com`

Render will now display the DNS records it expects. Keep that page open — **use the exact
values Render shows you**, since they can differ per account and change over time.

---

## 4. Configure DNS at GoDaddy

Go to [dcc.godaddy.com](https://dcc.godaddy.com) → **My Products** → find
`migraine-genie.com` → **DNS** → **Manage Zones**.

### Delete the parked records first

A fresh GoDaddy domain ships with parking records that will fight yours. **Delete or edit**:

- The `A` record for `@` pointing at a GoDaddy parking IP (often `Parked`)
- The `CNAME` for `www` pointing to `@`

Also check **Domain Settings → Forwarding** and remove any domain forwarding. GoDaddy
forwarding silently overrides DNS and is the single most common cause of "I set the
records but it still shows a parked page".

### Add these records

| Type | Name | Value | TTL |
|---|---|---|---|
| `A` | `@` | *(the IP Render shows — typically `216.24.57.1`)* | 600 seconds |
| `CNAME` | `www` | `migraine-genie-web.onrender.com` | 600 seconds |
| `CNAME` | `api` | `migraine-genie-api.onrender.com` | 600 seconds |

Notes:

- Use the real `.onrender.com` hostnames of *your* services — the ones above are examples.
- GoDaddy does not support `ALIAS`/`ANAME` at the apex, which is why the root domain uses
  an `A` record instead of a CNAME.
- Enter `@`, `www`, and `api` as the names — **not** the full domain. GoDaddy appends the
  domain automatically; typing `www.migraine-genie.com` produces
  `www.migraine-genie.com.migraine-genie.com`.
- Drop TTL to 600 while setting up so mistakes are cheap to fix. Raise it to 1 hour later.

### Choose a primary domain

In Render, mark either the apex or `www` as primary. Render issues a redirect from the
other one automatically, so visitors converge on a single canonical URL. The SEO tags in
this app use the **apex** (`https://migraine-genie.com`), so make the apex primary — or
update `client/src/config/site.ts` if you prefer `www`.

---

## 5. Verify

DNS usually propagates in 10–30 minutes with a 600s TTL, though it can take longer.

```bash
nslookup migraine-genie.com
```

```bash
nslookup www.migraine-genie.com
```

In Render, each custom domain should move to **Verified**, then issue a TLS certificate
(Let's Encrypt, automatic, a few minutes). Until the certificate is issued you will see
browser security warnings — that is expected, not a misconfiguration.

Check the API is reachable on its own subdomain:

```bash
curl https://api.migraine-genie.com/
```

You should get back `Migraine Genie API is running`.

---

## 6. Firebase authorized domains

Sign-in fails with `auth/unauthorized-domain` until this is done.

Firebase Console → **Authentication → Settings → Authorized domains** → add:

```text
migraine-genie.com
www.migraine-genie.com
migraine-genie-web.onrender.com
```

Under **Authentication → Sign-in method**, confirm Email/Password and Google are enabled.
Password reset emails are sent by Firebase — customize the copy under
**Authentication → Templates → Password reset** so it says Migraine Genie rather than the
default project name.

---

## 7. Post-launch SEO

1. **Google Search Console** — add `migraine-genie.com` as a *Domain* property. It will ask
   for a `TXT` record at `@`; add it in the same GoDaddy DNS panel.
2. **Submit the sitemap** — `https://migraine-genie.com/sitemap.xml`.
3. **Check robots** — `https://migraine-genie.com/robots.txt` should list the sitemap and
   disallow the signed-in routes.
4. **Add `og-image.png`** (1200×630) to `client/public/`. The social preview tags already
   point at it; until the file exists, shared links show no image.
5. **Test the link preview** with the
   [Facebook sharing debugger](https://developers.facebook.com/tools/debug/) and
   [X card validator](https://cards-dev.twitter.com/validator).

---

## Recommended hardening before launch

**Lock down CORS.** The API currently accepts requests from any origin
(`app.use(cors())` in `server/src/server.ts`). Once the domain is live, restrict it:

```ts
app.use(cors({
  origin: [
    'https://migraine-genie.com',
    'https://www.migraine-genie.com',
    'http://localhost:3000',
  ],
}));
```

**Cap AI spend.** Every user's chat spends your OpenRouter credit against a single shared
key. Set a monthly spend limit in the OpenRouter dashboard and add per-user rate limiting
before opening signups publicly.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Still shows the GoDaddy parked page | Domain forwarding is enabled, or the old parking `A` record wasn't deleted |
| Render stuck on "Verifying" | Records added under the wrong name (check for `.migraine-genie.com` appended twice), or DNSSEC is enabled at GoDaddy |
| Certificate pending for hours | DNS not yet resolving to Render; re-check with `nslookup` |
| Site loads but every API call fails | `REACT_APP_API_BASE` wrong, or the client wasn't rebuilt after changing it |
| `auth/unauthorized-domain` on sign-in | Domain not added to Firebase authorized domains |
| Deep links 404 on refresh | Missing `/*` → `/index.html` rewrite rule on the static site |
