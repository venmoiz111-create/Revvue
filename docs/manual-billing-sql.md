# Manual Billing — SQL Playbook

There is no payment integration in this build. Billing is done by hand:
agency emails Ven, Ven sends a PayPal / Interac / Stripe invoice, agency pays,
Ven runs the SQL below to flip them onto the right plan.

## Plan tiers (informational)

| plan        | $/mo  | max_clients |
|-------------|-------|-------------|
| `trial`     | 0     | 3           |
| `starter`   | 99    | 5           |
| `growth`    | 299   | 25          |
| `scale`     | 799   | 100         |
| `unlimited` | 1499  | 99999       |

These also live in `lib/plans.ts` for the dashboard UI; keep them in sync.

---

## Activate a paid plan (first invoice paid)

Replace `<slug>` with the agency's subdomain slug (the part before `.revvue.live`).

```sql
-- Starter ($99/mo, up to 5 restaurants), 30-day cycle
update agencies
set plan = 'starter',
    max_clients = 5,
    paid_until = now() + interval '30 days'
where slug = '<slug>';
```

```sql
-- Growth ($299/mo, up to 25 restaurants)
update agencies
set plan = 'growth',
    max_clients = 25,
    paid_until = now() + interval '30 days'
where slug = '<slug>';
```

```sql
-- Scale ($799/mo, up to 100 restaurants)
update agencies
set plan = 'scale',
    max_clients = 100,
    paid_until = now() + interval '30 days'
where slug = '<slug>';
```

```sql
-- Unlimited ($1499/mo, no cap)
update agencies
set plan = 'unlimited',
    max_clients = 99999,
    paid_until = now() + interval '30 days'
where slug = '<slug>';
```

## Renew a paid plan (next invoice paid, plan unchanged)

```sql
update agencies
set paid_until = greatest(paid_until, now()) + interval '30 days'
where slug = '<slug>';
```

## Annual / multi-month payment

```sql
update agencies
set paid_until = greatest(paid_until, now()) + interval '12 months'
where slug = '<slug>';
```

## Switch plans mid-cycle

```sql
update agencies
set plan = 'growth',
    max_clients = 25
    -- leave paid_until as-is; pro-rate by hand if you bothered
where slug = '<slug>';
```

## Pause / suspend an agency (locks dashboard, review pages still work)

The dashboard layout treats `plan = 'trial'` past `trial_ends_at` as locked.
For paid agencies past `paid_until`, the dashboard does NOT currently lock —
the cleanest "lock" today is to flip them back to trial:

```sql
update agencies
set plan = 'trial',
    trial_ends_at = now()         -- already expired -> paywall renders
where slug = '<slug>';
```

To fully disable an agency (review pages 404 too), set status:

```sql
update agencies
set status = 'paused'              -- the layout 404s; review pages 404 via tenant lookup
where slug = '<slug>';
```

> Use `paused` only when you really want the customer-facing review pages
> to go dark. For just locking the dashboard, prefer the trial trick above.

## Lookups

```sql
-- Show the current state of an agency
select slug, name, plan, max_clients, trial_ends_at, paid_until, status,
       (select count(*) from clients c where c.agency_id = a.agency_id) as client_count
from agencies a
where slug = '<slug>';

-- Agencies whose paid_until lapses in the next 7 days
select slug, name, contact_email, paid_until
from agencies
where plan <> 'trial'
  and paid_until is not null
  and paid_until between now() and now() + interval '7 days'
order by paid_until asc;

-- Agencies whose trial ends in the next 7 days (good time to email them)
select slug, name, contact_email, trial_ends_at
from agencies
where plan = 'trial'
  and trial_ends_at between now() and now() + interval '7 days'
order by trial_ends_at asc;
```

## Refund / shut down

```sql
-- Hard-stop: 404 their subdomain entirely, keep the row for records
update agencies set status = 'paused' where slug = '<slug>';

-- Nuclear: delete (cascades to agency_users and to clients via the FK,
-- but we left clients FK as-is — orphaned clients would stick around).
-- Recommended: paused + manual review.
```
