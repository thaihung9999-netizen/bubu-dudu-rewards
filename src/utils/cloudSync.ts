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
