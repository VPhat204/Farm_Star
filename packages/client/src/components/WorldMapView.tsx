import React, { useEffect, useRef, useState } from 'react';
import { PlayerProfile, CROPS, SHIPS } from '@starfarm/shared';
import {
  Sprout,
  Rocket,
  Store,
  Sparkles,
  Swords,
  Factory,
  Package,
  Volume2,
  Compass,
  Radio,
  Eye,
  MapPin,
  HelpCircle,
  Play
} from 'lucide-react';

interface WorldMapViewProps {
  profile: PlayerProfile;
  onOpenFarm: () => void;
  onOpenHangar: () => void;
  onOpenMarket: () => void;
  onOpenGacha: () => void;
  onOpenInventory: () => void;
  onOpenSettings: () => void;
  onStartBattle: () => void;
  onToggleOverview?: () => void;
}

interface InteractiveZone {
  id: string;
  name: string;
  sub: string;
  x: number;
  y: number;
  radius: number;
  icon: string;
  color: string;
  action: () => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({
  profile,
  onOpenFarm,
  onOpenHangar,
  onOpenMarket,
  onOpenGacha,
  onOpenInventory,
  onOpenSettings,
  onStartBattle,
  onToggleOverview,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeZone, setActiveZone] = useState<InteractiveZone | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: 700, y: 550 });

  const equippedShip = profile.ships.find((s) => s.isEquipped) || profile.ships[0];
  const readyCropsCount = profile.farmPlots.filter((p) => p.status === 'READY').length;

  const zones: InteractiveZone[] = [
    {
      id: 'FARM',
      name: 'VƯỜN SINH HỌC BIO-DOME',
      sub: readyCropsCount > 0 ? `${readyCropsCount} ô đất đã chín! Nhấn [E] thu hoạch` : 'Nhấn [E] để gieo hạt & tưới cây',
      x: 360,
      y: 360,
      radius: 140,
      icon: '🌱',
      color: '#10b981',
      action: onOpenFarm,
    },
    {
      id: 'HANGAR',
      name: 'BẾN TÀU CHIẾN CƠ LP-01',
      sub: `Chiến cơ: ${equippedShip ? equippedShip.shipId : 'Scout Alpha'} • Nhấn [E] mở Hangar`,
      x: 1040,
      y: 360,
      radius: 150,
      icon: '🛸',
      color: '#00f2fe',
      action: onOpenHangar,
    },
    {
      id: 'MARKET',
      name: 'CHỢ KHÔNG GIAN BAZAAR',
      sub: 'Gặp NPC Thương Nhân Jax • Nhấn [E] mở chợ',
      x: 360,
      y: 780,
      radius: 140,
      icon: '🏪',
      color: '#f59e0b',
      action: onOpenMarket,
    },
    {
      id: 'GACHA',
      name: 'CỔNG LƯỢNG TỬ WARP PORTAL',
      sub: `Triệu hồi chiến cơ SSR (Pity ${profile.pityCount}/10) • Nhấn [E] mở cổng`,
      x: 1040,
      y: 780,
      radius: 140,
      icon: '🌌',
      color: '#a855f7',
      action: onOpenGacha,
    },
    {
      id: 'BATTLE',
      name: 'TRẠM RADAR XUẤT KÍCH',
      sub: 'Tác chiến diệt quái & boss hạm đội • Nhấn [E] xuất kích',
      x: 700,
      y: 200,
      radius: 130,
      icon: '⚔️',
      color: '#ef4444',
      action: onStartBattle,
    },
    {
      id: 'INVENTORY',
      name: 'KHO CHỨA NĂNG LƯỢNG & VẬT PHẨM',
      sub: 'Xem túi đồ, quặng & linh kiện • Nhấn [E] mở kho',
      x: 700,
      y: 920,
      radius: 130,
      icon: '📦',
      color: '#6366f1',
      action: onOpenInventory,
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const worldWidth = 1500;
    const worldHeight = 1200;

    // Player State
    const player = {
      x: 700,
      y: 550,
      targetX: 700,
      targetY: 550,
      speed: 4.5,
      dir: 'DOWN' as 'DOWN' | 'UP' | 'LEFT' | 'RIGHT',
      isMoving: false,
      frame: 0,
      animTimer: 0,
    };

    // Load HD Spritesheet Assets
    const charImg = new Image();
    charImg.src = '/assets/spritesheet_characters.png';

    const shipsImg = new Image();
    shipsImg.src = '/assets/spritesheet_ships_r_to_ssr.png';

    const cropsImg = new Image();
    cropsImg.src = '/assets/tileset_crops_and_minerals.png';

    const baseMapImg = new Image();
    baseMapImg.src = '/assets/tileset_scifi_base_map.png';

    // Keyboard state
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === 'e' || e.key === 'E') {
        const found = zones.find((z) => Math.hypot(player.x - z.x, player.y - z.y) <= z.radius);
        if (found) {
          found.action();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const cameraX = Math.max(0, Math.min(worldWidth - width, player.x - width / 2));
      const cameraY = Math.max(0, Math.min(worldHeight - height, player.y - height / 2));

      player.targetX = clientX + cameraX;
      player.targetY = clientY + cameraY;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', handlePointerDown);

    // Ambient floating space particles
    const particles: { x: number; y: number; size: number; alpha: number; speedY: number; color: string }[] = [];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * worldWidth,
        y: Math.random() * worldHeight,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        speedY: Math.random() * 0.35 + 0.15,
        color: ['#00f2fe', '#10b981', '#a855f7', '#fbbf24'][Math.floor(Math.random() * 4)],
      });
    }

    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Keyboard Movement
      let moveX = 0;
      let moveY = 0;

      if (keys['w'] || keys['arrowup']) moveY -= 1;
      if (keys['s'] || keys['arrowdown']) moveY += 1;
      if (keys['a'] || keys['arrowleft']) moveX -= 1;
      if (keys['d'] || keys['arrowright']) moveX += 1;

      if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        player.x += (moveX / len) * player.speed;
        player.y += (moveY / len) * player.speed;
        player.targetX = player.x;
        player.targetY = player.y;
        player.isMoving = true;

        if (Math.abs(moveX) > Math.abs(moveY)) {
          player.dir = moveX > 0 ? 'RIGHT' : 'LEFT';
        } else {
          player.dir = moveY > 0 ? 'DOWN' : 'UP';
        }
      } else {
        // Pointer Movement
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) {
          player.x += (dx / dist) * player.speed;
          player.y += (dy / dist) * player.speed;
          player.isMoving = true;

          if (Math.abs(dx) > Math.abs(dy)) {
            player.dir = dx > 0 ? 'RIGHT' : 'LEFT';
          } else {
            player.dir = dy > 0 ? 'DOWN' : 'UP';
          }
        } else {
          player.isMoving = false;
        }
      }

      // Map Bounds Clamping
      player.x = Math.max(70, Math.min(worldWidth - 70, player.x));
      player.y = Math.max(70, Math.min(worldHeight - 70, player.y));
      setPlayerPos({ x: Math.round(player.x), y: Math.round(player.y) });

      // Walk Animation Step
      if (player.isMoving) {
        player.animTimer += dt * 9;
        player.frame = Math.floor(player.animTimer) % 3;
      } else {
        player.frame = 0;
      }

      // 2. Camera Tracking
      const cameraX = Math.max(0, Math.min(worldWidth - width, player.x - width / 2));
      const cameraY = Math.max(0, Math.min(worldHeight - height, player.y - height / 2));

      // 3. Proximity Check
      const nearbyZone = zones.find((z) => Math.hypot(player.x - z.x, player.y - z.y) <= z.radius);
      setActiveZone(nearbyZone || null);

      // 4. Render Background Grid & World Map
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(-cameraX, -cameraY);

      // Deep Space Base Texture Floor
      ctx.fillStyle = '#060b18';
      ctx.fillRect(0, 0, worldWidth, worldHeight);

      // Draw Tileset Base Map Floors & Pathways if loaded
      if (baseMapImg.complete && baseMapImg.naturalWidth > 0) {
        // Tile repeat background metal grid
        const patternSize = 256;
        for (let bx = 0; bx < worldWidth; bx += patternSize) {
          for (let by = 0; by < worldHeight; by += patternSize) {
            // Slicing top-left tile from baseMapImg (0, 0, 200, 200)
            ctx.drawImage(baseMapImg, 0, 0, 200, 200, bx, by, patternSize, patternSize);
          }
        }
      } else {
        // Fallback sci-fi grid
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.12)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= worldWidth; x += 48) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, worldHeight);
          ctx.stroke();
        }
        for (let y = 0; y <= worldHeight; y += 48) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(worldWidth, y);
          ctx.stroke();
        }
      }

      // Main Illuminated Energy Conduits Connecting All Sectors
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.5)';
      ctx.lineWidth = 8;
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      // Main Axes
      ctx.moveTo(700, 80);
      ctx.lineTo(700, 1120);
      ctx.moveTo(120, 550);
      ctx.lineTo(1380, 550);
      // Diagonals to Sector Zones
      ctx.moveTo(700, 550);
      ctx.lineTo(360, 360);
      ctx.moveTo(700, 550);
      ctx.lineTo(1040, 360);
      ctx.moveTo(700, 550);
      ctx.lineTo(360, 780);
      ctx.moveTo(700, 550);
      ctx.lineTo(1040, 780);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Central Nexus Hologram Hub
      const nexusPulse = Math.sin(time * 0.003) * 8 + 36;
      ctx.fillStyle = 'rgba(0, 242, 254, 0.2)';
      ctx.beginPath();
      ctx.arc(700, 550, nexusPulse + 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(700, 550, 42, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = 'bold 11px "Orbitron"';
      ctx.fillStyle = '#67e8f9';
      ctx.textAlign = 'center';
      ctx.fillText('NEXUS CORE', 700, 555);

      // 5. Render Interactive Zones with Real Sprites & Buildings
      zones.forEach((z) => {
        const isHover = activeZone?.id === z.id;
        const pulse = Math.sin(time * 0.004 + z.x) * 5;

        // Glowing Platform Aura
        ctx.fillStyle = isHover ? `${z.color}35` : `${z.color}15`;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius * 0.72 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = z.color;
        ctx.lineWidth = isHover ? 3.5 : 2;
        ctx.shadowColor = z.color;
        ctx.shadowBlur = isHover ? 16 : 8;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius * 0.72, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Specific Sector Sprites
        if (z.id === 'FARM') {
          // 1. Bio-Dome Greenhouse & Live Crop Plots
          if (baseMapImg.complete && baseMapImg.naturalWidth > 0) {
            // Draw Bio-Dome building slice (bottom-left of baseMapImg: 0, 700, 360, 320)
            ctx.drawImage(baseMapImg, 0, 700, 360, 320, z.x - 90, z.y - 120, 180, 160);
          }

          // Draw Crop Plots & Animated Crops using tileset_crops_and_minerals.png
          if (cropsImg.complete && cropsImg.naturalWidth > 0) {
            // Draw 4 crop plots around the dome
            const cropOffsets = [
              { dx: -70, dy: 45, type: 'WHEAT', stage: readyCropsCount > 0 ? 3 : 1 },
              { dx: -25, dy: 55, type: 'CORN', stage: 2 },
              { dx: 25, dy: 55, type: 'BERRY', stage: readyCropsCount > 0 ? 3 : 2 },
              { dx: 70, dy: 45, type: 'MELON', stage: readyCropsCount > 0 ? 3 : 1 },
            ];

            cropOffsets.forEach((c, idx) => {
              // Crop spritesheet slicing
              let sx = 100 + c.stage * 110;
              let sy = 100 + idx * 110;
              ctx.drawImage(cropsImg, sx, sy, 100, 100, z.x + c.dx - 22, z.y + c.dy - 22, 44, 44);
            });
          }
        } else if (z.id === 'HANGAR') {
          // 2. Launchpad LP-01 & Docked Starship
          if (baseMapImg.complete && baseMapImg.naturalWidth > 0) {
            // Slice Launch Pad from baseMapImg (bottom-right: 680, 680, 340, 340)
            ctx.drawImage(baseMapImg, 680, 680, 340, 340, z.x - 95, z.y - 95, 190, 190);
          }

          // Draw Docked Starship using spritesheet_ships_r_to_ssr.png
          if (shipsImg.complete && shipsImg.naturalWidth > 0) {
            // Determine ship slice by profile tier
            let shipSx = 150;
            let shipSy = 100; // Tier R Scout
            let shipSw = 220;
            let shipSh = 220;

            if (equippedShip && equippedShip.shipId.includes('NOVA')) {
              // SSR Nova Hunter (Middle-bottom)
              shipSx = 120;
              shipSy = 550;
              shipSw = 360;
              shipSh = 220;
            } else if (equippedShip && equippedShip.shipId.includes('PLASMA')) {
              // SR Plasma Interceptor
              shipSx = 100;
              shipSy = 220;
              shipSw = 280;
              shipSh = 200;
            }

            // Draw Ship on Launchpad
            ctx.save();
            ctx.translate(z.x, z.y - 10);
            ctx.rotate(-Math.PI / 2); // Point ship upward
            ctx.drawImage(shipsImg, shipSx, shipSy, shipSw, shipSh, -45, -45, 90, 90);
            ctx.restore();

            // Animated Thruster Plasma Plume
            const flamePulse = Math.sin(time * 0.02) * 5 + 14;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(z.x, z.y + 35, flamePulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        } else if (z.id === 'MARKET') {
          // 3. Interstellar Market Bazaar & Crates
          if (baseMapImg.complete && baseMapImg.naturalWidth > 0) {
            // Slice Storage / Solar structure (620, 250, 340, 240)
            ctx.drawImage(baseMapImg, 620, 250, 340, 240, z.x - 85, z.y - 85, 170, 120);
          }

          // Draw Ore / Treasure Chest from crops & minerals sheet
          if (cropsImg.complete && cropsImg.naturalWidth > 0) {
            // Treasure chest slice (bottom-right: 640, 750, 180, 180)
            ctx.drawImage(cropsImg, 640, 750, 180, 180, z.x - 25, z.y + 20, 50, 50);
          }
        } else if (z.id === 'GACHA') {
          // 4. Swirling Quantum Warp Gate
          if (baseMapImg.complete && baseMapImg.naturalWidth > 0) {
            // Slice Warp Gate from baseMapImg (bottom-middle: 380, 740, 280, 280)
            ctx.drawImage(baseMapImg, 380, 740, 280, 280, z.x - 80, z.y - 80, 160, 160);
          }

          // Animated Swirling Energy Vortex
          ctx.save();
          ctx.translate(z.x, z.y);
          ctx.rotate(time * 0.003);
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(0, 0, 36, 0, Math.PI * 1.6);
          ctx.stroke();

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 1.3);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.restore();
        } else if (z.id === 'BATTLE') {
          // 5. Strike Defense Radar & Solar Battery Array
          if (baseMapImg.complete && baseMapImg.naturalWidth > 0) {
            ctx.drawImage(baseMapImg, 620, 100, 260, 140, z.x - 80, z.y - 70, 160, 90);
          }

          // Radar Rotating Beam
          const scanAngle = time * 0.0035;
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(z.x, z.y);
          ctx.lineTo(z.x + Math.cos(scanAngle) * 55, z.y + Math.sin(scanAngle) * 55);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (z.id === 'INVENTORY') {
          // 6. Energy Minerals & Chest Vault
          if (cropsImg.complete && cropsImg.naturalWidth > 0) {
            // Draw Energy Crystal (bottom-left: 310, 750, 130, 130)
            ctx.drawImage(cropsImg, 310, 750, 130, 130, z.x - 55, z.y - 30, 55, 55);
            // Draw Stellar Gem (bottom-middle: 460, 750, 130, 130)
            ctx.drawImage(cropsImg, 460, 750, 130, 130, z.x + 5, z.y - 30, 55, 55);
          }
        }

        // Zone Name Label
        ctx.font = 'bold 12px "Orbitron", sans-serif';
        ctx.fillStyle = z.color;
        ctx.textAlign = 'center';
        ctx.fillText(z.name, z.x, z.y + z.radius * 0.72 + 20);
      });

      // 6. Render NPCs from Spritesheet
      if (charImg.complete && charImg.naturalWidth > 0) {
        // NPC 1: Dr. Nova (Scientist) at Bio-Farm (Row 3, Col 0: 40, 510, 140, 170)
        ctx.drawImage(charImg, 40, 510, 140, 170, 440, 390, 40, 48);
        ctx.font = 'bold 10px "Orbitron"';
        ctx.fillStyle = '#67e8f9';
        ctx.textAlign = 'center';
        ctx.fillText('TS. Nova 👩‍🔬', 460, 380);

        // NPC 2: Mechanic Zara at Hangar (Row 3, Col 2: 370, 510, 140, 170)
        ctx.drawImage(charImg, 370, 510, 140, 170, 960, 370, 40, 48);
        ctx.fillStyle = '#fde047';
        ctx.fillText('Kỹ sư Zara 👩‍🔧', 980, 360);

        // NPC 3: Alien Merchant Jax at Market (Row 3, Col 4: 700, 510, 140, 170)
        ctx.drawImage(charImg, 700, 510, 140, 170, 440, 800, 42, 50);
        ctx.fillStyle = '#c084fc';
        ctx.fillText('Thương nhân Jax 👽', 460, 790);

        // NPC 4: Floating Drone Companion (Row 5: 40 + (frame%4)*170, 870, 140, 140)
        const droneFrame = Math.floor(time * 0.006) % 4;
        const droneX = player.x - 26;
        const droneY = player.y - 32 + Math.sin(time * 0.005) * 6;
        ctx.drawImage(charImg, 40 + droneFrame * 170, 870, 140, 140, droneX - 16, droneY - 16, 32, 32);
      }

      // 7. Render Player Commander from Spritesheet with 4-Direction Walk Frames
      if (charImg.complete && charImg.naturalWidth > 0) {
        // Player Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(player.x, player.y + 18, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Determine Spritesheet Row based on Direction
        let rowY = 0; // DOWN
        let colX = player.frame;

        if (player.dir === 'LEFT' || player.dir === 'RIGHT') {
          rowY = 170; // Side walk
        } else if (player.dir === 'UP') {
          rowY = 340; // Back walk
        }

        const srcX = 40 + (colX % 4) * 165;
        const srcY = 20 + rowY;

        ctx.save();
        ctx.translate(player.x, player.y);

        if (player.dir === 'LEFT') {
          ctx.scale(-1, 1); // Flip horizontally for LEFT
        }

        // Draw Player Sprite Frame (48x56 px)
        ctx.drawImage(charImg, srcX, srcY, 140, 160, -24, -36, 48, 56);
        ctx.restore();

        // Player Name & Level Overhead
        ctx.font = 'bold 11px "Orbitron", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(profile.username, player.x, player.y - 44);

        ctx.font = 'bold 9px "Orbitron", sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Lv.${profile.level}`, player.x, player.y - 56);
      } else {
        // Fallback Vector Player
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(player.x - 12, player.y - 20, 24, 36, 6);
        ctx.fill();
      }

      // 8. Ambient Bio-Spores & Energy Particles
      particles.forEach((p) => {
        p.y -= p.speedY;
        if (p.y < 0) p.y = worldHeight;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (Math.sin(time * 0.002 + p.x) * 0.3 + 0.7);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('touchstart', handlePointerDown);
    };
  }, [profile, zones]);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#050b18]">
      
      {/* 2D RPG World Canvas */}
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair block" />

      {/* Top HUD: Commander Status Bar & Base Overview Switcher */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        {/* Left: Commander Badge */}
        <div className="flex items-center gap-3 bg-[#081026]/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-cyan-400/40 shadow-2xl pointer-events-auto glow-cyan-sm">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center text-lg shadow">
            🧑‍🚀
          </div>
          <div>
            <div className="flex items-center gap-2 font-['Orbitron'] font-bold text-xs text-white">
              <span>{profile.username}</span>
              <span className="text-amber-400 text-[10px]">Lv.{profile.level}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-cyan-200 mt-0.5">
              <span>🪙 {profile.credits.toLocaleString()}</span>
              <span>💎 {profile.stellarGems}</span>
            </div>
          </div>
        </div>

        {/* Center: Live Coordinates & Mission Guide */}
        <div className="hidden md:flex items-center gap-2 bg-[#081026]/80 backdrop-blur-md px-4 py-1.5 rounded-xl border border-cyan-500/20 text-xs text-cyan-300 font-mono pointer-events-auto">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>TỌA ĐỘ: [{playerPos.x}, {playerPos.y}]</span>
          <span className="text-gray-500">•</span>
          <span className="text-emerald-400 font-bold">TRẠM GAIA PRIME ONLINE 🟢</span>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onToggleOverview && (
            <button
              onClick={onToggleOverview}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081026]/90 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white transition backdrop-blur-xl shadow-xl glow-cyan-sm text-xs font-['Orbitron'] font-bold cursor-pointer hover:scale-105 active:scale-95"
              title="Chuyển góc nhìn 3D Hành Tinh"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Xem Căn Cứ 3D</span>
            </button>
          )}

          <button
            onClick={onOpenInventory}
            className="p-2.5 rounded-xl bg-[#081026]/90 border border-indigo-500/40 hover:border-indigo-300 text-indigo-200 hover:text-white transition backdrop-blur-xl shadow-xl glow-purple-sm cursor-pointer hover:scale-105 active:scale-95"
            title="Mở Kho Đồ"
          >
            <Package className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-[#081026]/90 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white transition backdrop-blur-xl shadow-xl glow-cyan-sm cursor-pointer hover:scale-105 active:scale-95"
            title="Cài đặt hệ thống"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Proximity Action Trigger Banner (Center Bottom) */}
      {activeZone && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto animate-bounce-short">
          <div
            onClick={activeZone.action}
            className="px-6 py-3 rounded-2xl bg-[#070e24]/95 border-2 border-cyan-400 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,242,254,0.6)] flex items-center gap-4 cursor-pointer hover:scale-105 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              {activeZone.icon}
            </div>
            <div className="text-left">
              <div className="font-['Orbitron'] font-black text-sm text-white flex items-center gap-2">
                <span>{activeZone.name}</span>
                <span className="px-2 py-0.5 rounded-lg bg-cyan-500 text-black text-[10px] font-bold">
                  NHẤN [E] HOẶC CHẠM
                </span>
              </div>
              <div className="text-xs text-cyan-200/90 font-mono mt-0.5">
                {activeZone.sub}
              </div>
            </div>
            <span className="text-cyan-400 text-lg font-bold">➔</span>
          </div>
        </div>
      )}

      {/* Navigation Key Guide (Bottom-Left) */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none hidden md:flex flex-col gap-1.5 text-[11px] text-cyan-300/80 font-mono bg-[#081026]/75 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/30 shadow-lg">
        <div className="font-['Orbitron'] font-bold text-white text-xs mb-1 flex items-center gap-2">
          <span>🎮 ĐIỀU KHIỂN NHÂN VẬT</span>
        </div>
        <div>• <strong>W-A-S-D / Phím Mũi Tên</strong>: Di chuyển nhân vật</div>
        <div>• <strong>Nhấp Chuột / Chạm</strong>: Đi tới vị trí chỉ định</div>
        <div>• <strong>Phím [E]</strong>: Tương tác với công trình & NPC</div>
      </div>

      {/* MiniMap Radar HUD (Bottom-Right) */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-auto bg-[#081026]/90 backdrop-blur-xl p-2.5 rounded-2xl border border-cyan-500/40 shadow-2xl glow-cyan-sm">
        <div className="font-['Orbitron'] font-bold text-[10px] text-cyan-300 mb-1 flex items-center justify-between">
          <span>RADAR CĂN CỨ</span>
          <span className="text-emerald-400 animate-pulse">●</span>
        </div>
        <div className="w-36 h-28 bg-[#040816] rounded-xl relative border border-cyan-500/30 overflow-hidden">
          {/* Zones on MiniMap */}
          {zones.map((z) => (
            <div
              key={z.id}
              className="absolute w-2.5 h-2.5 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(z.x / 1500) * 100}%`,
                top: `${(z.y / 1200) * 100}%`,
                backgroundColor: z.color,
              }}
              title={z.name}
            />
          ))}

          {/* Player Blip on MiniMap */}
          <div
            className="absolute w-3 h-3 rounded-full bg-white border border-cyan-400 animate-ping transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(playerPos.x / 1500) * 100}%`,
              top: `${(playerPos.y / 1200) * 100}%`,
            }}
          />
          <div
            className="absolute w-2 h-2 rounded-full bg-cyan-400 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(playerPos.x / 1500) * 100}%`,
              top: `${(playerPos.y / 1200) * 100}%`,
            }}
          />
        </div>
      </div>

    </div>
  );
};
