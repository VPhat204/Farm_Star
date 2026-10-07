import React, { useEffect, useRef, useState } from 'react';
import { PlayerProfile } from '@starfarm/shared';
import {
  Package,
  Volume2,
  Compass,
  Eye,
  ArrowRight
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
  const [activeZone, setActiveZone] = useState<{ id: string; name: string; sub: string; icon: string; action: () => void } | null>(null);
  const [hudCoord, setHudCoord] = useState({ x: 700, y: 550 });

  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const callbacksRef = useRef({
    onOpenFarm,
    onOpenHangar,
    onOpenMarket,
    onOpenGacha,
    onOpenInventory,
    onStartBattle,
  });
  useEffect(() => {
    callbacksRef.current = {
      onOpenFarm,
      onOpenHangar,
      onOpenMarket,
      onOpenGacha,
      onOpenInventory,
      onStartBattle,
    };
  }, [onOpenFarm, onOpenHangar, onOpenMarket, onOpenGacha, onOpenInventory, onStartBattle]);

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

    const worldWidth = 1600;
    const worldHeight = 1200;

    // Player State (Managed exclusively inside game loop to avoid React re-render freeze)
    const player = {
      x: 750,
      y: 580,
      targetX: 750,
      targetY: 580,
      speed: 4.8,
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

    // Interactive World Zones
    const getZones = () => [
      {
        id: 'FARM',
        name: 'VƯỜN SINH HỌC BIO-DOME',
        sub: 'Khu trồng Lúa Sao & Bắp Năng Lượng • Nhấn [E] thu hoạch',
        x: 350,
        y: 350,
        radius: 140,
        icon: '🌱',
        color: '#10b981',
        action: () => callbacksRef.current.onOpenFarm(),
      },
      {
        id: 'HANGAR',
        name: 'BẾN TÀU CHIẾN CƠ LP-01',
        sub: 'Trang bị & nâng cấp phi đội tàu chiến • Nhấn [E] mở Hangar',
        x: 1150,
        y: 350,
        radius: 140,
        icon: '🛸',
        color: '#00f2fe',
        action: () => callbacksRef.current.onOpenHangar(),
      },
      {
        id: 'MARKET',
        name: 'CHỢ KHÔNG GIAN BAZAAR',
        sub: 'Thương nhân Alien Jax • Giao thương nông sản & khoáng sản',
        x: 350,
        y: 850,
        radius: 140,
        icon: '🏪',
        color: '#f59e0b',
        action: () => callbacksRef.current.onOpenMarket(),
      },
      {
        id: 'GACHA',
        name: 'CỔNG WARP TRIỆU HỒI',
        sub: 'Triệu hồi chiến cơ SSR tối thượng • Nhấn [E] mở cổng',
        x: 1150,
        y: 850,
        radius: 140,
        icon: '🌌',
        color: '#a855f7',
        action: () => callbacksRef.current.onOpenGacha(),
      },
      {
        id: 'BATTLE',
        name: 'TRẠM RADAR XUẤT KÍCH',
        sub: 'Chiến dịch săn quái vũ trụ & hạm đội • Nhấn [E] tác chiến',
        x: 750,
        y: 180,
        radius: 130,
        icon: '⚔️',
        color: '#ef4444',
        action: () => callbacksRef.current.onStartBattle(),
      },
      {
        id: 'INVENTORY',
        name: 'KHO CHỨA NĂNG LƯỢNG',
        sub: 'Túi đồ, quặng sắt, titanium & đá quý • Nhấn [E] mở kho',
        x: 750,
        y: 980,
        radius: 130,
        icon: '📦',
        color: '#6366f1',
        action: () => callbacksRef.current.onOpenInventory(),
      },
    ];

    // Keyboard Input
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === 'e' || e.key === 'E') {
        const currentZones = getZones();
        const found = currentZones.find((z) => Math.hypot(player.x - z.x, player.y - z.y) <= z.radius);
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
    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });

    // Ambient floating space particles
    const particles: { x: number; y: number; size: number; alpha: number; speedY: number; color: string }[] = [];
    for (let i = 0; i < 80; i++) {
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
    let lastHudSync = 0;
    let currentActiveZoneId: string | null = null;

    const gameLoop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Keyboard Movement Update
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
        // Pointer / Touch Movement
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
      player.x = Math.max(80, Math.min(worldWidth - 80, player.x));
      player.y = Math.max(80, Math.min(worldHeight - 80, player.y));

      // Walk Animation Step
      if (player.isMoving) {
        player.animTimer += dt * 8;
        player.frame = Math.floor(player.animTimer) % 3;
      } else {
        player.frame = 0;
      }

      // Sync HUD coordinates every 150ms to keep React light
      if (time - lastHudSync > 150) {
        lastHudSync = time;
        setHudCoord({ x: Math.round(player.x), y: Math.round(player.y) });
      }

      // 2. Camera Tracking
      const cameraX = Math.max(0, Math.min(worldWidth - width, player.x - width / 2));
      const cameraY = Math.max(0, Math.min(worldHeight - height, player.y - height / 2));

      // 3. Proximity Check
      const currentZones = getZones();
      const nearbyZone = currentZones.find((z) => Math.hypot(player.x - z.x, player.y - z.y) <= z.radius);
      
      if (nearbyZone?.id !== currentActiveZoneId) {
        currentActiveZoneId = nearbyZone?.id || null;
        if (nearbyZone) {
          setActiveZone({
            id: nearbyZone.id,
            name: nearbyZone.name,
            sub: nearbyZone.sub,
            icon: nearbyZone.icon,
            action: nearbyZone.action,
          });
        } else {
          setActiveZone(null);
        }
      }

      // 4. Render Game World
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(-cameraX, -cameraY);

      // Deep Space Base Texture Floor
      ctx.fillStyle = '#050a17';
      ctx.fillRect(0, 0, worldWidth, worldHeight);

      // Draw Sci-Fi Hexagonal / Grid Floor Pattern
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
      ctx.lineWidth = 1;
      const step = 64;
      for (let x = 0; x <= worldWidth; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, worldHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= worldHeight; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(worldWidth, y);
        ctx.stroke();
      }

      // Glowing Neon Energy Pathways
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      // Main Center Axes
      ctx.moveTo(750, 60);
      ctx.lineTo(750, 1140);
      ctx.moveTo(100, 580);
      ctx.lineTo(1500, 580);
      // Diagonals to Sector Zones
      ctx.moveTo(750, 580);
      ctx.lineTo(350, 350);
      ctx.moveTo(750, 580);
      ctx.lineTo(1150, 350);
      ctx.moveTo(750, 580);
      ctx.lineTo(350, 850);
      ctx.moveTo(750, 580);
      ctx.lineTo(1150, 850);
      ctx.stroke();

      // Central Nexus Hub
      const nexusPulse = Math.sin(time * 0.003) * 8 + 40;
      ctx.fillStyle = 'rgba(0, 242, 254, 0.18)';
      ctx.beginPath();
      ctx.arc(750, 580, nexusPulse + 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(750, 580, 48, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = 'bold 11px "Orbitron", sans-serif';
      ctx.fillStyle = '#67e8f9';
      ctx.textAlign = 'center';
      ctx.fillText('TRẠM GAIA PRIME', 750, 584);

      // 5. Render Sectors & Buildings (Clean, Seamless, Transparent)
      currentZones.forEach((z) => {
        const isNear = currentActiveZoneId === z.id;
        const pulse = Math.sin(time * 0.004 + z.x) * 6;

        // Base Hologram Zone Ring
        ctx.fillStyle = isNear ? `${z.color}30` : `${z.color}12`;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius * 0.75 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = z.color;
        ctx.lineWidth = isNear ? 3.5 : 2;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius * 0.75, 0, Math.PI * 2);
        ctx.stroke();

        // Zone Sector Graphics
        if (z.id === 'FARM') {
          // 1. Bio-Dome Greenhouse Sector
          // Circular Bio-Dome Base Platform
          ctx.fillStyle = '#064e3b';
          ctx.beginPath();
          ctx.arc(z.x, z.y - 15, 65, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Crop Soil Plots (6 Plots)
          const plotCoords = [
            { dx: -40, dy: 15 },
            { dx: 0, dy: 15 },
            { dx: 40, dy: 15 },
            { dx: -40, dy: -35 },
            { dx: 0, dy: -35 },
            { dx: 40, dy: -35 },
          ];

          plotCoords.forEach((p, idx) => {
            ctx.fillStyle = '#022c22';
            ctx.fillRect(z.x + p.dx - 16, z.y + p.dy - 12, 32, 24);
            ctx.strokeStyle = '#34d399';
            ctx.strokeRect(z.x + p.dx - 16, z.y + p.dy - 12, 32, 24);

            // Draw Crops from tileset
            if (cropsImg.complete && cropsImg.naturalWidth > 0) {
              const cropTypeIdx = idx % 4; // Wheat, Corn, Berry, Melon
              const isReady = idx < profileRef.current.farmPlots.filter((fp) => fp.status === 'READY').length;
              const stage = isReady ? 3 : 1;
              const sx = 100 + stage * 110;
              const sy = 100 + cropTypeIdx * 110;
              ctx.drawImage(cropsImg, sx, sy, 100, 100, z.x + p.dx - 14, z.y + p.dy - 16, 28, 28);
            }
          });
        } else if (z.id === 'HANGAR') {
          // 2. Launch Pad LP-01 & Docked Ship
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(z.x, z.y, 70, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Runway Markings
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 2;
          ctx.strokeRect(z.x - 45, z.y - 45, 90, 90);

          // Render Docked Ship from Spritesheet
          if (shipsImg.complete && shipsImg.naturalWidth > 0) {
            const equipped = profileRef.current.ships.find((s) => s.isEquipped);
            let shipSx = 150;
            let shipSy = 100;
            let shipSw = 220;
            let shipSh = 220;

            if (equipped && equipped.shipId.includes('NOVA')) {
              shipSx = 120;
              shipSy = 550;
              shipSw = 360;
              shipSh = 220;
            } else if (equipped && equipped.shipId.includes('PLASMA')) {
              shipSx = 100;
              shipSy = 220;
              shipSw = 280;
              shipSh = 200;
            }

            ctx.save();
            ctx.translate(z.x, z.y - 8);
            ctx.rotate(-Math.PI / 2); // Point ship upward
            ctx.drawImage(shipsImg, shipSx, shipSy, shipSw, shipSh, -40, -40, 80, 80);
            ctx.restore();

            // Thruster Glow
            const flamePulse = Math.sin(time * 0.02) * 4 + 10;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
            ctx.beginPath();
            ctx.arc(z.x, z.y + 32, flamePulse, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (z.id === 'MARKET') {
          // 3. Market Bazaar Platform
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(z.x, z.y, 65, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Crates & Chests
          if (cropsImg.complete && cropsImg.naturalWidth > 0) {
            ctx.drawImage(cropsImg, 640, 750, 180, 180, z.x - 30, z.y - 15, 60, 60);
          }
        } else if (z.id === 'GACHA') {
          // 4. Quantum Warp Gate Vortex
          ctx.fillStyle = '#2e1065';
          ctx.beginPath();
          ctx.arc(z.x, z.y, 65, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Animated Swirling Vortex
          ctx.save();
          ctx.translate(z.x, z.y);
          ctx.rotate(time * 0.003);
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, 38, 0, Math.PI * 1.6);
          ctx.stroke();

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 1.3);
          ctx.stroke();
          ctx.restore();
        } else if (z.id === 'BATTLE') {
          // 5. Strike Radar Tower
          ctx.fillStyle = '#450a0a';
          ctx.beginPath();
          ctx.arc(z.x, z.y, 65, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          const scanAngle = time * 0.0035;
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(z.x, z.y);
          ctx.lineTo(z.x + Math.cos(scanAngle) * 58, z.y + Math.sin(scanAngle) * 58);
          ctx.stroke();
        } else if (z.id === 'INVENTORY') {
          // 6. Energy Crystal Vault
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(z.x, z.y, 65, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          if (cropsImg.complete && cropsImg.naturalWidth > 0) {
            ctx.drawImage(cropsImg, 310, 750, 130, 130, z.x - 45, z.y - 25, 45, 45);
            ctx.drawImage(cropsImg, 460, 750, 130, 130, z.x + 2, z.y - 25, 45, 45);
          }
        }

        // Zone Title
        ctx.font = 'bold 12px "Orbitron", sans-serif';
        ctx.fillStyle = z.color;
        ctx.textAlign = 'center';
        ctx.fillText(z.name, z.x, z.y + z.radius * 0.75 + 20);
      });

      // 6. Render NPCs
      if (charImg.complete && charImg.naturalWidth > 0) {
        // Dr. Nova at Farm (Row 3, Col 0: 40, 510, 140, 170)
        ctx.drawImage(charImg, 40, 510, 140, 170, 430, 390, 42, 50);
        ctx.font = 'bold 10px "Orbitron"';
        ctx.fillStyle = '#67e8f9';
        ctx.fillText('TS. Nova 👩‍🔬', 450, 380);

        // Mechanic Zara at Hangar (Row 3, Col 2: 370, 510, 140, 170)
        ctx.drawImage(charImg, 370, 510, 140, 170, 1070, 380, 42, 50);
        ctx.fillStyle = '#fde047';
        ctx.fillText('Kỹ sư Zara 👩‍🔧', 1090, 370);

        // Alien Merchant Jax at Market (Row 3, Col 4: 700, 510, 140, 170)
        ctx.drawImage(charImg, 700, 510, 140, 170, 430, 880, 44, 52);
        ctx.fillStyle = '#c084fc';
        ctx.fillText('Thương nhân Jax 👽', 450, 870);

        // Floating Drone Companion
        const droneFrame = Math.floor(time * 0.006) % 4;
        const droneX = player.x - 26;
        const droneY = player.y - 32 + Math.sin(time * 0.005) * 6;
        ctx.drawImage(charImg, 40 + droneFrame * 170, 870, 140, 140, droneX - 16, droneY - 16, 32, 32);
      }

      // 7. Render Player Character
      if (charImg.complete && charImg.naturalWidth > 0) {
        // Player Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(player.x, player.y + 18, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        let rowY = 0; // DOWN
        let colX = player.frame;

        if (player.dir === 'LEFT' || player.dir === 'RIGHT') {
          rowY = 170; // Side
        } else if (player.dir === 'UP') {
          rowY = 340; // Back
        }

        const srcX = 40 + (colX % 4) * 165;
        const srcY = 20 + rowY;

        ctx.save();
        ctx.translate(player.x, player.y);

        if (player.dir === 'LEFT') {
          ctx.scale(-1, 1);
        }

        ctx.drawImage(charImg, srcX, srcY, 140, 160, -24, -36, 48, 56);
        ctx.restore();

        // Player Name & Level
        ctx.font = 'bold 11px "Orbitron", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(profileRef.current.username, player.x, player.y - 44);

        ctx.font = 'bold 9px "Orbitron", sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Lv.${profileRef.current.level}`, player.x, player.y - 56);
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
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#050a17]">
      
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
          <span>TỌA ĐỘ: [{hudCoord.x}, {hudCoord.y}]</span>
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
          {/* Player Blip on MiniMap */}
          <div
            className="absolute w-3 h-3 rounded-full bg-white border border-cyan-400 animate-ping transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(hudCoord.x / 1600) * 100}%`,
              top: `${(hudCoord.y / 1200) * 100}%`,
            }}
          />
          <div
            className="absolute w-2 h-2 rounded-full bg-cyan-400 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(hudCoord.x / 1600) * 100}%`,
              top: `${(hudCoord.y / 1200) * 100}%`,
            }}
          />
        </div>
      </div>

    </div>
  );
};
