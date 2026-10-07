import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding default StarFarm player...');
    let player = await prisma.player.findUnique({
        where: { username: 'Commander_Nova' },
    });
    if (!player) {
        player = await prisma.player.create({
            data: {
                username: 'Commander_Nova',
                level: 1,
                exp: 0,
                credits: 500,
                stellarGems: 300,
                energy: 100,
                maxEnergy: 100,
                planetLevel: 1,
                pityCount: 0,
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
                        { itemId: 'IRON', quantity: 15 },
                        { itemId: 'WHEAT', quantity: 5 },
                    ],
                },
            },
        });
        console.log('✅ Created default Commander_Nova with ID:', player.id);
    }
    else {
        console.log('ℹ️ Commander_Nova already exists.');
    }
}
main()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map