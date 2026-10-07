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
  const [playerPos, setPlayerPos] = useState({ x: 600, y: 500 });
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);

  const equippedShip = profile.ships.find((s) => s.isEquipped) || profile.ships[0];
  const readyCropsCount = profile.farmPlots.filter((p) => p.status === 'READY').length;

  // Interactive zones in the 2D world
  const zones: InteractiveZone[] = [
    {
      id: 'FARM',
      name: 'VƯỜN SINH HỌC GAIA',
      sub: readyCropsCount > 0 ? `${readyCropsCount} ô đất đã chín! Nhấn [E] thu hoạch` : 'Nhấn [E] để gieo hạt & chăm sóc',
      x: 350,
      y: 350,
      radius: 120,
      icon: '🌱',
      color: '#10b981',
      action: onOpenFarm,
    },
    {
      id: 'HANGAR',
      name: 'BẾN TÀU CHIẾN CƠ HANGAR',
      sub: `Chiến cơ: ${equippedShip ? equippedShip.shipId : 'Scout Alpha'} • Nhấn [E] nâng cấp`,
      x: 950,
      y: 320,
      radius: 130,
      icon: '🛸',
      color: '#00f2fe',
      action: onOpenHangar,
    },
    {
      id: 'MARKET',
      name: 'CHỢ KHÔNG GIAN BAZAAR',
      sub: 'Gặp NPC Thương Nhân Jax • Nhấn [E] mở chợ',
      x: 350,
      y: 750,
      radius: 120,
      icon: '🏪',
      color: '#f59e0b',
      action: onOpenMarket,
    },
    {
      id: 'GACHA',
      name: 'CỔNG LƯỢNG TỬ WARP',
      sub: `Triệu hồi chiến cơ SSR (Pity ${profile.pityCount}/10) • Nhấn [E] mở cổng`,
      x: 950,
      y: 750,
      radius: 120,
      icon: '🌌',
      color: '#a855f7',
      action: onOpenGacha,
    },
    {
      id: 'BATTLE',
      name: 'TRẠM RADAR XUẤT KÍCH',
      sub: 'Tác chiến diệt quái & boss hạm đội • Nhấn [E] xuất kích',
      x: 650,
      y: 200,
      radius: 110,
      icon: '⚔️',
      color: '#ef4444',
      action: onStartBattle,
    },
    {
      id: 'INVENTORY',
      name: 'KHO CHỨA VẬT PHẨM',
      sub: 'Kho trang bị & khoáng sản • Nhấn [E] mở túi đồ',
      x: 650,
      y: 900,
      radius: 110,
      icon: '📦',
      color: '#6366f1',
      action: onOpenInventory,
    },
  ];

  // 2D Game Loop & Canvas Renderer
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

    // Game World State
    const worldWidth = 1400;
    const worldHeight = 1100;

    // Player State
    const player = {
      x: 650,
      y: 550,
      targetX: 650,
      targetY: 550,
      speed: 4,
      dir: 'DOWN' as 'DOWN' | 'UP' | 'LEFT' | 'RIGHT',
      isMoving: false,
      frame: 0,
      animTimer: 0,
    };

    // Load Spritesheet assets
    const charImg = new Image();
    charImg.src = '/assets/spritesheet_characters.png';

    const shipsImg = new Image();
    shipsImg.src = '/assets/spritesheet_ships_r_to_ssr.png';

    const cropsImg = new Image();
    cropsImg.src = '/assets/tileset_crops_and_minerals.png';

    const baseMapImg = new Image();
    baseMapImg.src = '/assets/tileset_scifi_base_map.png';

    // Keyboard Input State
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === 'e' || e.key === 'E') {
        const found = zones.find((z) => {
          const dist = Math.hypot(player.x - z.x, player.y - z.y);
          return dist <= z.radius;
        });
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

      // Convert Screen to World Coords
      const cameraX = Math.max(0, Math.min(worldWidth - width, player.x - width / 2));
      const cameraY = Math.max(0, Math.min(worldHeight - height, player.y - height / 2));

      player.targetX = clientX + cameraX;
      player.targetY = clientY + cameraY;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', handlePointerDown);

    // Particles (ambient space embers & bio-spores)
    const spores: { x: number; y: number; size: number; alpha: number; speedY: number; color: string }[] = [];
    for (let i = 0; i < 60; i++) {
      spores.push({
        x: Math.random() * worldWidth,
        y: Math.random() * worldHeight,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        speedY: Math.random() * 0.4 + 0.2,
        color: ['#00f2fe', '#10b981', '#a855f7', '#fbbf24'][Math.floor(Math.random() * 4)],
      });
    }

    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Update Player Movement via Keyboard
      let moveX = 0;
      let moveY = 0;

      if (keys['w'] || keys['arrowup']) moveY -= 1;
      if (keys['s'] || keys['arrowdown']) moveY += 1;
      if (keys['a'] || keys['arrowleft']) moveX -= 1;
      if (keys['d'] || keys['arrowright']) moveX += 1;

      if (moveX !== 0 || moveY !== 0) {
        // Normalize
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
        // Mouse / Touch Click-to-Move
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 4) {
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

      // Clamp Player to Map
      player.x = Math.max(60, Math.min(worldWidth - 60, player.x));
      player.y = Math.max(60, Math.min(worldHeight - 60, player.y));
      setPlayerPos({ x: Math.round(player.x), y: Math.round(player.y) });

      // Animation Frame Step
      if (player.isMoving) {
        player.animTimer += dt * 8;
        player.frame = Math.floor(player.animTimer) % 4;
      } else {
        player.frame = 0;
      }

      // 2. Camera Clamping
      const cameraX = Math.max(0, Math.min(worldWidth - width, player.x - width / 2));
      const cameraY = Math.max(0, Math.min(worldHeight - height, player.y - height / 2));

      // 3. Proximity Check
      const nearbyZone = zones.find((z) => Math.hypot(player.x - z.x, player.y - z.y) <= z.radius);
      setActiveZone(nearbyZone || null);

      // 4. Render Background Grid & World Map
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(-cameraX, -cameraY);

      // Base Cyber Floor Pattern
      ctx.fillStyle = '#050b18';
      ctx.fillRect(0, 0, worldWidth, worldHeight);

      // Grid Tiles
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.07)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x <= worldWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, worldHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= worldHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(worldWidth, y);
        ctx.stroke();
      }

      // Main Energy Conduits / Pathways
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      // Center Crossroad
      ctx.moveTo(650, 100);
      ctx.lineTo(650, 1000);
      ctx.moveTo(200, 550);
      ctx.lineTo(1200, 550);
      // Diagonals to Sector Zones
      ctx.moveTo(650, 550);
      ctx.lineTo(350, 350);
      ctx.moveTo(650, 550);
      ctx.lineTo(950, 320);
      ctx.moveTo(650, 550);
      ctx.lineTo(350, 750);
      ctx.moveTo(650, 550);
      ctx.lineTo(950, 750);
      ctx.stroke();

      // Glowing Center Nexus Hub
      const nexusPulse = Math.sin(time * 0.003) * 10 + 40;
      ctx.fillStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.beginPath();
      ctx.arc(650, 550, nexusPulse + 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(650, 550, 35, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Render Interactive Zones & Buildings
      zones.forEach((z) => {
        // Zone Aura
        const isHover = activeZone?.id === z.id;
        const pulse = Math.sin(time * 0.004 + z.x) * 6;
        ctx.fillStyle = isHover ? `${z.color}33` : `${z.color}15`;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius * 0.75 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = z.color;
        ctx.lineWidth = isHover ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius * 0.75, 0, Math.PI * 2);
        ctx.stroke();

        // Building / Sector Platform Graphics
        if (z.id === 'FARM') {
          // Bio-Dome Farm Plots
          ctx.fillStyle = '#064e3b';
          for (let row = -1; row <= 1; row++) {
            for (let col = -1; col <= 1; col++) {
              const px = z.x + col * 32 - 14;
              const py = z.y + row * 28 - 12;
              ctx.fillRect(px, py, 28, 24);
              ctx.strokeStyle = '#10b981';
              ctx.strokeRect(px, py, 28, 24);

              // Crop Sprout
              ctx.fillStyle = '#34d399';
              ctx.beginPath();
              ctx.arc(px + 14, py + 12, 4 + (readyCropsCount > 0 ? 2 : 0), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else if (z.id === 'HANGAR') {
          // Launch Pad Platform LP-01
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(z.x - 50, z.y - 45, 100, 90);
          ctx.strokeStyle = '#00f2fe';
          ctx.strokeRect(z.x - 50, z.y - 45, 100, 90);

          // Render Docked Ship (Top-down)
          ctx.fillStyle = '#00f2fe';
          ctx.font = '36px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛸', z.x, z.y);

          // Thruster Glow
          ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
          ctx.beginPath();
          ctx.arc(z.x, z.y + 24, 8 + Math.sin(time * 0.01) * 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (z.id === 'MARKET') {
          // Market Bazaar Stall
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(z.x - 45, z.y - 40, 90, 80);
          ctx.strokeStyle = '#f59e0b';
          ctx.strokeRect(z.x - 45, z.y - 40, 90, 80);

          ctx.font = '36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🏪', z.x, z.y);
        } else if (z.id === 'GACHA') {
          // Swirling Quantum Portal
          ctx.save();
          ctx.translate(z.x, z.y);
          ctx.rotate(time * 0.002);
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 1.5);
          ctx.stroke();

          ctx.strokeStyle = '#ec4899';
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 1.2);
          ctx.stroke();
          ctx.restore();

          ctx.font = '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🌌', z.x, z.y);
        } else if (z.id === 'BATTLE') {
          // Strike Radar Tower
          ctx.font = '36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚔️', z.x, z.y);

          // Scanning Line
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(z.x, z.y);
          const scanAngle = time * 0.003;
          ctx.lineTo(z.x + Math.cos(scanAngle) * 45, z.y + Math.sin(scanAngle) * 45);
          ctx.stroke();
        } else if (z.id === 'INVENTORY') {
          ctx.font = '36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('📦', z.x, z.y);
        }

        // Zone Name Label
        ctx.font = 'bold 12px "Orbitron", sans-serif';
        ctx.fillStyle = z.color;
        ctx.textAlign = 'center';
        ctx.fillText(z.name, z.x, z.y + z.radius * 0.75 + 18);
      });

      // 6. Render NPCs
      // NPC 1: Dr. Nova (Scientist)
      ctx.font = '28px sans-serif';
      ctx.fillText('👩‍🔬', 420, 380);
      ctx.font = 'bold 10px "Orbitron"';
      ctx.fillStyle = '#67e8f9';
      ctx.fillText('TS. Nova', 420, 360);

      // NPC 2: Mechanic Zara (Hangar)
      ctx.font = '28px sans-serif';
      ctx.fillText('👩‍🔧', 880, 340);
      ctx.fillStyle = '#fde047';
      ctx.fillText('Kỹ sư Zara', 880, 320);

      // NPC 3: Alien Merchant Jax (Market)
      ctx.font = '28px sans-serif';
      ctx.fillText('👽', 420, 780);
      ctx.fillStyle = '#c084fc';
      ctx.fillText('Thương nhân Jax', 420, 760);

      // 7. Render Floating Drone Companion
      const droneY = player.y - 30 + Math.sin(time * 0.005) * 6;
      const droneX = player.x - 24;
      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.arc(droneX, droneY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Drone Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(droneX + 2, droneY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Drone Thruster Particle
      ctx.fillStyle = 'rgba(0, 242, 254, 0.5)';
      ctx.beginPath();
      ctx.arc(droneX, droneY + 8, 3 + Math.sin(time * 0.01) * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 8. Render Player Commander
      // Player Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(player.x, player.y + 14, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player Body (High-Tech Suit with Visor Glow)
      ctx.save();
      ctx.translate(player.x, player.y);

      // Suit Base
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(-10, -18, 20, 30, 6);
      ctx.fill();
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Visor Glow (Cyan)
      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.ellipse(0, -10, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Armor Chest Light
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Walking Step Animation Legs
      if (player.isMoving) {
        const legOffset = Math.sin(player.animTimer * 2) * 4;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-8, 12, 6, 6 + legOffset);
        ctx.fillRect(2, 12, 6, 6 - legOffset);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-8, 12, 6, 6);
        ctx.fillRect(2, 12, 6, 6);
      }

      ctx.restore();

      // Player Name Overhead
      ctx.font = 'bold 11px "Orbitron", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(profile.username, player.x, player.y - 26);

      ctx.font = 'bold 9px "Orbitron", sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`Lv.${profile.level}`, player.x, player.y - 38);

      // 9. Floating Ambient Spores & Star Dust
      spores.forEach((s) => {
        s.y -= s.speedY;
        if (s.y < 0) s.y = worldHeight;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha * (Math.sin(time * 0.002 + s.x) * 0.3 + 0.7);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
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
          {/* Radar Sweep Line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-radar-sweep pointer-events-none" />

          {/* Zones on MiniMap */}
          {zones.map((z) => (
            <div
              key={z.id}
              className="absolute w-2.5 h-2.5 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(z.x / 1400) * 100}%`,
                top: `${(z.y / 1100) * 100}%`,
                backgroundColor: z.color,
              }}
              title={z.name}
            />
          ))}

          {/* Player Blip on MiniMap */}
          <div
            className="absolute w-3 h-3 rounded-full bg-white border border-cyan-400 animate-ping transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(playerPos.x / 1400) * 100}%`,
              top: `${(playerPos.y / 1100) * 100}%`,
            }}
          />
          <div
            className="absolute w-2 h-2 rounded-full bg-cyan-400 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(playerPos.x / 1400) * 100}%`,
              top: `${(playerPos.y / 1100) * 100}%`,
            }}
          />
        </div>
      </div>

    </div>
  );
};
