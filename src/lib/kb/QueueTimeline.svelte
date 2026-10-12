<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, type Report } from '#lib/kb/fingerprint';

  let { ticket, from = '03:00', to = '07:00' }: { ticket: number; from?: string; to?: string } = $props();

  const SLOT = 15;
  const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

  // Received vs merged, per 15 minutes of the night (desk local time).
  const slots = $derived.by(() => {
    const start = minutes(from);
    const count = Math.ceil((minutes(to) - start) / SLOT);
    const rows = Array.from({ length: count }, (_, i) => ({ at: start + i * SLOT, received: 0, merged: 0 }));
    const slotOf = (iso: string) => rows[Math.floor((minutes(iso.slice(11, 16)) - start) / SLOT)];
    for (const r of uniqueById(reports as Report[])) {
      if (r.mergedInto !== ticket) continue;
      const rIn = slotOf(r.receivedAt);
      if (rIn) rIn.received++;
      const rMerged = r.mergedAt ? slotOf(r.mergedAt) : undefined;
      if (rMerged) rMerged.merged++;
    }
    return rows;
  });
  const max = $derived(Math.max(...slots.flatMap((s) => [s.received, s.merged])));
  const label = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const h = (n: number) => (n / max) * 100;
</script>

<figure>
  <svg viewBox="0 0 {slots.length * 24} 140" role="img" aria-label="reports received and merged into #{ticket}, per 15 minutes">
    {#each slots as s, i (s.at)}
      <rect class="in" x={i * 24 + 2} y={110 - h(s.received)} width="9" height={h(s.received)} />
      <rect class="merged" x={i * 24 + 12} y={110 - h(s.merged)} width="9" height={h(s.merged)} />
      {#if s.received > 0}<text x={i * 24 + 6} y={105 - h(s.received)}>{s.received}</text>{/if}
      {#if s.at % 60 === 0}<text x={i * 24 + 12} y="128">{label(s.at)}</text>{/if}
    {/each}
  </svg>
  <figcaption><span class="key in"></span> received · <span class="key merged"></span> merged into #{ticket} · per 15 minutes</figcaption>
</figure>

<style>
  svg { width: 100%; max-width: 640px; }
  .in { fill: var(--warn); }
  .merged { fill: var(--accent); }
  text { font: 8px var(--mono); fill: var(--muted); text-anchor: middle; }
  figcaption { color: var(--muted); font-size: 0.85rem; }
  .key { display: inline-block; width: 0.7em; height: 0.7em; border-radius: 2px; }
  .key.in { background: var(--warn); }
  .key.merged { background: var(--accent); }
</style>
