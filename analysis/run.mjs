// Runs the kb's OWN logic (fingerprint.ts) over the ticket's reports.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { uniqueById, reporterKey, clusterReports, ticketIssue } from './kb-lib/fingerprint.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, '..', 'data');

const reports = JSON.parse(readFileSync(join(DATA, 'reports-4471.json'), 'utf8'));

// placeOf, as places.ts builds it: domain -> product from the tenant files, product as fallback.
const tenantDir = join(DATA, 'tenants');
const tenants = readdirSync(tenantDir).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(join(tenantDir, f), 'utf8')));
const productByDomain = new Map(tenants.flatMap(t => t.domains.map(d => [d, t.product])));
const placeOf = (r) => {
  const domain = reporterKey(r.reporter).split('@')[1];
  return (domain && productByDomain.get(domain)) ?? r.product;
};

const TICKET = 4471;
const merged = uniqueById(reports).filter(r => r.mergedInto === TICKET);
const clusters = clusterReports(merged, placeOf);
const issue = ticketIssue(clusters, TICKET);

console.log(`reports in file: ${reports.length} | unique: ${uniqueById(reports).length} | merged into #${TICKET}: ${merged.length}`);
console.log(`clusters (distinct issues): ${clusters.length}`);
console.log(`ticket issue (most of its reports): ${issue}`);
console.log('');
console.log('place        code        reports  people  first->last        tagged as                     verdict');
for (const c of clusters) {
  const tags = Object.entries(c.taggedAs).sort((a,b)=>b[1]-a[1]).map(([p,n])=>`${p} x${n}`).join(', ');
  const t = (iso) => iso.slice(11,16);
  const verdict = c.fingerprint === issue ? `#${TICKET}` : 'NO TICKET OF ITS OWN';
  console.log(`${c.place.padEnd(12)} ${c.code.padEnd(11)} ${String(c.reports.length).padStart(4)}     ${String(c.people).padStart(3)}    ${t(c.firstSeen)}->${t(c.lastSeen)}  ${tags.padEnd(28)}  ${verdict}`);
}
