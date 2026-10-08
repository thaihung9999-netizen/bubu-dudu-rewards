import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import type {
  Member,
  TaskItem,
  RewardItem,
  PointLog,
  RewardClaim,
  TaskCategory,
  FamilyGroup,
  ClaimStatus,
} from './types';
import {
  DEFAULT_FAMILY,
  loadStoredFamilies,
  saveFamiliesToStorage,
  loadStoredData,
  saveToStorage,
} from './utils/storage';
import { sound } from './utils/sound';
import { BUBU_DUDU_STICKERS } from './utils/stickers';
import { cloudSync } from './utils/cloudSync';
import { Mascot } from './components/Mascot';
import { ActionConfirmModal } from './components/ActionConfirmModal';
import { TaskModal } from './components/TaskModal';
import { RewardModal } from './components/RewardModal';
import { MemberModal } from './components/MemberModal';
import { MemberManagementModal } from './components/MemberManagementModal';
import { FamilyModal } from './components/FamilyModal';
import { RewardRedeemModal } from './components/RewardRedeemModal';
import { ClaimProfileModal } from './components/ClaimProfileModal';
import { RewardClaimsList } from './components/RewardClaimsList';
import {
  Sparkles,
  Plus,
  Gift,
  History,
  Trophy,
  Settings,
  Search,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Trash2,
  Edit2,
  Flame,
  Smile,
  Home,
  Users,
  UserCheck,
  Cloud,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  // --- Family Groups State ---
  const [families, setFamilies] = useState<FamilyGroup[]>([DEFAULT_FAMILY]);
  const [currentFamily, setCurrentFamily] = useState<FamilyGroup>(DEFAULT_FAMILY);

  // --- Persistent State ---
  const [dataLoaded, setDataLoaded] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // --- UI State ---
  const [activeTab, setActiveTab] = useState<'tasks' | 'shop' | 'stickers' | 'logs' | 'leaderboard' | 'settings'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'positive' | 'negative' | TaskCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shopSubTab, setShopSubTab] = useState<'rewards' | 'claims'>('rewards');
  const [logFilter, setLogFilter] = useState<'all' | 'earn' | 'deduct' | 'reward_redeem'>('all');

  // Modals state
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedTaskForAction, setSelectedTaskForAction] = useState<TaskItem | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isRewardRedeemOpen, setIsRewardRedeemOpen] = useState(false);
  const [selectedRewardToRedeem, setSelectedRewardToRedeem] = useState<RewardItem | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const [isMemberManagementOpen, setIsMemberManagementOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetStreakToo, setResetStreakToo] = useState(true);
  const [isClaimProfileOpen, setIsClaimProfileOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  // Load initial data & Family Groups
  useEffect(() => {
    const { currentFamilyId, families: loadedFamilies } = loadStoredFamilies();
    setFamilies(loadedFamilies);

    // Check URL parameters for ?family=...
    const urlParams = new URLSearchParams(window.location.search);
    const queryFamilyId = urlParams.get('family');

    let activeFamily = loadedFamilies.find((f) => f.id === currentFamilyId) || DEFAULT_FAMILY;

    if (queryFamilyId) {
      const existing = loadedFamilies.find((f) => f.id === queryFamilyId);
      if (existing) {
        activeFamily = existing;
      } else {
        const newFam: FamilyGroup = {
          id: queryFamilyId,
          name: `Nhóm Gia Đình ${queryFamilyId}`,
          createdAt: Date.now(),
        };
        const updated = [...loadedFamilies, newFam];
        setFamilies(updated);
        saveFamiliesToStorage(updated, queryFamilyId);
        activeFamily = newFam;
      }
      setIsClaimProfileOpen(true);
    }

    setCurrentFamily(activeFamily);

    // Load data for active family
    const loadedData = loadStoredData(activeFamily.id);
    setMembers(loadedData.members);
    setTasks(loadedData.tasks);
    setRewards(loadedData.rewards);
    setLogs(loadedData.logs);
    setClaims(loadedData.claims);
    setActiveMemberId(loadedData.activeMemberId || loadedData.members[0]?.id || '');
    setSoundEnabled(loadedData.soundEnabled);
    sound.enabled = loadedData.soundEnabled;
    setDataLoaded(true);
  }, []);

  // Cloud Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const isPullingRef = useRef<boolean>(false);
  const lastLocalUpdateRef = useRef<number>(Date.now());

  // Save changes to localStorage scoped by currentFamily.id & Cloud Sync
  const syncWithCloud = async (forcePull = false) => {
    if (!dataLoaded) return;
    try {
      setIsSyncing(true);
      const cloudData = await cloudSync.pullFamily(currentFamily.id);
      if (cloudData) {
        const cloudTime = cloudData.updatedAt || 0;
        const localTime = lastSyncedAt || 0;
        if (forcePull || cloudTime > localTime) {
          isPullingRef.current = true;
          if (cloudData.family?.name && cloudData.family.name !== currentFamily.name) {
            setCurrentFamily((prev) => ({ ...prev, name: cloudData.family!.name }));
            setFamilies((prev) =>
              prev.map((f) => (f.id === currentFamily.id ? { ...f, name: cloudData.family!.name } : f))
            );
          }
          if (cloudData.members && cloudData.members.length > 0) {
            setMembers(cloudData.members);
            saveToStorage.members(cloudData.members, currentFamily.id);
            setActiveMemberId((prev) => {
              if (prev && cloudData.members.some((m) => m.id === prev)) return prev;
              return cloudData.members[0].id;
            });
          }
          if (cloudData.tasks) {
            setTasks(cloudData.tasks);
            saveToStorage.tasks(cloudData.tasks, currentFamily.id);
          }
          if (cloudData.rewards) {
            setRewards(cloudData.rewards);
            saveToStorage.rewards(cloudData.rewards, currentFamily.id);
          }
          if (cloudData.logs) {
            setLogs(cloudData.logs);
            saveToStorage.logs(cloudData.logs, currentFamily.id);
          }
          if (cloudData.claims) {
            setClaims(cloudData.claims);
            saveToStorage.claims(cloudData.claims, currentFamily.id);
          }
          setLastSyncedAt(cloudTime);
          setTimeout(() => {
            isPullingRef.current = false;
          }, 600);
          if (forcePull) {
            showToast('Đã tải dữ liệu mới nhất từ đám mây! ☁️');
          }
          return;
        }
      } else {
        // Cloud has no data for this family yet: push initial state to cloud
        await cloudSync.pushFamily({
          family: currentFamily,
          members,
          tasks,
          rewards,
          logs,
          claims,
          updatedAt: Date.now(),
        });
        setLastSyncedAt(Date.now());
      }
    } catch (err) {
      console.warn('Sync with cloud error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync on initial load and family switch
  useEffect(() => {
    if (!dataLoaded) return;
    syncWithCloud(true);
  }, [dataLoaded, currentFamily.id]);

  // Periodic poll & focus / visibility sync (so phone and computer stay in sync automatically!)
  useEffect(() => {
    if (!dataLoaded) return;

    // Check cloud every 5 seconds
    const interval = setInterval(() => {
      syncWithCloud(false);
    }, 5000);

    const handleFocus = () => {
      syncWithCloud(false);
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [dataLoaded, currentFamily.id, lastSyncedAt]);

  // Save changes locally AND push to Cloud
  useEffect(() => {
    if (!dataLoaded) return;
    saveToStorage.members(members, currentFamily.id);
    saveToStorage.tasks(tasks, currentFamily.id);
    saveToStorage.rewards(rewards, currentFamily.id);
    saveToStorage.logs(logs, currentFamily.id);
    saveToStorage.claims(claims, currentFamily.id);

    // If local change made by user, push debounced to cloud!
    if (!isPullingRef.current) {
      const now = Date.now();
      lastLocalUpdateRef.current = now;
      cloudSync.debouncedPush({
        family: currentFamily,
        members,
        tasks,
        rewards,
        logs,
        claims,
        updatedAt: now,
      });
      setLastSyncedAt(now);
    }
  }, [members, tasks, rewards, logs, claims, dataLoaded, currentFamily.id]);

  useEffect(() => {
    if (!dataLoaded) return;
    saveToStorage.activeMemberId(activeMemberId, currentFamily.id);
  }, [activeMemberId, dataLoaded, currentFamily.id]);

  useEffect(() => {
    if (!dataLoaded) return;
    saveToStorage.soundEnabled(soundEnabled);
    sound.enabled = soundEnabled;
  }, [soundEnabled, dataLoaded]);

  const activeMember = useMemo(() => {
    return members.find((m) => m.id === activeMemberId) || members[0] || {
      id: 'default',
      name: 'Bubu',
      character: 'bubu',
      role: 'Thành viên',
      points: 0,
      streak: 1,
    };
  }, [members, activeMemberId]);

  const showToast = (text: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // --- Handlers: Family Switching / Creating / Joining ---
  const handleSelectFamily = (family: FamilyGroup) => {
    sound.playPop();
    setCurrentFamily(family);
    saveFamiliesToStorage(families, family.id);
    const loadedData = loadStoredData(family.id);
    setMembers(loadedData.members);
    setTasks(loadedData.tasks);
    setRewards(loadedData.rewards);
    setLogs(loadedData.logs);
    setClaims(loadedData.claims);
    setActiveMemberId(loadedData.activeMemberId || loadedData.members[0]?.id || '');
    showToast(`Đã chuyển sang nhóm: ${family.name}! 🏡`);
  };

  const handleCreateFamily = (name: string, customId?: string) => {
    sound.playPop();
    const id = customId || `GAU-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFam: FamilyGroup = {
      id,
      name,
      createdAt: Date.now(),
    };
    const updated = [...families, newFam];
    setFamilies(updated);
    handleSelectFamily(newFam);
    showToast(`Đã tạo thành công nhóm gia đình "${name}" (Mã: ${id})! ✨`);
  };

  const handleJoinFamily = (familyId: string, customName?: string) => {
    sound.playPop();
    const existing = families.find((f) => f.id === familyId);
    if (existing) {
      handleSelectFamily(existing);
      setIsClaimProfileOpen(true);
      return;
    }
    const newFam: FamilyGroup = {
      id: familyId,
      name: customName || `Nhóm Gia Đình ${familyId}`,
      createdAt: Date.now(),
    };
    const updated = [...families, newFam];
    setFamilies(updated);
    handleSelectFamily(newFam);
    setIsClaimProfileOpen(true);
    showToast(`Đã tham gia nhóm gia đình "${newFam.name}"! 🏡 Hãy chọn nhân vật của bạn nhé.`);
  };

  const handleSelectProfile = (memberId: string, updatedName?: string) => {
    sound.playPop();
    setActiveMemberId(memberId);
    if (updatedName) {
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, name: updatedName } : m))
      );
      showToast(`Chào mừng ${updatedName} đã vào vai thành công! 🐻✨`);
    } else {
      const chosen = members.find((x) => x.id === memberId);
      showToast(`Đã vào vai ${chosen ? chosen.name : 'thành viên'}! 🐻✨`);
    }
  };

  // --- Handlers: Reset All Points to 0 (Requirement 1) ---
  const handleResetAllPoints = () => {
    sound.playEarnPoint();
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        points: 0,
        ...(resetStreakToo ? { streak: 0 } : {}),
      }))
    );
    const newLog: PointLog = {
      id: 'log_' + Date.now(),
      memberId: 'all',
      memberName: 'Tất cả gia đình',
      memberCharacter: 'bubu',
      taskTitle: resetStreakToo
        ? '🔄 Khởi động chu kỳ mới: Reset toàn bộ điểm & chuỗi streak về 0 🐻'
        : '🔄 Khởi động chu kỳ mới: Reset toàn bộ điểm về 0 🐻',
      points: 0,
      type: 'earn',
      note: 'Bắt đầu tuần thi đua mới từ đầu',
      timestamp: Date.now(),
      stickerImage: '/stickers/bubu_dudu_pair.png',
    };
    setLogs((prev) => [newLog, ...prev]);
    setIsResetConfirmOpen(false);
    showToast(
      resetStreakToo
        ? 'Đã đặt lại 0 điểm & 0 ngày streak cho cả nhà! 🐻'
        : 'Đã đặt lại 0 điểm cho tất cả thành viên trong nhà! 🐻'
    );
  };

  // --- Handlers: Logging Task Action ---
  const handleOpenActionModal = (task: TaskItem) => {
    sound.playPop();
    setSelectedTaskForAction(task);
    setIsActionModalOpen(true);
  };

  const handleConfirmTaskAction = (task: TaskItem, member: Member, note: string) => {
    const isEarn = task.points > 0;

    // Trigger celebration effects
    if (isEarn) {
      sound.playEarnPoint();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF69B4', '#FFA07A', '#FFD700', '#48BB78', '#38B2AC'],
      });
      showToast(`Tuyệt vời! ${member.name} được cộng +${task.points} 🐻 điểm gấu!`);
    } else {
      sound.playDeductPoint();
      showToast(`Đã trừ ${task.points} 🐻 của ${member.name}. Cố gắng lên nhé!`, 'warning');
    }

    // Update member points
    setMembers((prev) =>
      prev.map((m) =>
        m.id === member.id
          ? {
              ...m,
              points: Math.max(0, m.points + task.points),
              streak: isEarn ? m.streak + 1 : m.streak,
            }
          : m
      )
    );

    // Update task timesCompleted
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, timesCompleted: (t.timesCompleted || 0) + 1 } : t
      )
    );

    // Create log entry
    const newLog: PointLog = {
      id: 'log_' + Date.now(),
      memberId: member.id,
      memberName: member.name,
      memberCharacter: member.character,
      taskId: task.id,
      taskTitle: task.title,
      points: task.points,
      type: isEarn ? 'earn' : 'deduct',
      note: note.trim() || undefined,
      timestamp: Date.now(),
      stickerImage: task.stickerImage,
    };
    setLogs((prev) => [newLog, ...prev]);

    setIsActionModalOpen(false);
  };

  // --- Handlers: Tasks CRUD ---
  const handleSaveTask = (taskData: Omit<TaskItem, 'id' | 'timesCompleted'>, editId?: string) => {
    sound.playPop();
    if (editId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editId ? { ...t, ...taskData } : t))
      );
      showToast('Đã cập nhật công việc!');
    } else {
      const newTask: TaskItem = {
        ...taskData,
        id: 'task_' + Date.now(),
        timesCompleted: 0,
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast('Đã thêm công việc mới!');
    }
  };

  const handleDeleteTask = (id: string) => {
    sound.playPop();
    if (confirm('Bạn có chắc muốn xóa đầu việc này?')) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast('Đã xóa công việc!');
    }
  };

  // --- Handlers: Rewards CRUD & Redeem ---
  const handleSaveReward = (rewardData: Omit<RewardItem, 'id' | 'redeemedCount'>) => {
    sound.playPop();
    const newReward: RewardItem = {
      ...rewardData,
      id: 'reward_' + Date.now(),
      redeemedCount: 0,
    };
    setRewards((prev) => [newReward, ...prev]);
    showToast('Đã thêm voucher quà mới!');
  };

  const handleOpenRedeemModal = (reward: RewardItem) => {
    sound.playPop();
    setSelectedRewardToRedeem(reward);
    setIsRewardRedeemOpen(true);
  };

  const handleConfirmRedeem = (reward: RewardItem, member: Member) => {
    sound.playRedeem();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FFB6C1', '#FF69B4', '#FFD700', '#FF4500'],
    });

    // Deduct points
    setMembers((prev) =>
      prev.map((m) =>
        m.id === member.id ? { ...m, points: m.points - reward.cost } : m
      )
    );

    // Update reward redeemed count
    setRewards((prev) =>
      prev.map((r) =>
        r.id === reward.id ? { ...r, redeemedCount: (r.redeemedCount || 0) + 1 } : r
      )
    );

    // Add claim & log
    const newClaim: RewardClaim = {
      id: 'claim_' + Date.now(),
      memberId: member.id,
      memberName: member.name,
      memberCharacter: member.character,
      memberAvatar: member.avatarSticker,
      rewardId: reward.id,
      rewardTitle: reward.title,
      rewardIcon: reward.icon,
      cost: reward.cost,
      timestamp: Date.now(),
      status: 'pending',
    };
    setClaims((prev) => [newClaim, ...prev]);

    const newLog: PointLog = {
      id: 'log_' + Date.now(),
      memberId: member.id,
      memberName: member.name,
      memberCharacter: member.character,
      taskTitle: `Đổi quà: ${reward.icon} ${reward.title}`,
      points: -reward.cost,
      type: 'reward_redeem',
      timestamp: Date.now(),
      stickerImage: reward.stickerImage,
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(`Chúc mừng ${member.name} đã đổi thành công: ${reward.title}! 🎉 Hãy kiểm tra phiếu quà.`);
  };

  const handleUpdateClaimStatus = (
    claimId: string,
    newStatus: ClaimStatus,
    note?: string
  ) => {
    sound.playPop();
    const targetClaim = claims.find((c) => c.id === claimId);
    if (!targetClaim) return;

    if (newStatus === 'cancelled' && targetClaim.status !== 'cancelled') {
      // Refund points to member
      setMembers((prev) =>
        prev.map((m) =>
          m.id === targetClaim.memberId
            ? { ...m, points: m.points + targetClaim.cost }
            : m
        )
      );
      const refundLog: PointLog = {
        id: 'log_' + Date.now(),
        memberId: targetClaim.memberId,
        memberName: targetClaim.memberName,
        memberCharacter: targetClaim.memberCharacter || 'bubu',
        taskTitle: `↩️ Hủy phiếu quà: Hoàn lại ${targetClaim.rewardTitle}`,
        points: targetClaim.cost,
        type: 'earn',
        note: note || 'Hoàn lại điểm do phiếu quà bị hủy',
        timestamp: Date.now(),
      };
      setLogs((prev) => [refundLog, ...prev]);
      showToast(`Đã hủy phiếu quà và hoàn lại +${targetClaim.cost} 🐻 cho ${targetClaim.memberName}!`);
    } else if (newStatus === 'completed') {
      sound.playRedeem();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      showToast(`Chúc mừng! Đã trao quà "${targetClaim.rewardTitle}" cho ${targetClaim.memberName}! 🎉`);
    } else {
      showToast(`Đã chuyển phiếu quà sang trạng thái: Đang chuẩn bị ⏳`);
    }

    setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? { ...c, status: newStatus, updatedAt: Date.now(), note: note || c.note }
          : c
      )
    );
  };

  // --- Handlers: Members CRUD & Quick Adjust (Requirement 2) ---
  const handleSaveMember = (
    memberData: Omit<Member, 'id'>,
    editId?: string
  ) => {
    sound.playPop();
    if (editId) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editId
            ? {
                ...m,
                ...memberData,
                points: memberData.points !== undefined ? memberData.points : m.points,
                streak: memberData.streak !== undefined ? memberData.streak : m.streak,
              }
            : m
        )
      );
      showToast('Đã cập nhật thông tin thành viên!');
    } else {
      const newMember: Member = {
        ...memberData,
        id: 'member_' + Date.now(),
        points: memberData.points ?? 0,
        streak: memberData.streak ?? 0,
      };
      setMembers((prev) => [...prev, newMember]);
      setActiveMemberId(newMember.id);
      showToast(`Chào mừng ${newMember.name} gia nhập nhà Gấu! 🐻`);
    }
  };

  const handleResetMemberStreak = (memberId: string) => {
    sound.playPop();
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, streak: 0 } : m))
    );
    showToast('Đã đặt lại chuỗi ngày streak về 0!');
  };

  const handleDeleteMember = (id: string) => {
    sound.playPop();
    if (members.length <= 1) {
      alert('Gia đình cần có ít nhất 1 thành viên!');
      return;
    }
    const memberToDelete = members.find((m) => m.id === id);
    if (confirm(`Bạn có chắc muốn xóa thành viên "${memberToDelete?.name}"?`)) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (activeMemberId === id) {
        const remaining = members.filter((m) => m.id !== id);
        if (remaining[0]) setActiveMemberId(remaining[0].id);
      }
      showToast('Đã xóa thành viên!');
    }
  };

  const handleQuickAdjustPoints = (member: Member, amount: number, reason: string) => {
    const isPositive = amount > 0;
    if (isPositive) {
      sound.playEarnPoint();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } else {
      sound.playDeductPoint();
    }

    setMembers((prev) =>
      prev.map((m) =>
        m.id === member.id ? { ...m, points: Math.max(0, m.points + amount) } : m
      )
    );

    const newLog: PointLog = {
      id: 'log_' + Date.now(),
      memberId: member.id,
      memberName: member.name,
      memberCharacter: member.character,
      taskTitle: isPositive ? `Thưởng trực tiếp: +${amount} 🐻` : `Trừ điểm trực tiếp: ${amount} 🐻`,
      points: amount,
      type: isPositive ? 'earn' : 'deduct',
      note: reason,
      timestamp: Date.now(),
      stickerImage: isPositive ? '/stickers/flowers_love.png' : '/stickers/dudu_solo_grumpy.png',
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(`Đã điều chỉnh ${isPositive ? '+' : ''}${amount} 🐻 cho ${member.name}!`);
  };

  // --- Revert / Undo Log Action ---
  const handleUndoLog = (log: PointLog) => {
    sound.playPop();
    if (confirm(`Bạn muốn hoàn tác giao dịch "${log.taskTitle}"? Điểm sẽ được điều chỉnh lại.`)) {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === log.memberId) {
            return {
              ...m,
              points: Math.max(0, m.points - log.points),
            };
          }
          return m;
        })
      );
      setLogs((prev) => prev.filter((l) => l.id !== log.id));
      showToast('Đã hoàn tác giao dịch thành công!');
    }
  };

  // --- Backup / Export / Import ---
  const handleExportData = () => {
    sound.playPop();
    const fullData = {
      family: currentFamily,
      members,
      tasks,
      rewards,
      logs,
      claims,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bubu_dudu_${currentFamily.id}_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file sao lưu!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.members && parsed.tasks) {
          setMembers(parsed.members);
          setTasks(parsed.tasks);
          if (parsed.rewards) setRewards(parsed.rewards);
          if (parsed.logs) setLogs(parsed.logs);
          if (parsed.claims) setClaims(parsed.claims);
          if (parsed.members[0]) setActiveMemberId(parsed.members[0].id);
          sound.playEarnPoint();
          showToast('Khôi phục dữ liệu thành công!');
        } else {
          alert('File sao lưu không đúng định dạng!');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON: ' + err);
      }
    };
    reader.readAsText(file);
  };

  // --- Filtered Tasks ---
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (taskFilter === 'all') return true;
      if (taskFilter === 'positive') return t.points > 0;
      if (taskFilter === 'negative') return t.points < 0;
      return t.category === taskFilter;
    });
  }, [tasks, taskFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-stone-800 flex flex-col items-center pb-24 md:pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 z-50 animate-pop px-5 py-3 rounded-2xl bg-stone-900/90 text-white font-bold text-sm shadow-xl flex items-center gap-2.5 backdrop-blur-md">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <span className="text-lg">🥺</span>
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-2xl px-4 pt-4 sm:pt-6">
        {/* Top Family ID Bar with Cloud Sync */}
        <div className="mb-2 flex items-center justify-between px-2 text-xs gap-1.5">
          <button
            onClick={() => setIsFamilyModalOpen(true)}
            className="flex items-center gap-1.5 py-1 px-2.5 sm:px-3 rounded-full bg-amber-100/80 hover:bg-amber-200/90 text-amber-900 font-extrabold border border-amber-300 shadow-2xs transition cursor-pointer max-w-[50%] sm:max-w-[60%] truncate"
            title="Bấm để đổi nhóm hoặc chia sẻ link"
          >
            <Home className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="truncate">{currentFamily.name}</span>
            <span className="bg-amber-200/80 px-1.5 py-0.2 rounded-md font-mono text-[10px] shrink-0">
              {currentFamily.id}
            </span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => syncWithCloud(true)}
              disabled={isSyncing}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                isSyncing
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
              }`}
              title="Dữ liệu tự động đồng bộ qua đám mây giữa Điện thoại & Máy tính. Bấm để đồng bộ ngay!"
            >
              <Cloud className="w-3 h-3 text-emerald-600" />
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Đang sync...' : 'Đám Mây Tự Đồng Bộ'}</span>
              <span className="sm:hidden">{isSyncing ? 'Sync...' : 'Sync ☁️'}</span>
            </button>

            <button
              onClick={() => setIsFamilyModalOpen(true)}
              className="text-[11px] font-black text-amber-800 hover:text-amber-950 underline decoration-amber-400 cursor-pointer shrink-0"
            >
              + Đổi Nhóm
            </button>
          </div>
        </div>

        {/* Top Header */}
        <header className="bg-white/85 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 shadow-xs border-2 border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 shrink-0 flex items-center justify-center">
              <img
                src="/stickers/bubu_dudu_pair.png"
                alt="Bubu & Dudu"
                className="w-full h-full object-contain filter drop-shadow-sm hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-amber-950 tracking-tight flex items-center gap-1.5">
                <span>Tiệm Tích Điểm Bubu & Dudu</span>
              </h1>
              <p className="text-xs text-amber-800/80 font-bold">
                Chăm việc nhà • Tích điểm gấu • Đổi quà cưng xỉu 🍯
              </p>
            </div>
          </div>

          {/* Sound & Member Management Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                sound.playPop();
              }}
              className="p-2.5 rounded-2xl bg-amber-50 text-amber-800 hover:bg-amber-100 transition border border-amber-200 cursor-pointer"
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            </button>
            <button
              onClick={() => setIsMemberManagementOpen(true)}
              className="py-2 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition cursor-pointer"
              title="Quản lý thành viên (Thêm, bớt, sửa ảnh)"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quản Lý Gấu</span>
            </button>
          </div>
        </header>

        {/* Member Selector Strip */}
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {members.map((m) => {
            const isActive = m.id === activeMemberId;
            return (
              <button
                key={m.id}
                onClick={() => {
                  sound.playPop();
                  setActiveMemberId(m.id);
                }}
                className={`flex items-center gap-2 py-1.5 px-3 rounded-2xl font-extrabold text-xs transition shrink-0 border-2 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200 scale-102'
                    : 'bg-white text-stone-700 border-amber-100 hover:border-amber-300'
                }`}
              >
                {m.avatarSticker ? (
                  <img src={m.avatarSticker} alt={m.name} className="w-6 h-6 object-contain" />
                ) : (
                  <Mascot character={m.character} expression="happy" size={24} animate={false} />
                )}
                <span>{m.name}</span>
                <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${
                  isActive ? 'bg-amber-600 text-amber-50' : 'bg-amber-100 text-amber-800'
                }`}>
                  {m.points} 🐻
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMemberManagementOpen(true)}
            className="flex items-center gap-1 py-1.5 px-3 rounded-2xl font-extrabold text-xs transition shrink-0 border-2 border-dashed border-amber-300 text-amber-800 hover:bg-amber-50 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thành viên</span>
          </button>
        </div>

        {/* Active Member Hero Banner */}
        <div className="mt-3 bg-gradient-to-br from-amber-400 via-amber-300 to-orange-300 rounded-3xl p-5 sm:p-6 text-stone-900 shadow-lg shadow-amber-200/50 relative overflow-hidden border-2 border-amber-200">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute top-2 right-12 text-white/30 text-3xl select-none pointer-events-none">✨</div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div
                onClick={() => {
                  setMemberToEdit(activeMember);
                  setIsMemberModalOpen(true);
                }}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white/85 p-1.5 shadow-md border-2 border-white/90 flex items-center justify-center cursor-pointer hover:scale-105 transition"
                title="Bấm để sửa thông tin / Đổi ảnh avatar"
              >
                {activeMember.avatarSticker ? (
                  <img
                    src={activeMember.avatarSticker}
                    alt={activeMember.name}
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                ) : (
                  <Mascot character={activeMember.character} expression="happy" size={68} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-amber-950">
                    {activeMember.name}
                  </h2>
                  <button
                    onClick={() => {
                      setMemberToEdit(activeMember);
                      setIsMemberModalOpen(true);
                    }}
                    className="text-amber-800/70 hover:text-amber-950 p-1 rounded-lg cursor-pointer"
                    title="Chỉnh sửa hồ sơ"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsClaimProfileOpen(true)}
                    className="text-amber-950 bg-white/70 hover:bg-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1 transition cursor-pointer"
                    title="Chọn hoặc đổi nhân vật của bạn trên máy này"
                  >
                    <UserCheck className="w-3 h-3 text-amber-700" />
                    <span>Tôi là ai?</span>
                  </button>
                </div>
                <p className="text-xs font-bold text-amber-900/80 bg-white/40 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {activeMember.role}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-xs font-black bg-white/70 px-2 py-0.5 rounded-lg text-amber-900 shadow-xs">
                    <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                    <span>{activeMember.streak} ngày chăm chỉ</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Big Bear Coin Balance */}
            <div className="text-right">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900/70 block">
                Hũ Mật Ong Hiện Có
              </span>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                  {activeMember.points}
                </span>
                <span className="text-2xl sm:text-3xl animate-bounce">🐻</span>
              </div>
              <button
                onClick={() => setActiveTab('shop')}
                className="mt-1.5 text-xs font-black text-amber-900 bg-white/80 hover:bg-white px-3 py-1 rounded-xl shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5 text-pink-600" />
                <span>Đổi Quà Ngay</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 grid grid-cols-6 gap-1 bg-stone-200/60 p-1.5 rounded-2xl">
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('tasks');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Nhiệm Vụ</span>
            <span className="sm:hidden text-[11px]">Việc</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('shop');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Gift className="w-4 h-4 text-pink-500" />
            <span>Tiệm Quà</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('stickers');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'stickers'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smile className="w-4 h-4 text-emerald-500" />
            <span>Sticker</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('logs');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <History className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Nhật Ký</span>
            <span className="sm:hidden text-[11px]">Ký</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('leaderboard');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="hidden sm:inline">Xếp Hạng</span>
            <span className="sm:hidden text-[11px]">Hạng</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('settings');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Settings className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">Cài Đặt</span>
            <span className="sm:hidden text-[11px]">Cài</span>
          </button>
        </div>

        {/* ================= TAB 1: NHIỆM VỤ (TASKS) ================= */}
        {activeTab === 'tasks' && (
          <div className="mt-4 space-y-4">
            {/* Search and Add Task Header */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm việc nhà, thói quen..."
                  className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="py-2 px-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Thêm Việc</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'positive', label: '🟢 Thưởng (+)' },
                { id: 'negative', label: '🔴 Nhắc/Phạt (-)' },
                { id: 'housework', label: '🧹 Việc nhà' },
                { id: 'habits', label: '🌱 Thói quen' },
                { id: 'study_work', label: '📚 Học/Làm' },
                { id: 'love_caring', label: '💖 Yêu thương' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTaskFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                    taskFilter === f.id
                      ? 'bg-stone-800 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Tasks List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredTasks.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-stone-200">
                  <div className="w-20 h-20 mx-auto mb-2">
                    <img src="/stickers/grumpy_dudu.png" alt="No tasks" className="w-full h-full object-contain" />
                  </div>
                  <p className="font-bold text-stone-600">Không tìm thấy công việc nào!</p>
                  <button
                    onClick={() => {
                      setTaskFilter('all');
                      setSearchQuery('');
                    }}
                    className="mt-2 text-xs font-bold text-amber-600 hover:underline"
                  >
                    Xem tất cả việc
                  </button>
                </div>
              ) : (
                filteredTasks.map((t) => {
                  const isPositive = t.points > 0;
                  return (
                    <div
                      key={t.id}
                      className={`group relative bg-white rounded-2xl p-3 border-2 transition-all hover:shadow-md flex items-center justify-between ${
                        isPositive
                          ? 'border-emerald-100 hover:border-emerald-300'
                          : 'border-rose-100 hover:border-rose-300'
                      }`}
                    >
                      <div
                        onClick={() => handleOpenActionModal(t)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 pr-2 cursor-pointer"
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 p-1 relative ${
                            isPositive ? 'bg-emerald-50/80 border border-emerald-100' : 'bg-rose-50/80 border border-rose-100'
                          }`}
                        >
                          {t.stickerImage ? (
                            <img src={t.stickerImage} alt="Sticker" className="w-full h-full object-contain filter drop-shadow-xs" />
                          ) : (
                            <span className="text-2xl">{t.icon}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-stone-800 truncate">
                            {t.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 truncate">
                            {t.description || (isPositive ? 'Làm để được thưởng gấu' : 'Lỗi cần nhắc nhở')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenActionModal(t)}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 shadow-xs transition active:scale-90 cursor-pointer ${
                            isPositive
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              : 'bg-rose-500 hover:bg-rose-600 text-white'
                          }`}
                          title={`Chấm điểm cho ${activeMember.name}`}
                        >
                          <span>{isPositive ? '+' : ''}{t.points}</span>
                          <span className="text-[10px]">🐻</span>
                        </button>

                        <div className="flex items-center opacity-70 group-hover:opacity-100 transition">
                          <button
                            onClick={() => {
                              setTaskToEdit(t);
                              setIsTaskModalOpen(true);
                            }}
                            className="p-1 hover:text-amber-600 text-stone-400"
                            title="Sửa công việc"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="p-1 hover:text-rose-600 text-stone-400"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: TIỆM ĐỔI QUÀ (SHOP) ================= */}
        {activeTab === 'shop' && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-stone-800 flex items-center gap-1.5">
                  <Gift className="w-5 h-5 text-pink-500" />
                  <span>Tiệm Voucher Bubu & Dudu</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Dùng điểm gấu tích lũy để đổi quà thực tế cho nhau
                </p>
              </div>
              <button
                onClick={() => setIsRewardModalOpen(true)}
                className="py-2 px-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Thêm Quà</span>
              </button>
            </div>

            {/* Sub-tab Switch: Rewards vs Claims */}
            <div className="flex bg-stone-100 p-1 rounded-2xl gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setShopSubTab('rewards')}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  shopSubTab === 'rewards'
                    ? 'bg-white text-stone-900 shadow-xs font-black'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-pink-500" />
                <span>Kho Voucher Quà ({rewards.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShopSubTab('claims')}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  shopSubTab === 'claims'
                    ? 'bg-white text-stone-900 shadow-xs font-black'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <span>🎫 Phiếu Quà Đã Đổi</span>
                {claims.length > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      claims.some((c) => c.status === 'pending')
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {claims.length}
                  </span>
                )}
              </button>
            </div>

            {/* SUB-VIEW 1: REWARD CLAIMS LIST */}
            {shopSubTab === 'claims' && (
              <RewardClaimsList
                claims={claims}
                onUpdateStatus={handleUpdateClaimStatus}
                onOpenShop={() => setShopSubTab('rewards')}
              />
            )}

            {/* SUB-VIEW 2: REWARD ITEMS GRID */}
            {shopSubTab === 'rewards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rewards.map((r) => {
                const canAfford = activeMember.points >= r.cost;
                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-3xl p-4 border-2 border-pink-100 shadow-xs flex flex-col justify-between hover:border-pink-300 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="w-16 h-16 rounded-2xl bg-pink-50/80 p-1.5 border border-pink-100 flex items-center justify-center">
                          {r.stickerImage ? (
                            <img src={r.stickerImage} alt={r.title} className="w-full h-full object-contain filter drop-shadow-sm" />
                          ) : (
                            <span className="text-3xl">{r.icon}</span>
                          )}
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-black text-xs">
                          {r.cost} 🐻
                        </span>
                      </div>
                      <h4 className="font-black text-stone-800 text-base mt-2.5">
                        {r.title}
                      </h4>
                      {r.description && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                          {r.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-400">
                        Đã đổi: {r.redeemedCount || 0} lần
                      </span>
                      <button
                        onClick={() => handleOpenRedeemModal(r)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition shadow-xs cursor-pointer ${
                          canAfford
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-95'
                            : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                        }`}
                      >
                        {canAfford ? 'Đổi Quà' : 'Chưa Đủ Điểm'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: BỘ SƯU TẬP STICKER BUBU & DUDU ================= */}
        {activeTab === 'stickers' && (
          <div className="mt-4 space-y-6">
            <div className="text-center py-1">
              <h3 className="text-base sm:text-lg font-black text-stone-800 flex items-center justify-center gap-1.5">
                <span>Bộ Sưu Tập Sticker Bubu & Dudu 🐻🤍</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Chạm để xem hiệu ứng hoạt họa và bấm đặt làm Avatar cho thành viên!
              </p>
            </div>

            {/* SECTION 1: BUBU SOLO */}
            <div className="bg-white/80 rounded-3xl p-4 border-2 border-pink-100 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🤍</span>
                <div>
                  <h4 className="font-black text-sm text-stone-800">Nhân Vật Bubu (Một Mình)</h4>
                  <p className="text-[11px] text-stone-400">Gấu trắng tinh nghịch, điệu đà, ngọt ngào</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUBU_DUDU_STICKERS.filter(s => s.tag === 'bubu_solo').map((stk) => (
                  <div
                    key={stk.id}
                    className="bg-pink-50/40 rounded-2xl p-3 border border-pink-200/70 flex flex-col items-center text-center group hover:shadow-sm transition"
                  >
                    <div
                      onClick={() => {
                        sound.playEarnPoint();
                        confetti({
                          particleCount: 50,
                          spread: 60,
                          origin: { y: 0.7 },
                          colors: ['#FFB6C1', '#FF69B4', '#FFF0F5'],
                        });
                        showToast(`Bubu: "${stk.name}"! 🤍`);
                      }}
                      className="w-24 h-24 p-1 flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform"
                    >
                      <img src={stk.url} alt={stk.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                    </div>
                    <h5 className="font-extrabold text-xs text-stone-800 mt-1.5">{stk.name}</h5>
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-2">{stk.description}</p>
                    <button
                      onClick={() => {
                        sound.playPop();
                        setMembers(prev => prev.map(m => m.id === activeMember.id ? { ...m, avatarSticker: stk.url, character: 'bubu' } : m));
                        showToast(`Đã đặt "${stk.name}" làm Avatar cho ${activeMember.name}! ✨`);
                      }}
                      className="mt-2 text-[11px] font-black py-1 px-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white transition cursor-pointer shadow-2xs"
                    >
                      Đặt làm Avatar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: DUDU SOLO */}
            <div className="bg-white/80 rounded-3xl p-4 border-2 border-amber-100 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🤎</span>
                <div>
                  <h4 className="font-black text-sm text-stone-800">Nhân Vật Dudu (Một Mình)</h4>
                  <p className="text-[11px] text-stone-400">Gấu nâu ấm áp, chăm chỉ, bĩu môi hờn dỗi</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUBU_DUDU_STICKERS.filter(s => s.tag === 'dudu_solo').map((stk) => (
                  <div
                    key={stk.id}
                    className="bg-amber-50/40 rounded-2xl p-3 border border-amber-200/70 flex flex-col items-center text-center group hover:shadow-sm transition"
                  >
                    <div
                      onClick={() => {
                        sound.playDeductPoint();
                        confetti({
                          particleCount: 50,
                          spread: 60,
                          origin: { y: 0.7 },
                          colors: ['#D2B48C', '#F4A460', '#FFD700'],
                        });
                        showToast(`Dudu: "${stk.name}"! 🤎`);
                      }}
                      className="w-24 h-24 p-1 flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform"
                    >
                      <img src={stk.url} alt={stk.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                    </div>
                    <h5 className="font-extrabold text-xs text-stone-800 mt-1.5">{stk.name}</h5>
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-2">{stk.description}</p>
                    <button
                      onClick={() => {
                        sound.playPop();
                        setMembers(prev => prev.map(m => m.id === activeMember.id ? { ...m, avatarSticker: stk.url, character: 'dudu' } : m));
                        showToast(`Đã đặt "${stk.name}" làm Avatar cho ${activeMember.name}! ✨`);
                      }}
                      className="mt-2 text-[11px] font-black py-1 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer shadow-2xs"
                    >
                      Đặt làm Avatar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: COUPLE STICKERS */}
            <div className="bg-white/80 rounded-3xl p-4 border-2 border-rose-100 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💕</span>
                <div>
                  <h4 className="font-black text-sm text-stone-800">Cặp Đôi Bubu & Dudu Bên Nhau</h4>
                  <p className="text-[11px] text-stone-400">Những khoảnh khắc ngọt ngào & dọn nhà cùng nhau</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {BUBU_DUDU_STICKERS.filter(s => s.tag === 'couple').map((stk) => (
                  <div
                    key={stk.id}
                    onClick={() => {
                      sound.playEarnPoint();
                      confetti({
                        particleCount: 50,
                        spread: 60,
                        origin: { y: 0.7 },
                        colors: ['#FF69B4', '#FFA07A', '#FFD700'],
                      });
                      showToast(`Cặp đôi: "${stk.name}"! 💕`);
                    }}
                    className="bg-rose-50/30 rounded-2xl p-2.5 border border-rose-200/50 flex flex-col items-center text-center group hover:shadow-xs transition cursor-pointer"
                  >
                    <div className="w-20 h-20 p-1 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img src={stk.url} alt={stk.name} className="w-full h-full object-contain filter drop-shadow-xs" />
                    </div>
                    <h5 className="font-extrabold text-[11px] text-stone-800 mt-1 line-clamp-1">{stk.name}</h5>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playPop();
                        setMembers(prev => prev.map(m => m.id === activeMember.id ? { ...m, avatarSticker: stk.url } : m));
                        showToast(`Đã đặt "${stk.name}" làm Avatar cho ${activeMember.name}! ✨`);
                      }}
                      className="mt-1.5 text-[10px] font-bold py-0.5 px-2 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 transition cursor-pointer"
                    >
                      Làm Avatar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Poster Preview */}
            <div className="bg-amber-50 rounded-3xl p-4 border border-amber-200 text-center flex flex-col items-center">
              <h4 className="font-extrabold text-xs text-amber-900 mb-2">Ảnh gốc bộ Sticker Bubu & Dudu</h4>
              <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-amber-200 shadow-xs">
                <img src="/stickers/original_pack.png" alt="Sticker Pack" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: NHẬT KÝ & LỊCH SỬ (LOGS) ================= */}
        {activeTab === 'logs' && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-stone-800">
                  Nhật Ký Biến Động Điểm 📜
                </h3>
                <p className="text-xs text-stone-500">
                  Ghi nhận đầy đủ minh bạch các lần cộng, trừ điểm và đổi quà
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
              {[
                { id: 'all', label: `Tất cả (${logs.length})` },
                { id: 'earn', label: 'Cộng điểm (+)' },
                { id: 'deduct', label: 'Trừ điểm (-)' },
                {
                  id: 'reward_redeem',
                  label: `Đổi quà 🎁 (${logs.filter((l) => l.type === 'reward_redeem').length})`,
                },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setLogFilter(f.id as any)}
                  className={`py-1.5 px-3 rounded-xl whitespace-nowrap transition cursor-pointer ${
                    logFilter === f.id
                      ? 'bg-amber-500 text-white font-black shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* If reward_redeem filter is selected, offer quick jump to claims pipeline */}
            {logFilter === 'reward_redeem' && (
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-2xl flex items-center justify-between text-left">
                <div>
                  <h4 className="font-black text-xs text-pink-900">Tiến Trình Xử Lý Phiếu Quà</h4>
                  <p className="text-[11px] text-pink-700">Xem trạng thái chuẩn bị và trao quà chi tiết</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('shop');
                    setShopSubTab('claims');
                  }}
                  className="py-1.5 px-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition cursor-pointer shadow-xs whitespace-nowrap"
                >
                  Mở Phiếu Quà 🎫
                </button>
              </div>
            )}

            {logs.filter((l) => logFilter === 'all' || l.type === logFilter).length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-stone-200">
                <div className="w-20 h-20 mx-auto mb-2">
                  <img src="/stickers/cuddle_mochi.png" alt="Empty logs" className="w-full h-full object-contain" />
                </div>
                <p className="font-bold text-stone-600">Không có giao dịch nào phù hợp</p>
                <p className="text-xs text-stone-400 mt-1">Chưa có bản ghi nào trong mục này!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs
                  .filter((l) => logFilter === 'all' || l.type === logFilter)
                  .map((l) => {
                  const isEarn = l.points > 0;
                  const dateStr = new Date(l.timestamp).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }) + ' • ' + new Date(l.timestamp).toLocaleDateString('vi-VN');

                  return (
                    <div
                      key={l.id}
                      className="bg-white rounded-2xl p-3 border border-stone-200 flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 p-1 flex items-center justify-center shrink-0">
                          {l.stickerImage ? (
                            <img src={l.stickerImage} alt="Sticker" className="w-full h-full object-contain" />
                          ) : (
                            <Mascot character={l.memberCharacter} size={32} animate={false} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              {l.memberName}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-stone-800">
                              {l.taskTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-stone-400">{dateStr}</span>
                            {l.note && (
                              <span className="text-[11px] text-amber-700 italic">
                                "{l.note}"
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {l.points !== 0 ? (
                          <span
                            className={`font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl ${
                              isEarn
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {isEarn ? '+' : ''}{l.points} 🐻
                          </span>
                        ) : (
                          <span className="font-black text-xs px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600">
                            Reset
                          </span>
                        )}
                        <button
                          onClick={() => handleUndoLog(l)}
                          className="p-1.5 text-stone-300 hover:text-stone-600 rounded-lg cursor-pointer"
                          title="Hoàn tác giao dịch này"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: BẢNG XẾP HẠNG (LEADERBOARD) ================= */}
        {activeTab === 'leaderboard' && (
          <div className="mt-4 space-y-4">
            <div className="text-center py-1">
              <h3 className="text-lg font-black text-stone-800 flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Bảng Phong Thần Nhà Gấu</span>
              </h3>
              <p className="text-xs text-stone-500">
                Gia đình cùng thi đua chăm ngoan và yêu thương
              </p>
            </div>

            {/* Podium Ranking */}
            <div className="space-y-2.5">
              {[...members]
                .sort((a, b) => b.points - a.points)
                .map((m, index) => {
                  const medals = ['🥇 Quán Quân', '🥈 Á Quân', '🥉 Hạng Ba'];
                  const isTop = index === 0;

                  return (
                    <div
                      key={m.id}
                      className={`rounded-3xl p-4 border-2 flex items-center justify-between transition ${
                        isTop
                          ? 'bg-gradient-to-r from-amber-100 to-amber-50 border-amber-300 shadow-md'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-white p-1.5 border border-stone-200 shadow-xs flex items-center justify-center">
                          {m.avatarSticker ? (
                            <img src={m.avatarSticker} alt={m.name} className="w-full h-full object-contain filter drop-shadow-xs" />
                          ) : (
                            <Mascot character={m.character} expression={isTop ? 'celebrate' : 'happy'} size={48} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-amber-800">
                              {medals[index] || `#${index + 1}`}
                            </span>
                            <h4 className="font-black text-base text-stone-800">
                              {m.name}
                            </h4>
                          </div>
                          <p className="text-xs text-stone-500">{m.role}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-black text-stone-800">
                          {m.points} <span className="text-sm">🐻</span>
                        </div>
                        <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md inline-block">
                          🔥 {m.streak} ngày streak
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* General Stats */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="bg-white p-3 rounded-2xl border border-stone-200 text-center">
                <span className="text-xl">🧹</span>
                <div className="text-base font-black text-stone-800 mt-1">
                  {tasks.reduce((acc, t) => acc + (t.timesCompleted || 0), 0)}
                </div>
                <span className="text-[10px] text-stone-400 font-bold uppercase">Việc Đã Làm</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200 text-center">
                <span className="text-xl">🎁</span>
                <div className="text-base font-black text-stone-800 mt-1">
                  {claims.length}
                </div>
                <span className="text-[10px] text-stone-400 font-bold uppercase">Quà Đã Đổi</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200 text-center">
                <span className="text-xl">🍯</span>
                <div className="text-base font-black text-stone-800 mt-1">
                  {members.reduce((acc, m) => acc + m.points, 0)}
                </div>
                <span className="text-[10px] text-stone-400 font-bold uppercase">Tổng Điểm Gấu</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: CÀI ĐẶT & SAO LƯU (SETTINGS) ================= */}
        {activeTab === 'settings' && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-base font-black text-stone-800">
                ⚙️ Cài Đặt & Quản Lý Dữ Liệu
              </h3>
              <p className="text-xs text-stone-500">
                Tùy chỉnh nhóm gia đình, reset điểm và bảo vệ dữ liệu
              </p>
            </div>

            {/* REQUIREMENT 1: RESET ALL POINTS TO 0 */}
            <div className="bg-amber-50/80 p-4 rounded-3xl border-2 border-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-200 text-amber-900">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-950">
                    Đặt Lại 0 Điểm Tất Cả (Khởi Động Mới)
                  </h4>
                  <p className="text-xs text-amber-800/80">
                    Đưa điểm mọi người về 0 🐻 để thi đua tuần/tháng mới (vẫn giữ nguyên thành viên & nhiệm vụ)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition shadow-xs cursor-pointer shrink-0"
              >
                Reset về 0 🐻
              </button>
            </div>

            {/* Member Management entry */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-800">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-800">Quản Lý Thành Viên Gia Đình</h4>
                  <p className="text-xs text-stone-400">Thêm, xóa thành viên, cập nhật ảnh avatar hoặc điều chỉnh điểm</p>
                </div>
              </div>
              <button
                onClick={() => setIsMemberManagementOpen(true)}
                className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition cursor-pointer shrink-0"
              >
                Quản lý
              </button>
            </div>

            {/* Family Group Settings */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-800">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-800">Nhóm Gia Đình & Chia Sẻ ID</h4>
                  <p className="text-xs text-stone-400">Đang ở nhóm: <strong>{currentFamily.name}</strong> (Mã: {currentFamily.id})</p>
                </div>
              </div>
              <button
                onClick={() => setIsFamilyModalOpen(true)}
                className="py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition cursor-pointer shrink-0"
              >
                Đổi nhóm
              </button>
            </div>

            {/* Sound Toggle */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-800">Âm thanh vui nhộn</h4>
                  <p className="text-xs text-stone-400">Tiếng leng keng cute khi cộng trừ điểm và đổi quà</p>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  soundEnabled ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                    soundEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Real-time Cloud Sync Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 p-4 rounded-3xl border-2 border-emerald-300 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-xs">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-emerald-950">
                        Đồng Bộ Đám Mây Đa Thiết Bị
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                        Đang hoạt động
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800/80 mt-0.5">
                      Dữ liệu điểm, đổi quà, nhiệm vụ tự động liên thông thời gian thực giữa Máy tính & Điện thoại theo Mã Nhóm <strong>{currentFamily.id}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-stone-500 block text-[11px]">Trạng thái đồng bộ:</span>
                  <span className="font-bold text-stone-800">
                    {lastSyncedAt ? `Lần cuối: ${new Date(lastSyncedAt).toLocaleTimeString('vi-VN')}` : 'Đã kết nối đám mây'}
                  </span>
                </div>
                <button
                  onClick={() => syncWithCloud(true)}
                  disabled={isSyncing}
                  className="w-full sm:w-auto py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Ngay Bây Giờ'}</span>
                </button>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200 space-y-3">
              <h4 className="font-bold text-sm text-stone-800">Sao lưu & Đồng bộ thiết bị</h4>
              <p className="text-xs text-stone-500">
                Xuất file dữ liệu để gửi sang điện thoại khác hoặc lưu trữ an toàn
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleExportData}
                  className="flex-1 py-2.5 px-3 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất File Backup</span>
                </button>
                <label className="flex-1 py-2.5 px-3 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Khôi Phục Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Reset to Default */}
            <div className="bg-rose-50/50 p-4 rounded-3xl border border-rose-200">
              <h4 className="font-bold text-sm text-rose-900">Khôi phục mặc định</h4>
              <p className="text-xs text-rose-700/80 mt-0.5">
                Xóa toàn bộ dữ liệu hiện tại của nhóm và nạp lại dữ liệu mẫu ban đầu
              </p>
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn cài lại từ đầu? Mọi điểm hiện tại sẽ bị xóa.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="mt-3 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition cursor-pointer"
              >
                Đặt Lại Tất Cả
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- CONFIRM RESET ALL POINTS MODAL (Requirement 1) --- */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-pop">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-200 text-center">
            <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
              <img src="/stickers/walking_flag.png" alt="Reset" className="w-full h-full object-contain filter drop-shadow-sm" />
            </div>
            <h3 className="text-lg font-black text-stone-800">
              Khởi Động Lại Chu Kỳ Mới?
            </h3>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              Tất cả thành viên trong nhóm <strong>{currentFamily.name}</strong> sẽ được đưa về <strong>0 🐻 điểm gấu</strong> để bắt đầu chặng thi đua mới.
            </p>

            <label className="flex items-center justify-center gap-2 mt-3 cursor-pointer select-none bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 text-left">
              <input
                type="checkbox"
                checked={resetStreakToo}
                onChange={(e) => setResetStreakToo(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-amber-950">
                Đồng thời reset số ngày streak (🔥 về 0)
              </span>
            </label>

            <span className="text-[11px] text-stone-400 mt-2 block">
              (Các việc cần làm, voucher quà và danh sách thành viên vẫn được giữ nguyên).
            </span>

            <div className="flex gap-2.5 mt-4">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 font-bold text-xs text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleResetAllPoints}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition shadow-xs cursor-pointer"
              >
                Xác Nhận Đưa Về 0 🐻
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      <ActionConfirmModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onConfirm={handleConfirmTaskAction}
        task={selectedTaskForAction}
        member={activeMember}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      <RewardModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        onSave={handleSaveReward}
      />

      <RewardRedeemModal
        isOpen={isRewardRedeemOpen}
        onClose={() => {
          setIsRewardRedeemOpen(false);
          setSelectedRewardToRedeem(null);
        }}
        onConfirm={handleConfirmRedeem}
        reward={selectedRewardToRedeem}
        member={activeMember}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        onSave={handleSaveMember}
        onDelete={handleDeleteMember}
        memberToEdit={memberToEdit}
        existingMemberNames={members.map((m) => m.name)}
      />

      <MemberManagementModal
        isOpen={isMemberManagementOpen}
        onClose={() => setIsMemberManagementOpen(false)}
        members={members}
        activeMemberId={activeMemberId}
        onSelectMember={(id) => {
          setActiveMemberId(id);
          setIsMemberManagementOpen(false);
          showToast('Đã chọn thành viên!');
        }}
        onOpenAddMember={() => {
          setMemberToEdit(null);
          setIsMemberModalOpen(true);
        }}
        onOpenEditMember={(member) => {
          setMemberToEdit(member);
          setIsMemberModalOpen(true);
        }}
        onDeleteMember={handleDeleteMember}
        onQuickAdjustPoints={handleQuickAdjustPoints}
        onResetMemberStreak={handleResetMemberStreak}
        onOpenResetAllModal={() => setIsResetConfirmOpen(true)}
      />

      <FamilyModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        currentFamily={currentFamily}
        families={families}
        onSelectFamily={handleSelectFamily}
        onCreateFamily={handleCreateFamily}
        onJoinFamily={handleJoinFamily}
      />

      <ClaimProfileModal
        isOpen={isClaimProfileOpen}
        onClose={() => setIsClaimProfileOpen(false)}
        familyName={currentFamily.name}
        familyId={currentFamily.id}
        members={members}
        currentMemberId={activeMemberId}
        onSelectProfile={handleSelectProfile}
        onOpenCreateMember={() => {
          setMemberToEdit(null);
          setIsMemberModalOpen(true);
        }}
      />
    </div>
  );
}
