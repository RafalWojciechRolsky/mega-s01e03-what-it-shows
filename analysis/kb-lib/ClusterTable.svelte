<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { clusterReports, ticketIssue, uniqueById, type Report } from '#lib/kb/fingerprint';
  import { placeOf } from '#lib/kb/places';

  let { ticket }: { ticket: number } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const clusters = $derived(clusterReports(merged, placeOf));
  const issue = $derived(ticketIssue(clusters, ticket));
  const time = (iso: string) => iso.slice(11, 16);
  const tags = (c: { taggedAs: Record<string, number> }) =>
    Object.entries(c.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([product, n]) => `${product} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{clusters.length}</strong>
  {clusters.length === 1 ? 'issue' : 'issues'}
</p>

<table>
  <thead>
    <tr><th>place</th><th>code</th><th>reports</th><th>tagged as</th><th>people</th><th>seen</th><th></th></tr>
  </thead>
  <tbody>
    {#each clusters as c (c.fingerprint)}
      <tr class:wrong={c.fingerprint !== issue}>
        <td>{c.place}</td>
        <td><code>{c.code}</code></td>
        <td>{c.reports.length}</td>
        <td class="tags">{tags(c)}</td>
        <td>{c.people}</td>
        <td>{time(c.firstSeen)} → {time(c.lastSeen)}</td>
        <td>{c.fingerprint === issue ? `#${ticket}` : 'not this ticket — no ticket of its own'}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .wrong td { background: var(--warn-bg); }
  .wrong td:last-child { color: var(--warn); font-weight: 600; }
</style>
