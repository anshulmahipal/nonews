# ensure-article-short-code

Fetches articles with missing `short_code`, generates codes, and updates those rows in batches.

## Request body

```json
{
  "limit": 50
}
```

- `limit` is optional.
- The function processes up to `limit` rows where `short_code` is `NULL` or an empty string.

## Invoke

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/ensure-article-short-code \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"limit":50}'
```

## Notes

- This function expects `public.articles.short_code` to exist.
- Add a unique index on `articles.short_code` so collisions are retried safely.
