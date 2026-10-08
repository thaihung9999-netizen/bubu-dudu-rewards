import type { Member, TaskItem, RewardItem, PointLog, RewardClaim, FamilyGroup } from '../types';
import { INITIAL_MEMBERS, INITIAL_TASKS, INITIAL_REWARDS } from './mockData';

export const DEFAULT_FAMILY: FamilyGroup = {
  id: 'GAU-BUBU-DUDU',
  name: 'Gia Đình Gấu Bubu & Dudu',
  createdAt: 1728345600000,
};

const GLOBAL_KEYS = {
  CURRENT_FAMILY_ID: 'bubu_dudu_current_family_id',
  FAMILIES: 'bubu_dudu_families',
  SOUND_ENABLED: 'bubu_dudu_sound_enabled',
};

const getFamilyPrefix = (familyId: string) => {
  return familyId === DEFAULT_FAMILY.id ? 'bubu_dudu' : `bubu_dudu_${familyId}`;
};

export const loadStoredFamilies = (): { currentFamilyId: string; families: FamilyGroup[] } => {
  try {
    let families: FamilyGroup[] = JSON.parse(
      localStorage.getItem(GLOBAL_KEYS.FAMILIES) || JSON.stringify([DEFAULT_FAMILY])
    );
    if (!families.some((f) => f.id === DEFAULT_FAMILY.id)) {
      families.unshift(DEFAULT_FAMILY);
    }
    const currentFamilyId =
      localStorage.getItem(GLOBAL_KEYS.CURRENT_FAMILY_ID) || DEFAULT_FAMILY.id;
    return { currentFamilyId, families };
  } catch (error) {
    console.error('Error loading families', error);
    return { currentFamilyId: DEFAULT_FAMILY.id, families: [DEFAULT_FAMILY] };
  }
};

export const saveFamiliesToStorage = (families: FamilyGroup[], currentFamilyId: string) => {
  localStorage.setItem(GLOBAL_KEYS.FAMILIES, JSON.stringify(families));
  localStorage.setItem(GLOBAL_KEYS.CURRENT_FAMILY_ID, currentFamilyId);
};

export const loadStoredData = (familyId: string = DEFAULT_FAMILY.id) => {
  try {
    const prefix = getFamilyPrefix(familyId);
    const membersKey = `${prefix}_members`;
    const tasksKey = `${prefix}_tasks`;
    const rewardsKey = `${prefix}_rewards`;
    const logsKey = `${prefix}_logs`;
    const claimsKey = `${prefix}_claims`;
    const activeMemberIdKey = `${prefix}_active_member_id`;

    let members: Member[] = JSON.parse(
      localStorage.getItem(membersKey) || JSON.stringify(INITIAL_MEMBERS)
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
    localStorage.setItem(membersKey, JSON.stringify(members));

    const tasks: TaskItem[] = JSON.parse(
      localStorage.getItem(tasksKey) || JSON.stringify(INITIAL_TASKS)
    );
    const rewards: RewardItem[] = JSON.parse(
      localStorage.getItem(rewardsKey) || JSON.stringify(INITIAL_REWARDS)
    );
    const logs: PointLog[] = JSON.parse(
      localStorage.getItem(logsKey) || '[]'
    );
    const claims: RewardClaim[] = JSON.parse(
      localStorage.getItem(claimsKey) || '[]'
    );
    const activeMemberId =
      localStorage.getItem(activeMemberIdKey) || members[0]?.id || 'm1';
    const soundEnabled =
      localStorage.getItem(GLOBAL_KEYS.SOUND_ENABLED) !== 'false';

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
  members: (members: Member[], familyId: string = DEFAULT_FAMILY.id) => {
    localStorage.setItem(`${getFamilyPrefix(familyId)}_members`, JSON.stringify(members));
  },
  tasks: (tasks: TaskItem[], familyId: string = DEFAULT_FAMILY.id) => {
    localStorage.setItem(`${getFamilyPrefix(familyId)}_tasks`, JSON.stringify(tasks));
  },
  rewards: (rewards: RewardItem[], familyId: string = DEFAULT_FAMILY.id) => {
    localStorage.setItem(`${getFamilyPrefix(familyId)}_rewards`, JSON.stringify(rewards));
  },
  logs: (logs: PointLog[], familyId: string = DEFAULT_FAMILY.id) => {
    localStorage.setItem(`${getFamilyPrefix(familyId)}_logs`, JSON.stringify(logs));
  },
  claims: (claims: RewardClaim[], familyId: string = DEFAULT_FAMILY.id) => {
    localStorage.setItem(`${getFamilyPrefix(familyId)}_claims`, JSON.stringify(claims));
  },
  activeMemberId: (id: string, familyId: string = DEFAULT_FAMILY.id) => {
    localStorage.setItem(`${getFamilyPrefix(familyId)}_active_member_id`, id);
  },
  soundEnabled: (val: boolean) => {
    localStorage.setItem(GLOBAL_KEYS.SOUND_ENABLED, String(val));
  },
};
