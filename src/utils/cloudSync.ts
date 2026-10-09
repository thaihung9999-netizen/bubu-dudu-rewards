import type { Member, TaskItem, RewardItem, PointLog, RewardClaim, FamilyGroup } from '../types';

export interface CloudFamilyPayload {
  family: FamilyGroup;
  members: Member[];
  tasks: TaskItem[];
  rewards: RewardItem[];
  logs: PointLog[];
  claims: RewardClaim[];
  updatedAt: number;
  deviceVersion?: string;
}

// Built-in Cloud Sync via Upstash Redis REST
const CLOUD_CONFIG = {
  ENDPOINT: 'https://ready-monitor-213159.upstash.io',
  TOKEN: 'gQAAAAAAA0CnAQIgcDFkMWQ3NGJkY2QwZjg0ZmZkODE0N2Y1NDI3YmVkYTViMw',
  CONSOLE_URL: 'https://upstash.com/start-redis/console/224546ad-ceaf-42e7-8775-f2bad154c807',
};

// In-memory debounce timer to avoid rate limits
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export const cloudSync = {
  consoleUrl: CLOUD_CONFIG.CONSOLE_URL,

  /**
   * Push family data to Cloud
   */
  async pushFamily(payload: CloudFamilyPayload): Promise<boolean> {
    try {
      const key = `bubu_family:${payload.family.id}`;
      const dataStr = JSON.stringify(payload);

      const res = await fetch(CLOUD_CONFIG.ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLOUD_CONFIG.TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', key, dataStr]),
      });

      if (!res.ok) {
        console.warn('Cloud sync push failed with status:', res.status);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Cloud sync push error (working offline):', err);
      return false;
    }
  },

  /**
   * Debounced push so multiple rapid changes (e.g. +10, +10 points) are grouped
   */
  debouncedPush(payload: CloudFamilyPayload, delayMs = 600) {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      this.pushFamily(payload);
    }, delayMs);
  },

  /**
   * Pull family data from Cloud
   */
  async pullFamily(familyId: string): Promise<CloudFamilyPayload | null> {
    try {
      const key = `bubu_family:${familyId}`;
      const res = await fetch(CLOUD_CONFIG.ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLOUD_CONFIG.TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['GET', key]),
      });

      if (!res.ok) return null;
      const json = await res.json();
      if (!json || !json.result) return null;

      const parsed: CloudFamilyPayload = JSON.parse(json.result);
      return parsed;
    } catch (err) {
      console.warn('Cloud sync pull error:', err);
      return null;
    }
  },
};

/**
 * Smart conflict resolution: merge local and remote cloud payloads
 * to prevent dropped points, chore logs, claims, or members during concurrent edits.
 */
export const mergeFamilyData = (
  local: CloudFamilyPayload,
  remote: CloudFamilyPayload
): CloudFamilyPayload => {
  const isRemoteNewer = (remote.updatedAt || 0) >= (local.updatedAt || 0);
  const base = isRemoteNewer ? remote : local;
  const other = isRemoteNewer ? local : remote;

  // 1. Merge logs: union of all unique logs by log.id, sorted descending by timestamp
  const logMap = new Map<string, PointLog>();
  [...(local.logs || []), ...(remote.logs || [])].forEach((l) => {
    if (l && l.id) logMap.set(l.id, l);
  });
  const mergedLogs = Array.from(logMap.values()).sort(
    (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
  );

  // 2. Merge claims: union of all unique claims by claim.id, preferring advanced status
  const claimMap = new Map<string, RewardClaim>();
  const statusWeight: Record<string, number> = {
    pending: 1,
    in_progress: 2,
    cancelled: 3,
    completed: 4,
  };

  [...(other.claims || []), ...(base.claims || [])].forEach((c) => {
    if (!c || !c.id) return;
    const existing = claimMap.get(c.id);
    if (!existing) {
      claimMap.set(c.id, c);
    } else {
      const existingWeight = statusWeight[existing.status] || 0;
      const cWeight = statusWeight[c.status] || 0;
      if (cWeight > existingWeight || (c.updatedAt || 0) > (existing.updatedAt || 0)) {
        claimMap.set(c.id, c);
      }
    }
  });
  const mergedClaims = Array.from(claimMap.values()).sort(
    (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
  );

  // 3. Merge members: keep all members from both
  const memberMap = new Map<string, Member>();
  (other.members || []).forEach((m) => {
    if (m && m.id) memberMap.set(m.id, m);
  });
  (base.members || []).forEach((m) => {
    if (m && m.id) memberMap.set(m.id, m);
  });
  const mergedMembers = Array.from(memberMap.values());

  // 4. Merge tasks: keep all tasks
  const taskMap = new Map<string, TaskItem>();
  (other.tasks || []).forEach((t) => {
    if (t && t.id) taskMap.set(t.id, t);
  });
  (base.tasks || []).forEach((t) => {
    if (t && t.id) taskMap.set(t.id, t);
  });
  const mergedTasks = Array.from(taskMap.values());

  // 5. Merge rewards: keep all rewards
  const rewardMap = new Map<string, RewardItem>();
  (other.rewards || []).forEach((r) => {
    if (r && r.id) rewardMap.set(r.id, r);
  });
  (base.rewards || []).forEach((r) => {
    if (r && r.id) rewardMap.set(r.id, r);
  });
  const mergedRewards = Array.from(rewardMap.values());

  return {
    family: {
      ...base.family,
      name: base.family?.name || other.family?.name,
      pin: base.family?.pin || other.family?.pin,
    },
    members: mergedMembers.length > 0 ? mergedMembers : base.members,
    tasks: mergedTasks.length > 0 ? mergedTasks : base.tasks,
    rewards: mergedRewards.length > 0 ? mergedRewards : base.rewards,
    logs: mergedLogs,
    claims: mergedClaims,
    updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0),
  };
};
