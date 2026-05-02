# White-Label Production Setup

This is the one-time setup you (Ven) run to flip Revvue from a single-tenant
app into the multi-tenant white-label platform on production. Local dev does
not require any of this — `lvh.me` already routes `*.lvh.me` to `127.0.0.1`.

There are four short steps:

1. Run the database migration in Supabase.
2. Add the wildcard domain in Vercel.
3. Add the wildcard CNAME in your DNS provider.
4. Set environment variables in Vercel.
5. (Optional) Hook up Resend for welcome emails.

---

## 1) Database — Supabase

Run the schema in Supabase → SQL Editor (idempotent — safe to re-run):

See the SQL block embedded in `agent-transcripts/<this chat>` Phase 1a. The
short version: it creates `agencies`, `agency_users`, adds `clients.agency_id`,
enables RLS, sets policies, and inserts the default `revvue` agency. Existing
clients are auto-backfilled to that default agency.

Verify:

```sql
select * from agencies where slug = 'revvue';
select count(*) as orphans from clients where agency_id is null;  -- expect 0
```

---

## 2) Vercel — Wildcard Domain

In the Vercel dashboard for the `revvue` project:

1. **Settings → Domains** → Add Domain.
2. Add `revvue.live` (apex). Vercel will give you A/ALIAS records to set.
3. Add `*.revvue.live` (wildcard). Vercel will give you a CNAME record to set.
4. Wait a couple minutes for SSL to provision. Vercel will issue a wildcard
   Let's Encrypt certificate automatically — no extra action needed.

When prompted, also add:
- `www.revvue.live` (canonical redirect target if you want; otherwise skip).

---

## 3) DNS — at your domain registrar (Namecheap / Cloudflare / etc.)

Add these records (Vercel will tell you the exact host values; this is
representative):

| Type  | Host  | Value                       | TTL    |
|-------|-------|-----------------------------|--------|
| A     | @     | 76.76.21.21 (Vercel apex)   | Auto   |
| CNAME | www   | cname.vercel-dns.com        | Auto   |
| CNAME | *     | cname.vercel-dns.com        | Auto   |

> The `*` CNAME is the magic — it routes every subdomain to Vercel, and
> Vercel routes them to the same Next.js deployment. Our middleware in
> `middleware.ts` reads the `Host` header and rewrites internally.

If your registrar is Cloudflare, set the wildcard record to "DNS only"
(grey cloud) for the initial test, then optionally re-enable proxying once
SSL is confirmed working.

Test with:

```bash
dig +short acme.revvue.live    # expect cname.vercel-dns.com
curl -I https://acme.revvue.live/  # expect a 200 or 404 from your app
```

---

## 4) Vercel — Environment Variables

Settings → Environment Variables. Add (Production AND Preview AND Development
unless noted):

| Key                              | Value                              | Notes |
|----------------------------------|------------------------------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL`       | `https://<your-project>.supabase.co` | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | `<anon key>`                       | safe to ship |
| `SUPABASE_SERVICE_ROLE_KEY`      | `<service role key>`               | Production only — never expose |
| `ANTHROPIC_API_KEY`              | `sk-ant-...`                       | Production only |
| `NEXT_PUBLIC_BASE_DOMAIN`        | `revvue.live`                      | |
| `NEXT_PUBLIC_APP_URL`            | `https://revvue.live`              | |
| `NEXT_PUBLIC_FOUNDER_EMAIL`      | `ven@revvue.live`                  | |
| `RESEND_API_KEY`                 | `re_...` (optional)                | leave blank to skip emails |
| `EMAIL_FROM`                     | `Revvue <noreply@revvue.live>`     | only used if Resend configured |

After saving, redeploy: Deployments → … → Redeploy.

---

## 5) (Optional) Resend — Welcome Emails

Welcome emails on signup are stubbed to `console.log` if `RESEND_API_KEY`
is unset. To turn them on:

1. Sign up at https://resend.com.
2. Verify the `revvue.live` sending domain (DKIM / SPF / DMARC records they
   provide).
3. Create an API key, drop it into Vercel as `RESEND_API_KEY`.
4. Redeploy.

The signup endpoint already wraps the email send in a try/catch, so a
Resend outage will never block an agency's signup.

---

## 6) Smoke Tests on Production

After deploy, run through these by hand:

1. `https://revvue.live/` → marketing page renders.
2. `https://revvue.live/r/<existing-slug>` → existing review flow renders (Revvue branding).
3. `https://revvue.live/agencies` → agency landing renders.
4. `https://revvue.live/signup` → signup form renders, validates inputs.
5. Sign up a test agency `acme-test`. After redirect:
   - `https://acme-test.revvue.live/dashboard` → loads.
6. In the dashboard, add a restaurant `marios`.
7. `https://acme-test.revvue.live/r/marios` → branded review page renders.
8. `https://revvue.live/tenant/anything` → 404 (apex direct access guard).

When done, clean up the test agency:

```sql
delete from clients where agency_id = (select agency_id from agencies where slug = 'acme-test');
delete from agency_users where agency_id = (select agency_id from agencies where slug = 'acme-test');
delete from agencies where slug = 'acme-test';
-- (and delete the auth.users row from Supabase Auth UI)
```

---

## Local Development

Local dev needs no DNS or Vercel changes — it uses `lvh.me`, which is a public
DNS service that always resolves `*.lvh.me` to `127.0.0.1`.

```
http://localhost:3000/         apex
http://localhost:3000/agencies marketing
http://localhost:3000/signup   signup form
http://acme.lvh.me:3000/login  agency login
http://acme.lvh.me:3000/dashboard  agency dashboard
http://acme.lvh.me:3000/r/marios   branded review page
```

Make sure `.env.local` has:
```
NEXT_PUBLIC_BASE_DOMAIN=revvue.live
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FOUNDER_EMAIL=ven@revvue.live
```

The signup API auto-detects `localhost`/`lvh.me` and redirects to
`http://{slug}.lvh.me:3000/dashboard` instead of production.
