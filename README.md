# #4471 follow-up — three issues, not one

Challenge S01E03 ("what it shows") from the MEGA.dev course.

The support desk merged **412 reports** into ticket **#4471** on the subject-line rule and closed it as one issue. Placed by where each reporter's tenant runs and by the server code each report carries, the same 412 reports are **three issues**:

| place | code | reports | people | window | outcome |
|---|---|---|---|---|---|
| `sched-prod` | `E-TZ-114` | 349 | 206 | 03:12 → 06:13 | fixed by change #29 — [issue 1](../../issues/1), closed |
| `tram-3` | `E-TZ-114` | 44 | 26 | 03:33 → 06:11 | won't fix, boards retired — [issue 2](../../issues/2), closed |
| `rota-6` | `E-SYNC-04` | 19 | 9 | 03:27 → 06:08 | fixed by change #31 — [issue 3](../../issues/3), closed |

349 + 44 + 19 = 412. The desk counted by intake tags (`sched-prod` 358 · `tram-3` 41 · `rota-6` 13); by place the tags disagree on 9 reports.

## The page, added to the kb

Signed — `signature:` in frontmatter, `<RenderStamp />` at the end, desk ref `DR-JREX-9VRK`.

- **`src/routes/kb/incidents/4471-followup/+page.svx`** — the page, in the kb's routes, so the desk's kb reads it as a page and lists it in the index.
- **`site/kb/incidents/4471-followup.html`** — the page as the desk will see it: a static build of the kb, with the table and chart computed at render time from the exported data.
- `kb-page/4471-followup.svx` — the same page source, standalone copy.
- `kb-page/page-as-desk-sees-it.png` — the same rendered view as an image.

## The tickets

One per issue, filed in this repo's issues, then closed out per the desk's engineering update (rota-6 fixed · change #31; tram-3 won't fix · boards retired):

- [#1](../../issues/1) — sched-prod · E-TZ-114: already fixed by change #29; closed as a duplicate record.
- [#2](../../issues/2) — tram-3 · E-TZ-114: closed, won't fix.
- [#3](../../issues/3) — rota-6 · E-SYNC-04: closed, fixed.

## Reproduce

```bash
node analysis/run.mjs
```

Runs the kb's own logic (`src/lib/kb/fingerprint.ts`, and the tenant lookup from `src/lib/kb/places.ts`) over `data/reports-4471.json`.
