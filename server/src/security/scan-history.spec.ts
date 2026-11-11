import {
  MAX_HISTORY,
  appendEntry,
  buildEntry,
  newBlocking,
  parseHistory,
  summarizeVulns,
} from './scan-history';
import {
  parsePolicy,
  rescanDue,
  validatePolicy,
  violates,
} from './vuln-policy';

const logs = {
  ArtifactName: 'repo/app:1',
  Results: [
    {
      Vulnerabilities: [
        { VulnerabilityID: 'CVE-1', PkgName: 'a', Severity: 'CRITICAL', FixedVersion: '2' },
        { VulnerabilityID: 'CVE-2', PkgName: 'b', Severity: 'HIGH' },
        { VulnerabilityID: 'CVE-3', PkgName: 'c', Severity: 'HIGH', FixedVersion: '3' },
        { VulnerabilityID: 'CVE-4', PkgName: 'd', Severity: 'LOW', Ignored: true },
      ],
    },
  ],
};

describe('summarizeVulns', () => {
  it('counts severities, fixable findings and ignored findings apart', () => {
    const s = summarizeVulns(logs);
    expect(s.total).toBe(3);
    expect(s.ignored).toBe(1);
    expect(s.fixable).toBe(2);
    expect(s.nofix).toBe(1);
    expect(s.fixableCritical).toBe(1);
    expect(s.fixableHigh).toBe(1);
  });

  it('returns zeros for a missing report', () => {
    expect(summarizeVulns(undefined).total).toBe(0);
  });
});

describe('history', () => {
  const entry = buildEntry(logs, summarizeVulns(logs), '2026-01-01T00:00:00Z');

  it('keeps fixable critical and high findings as blocking', () => {
    expect(entry.blocking).toEqual(['CVE-1|a', 'CVE-3|c']);
    expect(entry.target).toBe('repo/app:1');
  });

  it('replaces an entry of the same scan and caps the length', () => {
    let list = appendEntry([], entry);
    list = appendEntry(list, entry);
    expect(list).toHaveLength(1);
    for (let i = 0; i < MAX_HISTORY + 5; i++) {
      list = appendEntry(list, { ...entry, scannedAt: new Date(2026, 1, 1 + i).toISOString() });
    }
    expect(list).toHaveLength(MAX_HISTORY);
  });

  it('reports only new blocking findings', () => {
    const next = { ...entry, blocking: ['CVE-1|a', 'CVE-9|z'] };
    expect(newBlocking(entry, next)).toEqual(['CVE-9|z']);
    expect(newBlocking(undefined, next)).toEqual(['CVE-1|a', 'CVE-9|z']);
  });

  it('parses bad stored data as nothing', () => {
    expect(parseHistory('nope')).toBeUndefined();
    expect(parseHistory('{"entries":[]}')?.entries).toEqual([]);
  });
});

describe('policy', () => {
  const s = summarizeVulns(logs);

  it('gates by severity of fixable findings only', () => {
    expect(violates({ gate: 'off', rescanDays: 0, notify: true }, s)).toBe(false);
    expect(violates({ gate: 'critical', rescanDays: 0, notify: true }, s)).toBe(true);
    expect(
      violates({ gate: 'critical', rescanDays: 0, notify: true }, { ...s, fixableCritical: 0 }),
    ).toBe(false);
    expect(
      violates({ gate: 'high', rescanDays: 0, notify: true }, { ...s, fixableCritical: 0 }),
    ).toBe(true);
  });

  it('validates input and falls back to defaults for bad stored data', () => {
    expect(() => validatePolicy({ gate: 'nope' })).toThrow();
    expect(() => validatePolicy({ rescanDays: -1 })).toThrow();
    expect(() => validatePolicy({ rescanDays: 1.5 })).toThrow();
    expect(parsePolicy('nope').gate).toBe('off');
    expect(parsePolicy('{"gate":"high","rescanDays":7}').rescanDays).toBe(7);
  });

  it('decides when a rescan is due', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const p = { gate: 'off' as const, rescanDays: 7, notify: true };
    expect(rescanDue(p, '2026-01-01T00:00:00Z', now)).toBe(true);
    expect(rescanDue(p, '2026-01-05T00:00:00Z', now)).toBe(false);
    expect(rescanDue({ ...p, rescanDays: 0 }, '2020-01-01T00:00:00Z', now)).toBe(false);
    expect(rescanDue(p, undefined, now)).toBe(false);
  });
});
