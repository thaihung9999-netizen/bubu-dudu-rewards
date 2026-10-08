import React from 'react';
import type { RewardItem, Member } from '../types';
import { Mascot } from './Mascot';
import { X, Check, AlertCircle } from 'lucide-react';

interface RewardRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reward: RewardItem, member: Member) => void;
  reward: RewardItem | null;
  member: Member;
}

export const RewardRedeemModal: React.FC<RewardRedeemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reward,
  member,
}) => {
  if (!isOpen || !reward) return null;

  const canAfford = member.points >= reward.cost;
  const missingPoints = reward.cost - member.points;

  // Real Bubu Dudu sticker for reward celebration vs not enough points
  const displaySticker = canAfford
    ? reward.stickerImage || '/stickers/flowers_love.png'
    : '/stickers/grumpy_dudu.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-pop">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-100 flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 bg-stone-100 p-2 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot / Sticker Showcase */}
        <div className="relative -mt-12 mb-2 flex items-center justify-center">
          <div className="w-32 h-32 rounded-3xl bg-amber-50/90 border-4 border-amber-200 flex items-center justify-center shadow-lg p-2.5">
            {displaySticker ? (
              <img
                src={displaySticker}
                alt="Bubu Dudu Voucher Sticker"
                className="w-full h-full object-contain filter drop-shadow-md hover:scale-105 transition-transform"
              />
            ) : (
              <Mascot
                character={member.character}
                expression={canAfford ? 'celebrate' : 'sad'}
                size={90}
              />
            )}
          </div>
          <span className="absolute -bottom-2 -right-2 text-2xl bg-white p-1.5 rounded-2xl shadow-md border-2 border-amber-200 animate-bounce">
            {reward.icon}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-stone-800 mt-2">
          {canAfford ? 'Đổi Thưởng Bubu & Dudu! 🎁' : 'Chưa Đủ Hũ Mật Ơi 🍯'}
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Dành cho <strong className="text-amber-700">{member.name}</strong>
        </p>

        {/* Voucher Info */}
        <div className="w-full mt-4 p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/60 text-stone-800 flex items-center justify-between">
          <div className="text-left flex-1 pr-2">
            <div className="font-extrabold text-base flex items-center gap-1.5">
              <span>{reward.icon}</span>
              <span>{reward.title}</span>
            </div>
            {reward.description && (
              <p className="text-xs text-stone-600 mt-1">{reward.description}</p>
            )}
          </div>
          <div className="text-lg font-black px-3 py-1.5 rounded-xl bg-amber-500 text-white shadow-xs">
            {reward.cost} 🐻
          </div>
        </div>

        {/* Balance Status */}
        <div className="w-full mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex justify-between items-center">
          <span className="text-stone-500">Điểm hiện có của bạn:</span>
          <span className="font-black text-stone-800 text-sm">{member.points} 🐻</span>
        </div>

        {!canAfford && (
          <div className="w-full mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Bạn còn thiếu <strong>{missingPoints} 🐻</strong>. Hãy làm thêm việc nhà để gom đủ điểm đổi quà nhé!
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 w-full mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
          >
            {canAfford ? 'Để sau' : 'Đã hiểu'}
          </button>
          {canAfford && (
            <button
              onClick={() => {
                onConfirm(reward, member);
                onClose();
              }}
              className="flex-1 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-200 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Đổi Quà Ngay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
