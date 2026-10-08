import React, { useState } from 'react';
import type { RewardItem } from '../types';
import { BUBU_DUDU_STICKERS } from '../utils/stickers';
import { X, Gift } from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reward: Omit<RewardItem, 'id' | 'redeemedCount'>) => void;
}

const REWARD_EMOJIS = ['🧋', '🎟️', '💆', '🎬', '🎮', '🍲', '💖', '🎁', '🍰', '🍦', '🍕', '☕', '🛌', '🛍️', '🏖️'];

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState<number>(50);
  const [icon, setIcon] = useState('🧋');
  const [stickerImage, setStickerImage] = useState<string | undefined>('/stickers/bubu_dudu_pair.png');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      cost,
      icon,
      stickerImage,
      description: description.trim(),
    });
    setTitle('');
    setCost(50);
    setIcon('🧋');
    setStickerImage('/stickers/bubu_dudu_pair.png');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-pop">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 bg-stone-100 p-2 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mb-2">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-stone-800">
            Thêm Quà / Voucher Mới 🎁
          </h3>
          <p className="text-xs text-stone-500">
            Tạo phần thưởng đổi điểm cho thành viên gia đình
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">
              Tên quà / Đặc quyền thưởng:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: 1 ly trà sữa, 1 ngày không rửa bát..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-stone-600">
                Giá đổi (Điểm Gấu):
              </label>
              <span className="text-base font-black px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800">
                {cost} 🐻
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex gap-2 mt-2">
              {[30, 50, 80, 100, 150].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCost(preset)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                    cost === preset
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {preset} 🐻
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Sticker Bubu Dudu */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-600">
                Chọn Sticker Bubu & Dudu làm hình đại diện:
              </label>
              {stickerImage && (
                <button
                  type="button"
                  onClick={() => setStickerImage(undefined)}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Bỏ chọn
                </button>
              )}
            </div>
            <div className="flex gap-2 p-2 bg-pink-50/50 rounded-2xl overflow-x-auto border border-pink-200/70">
              {BUBU_DUDU_STICKERS.map((stk) => (
                <button
                  type="button"
                  key={stk.id}
                  onClick={() => setStickerImage(stk.url)}
                  className={`w-14 h-14 p-1 rounded-xl shrink-0 flex items-center justify-center transition cursor-pointer border-2 bg-white ${
                    stickerImage === stk.url
                      ? 'border-pink-500 ring-2 ring-pink-300 scale-105'
                      : 'border-stone-200 hover:border-pink-300'
                  }`}
                  title={stk.name}
                >
                  <img src={stk.url} alt={stk.name} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">
              Chọn biểu tượng Icon:
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 rounded-xl max-h-20 overflow-y-auto border border-stone-200">
              {REWARD_EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition cursor-pointer ${
                    icon === e ? 'bg-amber-200 scale-110 shadow-xs' : 'hover:bg-white'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">
              Ghi chú thêm:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quy định áp dụng phần thưởng..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-200 cursor-pointer"
            >
              Thêm Quà
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
