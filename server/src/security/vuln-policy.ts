import { VulnSummary } from './scan-history';

export type Gate = 'off' | 'critical' | 'high';

export interface VulnPolicy {
  /** Block an image update when the new image has fixable findings of this severity or worse. */
  gate: Gate;
  /** Scan again after this many days; 0 turns the schedule off. */
  rescanDays: number;
  /** Send a notification when a scan finds new fixable critical or high findings. */
  notify: boolean;
}

export const DEFAULT_POLICY: VulnPolicy = {
  gate: 'off',
  rescanDays: 0,
  notify: true,
};

const GATES: Gate[] = ['off', 'critical', 'high'];

export function parsePolicy(raw: string | undefined): VulnPolicy {
  if (!raw) {
    return { ...DEFAULT_POLICY };
  }
  try {
    return validatePolicy(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_POLICY };
  }
}

export function validatePolicy(input: any): VulnPolicy {
  const gate = (input?.gate ?? DEFAULT_POLICY.gate) as Gate;
  if (!GATES.includes(gate)) {
    throw new Error('gate must be off, critical or high');
  }
  const rescanDays = Number(input?.rescanDays ?? DEFAULT_POLICY.rescanDays);
  if (!Number.isInteger(rescanDays) || rescanDays < 0 || rescanDays > 365) {
    throw new Error('rescanDays must be a whole number from 0 to 365');
  }
  const notify = input?.notify === undefined ? DEFAULT_POLICY.notify : !!input.notify;
  return { gate, rescanDays, notify };
}

export function violates(policy: VulnPolicy, s: VulnSummary): boolean {
  switch (policy.gate) {
    case 'critical':
      return s.fixableCritical > 0;
    case 'high':
      return s.fixableCritical + s.fixableHigh > 0;
    default:
      return false;
  }
}

export function rescanDue(
  policy: VulnPolicy,
  lastScannedAt: string | undefined,
  now: Date = new Date(),
): boolean {
  if (policy.rescanDays <= 0 || !lastScannedAt) {
    return false;
  }
  const t = Date.parse(lastScannedAt);
  return !Number.isNaN(t) && now.getTime() - t >= policy.rescanDays * 86400000;
}
