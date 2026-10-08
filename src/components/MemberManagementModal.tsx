import React, { useState } from 'react';
import type { Member } from '../types';
import { Mascot } from './Mascot';
import { X, UserPlus, Edit2, Trash2, Award, Flame, Plus, Minus, RotateCcw } from 'lucide-react';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
  onOpenAddMember: () => void;
  onOpenEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onQuickAdjustPoints: (member: Member, amount: number, reason: string) => void;
  onResetMemberStreak?: (memberId: string) => void;
  onOpenResetAllModal?: () => void;
}

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  members,
  activeMemberId,
  onSelectMember,
  onOpenAddMember,
  onOpenEditMember,
  onDeleteMember,
  onQuickAdjustPoints,
  onResetMemberStreak,
  onOpenResetAllModal,
}) => {
  const [adjustingMember, setAdjustingMember] = useState<Member | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState('');

  if (!isOpen) return null;

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingMember) return;
    const finalAmount = adjustType === 'add' ? Math.abs(adjustAmount) : -Math.abs(adjustAmount);
    onQuickAdjustPoints(adjustingMember, finalAmount, adjustReason.trim() || 'Điều chỉnh điểm thủ công');
    setAdjustingMember(null);
    setAdjustReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-pop">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 bg-stone-100 p-2 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 mb-2">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-stone-800">
            Quản Lý Thành Viên Gia Đình 👨‍👩‍👧‍👦
          </h3>
          <p className="text-xs text-stone-500 text-center">
            Thêm, sửa đổi tên gọi, vai trò, ảnh sticker và điều chỉnh điểm
          </p>
        </div>

        {/* Action Buttons: Add Member & Reset All */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => {
              onOpenAddMember();
            }}
            className="py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" />
            <span>+ Thêm Mới</span>
          </button>

          {onOpenResetAllModal && (
            <button
              onClick={() => {
                onClose();
                onOpenResetAllModal();
              }}
              className="py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Đưa điểm tất cả thành viên về 0 để bắt đầu chu kỳ mới"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Tất Cả Về 0</span>
            </button>
          )}
        </div>

        {/* Guidance Tip */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-left flex items-start gap-2.5">
          <span className="text-base shrink-0">💡</span>
          <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
            <strong>Gia đình thực tế:</strong> Các bạn gấu <em>Bubu (Vợ iu)</em>, <em>Dudu (Chồng iu)</em> ban đầu là nhân vật mẫu. Bạn có thể bấm nút <strong>✏️ (Sửa)</strong> để đổi tên thành người nhà thật của mình, hoặc bấm <strong>🗑️ (Xóa)</strong> để xóa thành viên mẫu và bấm <strong>+ Thêm</strong> thành viên mới.
          </p>
        </div>

        {/* Member List */}
        <div className="space-y-3">
          {members.map((m) => {
            const isActive = m.id === activeMemberId;
            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border-2 transition flex items-center justify-between ${
                  isActive
                    ? 'border-amber-400 bg-amber-50/60 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-amber-200'
                }`}
              >
                {/* Left: Avatar & Info */}
                <div
                  onClick={() => onSelectMember(m.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2"
                >
                  <div className="w-13 h-13 rounded-2xl bg-white p-1 border border-stone-200 shadow-xs flex items-center justify-center shrink-0">
                    {m.avatarSticker ? (
                      <img src={m.avatarSticker} alt={m.name} className="w-full h-full object-contain" />
                    ) : (
                      <Mascot character={m.character} size={44} animate={false} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-black text-sm text-stone-800 truncate">{m.name}</h4>
                      {isActive && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded-md">
                          Đang chọn
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">{m.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                        {m.points} 🐻
                      </span>
                      <span className="text-[10px] font-bold text-orange-600 flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-orange-500" />
                        <span>{m.streak} ngày</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setAdjustingMember(m);
                      setAdjustType('add');
                      setAdjustAmount(10);
                      setAdjustReason('');
                    }}
                    className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                    title="Cộng/Trừ điểm trực tiếp"
                  >
                    <span className="text-xs font-extrabold px-1">± Điểm</span>
                  </button>
                  <button
                    onClick={() => onOpenEditMember(m)}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                    title="Chỉnh sửa thông tin / Đổi ảnh avatar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteMember(m.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                    title="Xóa thành viên"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Adjust Sub-modal */}
        {adjustingMember && (
          <div className="mt-4 p-4 rounded-2xl bg-stone-50 border-2 border-amber-200 animate-pop text-left">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-extrabold text-xs text-stone-800">
                Điều chỉnh điểm cho: <span className="text-amber-800 font-black">{adjustingMember.name}</span>
              </h5>
              <button
                type="button"
                onClick={() => setAdjustingMember(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer ${
                    adjustType === 'add'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cộng điểm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('subtract')}
                  className={`py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer ${
                    adjustType === 'subtract'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Trừ điểm</span>
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">
                  Số điểm điều chỉnh:
                </label>
                <div className="flex gap-2">
                  {[5, 10, 20, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAdjustAmount(num)}
                      className={`flex-1 py-1 rounded-lg border text-xs font-black transition cursor-pointer ${
                        adjustAmount === num
                          ? 'bg-amber-100 border-amber-400 text-amber-900'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">
                  Lý do điều chỉnh:
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ví dụ: Thưởng nóng cuối tuần, bù điểm hôm qua..."
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                />
              </div>

              {/* Streak Info & Quick Reset */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                  Chuỗi chăm chỉ: {adjustingMember.streak} ngày
                </span>
                {onResetMemberStreak && adjustingMember.streak > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Đặt lại số ngày streak của ${adjustingMember.name} về 0?`)) {
                        onResetMemberStreak(adjustingMember.id);
                        setAdjustingMember({ ...adjustingMember, streak: 0 });
                      }
                    }}
                    className="text-[10px] font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 px-2 py-1 rounded-lg border border-orange-300 transition cursor-pointer"
                  >
                    🔥 Đặt lại streak về 0
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition shadow-xs cursor-pointer"
              >
                Xác Nhận Điều Chỉnh ({adjustType === 'add' ? '+' : '-'}{adjustAmount} 🐻)
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
