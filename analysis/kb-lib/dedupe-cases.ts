// Pairs the desk argued about. DedupeExplorer runs fingerprint.ts over them on every build.

type Side = { place: string; subject: string; body: string; meta: { errorCode?: string } };

export const DEDUPE_CASES: { a: Side; b: Side; why: string }[] = [
  {
    why: 'code in meta vs code typed in the body',
    a: { place: 'sched-prod', subject: 'Off by 1h', body: 'Every shift starts an hour late.', meta: { errorCode: 'E-TZ-114' } },
    b: { place: 'sched-prod', subject: 'URGENT times wrong', body: 'App says error e-tz 114.', meta: {} },
  },
  {
    why: 'same subject, different place',
    a: { place: 'sched-prod', subject: 'Times moved by an hour', body: 'Thursday shifts moved by an hour.', meta: { errorCode: 'E-TZ-114' } },
    b: { place: 'tram-3', subject: 'Times moved by an hour', body: 'Boards show every tram an hour late.', meta: { errorCode: 'E-TZ-114' } },
  },
  {
    why: 'same subject, different code',
    a: { place: 'rota-6', subject: 'times are wrong!!', body: 'Night shift shows twice.', meta: { errorCode: 'E-SYNC-04' } },
    b: { place: 'sched-prod', subject: 'times are wrong!!', body: 'Shifted by one hour.', meta: { errorCode: 'E-TZ-114' } },
  },
  {
    why: 'different subject, same issue',
    a: { place: 'rota-6', subject: 'Night shift listed twice', body: '(E-SYNC-04)', meta: {} },
    b: { place: 'rota-6', subject: 'Wrong times showing', body: 'Two copies of the night rota.', meta: { errorCode: 'E-SYNC-04' } },
  },
  {
    why: 'no code at all',
    a: { place: 'sched-prod', subject: 'Clock is wrong', body: 'Something is off.', meta: {} },
    b: { place: 'sched-prod', subject: 'Clock is wrong', body: 'Since last night.', meta: {} },
  },
];
