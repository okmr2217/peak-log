-- Reflection の stars / note を Log にコピー
UPDATE logs l
SET
  stars = r.stars,
  note  = r.note,
  "updatedAt" = NOW()
FROM reflections r
WHERE r."logId" = l.id;
