import React, { useState } from 'react';
import type { Member } from '../types';
import { Mascot } from './Mascot';
import { X, UserCheck, Plus, Edit2 } from 'lucide-react';

interface ClaimProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyName: string;
  familyId: string;
  members: Member[];
  currentMemberId: string;
  onSelectProfile: (memberId: string, updatedName?: string) => void;
  onOpenCreateMember: () => void;
}

export const ClaimProfileModal: React.FC<ClaimProfileModalProps> = ({
  isOpen,
  onClose,
  familyName,
  familyId,
  members,
  currentMemberId,
  onSelectProfile,
  onOpenCreateMember,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const handleClaim = (m: Member) => {
    if (editingId === m.id && customName.trim()) {
      onSelectProfile(m.id, customName.trim());
    } else {
      onSelectProfile(m.id);
    }
    setEditingId(null);
    setCustomName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-pop">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 bg-stone-100 p-2 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
            <img
              src="/stickers/bubu_dudu_pair.png"
              alt="Gia Đình Gấu"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
          <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
            Mã Nhóm: {familyId}
          </span>
          <h3 className="text-xl font-black text-stone-800">
            Bạn Là Ai Trong {familyName}? 🐻
          </h3>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            Chọn thành viên mẫu sẵn có để vào vai ngay trên thiết bị này, hoặc đổi tên thành tên của bạn!
          </p>
        </div>

        {/* Member Cards */}
        <div className="space-y-3 mb-5">
          {members.map((m) => {
            const isCurrent = m.id === currentMemberId;
            const isEditing = editingId === m.id;

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border-2 transition text-left ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-13 h-13 rounded-2xl bg-white p-1 border border-stone-200 shadow-xs flex items-center justify-center shrink-0">
                      {m.avatarSticker ? (
                        <img
                          src={m.avatarSticker}
                          alt={m.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Mascot character={m.character} size={44} animate={false} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Nhập tên của bạn..."
                            autoFocus
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                          />
                          <p className="text-[10px] text-stone-400">Đổi tên nhân vật mẫu này</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-sm text-stone-800 truncate">
                              {m.name}
                            </h4>
                            {isCurrent && (
                              <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded-md">
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 truncate">{m.role}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-black text-amber-900">
                              {m.points} 🐻 điểm
                            </span>
                            <span className="text-[10px] font-bold text-orange-600">
                              🔥 {m.streak} ngày
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleClaim(m)}
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{isEditing ? 'Lưu & Chọn' : 'Vào Vai Này'}</span>
                    </button>

                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingId(m.id);
                          setCustomName(m.name);
                        }}
                        className="py-1 px-2 rounded-lg text-[10px] font-bold text-stone-500 hover:text-amber-800 hover:bg-stone-100 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Đổi tên tôi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Create Brand New Member Option */}
        <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenCreateMember();
            }}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-amber-300 hover:bg-amber-50 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Thành Viên Mới Hoàn Toàn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
