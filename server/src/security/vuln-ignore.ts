export interface VulnIgnore {
  id: string; // CVE or advisory ID
  pkg?: string; // limit to one package; empty means every package
  reason?: string;
  expires?: string; // ISO date; empty means never
  created: string;
}

export const MAX_IGNORES = 500;

export function isActive(entry: VulnIgnore, now: Date = new Date()): boolean {
  if (!entry.expires) {
    return true;
  }
  const t = Date.parse(entry.expires);
  return Number.isNaN(t) ? false : t > now.getTime();
}

export function matches(entry: VulnIgnore, vuln: any): boolean {
  if (entry.id !== vuln.VulnerabilityID) {
    return false;
  }
  return !entry.pkg || entry.pkg === vuln.PkgName;
}

/** Marks ignored findings with `Ignored: true` and the entry's reason; keeps every finding. */
export function applyIgnores(
  logs: any,
  entries: VulnIgnore[],
  now: Date = new Date(),
): void {
  const active = entries.filter((e) => isActive(e, now));
  if (!logs?.Results || active.length === 0) {
    return;
  }
  for (const target of logs.Results) {
    for (const v of target.Vulnerabilities || []) {
      const hit = active.find((e) => matches(e, v));
      if (hit) {
        v.Ignored = true;
        v.IgnoreReason = hit.reason || '';
        v.IgnoreExpires = hit.expires || '';
      }
    }
  }
}

export function parseIgnores(raw: string | undefined): VulnIgnore[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((e) => e && typeof e.id === 'string')
      : [];
  } catch {
    return [];
  }
}

export function validateIgnore(input: any, now: Date = new Date()): VulnIgnore {
  const id = String(input?.id ?? '').trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{1,63}$/.test(id)) {
    throw new Error('invalid vulnerability id');
  }
  const pkg = input?.pkg ? String(input.pkg).trim().slice(0, 128) : undefined;
  const reason = input?.reason
    ? String(input.reason).trim().slice(0, 500)
    : undefined;
  let expires: string | undefined;
  if (input?.expires) {
    const t = Date.parse(String(input.expires));
    if (Number.isNaN(t) || t <= now.getTime()) {
      throw new Error('expiry must be a future date');
    }
    expires = new Date(t).toISOString();
  }
  return { id, pkg, reason, expires, created: now.toISOString() };
}
