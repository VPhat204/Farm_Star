import React, { useState } from 'react';
import { PlayerProfile, CROPS } from '@starfarm/shared';
import { api } from '../services/api';
import { Store, Coins, X, ArrowRight, Sparkles } from 'lucide-react';

interface MarketModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onUpdateProfile: (p: PlayerProfile) => void;
}

export const MarketModal: React.FC<MarketModalProps> = ({ profile, onClose, onUpdateProfile }) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const getItemPrice = (itemId: string): number => {
    if (CROPS[itemId]) return CROPS[itemId].baseSellPrice;
    if (itemId === 'IRON') return 25;
    if (itemId === 'TITANIUM') return 80;
    if (itemId === 'PLASMA_CRYSTAL') return 250;
    return 10;
  };

  const getItemName = (itemId: string): string => {
    if (CROPS[itemId]) return CROPS[itemId].name;
    if (itemId === 'IRON') return 'Quặng Sắt (Iron Ore)';
    if (itemId === 'TITANIUM') return 'Titanium Vũ Trụ';
    if (itemId === 'PLASMA_CRYSTAL') return 'Pha Lê Plasma';
    if (itemId.startsWith('BLUEPRINT_')) return `Mảnh Bản Vẽ ${itemId.replace('BLUEPRINT_', '')}`;
    return itemId;
  };

  const getItemIcon = (itemId: string): string => {
    if (CROPS[itemId]) return CROPS[itemId].icon;
    if (itemId === 'IRON') return '⛏️';
    if (itemId === 'TITANIUM') return '🛡️';
    if (itemId === 'PLASMA_CRYSTAL') return '💎';
    if (itemId.startsWith('BLUEPRINT_')) return '📜';
    return '📦';
  };

  const handleSell = async (itemId: string, quantity: number) => {
    setLoading(true);
    setFeedback(null);
    try {
      const { message, profile: updated } = await api.sellItem(itemId, quantity);
      onUpdateProfile(updated);
      setFeedback(message);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inventoryItems = profile.inventory.filter((i) => i.quantity > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-3xl rounded-2xl p-6 border border-stellar-gold/40 glow-gold relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-stellar-gold/20 text-stellar-gold border border-stellar-gold/40 glow-gold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-['Orbitron'] font-bold text-stellar-gold tracking-wide">
                CHỢ LIÊN HÀNH TINH (INTERSTELLAR MARKET)
              </h2>
              <p className="text-xs text-gray-400">
                Giao thương nông sản và quặng mỏ thu thập được để kiếm hàng ngàn Credits 💰
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-space-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-stellar-gold/10 border border-stellar-gold/30 text-stellar-gold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Inventory Items list */}
        {inventoryItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Kho đồ đang trống!</p>
            <p className="text-xs mt-1">Hãy thu hoạch ở Nông trại hoặc đi ải bắn quái để kiếm thêm tài nguyên.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inventoryItems.map((item) => {
              const price = getItemPrice(item.itemId);
              const isBlueprint = item.itemId.startsWith('BLUEPRINT_');

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-space-800/80 border border-gray-700 flex flex-wrap items-center justify-between gap-4 hover:border-stellar-gold/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl p-2 rounded-lg bg-space-900 border border-gray-800">
                      {getItemIcon(item.itemId)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{getItemName(item.itemId)}</h4>
                      <p className="text-xs text-gray-400">
                        Số lượng trong kho: <span className="font-bold text-white">x{item.quantity}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Giá bán / đơn vị</div>
                      <div className="font-['Orbitron'] font-bold text-stellar-gold text-sm">
                        {price} Credits
                      </div>
                    </div>

                    {!isBlueprint ? (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={loading}
                          onClick={() => handleSell(item.itemId, 1)}
                          className="px-3 py-1.5 rounded-lg bg-space-700 hover:bg-space-600 text-xs font-bold text-white border border-gray-600 transition"
                        >
                          Bán x1
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleSell(item.itemId, item.quantity)}
                          className="px-4 py-1.5 rounded-lg bg-stellar-gold text-black text-xs font-['Orbitron'] font-bold hover:bg-yellow-400 transition glow-gold"
                        >
                          Bán Tất Cả (+{price * item.quantity})
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-stellar-purple font-bold px-2.5 py-1 rounded bg-stellar-purple/20 border border-stellar-purple/40">
                        Mảnh Ghép Tàu (Không bán)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
