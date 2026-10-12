// How the support desk decides that two reports are the same issue.
// Pages explain it; this file is what runs.

// `product` is what intake picked for the report, at night, from the subject line. It is a guess.
// Where a report really comes from is its place: the product the reporter's tenant runs
// (places.ts). The two disagree more often than intake would like.
export type Report = {
  id: string;
  receivedAt: string;
  reporter: string;
  subject: string;
  source: string;
  product: string;
  meta: { errorCode?: string };
  body: string;
  mergedInto: number | null;
  mergedBy: string | null;
  mergedAt: string | null;
};

// A report placed: the issue it belongs to depends on where it came from, not on its tag.
export type Placed = Pick<Report, 'meta' | 'body'> & { place: string };

// Customers paste codes any way they like: "E-TZ-114", "e-tz 114", "(E-SYNC-04)".
const CODE_IN_TEXT = /\be[-\s]?([a-z]{2,4})[-\s]?(\d{2,3})\b/i;

// Codes the servers raise. Anything else (E-NET-…, E-UI-…) is the client app complaining on the
// way down: worth reading, never what the desk files a report under.
const SERVER_FAMILIES = ['TZ', 'SYNC'];
const isServer = (code: string) => SERVER_FAMILIES.includes(code.split('-')[1]);

export function errorCode(r: Pick<Report, 'meta' | 'body'>): string | null {
  const codes = errorCodesIn(r.meta.errorCode ?? r.body);
  return codes.find(isServer) ?? codes[0] ?? null;
}

// Every code in a free text, normalized the same way: "e-tz 114, (E-SYNC-04)" → E-TZ-114, E-SYNC-04.
export function errorCodesIn(text: string): string[] {
  const all = new RegExp(CODE_IN_TEXT.source, 'gi');
  return [...text.matchAll(all)].map((m) => `E-${m[1].toUpperCase()}-${m[2]}`);
}

// Same code from a different place is a different bug: tram-3 E-TZ-114 is not sched-prod E-TZ-114.
export function fingerprint(r: Placed): string | null {
  const code = errorCode(r);
  return code ? `${r.place}:${code}` : null;
}

export function sameIssue(a: Placed, b: Placed): boolean {
  const fa = fingerprint(a);
  return fa !== null && fa === fingerprint(b);
}

// One person, however they typed their address: case and "+tag" do not make a new reporter.
export function reporterKey(email: string): string {
  const [local, domain] = email.trim().toLowerCase().split('@');
  return domain ? `${local.split('+')[0]}@${domain}` : local;
}

// The ticket system exports in pages that overlap: a report can come twice. One id, one report.
export function uniqueById(reports: Report[]): Report[] {
  return [...new Map(reports.map((r) => [r.id, r])).values()];
}

export type Cluster = {
  fingerprint: string;
  place: string;
  code: string;
  reports: Report[];
  // What intake tagged these reports as: product → count.
  taggedAs: Record<string, number>;
  people: number;
  firstSeen: string;
  lastSeen: string;
  mergedInto: number[];
};

export function clusterReports(reports: Report[], placeOf: (r: Report) => string): Cluster[] {
  const byPrint = new Map<string, Report[]>();
  for (const r of reports) {
    const place = placeOf(r);
    const fp = fingerprint({ ...r, place }) ?? `${place}:unknown`;
    byPrint.set(fp, [...(byPrint.get(fp) ?? []), r]);
  }
  return [...byPrint.entries()]
    .map(([fp, rs]) => {
      const times = rs.map((r) => r.receivedAt).sort();
      const [place, code] = fp.split(':');
      return {
        fingerprint: fp,
        place,
        code,
        reports: rs,
        taggedAs: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.product]: (n[r.product] ?? 0) + 1 }), {}),
        people: new Set(rs.map((r) => reporterKey(r.reporter))).size,
        firstSeen: times[0],
        lastSeen: times[times.length - 1],
        mergedInto: [...new Set(rs.flatMap((r) => (r.mergedInto ? [r.mergedInto] : [])))],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}

// A ticket is the issue most of its reports share; the rest were merged into the wrong place.
export function ticketIssue(clusters: Cluster[], ticket: number): string | null {
  return clusters.find((c) => c.mergedInto.includes(ticket))?.fingerprint ?? null;
}
