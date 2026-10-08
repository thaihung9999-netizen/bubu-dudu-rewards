import type { Member, TaskItem, RewardItem, PointLog, RewardClaim } from '../types';
import { INITIAL_MEMBERS, INITIAL_TASKS, INITIAL_REWARDS } from './mockData';

const STORAGE_KEYS = {
  MEMBERS: 'bubu_dudu_members',
  TASKS: 'bubu_dudu_tasks',
  REWARDS: 'bubu_dudu_rewards',
  LOGS: 'bubu_dudu_logs',
  CLAIMS: 'bubu_dudu_claims',
  ACTIVE_MEMBER_ID: 'bubu_dudu_active_member_id',
  SOUND_ENABLED: 'bubu_dudu_sound_enabled',
};

export const loadStoredData = () => {
  try {
    let members: Member[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.MEMBERS) || JSON.stringify(INITIAL_MEMBERS)
    );

    // Ensure all members have sticker avatars assigned
    members = members.map((m) => {
      if (!m.avatarSticker) {
        if (m.character === 'dudu' || m.id === 'm2' || m.name.toLowerCase().includes('dudu') || m.name.toLowerCase().includes('chồng')) {
          return { ...m, avatarSticker: '/stickers/dudu_solo_bag.png' };
        } else if (m.character === 'baby_bear' || m.id === 'm3' || m.name.toLowerCase().includes('bông') || m.name.toLowerCase().includes('bé')) {
          return { ...m, avatarSticker: '/stickers/bubu_mochi.png' };
        } else {
          return { ...m, avatarSticker: '/stickers/bubu_solo_hat.png' };
        }
      }
      return m;
    });
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    const tasks: TaskItem[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TASKS) || JSON.stringify(INITIAL_TASKS)
    );
    const rewards: RewardItem[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REWARDS) || JSON.stringify(INITIAL_REWARDS)
    );
    const logs: PointLog[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LOGS) || '[]'
    );
    const claims: RewardClaim[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLAIMS) || '[]'
    );
    const activeMemberId =
      localStorage.getItem(STORAGE_KEYS.ACTIVE_MEMBER_ID) || members[0]?.id || 'm1';
    const soundEnabled =
      localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED) !== 'false';

    return { members, tasks, rewards, logs, claims, activeMemberId, soundEnabled };
  } catch (error) {
    console.error('Error loading data from localStorage', error);
    return {
      members: INITIAL_MEMBERS,
      tasks: INITIAL_TASKS,
      rewards: INITIAL_REWARDS,
      logs: [],
      claims: [],
      activeMemberId: 'm1',
      soundEnabled: true,
    };
  }
};

export const saveToStorage = {
  members: (members: Member[]) => localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members)),
  tasks: (tasks: TaskItem[]) => localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)),
  rewards: (rewards: RewardItem[]) => localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards)),
  logs: (logs: PointLog[]) => localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs)),
  claims: (claims: RewardClaim[]) => localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims)),
  activeMemberId: (id: string) => localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER_ID, id),
  soundEnabled: (val: boolean) => localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(val)),
};
