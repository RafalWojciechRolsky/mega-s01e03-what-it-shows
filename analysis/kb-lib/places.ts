// Where a report comes from: the product its reporter's tenant runs. Intake's `product` is only
// the fallback, for reports nobody can trace to a tenant.
import { reporterKey, type Report } from '#lib/kb/fingerprint';

type Tenant = { name: string; domains: string[]; product: string };

// The desk's tenant directory, one file per tenant.
const tenants = Object.values(import.meta.glob<Tenant>('/src/lib/data/tenants/*.json', { eager: true, import: 'default' }));

const productByDomain = new Map(tenants.flatMap((t) => t.domains.map((d) => [d, t.product] as const)));

export function placeOf(r: Pick<Report, 'reporter' | 'product'>): string {
  const domain = reporterKey(r.reporter).split('@')[1];
  return (domain && productByDomain.get(domain)) ?? r.product;
}
