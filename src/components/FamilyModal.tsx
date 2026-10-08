import React, { useState } from 'react';
import type { FamilyGroup } from '../types';
import { X, Users, Copy, Check, Plus, LogIn, Share2 } from 'lucide-react';

interface FamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFamily: FamilyGroup;
  families: FamilyGroup[];
  onSelectFamily: (family: FamilyGroup) => void;
  onCreateFamily: (name: string, customId?: string) => void;
  onJoinFamily: (familyId: string, name?: string) => void;
}

export const FamilyModal: React.FC<FamilyModalProps> = ({
  isOpen,
  onClose,
  currentFamily,
  families,
  onSelectFamily,
  onCreateFamily,
  onJoinFamily,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'create' | 'join'>('current');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyId, setNewFamilyId] = useState('');
  const [joinId, setJoinId] = useState('');
  const [joinName, setJoinName] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteLink = `${window.location.origin}?family=${encodeURIComponent(currentFamily.id)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentFamily.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    onCreateFamily(newFamilyName.trim(), newFamilyId.trim() || undefined);
    setNewFamilyName('');
    setNewFamilyId('');
    setActiveTab('current');
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinId.trim()) return;
    onJoinFamily(joinId.trim(), joinName.trim() || undefined);
    setJoinId('');
    setJoinName('');
    setActiveTab('current');
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
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 mb-2">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-stone-800">
            Mã Nhóm Gia Đình 🏡
          </h3>
          <p className="text-xs text-stone-500 text-center">
            Mỗi gia đình có một mã ID riêng biệt, kết nối các thành viên
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-2xl mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'current'
                ? 'bg-white text-stone-800 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Nhóm Hiện Tại
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white text-stone-800 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            + Tạo Mới
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'join'
                ? 'bg-white text-stone-800 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Nhập ID Nhóm
          </button>
        </div>

        {/* --- VIEW 1: CURRENT FAMILY & SWITCH --- */}
        {activeTab === 'current' && (
          <div className="space-y-4">
            {/* Current Family Box */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-left">
              <span className="text-[10px] font-black uppercase text-amber-800/80 tracking-wider">
                Gia đình đang hoạt động
              </span>
              <h4 className="text-lg font-black text-amber-950 mt-0.5">
                {currentFamily.name}
              </h4>

              <div className="mt-3 flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold block">MÃ ID GIA ĐÌNH:</span>
                  <span className="text-sm font-black text-amber-900 tracking-wide">
                    {currentFamily.id}
                  </span>
                </div>
                <button
                  onClick={handleCopyId}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép ID'}</span>
                </button>
              </div>

              {/* Share link button */}
              <button
                onClick={handleCopyLink}
                className="mt-3 w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Sao chép Link mời các thành viên tham gia</span>
              </button>
            </div>

            {/* Switch Families List */}
            {families.length > 1 && (
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1.5">
                  Đổi sang nhóm gia đình khác của bạn:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {families.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onSelectFamily(f);
                        onClose();
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition cursor-pointer ${
                        f.id === currentFamily.id
                          ? 'border-amber-400 bg-amber-50/70 font-black'
                          : 'border-stone-200 bg-white hover:bg-stone-50 font-bold'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-stone-800">{f.name}</div>
                        <div className="text-[10px] text-stone-400">ID: {f.id}</div>
                      </div>
                      {f.id === currentFamily.id && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                          Đang dùng
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 2: CREATE NEW FAMILY --- */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreate} className="space-y-3.5 text-left">
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                Tên nhóm gia đình:
              </label>
              <input
                type="text"
                required
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="Ví dụ: Nhà Gấu Bubu & Dudu, Gia Đình Hạnh Phúc..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                Tùy chỉnh Mã ID Nhóm (bỏ trống để tự tạo mã ngẫu nhiên):
              </label>
              <input
                type="text"
                value={newFamilyId}
                onChange={(e) => setNewFamilyId(e.target.value.toUpperCase().replace(/\s+/g, '-'))}
                placeholder="Ví dụ: GAU-YEU-2026, NHA-MINH..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono text-xs uppercase"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tạo Nhóm Gia Đình Mới</span>
            </button>
          </form>
        )}

        {/* --- VIEW 3: JOIN EXISTING FAMILY --- */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoin} className="space-y-3.5 text-left">
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                Nhập Mã ID Gia Đình cần tham gia:
              </label>
              <input
                type="text"
                required
                value={joinId}
                onChange={(e) => setJoinId(e.target.value.toUpperCase().trim())}
                placeholder="Ví dụ: GAU-BUBU-DUDU hoặc GAU-8824"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                Tên gợi nhớ cho nhóm (không bắt buộc):
              </label>
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Ví dụ: Nhà Ngoại, Nhà Anh Chị..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4 stroke-[3]" />
              <span>Tham Gia Nhóm Gia Đình</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
