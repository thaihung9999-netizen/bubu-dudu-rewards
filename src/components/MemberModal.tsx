import React, { useState, useEffect } from 'react';
import type { Member, CharacterType } from '../types';
import { BUBU_DUDU_STICKERS } from '../utils/stickers';
import { Mascot } from './Mascot';
import { X, UserPlus, Trash2 } from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<Member, 'id' | 'points' | 'streak'>, editId?: string) => void;
  onDelete?: (id: string) => void;
  memberToEdit?: Member | null;
}



export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  memberToEdit,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [character, setCharacter] = useState<CharacterType>('bubu');
  const [avatarSticker, setAvatarSticker] = useState<string | undefined>(undefined);
  const [stickerFilter, setStickerFilter] = useState<'all' | 'bubu_solo' | 'dudu_solo' | 'couple'>('all');

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name);
      setRole(memberToEdit.role);
      setCharacter(memberToEdit.character);
      setAvatarSticker(memberToEdit.avatarSticker);
    } else {
      setName('');
      setRole('');
      setCharacter('bubu');
      setAvatarSticker('/stickers/bubu_solo_hat.png');
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        role: role.trim() || 'Thành viên nhà Gấu',
        character,
        avatarSticker,
      },
      memberToEdit?.id
    );
    onClose();
  };

  const filteredStickers = BUBU_DUDU_STICKERS.filter((s) => {
    if (stickerFilter === 'all') return true;
    return s.tag === stickerFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-pop">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 bg-stone-100 p-2 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-3">
          <div className="w-24 h-24 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-2 shadow-inner p-2">
            {avatarSticker ? (
              <img src={avatarSticker} alt="Avatar" className="w-full h-full object-contain filter drop-shadow-sm hover:scale-105 transition-transform" />
            ) : (
              <Mascot character={character} expression="happy" size={76} />
            )}
          </div>
          <h3 className="text-xl font-black text-stone-800">
            {memberToEdit ? 'Chỉnh Sửa Thành Viên' : 'Thêm Thành Viên Mới'}
          </h3>
          <p className="text-xs text-stone-500">
            Chọn hình tượng Bubu hoặc Dudu đại diện
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chọn Sticker Bubu & Dudu làm avatar */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-stone-600">
                Chọn hình Sticker Bubu hoặc Dudu:
              </label>
              {avatarSticker && (
                <button
                  type="button"
                  onClick={() => setAvatarSticker(undefined)}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                >
                  Dùng Icon vẽ
                </button>
              )}
            </div>

            {/* Filter buttons for sticker avatar */}
            <div className="flex gap-1 mb-2 bg-stone-100 p-1 rounded-xl text-[11px] font-bold">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'bubu_solo', label: '🤍 Bubu' },
                { id: 'dudu_solo', label: '🤎 Dudu' },
                { id: 'couple', label: '💕 Cặp đôi' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStickerFilter(f.id as any)}
                  className={`flex-1 py-1 rounded-lg transition cursor-pointer text-center ${
                    stickerFilter === f.id
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sticker Grid */}
            <div className="grid grid-cols-4 gap-2 p-2 bg-amber-50/50 rounded-2xl max-h-36 overflow-y-auto border border-amber-200/80">
              {filteredStickers.map((stk) => (
                <button
                  type="button"
                  key={stk.id}
                  onClick={() => {
                    setAvatarSticker(stk.url);
                    if (stk.tag === 'bubu_solo') setCharacter('bubu');
                    if (stk.tag === 'dudu_solo') setCharacter('dudu');
                  }}
                  className={`h-16 p-1 rounded-xl flex flex-col items-center justify-center transition cursor-pointer border-2 bg-white ${
                    avatarSticker === stk.url
                      ? 'border-amber-500 ring-2 ring-amber-300 scale-105'
                      : 'border-stone-200 hover:border-amber-300'
                  }`}
                  title={stk.name}
                >
                  <img src={stk.url} alt={stk.name} className="w-10 h-10 object-contain" />
                  <span className="text-[9px] text-stone-500 font-bold truncate max-w-full mt-0.5">
                    {stk.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">
              Tên gọi:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Vợ Bubu, Chồng Dudu, Bé Ben..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">
              Danh hiệu / Vai trò:
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ví dụ: Nữ hoàng việc nhà, Bé ngoan..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="flex gap-2 pt-2">
            {memberToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Bạn có chắc muốn xóa thành viên ${memberToEdit.name}?`)) {
                    onDelete(memberToEdit.id);
                    onClose();
                  }
                }}
                className="p-3 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                title="Xóa thành viên"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{memberToEdit ? 'Lưu' : 'Thêm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
