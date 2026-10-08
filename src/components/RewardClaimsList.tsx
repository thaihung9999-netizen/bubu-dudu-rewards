import React, { useState } from 'react';
import type { RewardClaim, ClaimStatus } from '../types';
import { Mascot } from './Mascot';
import { CheckCircle2, Clock, Hourglass, XCircle, RotateCcw, Gift, ChevronRight } from 'lucide-react';

interface RewardClaimsListProps {
  claims: RewardClaim[];
  onUpdateStatus: (claimId: string, newStatus: ClaimStatus, note?: string) => void;
  onOpenShop?: () => void;
}

export const RewardClaimsList: React.FC<RewardClaimsListProps> = ({
  claims,
  onUpdateStatus,
  onOpenShop,
}) => {
  const [filter, setFilter] = useState<'all' | ClaimStatus>('all');

  const filteredClaims = claims.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Chờ thực hiện',
          icon: <Clock className="w-3 h-3 text-amber-600" />,
          classes: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'in_progress':
        return {
          label: 'Đang chuẩn bị',
          icon: <Hourglass className="w-3 h-3 text-sky-600 animate-spin" />,
          classes: 'bg-sky-100 text-sky-800 border-sky-300',
        };
      case 'completed':
        return {
          label: 'Đã trao quà',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
          classes: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'cancelled':
        return {
          label: 'Đã hủy & hoàn điểm',
          icon: <XCircle className="w-3 h-3 text-rose-600" />,
          classes: 'bg-rose-100 text-rose-800 border-rose-300',
        };
    }
  };

  const pendingCount = claims.filter((c) => c.status === 'pending').length;
  const inProgressCount = claims.filter((c) => c.status === 'in_progress').length;
  const completedCount = claims.filter((c) => c.status === 'completed').length;

  return (
    <div className="space-y-3.5 text-left">
      {/* Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-2.5 text-center">
          <span className="text-[10px] font-black uppercase text-amber-800 block">Chờ Làm</span>
          <span className="text-lg font-black text-amber-950">{pendingCount}</span>
        </div>
        <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-2.5 text-center">
          <span className="text-[10px] font-black uppercase text-sky-800 block">Đang Làm</span>
          <span className="text-lg font-black text-sky-950">{inProgressCount}</span>
        </div>
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-2.5 text-center">
          <span className="text-[10px] font-black uppercase text-emerald-800 block">Đã Trao Quà</span>
          <span className="text-lg font-black text-emerald-950">{completedCount}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        {[
          { id: 'all', label: `Tất cả (${claims.length})` },
          { id: 'pending', label: `Chờ thực hiện (${pendingCount})` },
          { id: 'in_progress', label: `Đang làm (${inProgressCount})` },
          { id: 'completed', label: `Đã xong (${completedCount})` },
          { id: 'cancelled', label: `Đã hủy` },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id as any)}
            className={`py-1.5 px-3 rounded-xl whitespace-nowrap transition cursor-pointer ${
              filter === f.id
                ? 'bg-amber-500 text-white shadow-xs font-black'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="py-10 text-center bg-white rounded-3xl border border-stone-200 p-4">
          <div className="w-16 h-16 mx-auto mb-2 opacity-80">
            <img src="/stickers/cuddle_mochi.png" alt="No claims" className="w-full h-full object-contain" />
          </div>
          <h4 className="font-extrabold text-sm text-stone-700">Chưa có phiếu quà nào</h4>
          <p className="text-xs text-stone-400 mt-0.5">
            Khi thành viên tích đủ điểm và đổi quà, phiếu quà sẽ xuất hiện ở đây để theo dõi tiến trình!
          </p>
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              className="mt-3 py-1.5 px-3.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs inline-flex items-center gap-1 transition cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Xem Kho Quà Thưởng</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClaims.map((claim) => {
            const statusBadge = getStatusBadge(claim.status);
            const dateStr =
              new Date(claim.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              }) +
              ' • ' +
              new Date(claim.timestamp).toLocaleDateString('vi-VN');

            return (
              <div
                key={claim.id}
                className="bg-white rounded-2xl p-3.5 border-2 border-stone-200/90 shadow-xs hover:border-amber-300 transition"
              >
                {/* Header of Claim: Member & Status */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 p-0.5 border border-amber-200 flex items-center justify-center shrink-0">
                      {claim.memberAvatar ? (
                        <img
                          src={claim.memberAvatar}
                          alt={claim.memberName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Mascot character={claim.memberCharacter || 'bubu'} size={24} animate={false} />
                      )}
                    </div>
                    <div>
                      <span className="font-black text-xs text-stone-800 block leading-tight">
                        {claim.memberName}
                      </span>
                      <span className="text-[10px] text-stone-400">{dateStr}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl border ${statusBadge.classes}`}
                  >
                    {statusBadge.icon}
                    <span>{statusBadge.label}</span>
                  </span>
                </div>

                {/* Body: Reward Title & Cost */}
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl shrink-0">{claim.rewardIcon || '🎁'}</span>
                    <div>
                      <h4 className="font-black text-sm text-stone-900 leading-tight">
                        {claim.rewardTitle}
                      </h4>
                      <span className="text-[11px] font-bold text-amber-800">
                        Đã đổi: -{claim.cost} 🐻 điểm gấu
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Stepper Visual */}
                <div className="bg-stone-50 rounded-xl p-2 mb-2 border border-stone-100 flex items-center justify-between text-[10px] font-extrabold text-stone-500">
                  <div
                    className={`flex items-center gap-1 ${
                      claim.status !== 'cancelled' ? 'text-amber-800' : 'text-stone-400'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center text-[9px] font-black">
                      1
                    </span>
                    <span>Đã đổi điểm</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-stone-300" />
                  <div
                    className={`flex items-center gap-1 ${
                      claim.status === 'in_progress' || claim.status === 'completed'
                        ? 'text-sky-700'
                        : 'text-stone-400'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                        claim.status === 'in_progress' || claim.status === 'completed'
                          ? 'bg-sky-200 text-sky-900'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      2
                    </span>
                    <span>Đang chuẩn bị</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-stone-300" />
                  <div
                    className={`flex items-center gap-1 ${
                      claim.status === 'completed' ? 'text-emerald-700' : 'text-stone-400'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                        claim.status === 'completed'
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      3
                    </span>
                    <span>Đã trao quà</span>
                  </div>
                </div>

                {/* Action Controls for Parent / Partner */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {claim.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onUpdateStatus(claim.id, 'in_progress')}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
                      >
                        <Hourglass className="w-3.5 h-3.5" />
                        <span>Bắt Đầu Chuẩn Bị ⏳</span>
                      </button>
                      <button
                        onClick={() => onUpdateStatus(claim.id, 'completed')}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã Trao Quà Xong ✅</span>
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Hủy phiếu quà "${claim.rewardTitle}" và hoàn trả lại ${claim.cost} 🐻 điểm cho ${claim.memberName}?`
                            )
                          ) {
                            onUpdateStatus(claim.id, 'cancelled');
                          }
                        }}
                        className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1 border border-rose-200 transition cursor-pointer"
                        title="Hủy và hoàn điểm"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Hủy & Hoàn Điểm</span>
                      </button>
                    </>
                  )}

                  {claim.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => onUpdateStatus(claim.id, 'completed')}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Xác Nhận Đã Trao Quà ✅</span>
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Hủy phiếu quà "${claim.rewardTitle}" và hoàn trả lại ${claim.cost} 🐻 điểm cho ${claim.memberName}?`
                            )
                          ) {
                            onUpdateStatus(claim.id, 'cancelled');
                          }
                        }}
                        className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1 border border-rose-200 transition cursor-pointer"
                        title="Hủy và hoàn điểm"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Hủy & Hoàn Điểm</span>
                      </button>
                    </>
                  )}

                  {claim.status === 'completed' && (
                    <div className="w-full py-1 text-center text-xs font-black text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Món quà này đã được trao cho {claim.memberName} trọn vẹn! 🎉</span>
                    </div>
                  )}

                  {claim.status === 'cancelled' && (
                    <div className="w-full py-1 text-center text-xs font-bold text-rose-700 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      <span>Đã hủy và hoàn trả +{claim.cost} 🐻 vào ví của {claim.memberName}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
