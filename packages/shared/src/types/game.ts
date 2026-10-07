// Currency Types
export type CurrencyType = 'CREDITS' | 'STELLAR_GEM' | 'ENERGY';

// Resource & Crop Types
export type CropType = 'WHEAT' | 'ENERGY_CORN' | 'NANO_TOMATO' | 'CRYSTAL_BERRY';

export type MaterialType = 'IRON' | 'TITANIUM' | 'PLASMA_CRYSTAL' | 'STELLAR_FRAGMENT';

export type ItemType = CropType | MaterialType | 'BLUEPRINT_NOVA_HUNTER' | 'BLUEPRINT_STAR_GUARDIAN' | 'EXP_CUBE';

// Rarity
export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR';

// Ship Class
export type ShipClass = 'FIGHTER' | 'TANK' | 'BOMBER' | 'SNIPER' | 'SUPPORT';

// Equipment Slot
export type EquipmentSlot = 'WEAPON' | 'ENGINE' | 'ARMOR' | 'SHIELD' | 'CORE' | 'MODULE';

// Crop Config Definition
export interface CropConfig {
  id: CropType;
  name: string;
  description: string;
  growTimeSeconds: number;
  seedCost: number;
  baseSellPrice: number;
  harvestYield: number;
  icon: string;
}

// Ship Config Definition
export interface ShipConfig {
  id: string;
  name: string;
  rarity: Rarity;
  shipClass: ShipClass;
  description: string;
  baseStats: {
    hp: number;
    shield: number;
    attack: number;
    defense: number;
    critRate: number; // 0.05 = 5%
    speed: number;
  };
  passiveName: string;
  passiveDesc: string;
  spriteKey: string;
  bulletType: 'PLASMA' | 'LASER' | 'MISSILE' | 'SPREAD';
}

// Player Farm Plot State
export interface FarmPlotState {
  id: number;
  plotIndex: number;
  cropType: CropType | null;
  plantedAt: string | null;
  readyAt: string | null;
  status: 'EMPTY' | 'GROWING' | 'READY';
}

// Player Ship State
export interface PlayerShipState {
  id: number;
  shipId: string;
  level: number;
  exp: number;
  star: number;
  isEquipped: boolean;
  power: number;
  stats: {
    hp: number;
    shield: number;
    attack: number;
    defense: number;
    critRate: number;
    speed: number;
  };
}

// Inventory Item State
export interface InventoryItemState {
  id: number;
  itemId: string;
  quantity: number;
}

// Full Player Profile
export interface PlayerProfile {
  id: number;
  username: string;
  level: number;
  exp: number;
  credits: number;
  stellarGems: number;
  energy: number;
  maxEnergy: number;
  planetLevel: number;
  pityCount: number;
  farmPlots: FarmPlotState[];
  ships: PlayerShipState[];
  inventory: InventoryItemState[];
}

// Stage Definition for Combat
export interface StageData {
  id: string;
  chapter: number;
  stageNumber: number;
  name: string;
  energyCost: number;
  recommendedPower: number;
  enemyWaves: number;
  bossName: string;
  bossHp: number;
  rewards: {
    creditsMin: number;
    creditsMax: number;
    exp: number;
    materials: { itemId: ItemType; chance: number; amount: number }[];
  };
}

// Gacha Result
export interface GachaResult {
  shipId: string;
  shipName: string;
  rarity: Rarity;
  isNew: boolean;
  duplicateBlueprints?: number;
  pityCount: number;
}
