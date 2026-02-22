-- Backfill author_id for existing articles with author text
INSERT INTO public.authors (name)
SELECT DISTINCT author
FROM public.articles
WHERE author IS NOT NULL AND author != ''
ON CONFLICT (name) DO NOTHING;

UPDATE public.articles a
SET author_id = au.id
FROM public.authors au
WHERE a.author IS NOT NULL
  AND a.author != ''
  AND a.author = au.name
  AND a.author_id IS NULL;
