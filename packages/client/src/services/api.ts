import { CropType, PlayerProfile, GachaResult } from '@starfarm/shared';

const API_BASE = '/api';

export const api = {
  async getProfile(): Promise<PlayerProfile> {
    const res = await fetch(`${API_BASE}/player/profile?username=Commander_Nova`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async plant(plotIndex: number, cropType: CropType): Promise<PlayerProfile> {
    const res = await fetch(`${API_BASE}/farm/plant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Commander_Nova', plotIndex, cropType }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async harvest(plotIndex: number): Promise<{ message: string; profile: PlayerProfile }> {
    const res = await fetch(`${API_BASE}/farm/harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Commander_Nova', plotIndex }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async sellItem(itemId: string, quantity: number): Promise<{ message: string; profile: PlayerProfile }> {
    const res = await fetch(`${API_BASE}/market/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Commander_Nova', itemId, quantity }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async upgradeShip(playerShipId: number): Promise<{ message: string; profile: PlayerProfile }> {
    const res = await fetch(`${API_BASE}/hangar/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Commander_Nova', playerShipId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async equipShip(playerShipId: number): Promise<PlayerProfile> {
    const res = await fetch(`${API_BASE}/hangar/equip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Commander_Nova', playerShipId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async rollGacha(): Promise<{ result: GachaResult; profile: PlayerProfile }> {
    const res = await fetch(`${API_BASE}/gacha/roll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Commander_Nova' }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async completeBattle(stageId: string, isVictory: boolean): Promise<{ message: string; loot: any; profile: PlayerProfile }> {
    const res = await fetch(`${API_BASE}/battle/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Commander_Nova', stageId, isVictory }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },
};
