import React, { useState } from 'react';
import type { TaskItem, Member } from '../types';
import { Mascot } from './Mascot';
import { Check, X } from 'lucide-react';

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (task: TaskItem, member: Member, note: string) => void;
  task: TaskItem | null;
  member: Member;
}

export const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  task,
  member,
}) => {
  const [note, setNote] = useState('');

  if (!isOpen || !task) return null;

  const isPositive = task.points > 0;
  // Choose sticker illustration
  const displaySticker =
    task.stickerImage ||
    (isPositive ? '/stickers/flowers_love.png' : '/stickers/grumpy_dudu.png');

  const handleConfirm = () => {
    onConfirm(task, member, note);
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-pop">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-100 flex flex-col items-center text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 bg-stone-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot / Sticker Animation Showcase */}
        <div className="relative -mt-12 mb-2 flex items-center justify-center">
          <div className="w-32 h-32 rounded-3xl bg-amber-50/80 border-4 border-amber-200 flex items-center justify-center shadow-lg p-2.5 backdrop-blur-xs">
            {displaySticker ? (
              <img
                src={displaySticker}
                alt="Bubu Dudu Sticker"
                className="w-full h-full object-contain filter drop-shadow-md hover:scale-110 transition-transform"
              />
            ) : (
              <Mascot character={member.character} expression={isPositive ? 'celebrate' : 'pout'} size={95} />
            )}
          </div>
          <span className="absolute -bottom-2 -right-2 text-2xl bg-white p-1.5 rounded-2xl shadow-md border-2 border-amber-200 animate-bounce">
            {task.icon}
          </span>
        </div>

        {/* Title & Tag */}
        <h3 className="text-xl font-extrabold text-stone-800 mt-2">
          {isPositive ? 'Khen Thưởng Gấu Chăm! 🎉' : 'Nhắc Nhở Gấu Yêu 🥺'}
        </h3>
        <p className="text-sm text-stone-500 mt-1">
          Ghi nhận cho <strong className="text-amber-700">{member.name}</strong>
        </p>

        {/* Task Details Card */}
        <div className={`w-full mt-4 p-4 rounded-2xl border-2 flex items-center justify-between ${
          isPositive ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
        }`}>
          <div className="text-left flex-1 pr-2">
            <div className="font-bold text-base flex items-center gap-1.5">
              <span>{task.icon}</span>
              <span>{task.title}</span>
            </div>
            {task.description && (
              <p className="text-xs text-stone-600 mt-0.5 line-clamp-1">{task.description}</p>
            )}
          </div>
          <div className={`text-xl font-black px-3 py-1.5 rounded-xl flex items-center gap-1 ${
            isPositive ? 'bg-emerald-500 text-white shadow-xs' : 'bg-rose-500 text-white shadow-xs'
          }`}>
            <span>{isPositive ? '+' : ''}{task.points}</span>
            <span className="text-sm">🐻</span>
          </div>
        </div>

        {/* Note input */}
        <div className="w-full mt-4 text-left">
          <label className="text-xs font-bold text-stone-500 block mb-1.5">
            Ghi chú thêm (không bắt buộc):
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isPositive ? 'Ví dụ: Tự giác dọn rất nhanh, siêu đáng yêu...' : 'Ví dụ: Nhắc 2 lần mới chịu làm...'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
          >
            Để sau
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer ${
              isPositive
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-200'
                : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-200'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>{isPositive ? 'Cộng Điểm Ngay' : 'Trừ Điểm Gấu'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
