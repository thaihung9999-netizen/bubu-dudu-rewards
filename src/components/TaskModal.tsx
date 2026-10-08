import React, { useState, useEffect } from 'react';
import type { TaskItem, TaskCategory } from '../types';
import { BUBU_DUDU_STICKERS } from '../utils/stickers';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<TaskItem, 'id' | 'timesCompleted'>, editId?: string) => void;
  taskToEdit?: TaskItem | null;
}

const COMMON_EMOJIS = ['🧹', '🍽️', '🧺', '🍳', '🗑️', '📚', '📖', '🌙', '💧', '🏃', '💆', '🥰', '🧸', '🧦', '📱', '🥣', '😤', '📝', '🪴', '🐶'];

const CATEGORIES: { id: TaskCategory; label: string; icon: string }[] = [
  { id: 'housework', label: 'Việc Nhà', icon: '🧹' },
  { id: 'habits', label: 'Thói Quen Tốt', icon: '🌱' },
  { id: 'study_work', label: 'Học Tập / Công Việc', icon: '📚' },
  { id: 'love_caring', label: 'Yêu Thương & Gắn Kết', icon: '💖' },
  { id: 'penalty', label: 'Nhắc Nhở / Phạt', icon: '⚠️' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState<number>(20);
  const [isPenalty, setIsPenalty] = useState<boolean>(false);
  const [category, setCategory] = useState<TaskCategory>('housework');
  const [icon, setIcon] = useState('🧹');
  const [stickerImage, setStickerImage] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setPoints(Math.abs(taskToEdit.points));
      setIsPenalty(taskToEdit.points < 0);
      setCategory(taskToEdit.category);
      setIcon(taskToEdit.icon);
      setStickerImage(taskToEdit.stickerImage);
      setDescription(taskToEdit.description || '');
    } else {
      setTitle('');
      setPoints(20);
      setIsPenalty(false);
      setCategory('housework');
      setIcon('🧹');
      setStickerImage(undefined);
      setDescription('');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalPoints = isPenalty ? -Math.abs(points) : Math.abs(points);
    onSave(
      {
        title: title.trim(),
        points: finalPoints,
        category: isPenalty ? 'penalty' : category,
        icon,
        stickerImage,
        description: description.trim(),
      },
      taskToEdit?.id
    );
    onClose();
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

        <h3 className="text-xl font-black text-stone-800 text-center mb-1">
          {taskToEdit ? '✏️ Chỉnh Sửa Đầu Việc' : '✨ Thêm Đầu Việc Mới'}
        </h3>
        <p className="text-xs text-stone-500 text-center mb-5">
          Tùy chỉnh nhiệm vụ kèm mức điểm cộng hoặc trừ cho gia đình
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Loai viec: Cong hay Tru */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setIsPenalty(false);
                if (category === 'penalty') setCategory('housework');
              }}
              className={`py-2.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                !isPenalty
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Cộng Điểm (+)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPenalty(true);
                setCategory('penalty');
                if (!stickerImage) setStickerImage('/stickers/grumpy_dudu.png');
              }}
              className={`py-2.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isPenalty
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Trừ Điểm (-)</span>
            </button>
          </div>

          {/* Ten cong viec */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">
              Tên công việc / hành vi:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isPenalty ? 'Ví dụ: Chưa làm bài tập, Thức khuya...' : 'Ví dụ: Rửa bát, Gấp quần áo, Tưới cây...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
            />
          </div>

          {/* Muc diem */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-stone-600">
                Mức điểm {isPenalty ? 'trừ' : 'thưởng'}:
              </label>
              <span className={`text-base font-black px-2.5 py-0.5 rounded-lg ${
                isPenalty ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isPenalty ? '-' : '+'}{points} 🐻
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[10, 20, 30, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPoints(preset)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                    points === preset
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {isPenalty ? '-' : '+'}{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Chon Sticker Bubu & Dudu (NEW!) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-600">
                Sticker Bubu & Dudu kèm theo:
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
            <div className="flex gap-2 p-2 bg-amber-50/50 rounded-2xl overflow-x-auto border border-amber-200/80">
              {BUBU_DUDU_STICKERS.map((stk) => (
                <button
                  type="button"
                  key={stk.id}
                  onClick={() => setStickerImage(stk.url)}
                  className={`w-14 h-14 p-1 rounded-xl shrink-0 flex items-center justify-center transition cursor-pointer border-2 bg-white ${
                    stickerImage === stk.url
                      ? 'border-amber-500 ring-2 ring-amber-300 scale-105'
                      : 'border-stone-200 hover:border-amber-300'
                  }`}
                  title={stk.name}
                >
                  <img src={stk.url} alt={stk.name} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Chon Emoji Icon */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">
              Chọn Icon biểu tượng nhanh:
            </label>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl border border-amber-300">
                {icon}
              </div>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-20 px-2 py-2 text-center rounded-xl border border-stone-200 text-base"
                maxLength={4}
              />
              <span className="text-xs text-stone-400">hoặc chọn:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 rounded-xl max-h-20 overflow-y-auto border border-stone-200">
              {COMMON_EMOJIS.map((e) => (
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

          {/* Danh muc */}
          {!isPenalty && (
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                Danh mục:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.filter(c => c.id !== 'penalty').map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-left flex items-center gap-1.5 border transition cursor-pointer ${
                      category === c.id
                        ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mo ta chi tiet */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">
              Mô tả thêm:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú điều kiện hoàn thành..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-200 transition cursor-pointer"
            >
              {taskToEdit ? 'Lưu Thay Đổi' : 'Thêm Công Việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
