// Runs the kb's OWN logic (fingerprint.ts) over the ticket's reports.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { uniqueById, reporterKey, clusterReports, ticketIssue } from '../kb/support-kb/src/lib/kb/fingerprint.ts';

const KB = 'kb/support-kb';
const reports = JSON.parse(readFileSync(join(KB, 'src/lib/data/reports-4471.json'), 'utf8'));

// placeOf, as places.ts builds it: domain -> product from the tenant files, product as fallback.
const tenantDir = join(KB, 'src/lib/data/tenants');
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
console.log('');
console.log('JSON for later steps:');
console.log(JSON.stringify({ ticket: TICKET, issue, merged: merged.length, clusters: clusters.map(c => ({ fingerprint: c.fingerprint, place: c.place, code: c.code, reports: c.reports.length, people: c.people, firstSeen: c.firstSeen, lastSeen: c.lastSeen, taggedAs: c.taggedAs, isTicketIssue: c.fingerprint === issue })) }, null, 2));
