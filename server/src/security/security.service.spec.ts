import { SecurityService } from './security.service';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { AppsService } from '../apps/apps.service';
import { mockKubectlApp as app } from '../apps/apps.controller.spec';
import { IKubectlApp } from '../kubernetes/kubernetes.interface';

describe('SecurityService', () => {
  let service: SecurityService;
  let kubectl: jest.Mocked<KubernetesService>;
  let pipelinesService: jest.Mocked<PipelinesService>;
  let appsService: jest.Mocked<AppsService>;

  beforeEach(() => {
    kubectl = {
      getLatestPodByLabel: jest.fn(),
      setCurrentContext: jest.fn(),
      getVulnerabilityScanLogs: jest.fn(),
      createScanRepoJob: jest.fn(),
      createScanImageJob: jest.fn(),
    } as any;

    pipelinesService = {
      getContext: jest.fn(),
    } as any;

    appsService = {
      getApp: jest.fn(),
    } as any;

    service = new SecurityService(kubectl, pipelinesService, appsService);
  });

  describe('getScanResult', () => {
    it('should return error if no vulnerability scan pod found', async () => {
      pipelinesService.getContext.mockResolvedValue('ctx');
      appsService.getApp.mockResolvedValue(app);
      kubectl.getLatestPodByLabel.mockResolvedValue({});
      const result = await service.getScanResult(
        'pipe',
        'phase',
        'app',
        false,
        ['group1', 'group2'],
      );
      expect(result.status).toBe('error');
      expect(result.message).toBe('no vulnerability scan pod found');
    });

    it('should return running if no logs found', async () => {
      pipelinesService.getContext.mockResolvedValue('ctx');
      appsService.getApp.mockResolvedValue(app);
      kubectl.getLatestPodByLabel.mockResolvedValue({ name: 'pod1' });
      kubectl.getVulnerabilityScanLogs.mockResolvedValue('');
      const result = await service.getScanResult(
        'pipe',
        'phase',
        'app',
        false,
        ['group1', 'group2'],
      );
      expect(result.status).toBe('running');
      expect(result.message).toBe('no vulnerability scan logs found');
    });

    it('should return ok if logs and summary found', async () => {
      pipelinesService.getContext.mockResolvedValue('ctx');
      const app1 = {
        ...app,
        ...{
          spec: {
            deploymentstrategy: 'git',
          },
        },
      } as IKubectlApp;
      appsService.getApp.mockResolvedValue(app1);
      kubectl.getLatestPodByLabel.mockResolvedValue({ name: 'pod1' });
      kubectl.getVulnerabilityScanLogs.mockResolvedValue({ Results: [] });
      const result = await service.getScanResult('pipe', 'phase', 'app', true, [
        'group1',
        'group2',
      ]);
      expect(result.status).toBe('ok');
      expect(result.message).toBe('vulnerability scan result');
      expect(result.logs).toBeDefined();
      expect(result.logsummary).toBeDefined();
    });
  });

  describe('getVulnSummary', () => {
    it('should summarize vulnerabilities', () => {
      const logs = {
        Results: [
          {
            Vulnerabilities: [
              { Severity: 'CRITICAL' },
              { Severity: 'HIGH' },
              { Severity: 'MEDIUM' },
              { Severity: 'LOW' },
              { Severity: 'UNKNOWN' },
              { Severity: 'SOMETHINGELSE' },
            ],
          },
        ],
      };
      // @ts-ignore
      const summary = service['getVulnSummary'](logs);
      expect(summary.total).toBe(6);
      expect(summary.critical).toBe(1);
      expect(summary.high).toBe(1);
      expect(summary.medium).toBe(1);
      expect(summary.low).toBe(1);
      expect(summary.unknown).toBe(2);
    });

    it('should return default summary if logs are missing', () => {
      // @ts-ignore
      const summary = service['getVulnSummary'](null);
      expect(summary.total).toBe(0);
    });
  });

  describe('startScan', () => {
    it('should call createScanImageJob for git/!plain', async () => {
      pipelinesService.getContext.mockResolvedValue('ctx');
      const app1 = {
        ...app,
        ...{
          spec: {
            deploymentstrategy: 'git',
            buildstrategy: 'dockerfile',
            image: { repository: 'repo', tag: 'tag' },
          },
        },
      } as IKubectlApp;
      appsService.getApp.mockResolvedValue(app1);
      const result = await service.startScan('pipe', 'phase', 'app', [
        'group1',
        'group2',
      ]);
      expect(kubectl.createScanImageJob).toHaveBeenCalledWith(
        'pipe-phase',
        'app',
        'repo',
        'tag',
        true,
      );
      expect(result.status).toBe('ok');
    });

    it('should call createScanImageJob for other strategies', async () => {
      pipelinesService.getContext.mockResolvedValue('ctx');
      const app1 = {
        ...app,
        ...{
          spec: {
            deploymentstrategy: 'docker',
            image: { repository: 'repo', tag: 'tag' },
          },
        },
      } as IKubectlApp;
      appsService.getApp.mockResolvedValue(app1);
      const result = await service.startScan('pipe', 'phase', 'app', [
        'group1',
        'group2',
      ]);
      expect(kubectl.createScanImageJob).toHaveBeenCalledWith(
        'pipe-phase',
        'app',
        'repo',
        'tag',
        false,
      );
      expect(result.status).toBe('ok');
    });
  });
});
