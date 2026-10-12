<script lang="ts">
  import { DEDUPE_CASES } from '#lib/kb/dedupe-cases';
  import { fingerprint, sameIssue } from '#lib/kb/fingerprint';

  const PLACES = ['sched-prod', 'tram-3', 'rota-6'];
  let a = $state({ place: 'sched-prod', subject: 'Times moved by an hour', body: 'App says error e-tz 114.', meta: {} });
  let b = $state({ place: 'tram-3', subject: 'Times moved by an hour', body: '(E-TZ-114)', meta: {} });
</script>

<div class="try">
  {#each [a, b] as side, i (i)}
    <fieldset>
      <legend>report {i === 0 ? 'A' : 'B'}</legend>
      <select bind:value={side.place}>
        {#each PLACES as place (place)}<option>{place}</option>{/each}
      </select>
      <input bind:value={side.subject} aria-label="subject" />
      <textarea bind:value={side.body} rows="2" aria-label="body"></textarea>
      <code>{fingerprint(side) ?? 'no code'}</code>
    </fieldset>
  {/each}
  <p class="verdict" class:dup={sameIssue(a, b)}>{sameIssue(a, b) ? 'same issue — merge' : 'different issues — keep apart'}</p>
</div>

<table>
  <thead><tr><th>case</th><th>same subject</th><th>same issue</th></tr></thead>
  <tbody>
    {#each DEDUPE_CASES as c (c.why)}
      <tr>
        <td>{c.why}</td>
        <td>{c.a.subject === c.b.subject ? 'yes' : 'no'}</td>
        <td class:dup={sameIssue(c.a, c.b)}>{sameIssue(c.a, c.b) ? 'yes' : 'no'}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .try { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; margin: 1rem 0; }
  fieldset { display: grid; gap: 0.4rem; border: 1px solid var(--line); border-radius: 6px; }
  .verdict { grid-column: 1 / -1; margin: 0; font-weight: 600; color: var(--muted); }
  .dup { color: var(--accent); font-weight: 600; }
</style>
