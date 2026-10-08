export type CharacterType = 'bubu' | 'dudu' | 'panda' | 'baby_bear';

export type MascotExpression = 'happy' | 'celebrate' | 'sad' | 'pout' | 'love' | 'neutral';

export interface FamilyGroup {
  id: string; // e.g., 'GAU-8824'
  name: string; // e.g., 'Nhà Gấu Bubu & Dudu'
  createdAt: number;
}

export interface Member {
  id: string;
  name: string;
  character: CharacterType;
  role: string; // e.g., 'Vợ iu', 'Chồng iu', 'Bé Bông', 'Bé Ben'
  points: number;
  streak: number;
  avatarExpression?: MascotExpression;
  avatarSticker?: string;
}

export type TaskCategory = 'housework' | 'habits' | 'study_work' | 'love_caring' | 'penalty';

export interface TaskItem {
  id: string;
  title: string;
  points: number; // positive for reward, negative for penalty
  category: TaskCategory;
  icon: string;
  description?: string;
  timesCompleted?: number;
  stickerImage?: string;
}

export interface PointLog {
  id: string;
  memberId: string;
  memberName: string;
  memberCharacter: CharacterType;
  taskId?: string;
  taskTitle: string;
  points: number;
  type: 'earn' | 'deduct' | 'reward_redeem';
  note?: string;
  timestamp: number;
  stickerImage?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  cost: number;
  icon: string;
  description?: string;
  redeemedCount: number;
  stickerImage?: string;
}

export interface RewardClaim {
  id: string;
  memberId: string;
  memberName: string;
  rewardId: string;
  rewardTitle: string;
  cost: number;
  timestamp: number;
  status: 'used' | 'pending';
}
