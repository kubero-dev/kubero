import {
  applyIgnores,
  isActive,
  parseIgnores,
  validateIgnore,
} from './vuln-ignore';

const now = new Date('2026-01-01T00:00:00Z');

describe('vuln-ignore', () => {
  it('expires entries', () => {
    expect(
      isActive({ id: 'CVE-1', created: '', expires: '2025-12-31T00:00:00Z' }, now),
    ).toBe(false);
    expect(
      isActive({ id: 'CVE-1', created: '', expires: '2026-02-01T00:00:00Z' }, now),
    ).toBe(true);
    expect(isActive({ id: 'CVE-1', created: '' }, now)).toBe(true);
  });

  it('marks only matching findings and keeps them', () => {
    const logs = {
      Results: [
        {
          Vulnerabilities: [
            { VulnerabilityID: 'CVE-1', PkgName: 'a' },
            { VulnerabilityID: 'CVE-1', PkgName: 'b' },
            { VulnerabilityID: 'CVE-2', PkgName: 'a' },
          ],
        },
      ],
    };
    applyIgnores(logs, [{ id: 'CVE-1', pkg: 'a', reason: 'n/a', created: '' }], now);
    const v = logs.Results[0].Vulnerabilities as any[];
    expect(v.map((x) => !!x.Ignored)).toEqual([true, false, false]);
    expect(v[0].IgnoreReason).toBe('n/a');
  });

  it('validates input', () => {
    expect(() => validateIgnore({ id: 'bad id!' }, now)).toThrow();
    expect(() => validateIgnore({ id: 'CVE-1', expires: '2020-01-01' }, now)).toThrow();
    expect(
      validateIgnore({ id: 'CVE-2026-1', expires: '2026-06-01' }, now).expires,
    ).toContain('2026-06-01');
  });

  it('parses bad stored data as empty', () => {
    expect(parseIgnores('nope')).toEqual([]);
    expect(parseIgnores('[{"id":"CVE-1"},5]')).toHaveLength(1);
  });
});
