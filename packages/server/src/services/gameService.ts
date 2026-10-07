import { prisma } from '../db';
import { FarmPlot, PlayerShip, InventoryItem } from '@prisma/client';
import { CROPS, SHIPS, STAGES, CropType, PlayerProfile, Rarity } from '@starfarm/shared';

// In-Memory Fallback State in case Remote Cloud Database is unreachable
let memoryProfile: PlayerProfile = {
  id: 1,
  username: 'Commander_Nova',
  level: 1,
  exp: 0,
  credits: 500,
  stellarGems: 300,
  energy: 100,
  maxEnergy: 100,
  planetLevel: 1,
  pityCount: 0,
  farmPlots: [
    { id: 1, plotIndex: 0, cropType: null, plantedAt: null, readyAt: null, status: 'EMPTY' },
    { id: 2, plotIndex: 1, cropType: null, plantedAt: null, readyAt: null, status: 'EMPTY' },
    { id: 3, plotIndex: 2, cropType: null, plantedAt: null, readyAt: null, status: 'EMPTY' },
    { id: 4, plotIndex: 3, cropType: null, plantedAt: null, readyAt: null, status: 'EMPTY' },
    { id: 5, plotIndex: 4, cropType: null, plantedAt: null, readyAt: null, status: 'EMPTY' },
    { id: 6, plotIndex: 5, cropType: null, plantedAt: null, readyAt: null, status: 'EMPTY' },
  ],
  ships: [
    {
      id: 1,
      shipId: 'SHIP_SCOUT_01',
      level: 1,
      exp: 0,
      star: 1,
      isEquipped: true,
      power: 280,
      stats: {
        hp: 450,
        shield: 180,
        attack: 75,
        defense: 45,
        critRate: 0.12,
        speed: 340,
      },
    },
  ],
  inventory: [
    { id: 1, itemId: 'IRON', quantity: 20 },
    { id: 2, itemId: 'WHEAT', quantity: 10 },
  ],
};

export class GameService {
  // Get or create player profile with all relations and check crop status
  static async getProfile(username: string = 'Commander_Nova'): Promise<PlayerProfile> {
    try {
      let player = await prisma.player.findUnique({
        where: { username },
        include: {
          farmPlots: { orderBy: { plotIndex: 'asc' } },
          ships: true,
          inventory: true,
        },
      });

      if (!player) {
        player = await prisma.player.create({
          data: {
            username,
            credits: 500,
            stellarGems: 300,
            energy: 100,
            maxEnergy: 100,
            planetLevel: 1,
            farmPlots: {
              create: [
                { plotIndex: 0, status: 'EMPTY' },
                { plotIndex: 1, status: 'EMPTY' },
                { plotIndex: 2, status: 'EMPTY' },
                { plotIndex: 3, status: 'EMPTY' },
                { plotIndex: 4, status: 'EMPTY' },
                { plotIndex: 5, status: 'EMPTY' },
              ],
            },
            ships: {
              create: [
                {
                  shipId: 'SHIP_SCOUT_01',
                  level: 1,
                  exp: 0,
                  star: 1,
                  isEquipped: true,
                },
              ],
            },
            inventory: {
              create: [
                { itemId: 'IRON', quantity: 20 },
                { itemId: 'WHEAT', quantity: 10 },
              ],
            },
          },
          include: {
            farmPlots: { orderBy: { plotIndex: 'asc' } },
            ships: true,
            inventory: true,
          },
        });
      }

      // Auto update ready state for crops
      const now = new Date();
      const updatedPlots = await Promise.all(
        player.farmPlots.map(async (plot: FarmPlot) => {
          if (plot.status === 'GROWING' && plot.readyAt && plot.readyAt <= now) {
            return await prisma.farmPlot.update({
              where: { id: plot.id },
              data: { status: 'READY' },
            });
          }
          return plot;
        })
      );

      // Compute ship stats
      const shipsWithStats = player.ships.map((s: PlayerShip) => {
        const config = SHIPS[s.shipId] || SHIPS['SHIP_SCOUT_01'];
        const levelMultiplier = 1 + (s.level - 1) * 0.15;
        const stats = {
          hp: Math.round(config.baseStats.hp * levelMultiplier),
          shield: Math.round(config.baseStats.shield * levelMultiplier),
          attack: Math.round(config.baseStats.attack * levelMultiplier),
          defense: Math.round(config.baseStats.defense * levelMultiplier),
          critRate: config.baseStats.critRate,
          speed: config.baseStats.speed,
        };
        const power = Math.round(stats.attack * 1.5 + stats.hp * 0.2 + stats.shield * 0.3 + stats.defense * 0.5);
        return {
          id: s.id,
          shipId: s.shipId,
          level: s.level,
          exp: s.exp,
          star: s.star,
          isEquipped: s.isEquipped,
          power,
          stats,
        };
      });

      return {
        id: player.id,
        username: player.username,
        level: player.level,
        exp: player.exp,
        credits: player.credits,
        stellarGems: player.stellarGems,
        energy: player.energy,
        maxEnergy: player.maxEnergy,
        planetLevel: player.planetLevel,
        pityCount: player.pityCount,
        farmPlots: updatedPlots.map((p) => ({
          id: p.id,
          plotIndex: p.plotIndex,
          cropType: p.cropType as CropType | null,
          plantedAt: p.plantedAt ? p.plantedAt.toISOString() : null,
          readyAt: p.readyAt ? p.readyAt.toISOString() : null,
          status: p.status as 'EMPTY' | 'GROWING' | 'READY',
        })),
        ships: shipsWithStats,
        inventory: player.inventory.map((i: InventoryItem) => ({
          id: i.id,
          itemId: i.itemId,
          quantity: i.quantity,
        })),
      };
    } catch (dbErr) {
      console.warn('⚠️ [Database Resilient Mode] Remote database unreachable. Serving resilient in-memory profile.');
      
      // Auto update crops in memory
      const now = new Date();
      memoryProfile.farmPlots.forEach((p) => {
        if (p.status === 'GROWING' && p.readyAt && new Date(p.readyAt) <= now) {
          p.status = 'READY';
        }
      });

      return { ...memoryProfile };
    }
  }

  // Plant a crop
  static async plant(username: string, plotIndex: number, cropType: CropType) {
    const cropConfig = CROPS[cropType];
    if (!cropConfig) throw new Error('Loại cây không hợp lệ');

    try {
      const player = await prisma.player.findUnique({
        where: { username },
        include: { farmPlots: true },
      });
      if (!player) throw new Error('Không tìm thấy người chơi');

      if (player.credits < cropConfig.seedCost) {
        throw new Error(`Không đủ Credits. Cần ${cropConfig.seedCost} Credits để mua hạt giống.`);
      }

      const plot = player.farmPlots.find((p) => p.plotIndex === plotIndex);
      if (!plot) throw new Error('Ô đất không tồn tại');
      if (plot.status !== 'EMPTY') throw new Error('Ô đất đang được sử dụng');

      const plantedAt = new Date();
      const readyAt = new Date(plantedAt.getTime() + cropConfig.growTimeSeconds * 1000);

      await prisma.$transaction([
        prisma.player.update({
          where: { id: player.id },
          data: { credits: { decrement: cropConfig.seedCost } },
        }),
        prisma.farmPlot.update({
          where: { id: plot.id },
          data: {
            cropType,
            plantedAt,
            readyAt,
            status: 'GROWING',
          },
        }),
      ]);

      return await this.getProfile(username);
    } catch (err: any) {
      if (err.message && (err.message.includes('Không đủ') || err.message.includes('không tồn tại'))) {
        throw err;
      }
      // Memory Fallback
      if (memoryProfile.credits < cropConfig.seedCost) {
        throw new Error(`Không đủ Credits. Cần ${cropConfig.seedCost} Credits để mua hạt giống.`);
      }
      const plot = memoryProfile.farmPlots.find((p) => p.plotIndex === plotIndex);
      if (plot) {
        const plantedAt = new Date();
        const readyAt = new Date(plantedAt.getTime() + cropConfig.growTimeSeconds * 1000);
        memoryProfile.credits -= cropConfig.seedCost;
        plot.cropType = cropType;
        plot.plantedAt = plantedAt.toISOString();
        plot.readyAt = readyAt.toISOString();
        plot.status = 'GROWING';
      }
      return { ...memoryProfile };
    }
  }

  // Harvest a ready crop
  static async harvest(username: string, plotIndex: number) {
    try {
      const player = await prisma.player.findUnique({
        where: { username },
        include: { farmPlots: true, inventory: true },
      });
      if (!player) throw new Error('Không tìm thấy người chơi');

      const plot = player.farmPlots.find((p) => p.plotIndex === plotIndex);
      if (!plot) throw new Error('Ô đất không tồn tại');
      if (!plot.cropType) throw new Error('Ô đất trống');

      const now = new Date();
      if (!plot.readyAt || (plot.readyAt > now && plot.status !== 'READY')) {
        throw new Error('Cây chưa chín, hãy kiên nhẫn!');
      }

      const cropConfig = CROPS[plot.cropType];
      const yieldAmount = cropConfig ? cropConfig.harvestYield : 1;

      await prisma.$transaction([
        prisma.farmPlot.update({
          where: { id: plot.id },
          data: {
            cropType: null,
            plantedAt: null,
            readyAt: null,
            status: 'EMPTY',
          },
        }),
        prisma.inventoryItem.upsert({
          where: {
            playerId_itemId: {
              playerId: player.id,
              itemId: plot.cropType,
            },
          },
          update: { quantity: { increment: yieldAmount } },
          create: {
            playerId: player.id,
            itemId: plot.cropType,
            quantity: yieldAmount,
          },
        }),
        prisma.player.update({
          where: { id: player.id },
          data: { exp: { increment: 15 } },
        }),
      ]);

      return {
        message: `Thu hoạch thành công ${yieldAmount}x ${cropConfig?.name || plot.cropType}!`,
        profile: await this.getProfile(username),
      };
    } catch (err: any) {
      if (err.message && err.message.includes('Cây chưa chín')) throw err;
      
      // Memory Fallback
      const plot = memoryProfile.farmPlots.find((p) => p.plotIndex === plotIndex);
      if (!plot || !plot.cropType) throw new Error('Ô đất trống');
      const cropConfig = CROPS[plot.cropType];
      const yieldAmount = cropConfig ? cropConfig.harvestYield : 1;

      plot.cropType = null;
      plot.plantedAt = null;
      plot.readyAt = null;
      plot.status = 'EMPTY';

      const existingInv = memoryProfile.inventory.find((i) => i.itemId === (cropConfig?.id || 'WHEAT'));
      if (existingInv) {
        existingInv.quantity += yieldAmount;
      } else {
        memoryProfile.inventory.push({ id: Date.now(), itemId: cropConfig?.id || 'WHEAT', quantity: yieldAmount });
      }
      memoryProfile.exp += 15;

      return {
        message: `Thu hoạch thành công ${yieldAmount}x ${cropConfig?.name || 'Nông sản'}!`,
        profile: { ...memoryProfile },
      };
    }
  }

  // Sell items for credits
  static async sellItem(username: string, itemId: string, quantity: number) {
    if (quantity <= 0) throw new Error('Số lượng không hợp lệ');

    let unitPrice = 10;
    if (CROPS[itemId]) {
      unitPrice = CROPS[itemId].baseSellPrice;
    } else if (itemId === 'IRON') {
      unitPrice = 25;
    } else if (itemId === 'TITANIUM') {
      unitPrice = 80;
    }
    const totalEarned = unitPrice * quantity;

    try {
      const player = await prisma.player.findUnique({
        where: { username },
        include: { inventory: true },
      });
      if (!player) throw new Error('Không tìm thấy người chơi');

      const invItem = player.inventory.find((i) => i.itemId === itemId);
      if (!invItem || invItem.quantity < quantity) {
        throw new Error('Số lượng vật phẩm trong kho không đủ');
      }

      await prisma.$transaction([
        prisma.inventoryItem.update({
          where: { id: invItem.id },
          data: { quantity: { decrement: quantity } },
        }),
        prisma.player.update({
          where: { id: player.id },
          data: { credits: { increment: totalEarned } },
        }),
      ]);

      return {
        message: `Đã bán ${quantity}x ${itemId}, nhận được +${totalEarned} Credits 💰`,
        profile: await this.getProfile(username),
      };
    } catch (err: any) {
      if (err.message && err.message.includes('không đủ')) throw err;

      // Memory Fallback
      const inv = memoryProfile.inventory.find((i) => i.itemId === itemId);
      if (!inv || inv.quantity < quantity) throw new Error('Số lượng vật phẩm trong kho không đủ');

      inv.quantity -= quantity;
      memoryProfile.credits += totalEarned;

      return {
        message: `Đã bán ${quantity}x ${itemId}, nhận được +${totalEarned} Credits 💰`,
        profile: { ...memoryProfile },
      };
    }
  }

  // Upgrade player ship
  static async upgradeShip(username: string, playerShipId: number) {
    try {
      const player = await prisma.player.findUnique({
        where: { username },
        include: { ships: true, inventory: true },
      });
      if (!player) throw new Error('Không tìm thấy người chơi');

      const targetShip = player.ships.find((s) => s.id === playerShipId);
      if (!targetShip) throw new Error('Không tìm thấy chiến cơ');

      const upgradeCostCredits = targetShip.level * 150;
      const upgradeCostIron = targetShip.level * 3;

      if (player.credits < upgradeCostCredits) {
        throw new Error(`Cần ${upgradeCostCredits} Credits để nâng cấp`);
      }

      const ironItem = player.inventory.find((i) => i.itemId === 'IRON');
      if (!ironItem || ironItem.quantity < upgradeCostIron) {
        throw new Error(`Cần ${upgradeCostIron} Quặng Sắt (Iron) để nâng cấp`);
      }

      await prisma.$transaction([
        prisma.player.update({
          where: { id: player.id },
          data: { credits: { decrement: upgradeCostCredits } },
        }),
        prisma.inventoryItem.update({
          where: { id: ironItem.id },
          data: { quantity: { decrement: upgradeCostIron } },
        }),
        prisma.playerShip.update({
          where: { id: targetShip.id },
          data: { level: { increment: 1 } },
        }),
      ]);

      return {
        message: `Nâng cấp ${targetShip.shipId} lên Cấp ${targetShip.level + 1} thành công!`,
        profile: await this.getProfile(username),
      };
    } catch (err: any) {
      if (err.message && err.message.includes('Cần')) throw err;

      // Memory Fallback
      const targetShip = memoryProfile.ships.find((s) => s.id === playerShipId) || memoryProfile.ships[0];
      const upgradeCostCredits = targetShip.level * 150;
      const upgradeCostIron = targetShip.level * 3;

      const iron = memoryProfile.inventory.find((i) => i.itemId === 'IRON');
      if (memoryProfile.credits < upgradeCostCredits) throw new Error(`Cần ${upgradeCostCredits} Credits để nâng cấp`);
      if (!iron || iron.quantity < upgradeCostIron) throw new Error(`Cần ${upgradeCostIron} Quặng Sắt để nâng cấp`);

      memoryProfile.credits -= upgradeCostCredits;
      iron.quantity -= upgradeCostIron;
      targetShip.level += 1;
      targetShip.power += 40;

      return {
        message: `Nâng cấp ${targetShip.shipId} lên Cấp ${targetShip.level} thành công!`,
        profile: { ...memoryProfile },
      };
    }
  }

  // Equip ship
  static async equipShip(username: string, playerShipId: number) {
    try {
      const player = await prisma.player.findUnique({
        where: { username },
        include: { ships: true },
      });
      if (!player) throw new Error('Không tìm thấy người chơi');

      await prisma.$transaction([
        prisma.playerShip.updateMany({
          where: { playerId: player.id },
          data: { isEquipped: false },
        }),
        prisma.playerShip.update({
          where: { id: playerShipId },
          data: { isEquipped: true },
        }),
      ]);

      return await this.getProfile(username);
    } catch (err) {
      memoryProfile.ships.forEach((s) => {
        s.isEquipped = s.id === playerShipId;
      });
      return { ...memoryProfile };
    }
  }

  // Gacha Summon with Pity System
  static async rollGacha(username: string) {
    const COST_GEM = 100;
    if (memoryProfile.stellarGems < COST_GEM) {
      throw new Error(`Không đủ Đá Quý. Cần ${COST_GEM} Stellar Gems để mở rương!`);
    }

    const newPity = memoryProfile.pityCount + 1;
    let rarity: Rarity = 'N';

    if (newPity >= 10) {
      rarity = 'SSR';
    } else {
      const roll = Math.random() * 100;
      if (roll < 8) rarity = 'SSR';
      else if (roll < 28) rarity = 'SR';
      else if (roll < 60) rarity = 'R';
      else rarity = 'N';
    }

    const eligibleShips = Object.values(SHIPS).filter((s) => s.rarity === rarity);
    const chosenConfig =
      eligibleShips.length > 0
        ? eligibleShips[Math.floor(Math.random() * eligibleShips.length)]
        : SHIPS['SHIP_SCOUT_01'];

    const existingShip = memoryProfile.ships.find((s) => s.shipId === chosenConfig.id);
    let isNew = false;

    if (!existingShip) {
      isNew = true;
      memoryProfile.ships.push({
        id: Date.now(),
        shipId: chosenConfig.id,
        level: 1,
        exp: 0,
        star: 1,
        isEquipped: false,
        power: chosenConfig.rarity === 'SSR' ? 950 : chosenConfig.rarity === 'SR' ? 580 : 320,
        stats: {
          hp: chosenConfig.baseStats.hp,
          shield: chosenConfig.baseStats.shield,
          attack: chosenConfig.baseStats.attack,
          defense: chosenConfig.baseStats.defense,
          critRate: chosenConfig.baseStats.critRate,
          speed: chosenConfig.baseStats.speed,
        },
      });
    }

    memoryProfile.stellarGems -= COST_GEM;
    memoryProfile.pityCount = rarity === 'SSR' ? 0 : newPity;

    return {
      result: {
        shipId: chosenConfig.id,
        shipName: chosenConfig.name,
        rarity,
        isNew,
        duplicateBlueprints: isNew ? 0 : 10,
        pityCount: memoryProfile.pityCount,
      },
      profile: { ...memoryProfile },
    };
  }

  // Complete battle & reward loot
  static async completeBattle(username: string, stageId: string, isVictory: boolean) {
    const stage = STAGES.find((s) => s.id === stageId) || STAGES[0];

    if (!isVictory) {
      return {
        message: 'Thất bại! Hãy nâng cấp chiến cơ và thử lại.',
        loot: null,
        profile: { ...memoryProfile },
      };
    }

    const earnedCredits = Math.floor(
      Math.random() * (stage.rewards.creditsMax - stage.rewards.creditsMin + 1) + stage.rewards.creditsMin
    );
    const earnedExp = stage.rewards.exp;
    const droppedMaterials: { itemId: string; amount: number }[] = [];

    for (const mat of stage.rewards.materials) {
      if (Math.random() <= mat.chance) {
        droppedMaterials.push({ itemId: mat.itemId, amount: mat.amount });
      }
    }

    memoryProfile.credits += earnedCredits;
    memoryProfile.exp += earnedExp;

    for (const drop of droppedMaterials) {
      const item = memoryProfile.inventory.find((i) => i.itemId === drop.itemId);
      if (item) {
        item.quantity += drop.amount;
      } else {
        memoryProfile.inventory.push({ id: Date.now() + Math.random(), itemId: drop.itemId, quantity: drop.amount });
      }
    }

    return {
      message: `Chiến thắng rực rỡ ải ${stage.name}!`,
      loot: {
        credits: earnedCredits,
        exp: earnedExp,
        materials: droppedMaterials,
      },
      profile: { ...memoryProfile },
    };
  }
}
