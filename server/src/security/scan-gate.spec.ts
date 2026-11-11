import { ScanGate, gateJobName } from './scan-gate';

const policy = { gate: 'critical' as const, rescanDays: 0, notify: true };

function makeGate(over: Record<string, any> = {}) {
  const kubectl: any = {
    getLatestPodByLabel: jest.fn().mockResolvedValue({}),
    createScanImageJob: jest.fn().mockResolvedValue(undefined),
    getVulnerabilityScanLogs: jest.fn(),
    getConfigMapValue: jest.fn().mockResolvedValue(undefined),
    ...over,
  };
  return { gate: new ScanGate(kubectl), kubectl };
}

describe('ScanGate', () => {
  it('does nothing when the gate is off', async () => {
    const { gate, kubectl } = makeGate();
    const r = await gate.check('ns', 'app', 'repo/app', '2', { ...policy, gate: 'off' });
    expect(r.status).toBe('off');
    expect(kubectl.createScanImageJob).not.toHaveBeenCalled();
  });

  it('starts a scan job for an unscanned image under its own name', async () => {
    const { gate, kubectl } = makeGate();
    const r = await gate.check('ns', 'app', 'repo/app', '2', policy);
    expect(r.status).toBe('scanning');
    expect(kubectl.createScanImageJob).toHaveBeenCalledWith(
      'ns', 'app', 'repo/app', '2', true,
      expect.objectContaining({ name: gateJobName('app', 'repo/app:2') }),
    );
  });

  it('waits while the scan runs and blocks when it failed', async () => {
    let r = await makeGate({
      getLatestPodByLabel: jest.fn().mockResolvedValue({ name: 'p', status: 'Running' }),
    }).gate.check('ns', 'app', 'repo/app', '2', policy);
    expect(r.status).toBe('scanning');
    r = await makeGate({
      getLatestPodByLabel: jest.fn().mockResolvedValue({ name: 'p', status: 'Failed' }),
    }).gate.check('ns', 'app', 'repo/app', '2', policy);
    expect(r.status).toBe('error');
  });

  const report = (fixed?: string) => ({
    Results: [
      { Vulnerabilities: [{ VulnerabilityID: 'CVE-1', PkgName: 'a', Severity: 'CRITICAL', FixedVersion: fixed }] },
    ],
  });
  const done = { getLatestPodByLabel: jest.fn().mockResolvedValue({ name: 'p', status: 'Succeeded' }) };

  it('blocks on fixable critical findings and passes without a fix', async () => {
    let r = await makeGate({ ...done, getVulnerabilityScanLogs: jest.fn().mockResolvedValue(report('2')) })
      .gate.check('ns', 'app', 'repo/app', '2', policy);
    expect(r.status).toBe('blocked');
    r = await makeGate({ ...done, getVulnerabilityScanLogs: jest.fn().mockResolvedValue(report()) })
      .gate.check('ns', 'app', 'repo/app', '2', policy);
    expect(r.status).toBe('pass');
  });

  it('honours the ignore list and parses a string report', async () => {
    const { gate } = makeGate({
      ...done,
      getVulnerabilityScanLogs: jest.fn().mockResolvedValue(JSON.stringify(report('2'))),
      getConfigMapValue: jest.fn().mockResolvedValue('[{"id":"CVE-1","created":""}]'),
    });
    expect((await gate.check('ns', 'app', 'repo/app', '2', policy)).status).toBe('pass');
  });

  it('blocks when the report cannot be read', async () => {
    const { gate } = makeGate({ ...done, getVulnerabilityScanLogs: jest.fn().mockResolvedValue('not json') });
    expect((await gate.check('ns', 'app', 'repo/app', '2', policy)).status).toBe('error');
  });
});
