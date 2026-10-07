import { prisma } from '../db';
import { FarmPlot, PlayerShip, InventoryItem } from '@prisma/client';
import { CROPS, SHIPS, STAGES, CropType, PlayerProfile, Rarity } from '@starfarm/shared';

export class GameService {
  // Get or create player profile with all relations and check crop status
  static async getProfile(username: string = 'Commander_Nova'): Promise<PlayerProfile> {
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
  }

  // Plant a crop
  static async plant(username: string, plotIndex: number, cropType: CropType) {
    const cropConfig = CROPS[cropType];
    if (!cropConfig) throw new Error('Loại cây không hợp lệ');

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

    // Deduct credits and update plot
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
  }

  // Harvest a ready crop
  static async harvest(username: string, plotIndex: number) {
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

    // Reset plot & Add crop item to inventory
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
  }

  // Sell items for credits
  static async sellItem(username: string, itemId: string, quantity: number) {
    if (quantity <= 0) throw new Error('Số lượng không hợp lệ');

    const player = await prisma.player.findUnique({
      where: { username },
      include: { inventory: true },
    });
    if (!player) throw new Error('Không tìm thấy người chơi');

    const invItem = player.inventory.find((i) => i.itemId === itemId);
    if (!invItem || invItem.quantity < quantity) {
      throw new Error('Số lượng vật phẩm trong kho không đủ');
    }

    // Price calculation
    let unitPrice = 10;
    if (CROPS[itemId]) {
      unitPrice = CROPS[itemId].baseSellPrice;
    } else if (itemId === 'IRON') {
      unitPrice = 25;
    } else if (itemId === 'TITANIUM') {
      unitPrice = 80;
    }

    const totalEarned = unitPrice * quantity;

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
  }

  // Upgrade player ship
  static async upgradeShip(username: string, playerShipId: number) {
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
  }

  // Equip ship
  static async equipShip(username: string, playerShipId: number) {
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
  }

  // Gacha Summon with Pity System
  static async rollGacha(username: string) {
    const COST_GEM = 100;
    const player = await prisma.player.findUnique({
      where: { username },
      include: { ships: true },
    });
    if (!player) throw new Error('Không tìm thấy người chơi');
    if (player.stellarGems < COST_GEM) {
      throw new Error(`Không đủ Đá Quý. Cần ${COST_GEM} Stellar Gems để mở rương!`);
    }

    const newPity = player.pityCount + 1;
    let rarity: Rarity = 'N';

    // Pity check
    if (newPity >= 10) {
      rarity = 'SSR';
    } else {
      const roll = Math.random() * 100;
      if (roll < 7) rarity = 'SSR';
      else if (roll < 25) rarity = 'SR';
      else if (roll < 55) rarity = 'R';
      else rarity = 'N';
    }

    const eligibleShips = Object.values(SHIPS).filter((s) => s.rarity === rarity);
    const chosenConfig =
      eligibleShips.length > 0
        ? eligibleShips[Math.floor(Math.random() * eligibleShips.length)]
        : SHIPS['SHIP_SCOUT_01'];

    const existingShip = player.ships.find((s) => s.shipId === chosenConfig.id);
    let isNew = false;

    if (!existingShip) {
      isNew = true;
      await prisma.playerShip.create({
        data: {
          playerId: player.id,
          shipId: chosenConfig.id,
          level: 1,
          exp: 0,
          star: 1,
          isEquipped: false,
        },
      });
    } else {
      // Duplicate converted into Blueprint
      const bpKey = `BLUEPRINT_${chosenConfig.id.replace('SHIP_', '')}`;
      await prisma.inventoryItem.upsert({
        where: {
          playerId_itemId: {
            playerId: player.id,
            itemId: bpKey,
          },
        },
        update: { quantity: { increment: 10 } },
        create: {
          playerId: player.id,
          itemId: bpKey,
          quantity: 10,
        },
      });
    }

    await prisma.player.update({
      where: { id: player.id },
      data: {
        stellarGems: { decrement: COST_GEM },
        pityCount: rarity === 'SSR' ? 0 : newPity,
      },
    });

    await prisma.gachaHistory.create({
      data: {
        playerId: player.id,
        shipId: chosenConfig.id,
        rarity,
        isNew,
      },
    });

    return {
      result: {
        shipId: chosenConfig.id,
        shipName: chosenConfig.name,
        rarity,
        isNew,
        duplicateBlueprints: isNew ? 0 : 10,
        pityCount: rarity === 'SSR' ? 0 : newPity,
      },
      profile: await this.getProfile(username),
    };
  }

  // Complete battle & reward loot
  static async completeBattle(username: string, stageId: string, isVictory: boolean) {
    const stage = STAGES.find((s) => s.id === stageId) || STAGES[0];
    const player = await prisma.player.findUnique({
      where: { username },
    });
    if (!player) throw new Error('Không tìm thấy người chơi');

    if (!isVictory) {
      return {
        message: 'Thất bại! Hãy nâng cấp chiến cơ và thử lại.',
        loot: null,
        profile: await this.getProfile(username),
      };
    }

    const earnedCredits = Math.floor(
      Math.random() * (stage.rewards.creditsMax - stage.rewards.creditsMin + 1) + stage.rewards.creditsMin
    );
    const earnedExp = stage.rewards.exp;
    const droppedMaterials: { itemId: string; amount: number }[] = [];

    // Evaluate drop chances
    for (const mat of stage.rewards.materials) {
      if (Math.random() <= mat.chance) {
        droppedMaterials.push({ itemId: mat.itemId, amount: mat.amount });
      }
    }

    // Award player
    await prisma.player.update({
      where: { id: player.id },
      data: {
        credits: { increment: earnedCredits },
        exp: { increment: earnedExp },
        energy: { decrement: Math.min(player.energy, stage.energyCost) },
      },
    });

    // Add inventory drops
    for (const drop of droppedMaterials) {
      await prisma.inventoryItem.upsert({
        where: {
          playerId_itemId: {
            playerId: player.id,
            itemId: drop.itemId,
          },
        },
        update: { quantity: { increment: drop.amount } },
        create: {
          playerId: player.id,
          itemId: drop.itemId,
          quantity: drop.amount,
        },
      });
    }

    return {
      message: `Chiến thắng rực rỡ ải ${stage.name}!`,
      loot: {
        credits: earnedCredits,
        exp: earnedExp,
        materials: droppedMaterials,
      },
      profile: await this.getProfile(username),
    };
  }
}
