export interface VulnSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
  fixable: number;
  nofix: number;
  fixableCritical: number;
  fixableHigh: number;
  ignored: number;
}

export interface ScanEntry {
  scannedAt: string;
  target: string;
  summary: VulnSummary;
  /** CRITICAL and HIGH findings with a fix, as `id|package`; capped. */
  blocking: string[];
}

export interface ScanHistory {
  pipeline: string;
  phase: string;
  app: string;
  entries: ScanEntry[];
}

export const MAX_HISTORY = 30;
export const MAX_BLOCKING = 100;

export function emptySummary(): VulnSummary {
  return {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
    fixable: 0,
    nofix: 0,
    fixableCritical: 0,
    fixableHigh: 0,
    ignored: 0,
  };
}

/** Counts the findings of a Trivy JSON report; ignored findings are counted apart. */
export function summarizeVulns(logs: any): VulnSummary {
  const summary = emptySummary();
  for (const target of logs?.Results || []) {
    for (const vuln of target.Vulnerabilities || []) {
      if (vuln.Ignored) {
        summary.ignored++;
        continue;
      }
      summary.total++;
      const fixable = !!vuln.FixedVersion;
      if (fixable) {
        summary.fixable++;
      } else {
        summary.nofix++;
      }
      switch (vuln.Severity) {
        case 'CRITICAL':
          summary.critical++;
          if (fixable) summary.fixableCritical++;
          break;
        case 'HIGH':
          summary.high++;
          if (fixable) summary.fixableHigh++;
          break;
        case 'MEDIUM':
          summary.medium++;
          break;
        case 'LOW':
          summary.low++;
          break;
        default:
          summary.unknown++;
      }
    }
  }
  return summary;
}

export function blockingFindings(logs: any): string[] {
  const out: string[] = [];
  for (const target of logs?.Results || []) {
    for (const v of target.Vulnerabilities || []) {
      if (
        !v.Ignored &&
        v.FixedVersion &&
        (v.Severity === 'CRITICAL' || v.Severity === 'HIGH')
      ) {
        out.push(`${v.VulnerabilityID}|${v.PkgName}`);
        if (out.length >= MAX_BLOCKING) {
          return out;
        }
      }
    }
  }
  return out;
}

export function buildEntry(
  logs: any,
  summary: VulnSummary,
  scannedAt: string,
): ScanEntry {
  return {
    scannedAt,
    target: String(logs?.ArtifactName ?? ''),
    summary,
    blocking: blockingFindings(logs),
  };
}

/** Adds an entry, replacing one with the same scan time; keeps the newest MAX_HISTORY. */
export function appendEntry(entries: ScanEntry[], entry: ScanEntry): ScanEntry[] {
  const rest = entries.filter((e) => e.scannedAt !== entry.scannedAt);
  rest.push(entry);
  rest.sort((a, b) => Date.parse(a.scannedAt) - Date.parse(b.scannedAt));
  return rest.slice(-MAX_HISTORY);
}

export function hasEntry(entries: ScanEntry[], scannedAt: string): boolean {
  return entries.some((e) => e.scannedAt === scannedAt);
}

/** Blocking findings of `entry` that the previous scan did not have. */
export function newBlocking(
  previous: ScanEntry | undefined,
  entry: ScanEntry,
): string[] {
  const before = new Set(previous?.blocking ?? []);
  return entry.blocking.filter((b) => !before.has(b));
}

export function parseHistory(raw: string | undefined): ScanHistory | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    const h = JSON.parse(raw);
    if (h && Array.isArray(h.entries)) {
      return h as ScanHistory;
    }
  } catch {
    // fall through
  }
  return undefined;
}

/** The report may arrive as a string or as parsed JSON. */
export function asReport(logs: any): any {
  if (typeof logs === 'string') {
    try {
      return JSON.parse(logs);
    } catch {
      return undefined;
    }
  }
  return logs;
}
