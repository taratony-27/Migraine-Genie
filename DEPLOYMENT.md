# Deployment Checklist

Use this when publishing Migraine Genie on Render and connecting the GoDaddy domain.

## Render environment variables

Client service:

```bash
REACT_APP_API_BASE=https://your-api-service.onrender.com
```

Server service:

```bash
MONGO_URI=mongodb+srv://...
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
PORT=5001
```

`FIREBASE_SERVICE_ACCOUNT_JSON` may be the raw Firebase service-account JSON or the base64-encoded JSON. If using raw JSON in Render, keep the whole value on one line.

## Firebase Authentication settings

In Firebase Console, open Authentication > Settings > Authorized domains and add:

```text
your-client-service.onrender.com
your-godaddy-domain.com
www.your-godaddy-domain.com
```

Enable Email/Password and Google under Authentication > Sign-in method. Password reset emails are sent by Firebase, so the email template can be customized in Authentication > Templates > Password reset.

## GoDaddy domain to Render

In Render, add the custom domain to the client service first. Render will show the required DNS records.

In GoDaddy DNS, add the records Render provides. Usually this is a `CNAME` for `www` and either an `A` record or forwarding setup for the apex domain.

After DNS verifies in Render, add the GoDaddy domain to Firebase Authorized domains as shown above, then redeploy the client so `REACT_APP_API_BASE` is baked into the build.
