import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { PlayerProfile, STAGES, SHIPS } from '@starfarm/shared';
import { api } from '../services/api';
import { X, Trophy, AlertTriangle, ArrowLeft } from 'lucide-react';

interface BattleViewProps {
  profile: PlayerProfile;
  onExit: () => void;
  onUpdateProfile: (p: PlayerProfile) => void;
}

export const BattleView: React.FC<BattleViewProps> = ({ profile, onExit, onUpdateProfile }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [battleResult, setBattleResult] = useState<{ isVictory: boolean; loot: any } | null>(null);

  const equippedShip = profile.ships.find((s) => s.isEquipped) || profile.ships[0];
  const shipConfig = equippedShip ? SHIPS[equippedShip.shipId] || SHIPS['SHIP_SCOUT_01'] : SHIPS['SHIP_SCOUT_01'];

  useEffect(() => {
    if (!gameContainerRef.current) return;

    let gameInstance: Phaser.Game | null = null;

    class BattleScene extends Phaser.Scene {
      private player!: Phaser.GameObjects.Rectangle;
      private bullets!: Phaser.GameObjects.Group;
      private enemies!: Phaser.GameObjects.Group;
      private enemyBullets!: Phaser.GameObjects.Group;
      private items!: Phaser.GameObjects.Group;
      private boss: Phaser.GameObjects.Rectangle | null = null;

      private playerHp = equippedShip ? equippedShip.stats.hp : 1200;
      private maxPlayerHp = equippedShip ? equippedShip.stats.hp : 1200;
      private playerAttack = equippedShip ? equippedShip.stats.attack : 180;
      private bossHp = 3000;
      private maxBossHp = 3000;
      private score = 0;
      private wave = 1;
      private isGameOver = false;

      private hpText!: Phaser.GameObjects.Text;
      private scoreText!: Phaser.GameObjects.Text;
      private bossHpBar!: Phaser.GameObjects.Graphics;

      constructor() {
        super({ key: 'BattleScene' });
      }

      create() {
        const { width, height } = this.scale;

        // Background Starfield
        for (let i = 0; i < 80; i++) {
          const x = Phaser.Math.Between(0, width);
          const y = Phaser.Math.Between(0, height);
          const star = this.add.circle(x, y, Phaser.Math.Between(1, 2), 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
          this.tweens.add({
            targets: star,
            y: height + 10,
            duration: Phaser.Math.Between(2000, 5000),
            repeat: -1,
            onRepeat: () => {
              star.x = Phaser.Math.Between(0, width);
              star.y = -10;
            },
          });
        }

        // Groups
        this.bullets = this.add.group();
        this.enemies = this.add.group();
        this.enemyBullets = this.add.group();
        this.items = this.add.group();

        // Player Ship Shape (Cyan Futuristic Arrow)
        this.player = this.add.rectangle(width / 2, height - 80, 36, 44, 0x00f0ff);
        this.physics.add.existing(this.player);
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setCollideWorldBounds(true);

        // Player Controls
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
          if (this.isGameOver) return;
          this.player.x = Phaser.Math.Clamp(pointer.x, 20, width - 20);
          this.player.y = Phaser.Math.Clamp(pointer.y, 40, height - 40);
        });

        // Shooting Loop
        this.time.addEvent({
          delay: 150,
          loop: true,
          callback: () => {
            if (this.isGameOver) return;
            this.shootPlayerBullet();
          },
        });

        // Enemy Wave Spawner
        this.time.addEvent({
          delay: 1800,
          loop: true,
          callback: () => {
            if (this.isGameOver || this.boss) return;
            this.spawnEnemyWave();
          },
        });

        // Boss Spawn at 20 seconds
        this.time.delayedCall(12000, () => {
          if (!this.isGameOver && !this.boss) {
            this.spawnBoss();
          }
        });

        // UI Texts
        this.hpText = this.add.text(16, 16, `HP: ${this.playerHp}/${this.maxPlayerHp}`, {
          fontFamily: 'Orbitron',
          fontSize: '14px',
          color: '#00f0ff',
        });

        this.scoreText = this.add.text(width - 16, 16, `ĐIỂM: 0`, {
          fontFamily: 'Orbitron',
          fontSize: '14px',
          color: '#ffd700',
        }).setOrigin(1, 0);

        this.bossHpBar = this.add.graphics();

        // Collisions
        this.physics.add.overlap(this.bullets, this.enemies, (bulletObj, enemyObj) => {
          const bullet = bulletObj as Phaser.GameObjects.Rectangle;
          const enemy = enemyObj as Phaser.GameObjects.Rectangle;
          bullet.destroy();

          const currentHp = (enemy.getData('hp') || 100) - this.playerAttack;
          if (currentHp <= 0) {
            this.createExplosion(enemy.x, enemy.y, 0xff0055);
            this.dropItem(enemy.x, enemy.y);
            enemy.destroy();
            this.score += 100;
            this.scoreText.setText(`ĐIỂM: ${this.score}`);
          } else {
            enemy.setData('hp', currentHp);
          }
        });

        this.physics.add.overlap(this.player, this.enemies, (playerObj, enemyObj) => {
          const enemy = enemyObj as Phaser.GameObjects.Rectangle;
          enemy.destroy();
          this.takeDamage(150);
        });

        this.physics.add.overlap(this.player, this.enemyBullets, (playerObj, bulletObj) => {
          const bullet = bulletObj as Phaser.GameObjects.Arc;
          bullet.destroy();
          this.takeDamage(80);
        });
      }

      shootPlayerBullet() {
        const b = this.add.rectangle(this.player.x, this.player.y - 20, 6, 18, 0x00ffff);
        this.physics.add.existing(b);
        this.bullets.add(b);
        (b.body as Phaser.Physics.Arcade.Body).setVelocityY(-650);

        // Auto destroy bullet out of screen
        this.time.delayedCall(1200, () => b.destroy());
      }

      spawnEnemyWave() {
        const { width } = this.scale;
        for (let i = 0; i < 3; i++) {
          const x = 60 + i * (width / 3.5);
          const enemy = this.add.rectangle(x, -20, 30, 30, 0xff3366);
          this.physics.add.existing(enemy);
          enemy.setData('hp', 250);
          this.enemies.add(enemy);

          const body = enemy.body as Phaser.Physics.Arcade.Body;
          body.setVelocityY(Phaser.Math.Between(80, 140));

          // Enemy shooting
          this.time.delayedCall(1000, () => {
            if (enemy.active) {
              const eb = this.add.circle(enemy.x, enemy.y + 15, 5, 0xff0055);
              this.physics.add.existing(eb);
              this.enemyBullets.add(eb);
              (eb.body as Phaser.Physics.Arcade.Body).setVelocityY(220);
            }
          });
        }
      }

      spawnBoss() {
        const { width } = this.scale;
        this.boss = this.add.rectangle(width / 2, -50, 90, 70, 0xff00ff);
        this.physics.add.existing(this.boss);
        this.enemies.add(this.boss);

        // Move boss down
        this.tweens.add({
          targets: this.boss,
          y: 110,
          duration: 1500,
          ease: 'Power2',
        });

        // Boss Bullet Hell Patterns
        this.time.addEvent({
          delay: 900,
          loop: true,
          callback: () => {
            if (!this.boss || !this.boss.active) return;
            for (let angle = -40; angle <= 40; angle += 20) {
              const rad = Phaser.Math.DegToRad(angle + 90);
              const eb = this.add.circle(this.boss.x, this.boss.y + 30, 6, 0xff00ff);
              this.physics.add.existing(eb);
              this.enemyBullets.add(eb);
              const body = eb.body as Phaser.Physics.Arcade.Body;
              body.setVelocity(Math.cos(rad) * 200, Math.sin(rad) * 200);
            }
          },
        });
      }

      takeDamage(amount: number) {
        if (this.isGameOver) return;
        this.playerHp = Math.max(0, this.playerHp - amount);
        this.hpText.setText(`HP: ${this.playerHp}/${this.maxPlayerHp}`);

        // Red flash
        this.cameras.main.flash(100, 255, 0, 0);

        if (this.playerHp <= 0) {
          this.isGameOver = true;
          this.createExplosion(this.player.x, this.player.y, 0x00f0ff);
          this.player.destroy();
          this.finishGame(false);
        }
      }

      createExplosion(x: number, y: number, color: number) {
        for (let i = 0; i < 15; i++) {
          const p = this.add.circle(x, y, Phaser.Math.Between(2, 5), color);
          this.physics.add.existing(p);
          const rad = Phaser.Math.FloatBetween(0, Math.PI * 2);
          const speed = Phaser.Math.Between(50, 180);
          (p.body as Phaser.Physics.Arcade.Body).setVelocity(Math.cos(rad) * speed, Math.sin(rad) * speed);
          this.tweens.add({
            targets: p,
            alpha: 0,
            duration: 500,
            onComplete: () => p.destroy(),
          });
        }
      }

      dropItem(x: number, y: number) {
        const item = this.add.text(x, y, '⛏️', { fontSize: '16px' });
        this.tweens.add({
          targets: item,
          y: y - 20,
          alpha: 0,
          duration: 800,
          onComplete: () => item.destroy(),
        });
      }

      update() {
        if (this.boss && this.boss.active) {
          // Check Boss Hit
          this.physics.overlap(this.bullets, this.boss, (bossObj, bulletObj) => {
            bulletObj.destroy();
            this.bossHp -= this.playerAttack;

            // Draw Boss HP Bar
            this.bossHpBar.clear();
            const { width } = this.scale;
            const barW = width - 40;
            const hpRatio = Math.max(0, this.bossHp / this.maxBossHp);
            this.bossHpBar.fillStyle(0x330033, 0.8);
            this.bossHpBar.fillRect(20, 40, barW, 8);
            this.bossHpBar.fillStyle(0xff00ff, 1);
            this.bossHpBar.fillRect(20, 40, barW * hpRatio, 8);

            if (this.bossHp <= 0 && !this.isGameOver) {
              this.isGameOver = true;
              this.createExplosion(this.boss!.x, this.boss!.y, 0xff00ff);
              this.boss!.destroy();
              this.finishGame(true);
            }
          });
        }
      }

      async finishGame(isVictory: boolean) {
        try {
          const res = await api.completeBattle('STAGE_1_1', isVictory);
          onUpdateProfile(res.profile);
          setBattleResult({ isVictory, loot: res.loot });
        } catch (err) {
          console.error('Error completing battle:', err);
        }
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: Math.min(window.innerWidth - 32, 480),
      height: 600,
      backgroundColor: '#060913',
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      scene: [BattleScene],
    };

    gameInstance = new Phaser.Game(config);

    return () => {
      gameInstance?.destroy(true);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="glass-panel p-4 rounded-3xl border border-stellar-cyan/50 glow-cyan flex flex-col items-center max-w-lg w-full relative">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚔️</span>
            <div>
              <h3 className="font-['Orbitron'] font-bold text-sm text-stellar-cyan">
                CHIẾN TRƯỜNG GAIA: STAGE 1-1
              </h3>
              <p className="text-[11px] text-gray-400">Rê chuột hoặc cảm ứng để điều khiển chiến cơ</p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg bg-space-800 text-gray-400 hover:text-white border border-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phaser 3 Canvas Container */}
        <div
          ref={gameContainerRef}
          className="rounded-2xl overflow-hidden border border-stellar-cyan/30 shadow-2xl relative"
        />

        {/* Battle Victory / Defeat Modal */}
        {battleResult && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center animate-fade-in">
            {battleResult.isVictory ? (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-stellar-gold/20 border-2 border-stellar-gold flex items-center justify-center text-4xl mx-auto glow-gold animate-bounce">
                  🏆
                </div>
                <h2 className="font-['Orbitron'] font-black text-2xl text-stellar-gold tracking-widest">
                  CHIẾN THẮNG RỰC RỠ!
                </h2>
                <p className="text-xs text-gray-300">Đã tiêu diệt Drone Chỉ Huy Alpha và bảo vệ căn cứ!</p>

                {battleResult.loot && (
                  <div className="p-4 rounded-xl bg-space-800/90 border border-stellar-gold/40 text-left space-y-2 max-w-xs mx-auto">
                    <div className="text-xs font-bold text-stellar-gold uppercase">CHIẾN LỢI PHẨM (LOOT):</div>
                    <div className="text-sm font-['Orbitron'] text-stellar-gold font-bold">
                      + {battleResult.loot.credits} Credits 💰
                    </div>
                    <div className="text-sm font-['Orbitron'] text-stellar-cyan font-bold">
                      + {battleResult.loot.exp} EXP Căn Cứ
                    </div>
                    {battleResult.loot.materials.map((m: any, idx: number) => (
                      <div key={idx} className="text-xs text-white font-bold flex items-center gap-1.5">
                        <span>⛏️</span> +{m.amount} {m.itemId}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={onExit}
                  className="px-8 py-3 rounded-xl bg-stellar-gold text-black font-['Orbitron'] font-bold text-xs hover:bg-yellow-400 transition glow-gold cursor-pointer"
                >
                  Trở Về Căn Cứ Gaia
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-4xl mx-auto glow-purple">
                  💥
                </div>
                <h2 className="font-['Orbitron'] font-black text-2xl text-red-400 tracking-widest">
                  CHIẾN CƠ BỊ BẮN HẠ!
                </h2>
                <p className="text-xs text-gray-400 max-w-xs">
                  Hãy quay lại Nông Trại để trồng trọt, kiếm Credits và nâng cấp cấp độ phi thuyền trong Hangar!
                </p>
                <button
                  onClick={onExit}
                  className="px-8 py-3 rounded-xl bg-space-700 text-white font-['Orbitron'] font-bold text-xs hover:bg-space-600 transition border border-gray-600 cursor-pointer"
                >
                  Rút Lui Về Căn Cứ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
