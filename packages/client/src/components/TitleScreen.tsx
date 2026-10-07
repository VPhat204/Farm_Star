import React, { useEffect, useRef } from 'react';
import { PlayerProfile } from '@starfarm/shared';
import { Play, Volume2, Radio, Sparkles, Orbit, Rocket, Shield, Globe } from 'lucide-react';

interface TitleScreenProps {
  profile: PlayerProfile;
  onStartGame: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ profile, onStartGame, onOpenSettings }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic Animated Starfield & Nebula Particles
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

    // Generate Stars
    const stars: { x: number; y: number; size: number; alpha: number; speed: number; color: string }[] = [];
    const colors = ['#ffffff', '#00f2fe', '#9d4edd', '#ffd166', '#a0c4ff'];

    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.3 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Shooting Stars
    const shootingStars: { x: number; y: number; length: number; speed: number; alpha: number; active: boolean }[] = [
      { x: 0, y: 0, length: 120, speed: 12, alpha: 0, active: false },
      { x: 0, y: 0, length: 100, speed: 15, alpha: 0, active: false },
    ];

    let lastShootTime = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Twinkling Stars
      stars.forEach((star) => {
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        const pulse = Math.sin(time * 0.002 + star.x) * 0.3 + 0.7;
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha * pulse;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Trigger Shooting Star periodically
      if (time - lastShootTime > 3500) {
        lastShootTime = time;
        const s = shootingStars.find((st) => !st.active);
        if (s) {
          s.active = true;
          s.x = Math.random() * (width * 0.7);
          s.y = Math.random() * (height * 0.4);
          s.alpha = 1;
        }
      }

      // Draw Shooting Stars
      shootingStars.forEach((s) => {
        if (s.active) {
          ctx.strokeStyle = `rgba(0, 242, 254, ${s.alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + s.length, s.y + s.length * 0.6);
          ctx.stroke();

          s.x += s.speed;
          s.y += s.speed * 0.6;
          s.alpha -= 0.02;

          if (s.alpha <= 0) {
            s.active = false;
          }
        }
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none text-white flex flex-col justify-between p-6 sm:p-10 bg-[#040816]">
      
      {/* 1. Dynamic Canvas Starfield Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none -z-10" />

      {/* 2. Deep Cosmic Atmosphere Gradients */}
      <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden">
        {/* Core Galaxy Nebula Glows */}
        <div className="absolute -top-40 left-1/4 w-[750px] h-[750px] bg-gradient-to-br from-cyan-600/20 via-indigo-700/20 to-transparent rounded-full blur-[140px] animate-pulse-slow" />
        <div className="absolute top-1/3 -right-32 w-[650px] h-[650px] bg-gradient-to-bl from-purple-600/20 via-fuchsia-800/15 to-transparent rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 left-10 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-800/15 via-blue-900/20 to-transparent rounded-full blur-[140px]" />

        {/* Massive 3D Gaia Planet Horizon at Bottom-Right */}
        <div className="absolute -bottom-[420px] -right-[220px] sm:-right-[100px] w-[950px] h-[950px] rounded-full bg-gradient-to-tl from-[#031326] via-[#09354d] to-[#0d6e6e] border-t-4 border-cyan-400/50 shadow-[0_0_120px_rgba(0,242,254,0.35)] flex items-center justify-center">
          {/* Planet Atmosphere Glow & Ring */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-transparent via-cyan-500/15 to-emerald-400/20" />
          <div className="absolute w-[1200px] h-[180px] -rotate-12 rounded-full border-t-2 border-b border-amber-300/40 shadow-[0_0_50px_rgba(255,215,0,0.3)] pointer-events-none" />
        </div>

        {/* Sci-Fi Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f2fe08_1px,transparent_1px),linear-gradient(to_bottom,#00f2fe08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />
      </div>

      {/* 3. Top Header Bar (No Footer, Clean & Modern) */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-[#081026]/85 backdrop-blur-xl px-4 py-2 rounded-2xl border border-cyan-400/40 shadow-2xl glow-cyan-sm">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-['Orbitron'] font-bold text-xs tracking-wider text-cyan-200">
              TRẠM GAIA PRIME: <strong className="text-emerald-400">ONLINE 🟢</strong>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#081026]/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-500/20 text-[11px] text-cyan-300 font-mono">
            <Orbit className="w-3.5 h-3.5 text-cyan-400" />
            <span>TỌA ĐỘ VŨ TRỤ: SECTOR-07</span>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-3 rounded-2xl bg-[#081026]/85 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white transition backdrop-blur-xl shadow-2xl glow-cyan-sm hover:scale-105 active:scale-95 cursor-pointer"
          title="Cài đặt hệ thống"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Center Main Hero Title & Start Action */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col justify-center items-center text-center z-20 my-auto py-6">
        
        {/* Emblem & Logo Icon */}
        <div className="relative mb-3 flex items-center justify-center animate-float">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-indigo-600 p-1 shadow-[0_0_50px_rgba(0,242,254,0.5)] glow-cyan flex items-center justify-center relative">
            <div className="w-full h-full rounded-[22px] bg-[#070e24] flex items-center justify-center text-4xl sm:text-5xl relative overflow-hidden border border-cyan-400/40">
              <span className="filter drop-shadow">🌱</span>
              <span className="absolute -top-1 -right-1 text-sm sm:text-base animate-bounce">🚀</span>
            </div>
          </div>
        </div>

        {/* Pure 3D Sci-Fi Typography Title */}
        <div className="cursor-pointer group mb-2" onClick={onStartGame}>
          <h1 className="font-['Orbitron'] font-black text-5xl sm:text-7xl md:text-8xl tracking-wider uppercase bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_12px_30px_rgba(0,0,0,0.95)] filter transition-transform duration-300 group-hover:scale-105">
            STARFARM
          </h1>
          <div className="mt-2 flex items-center justify-center">
            <span className="px-6 py-1.5 rounded-xl bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 border-2 border-cyan-400 text-xs sm:text-sm font-['Orbitron'] font-black tracking-[0.25em] text-cyan-200 uppercase shadow-2xl glow-cyan-sm">
              HÀNH TRÌNH NGÂN HÀ
            </span>
          </div>
        </div>

        {/* Sci-Fi Slogan */}
        <p className="text-xs sm:text-sm font-bold tracking-widest text-cyan-100 uppercase bg-[#081026]/75 backdrop-blur-md px-5 py-1.5 rounded-full border border-cyan-500/30 my-5 shadow-lg">
          Nông Trại Sinh Học Không Gian • Hạm Đội Chiến Cơ Ngân Hà
        </p>

        {/* Commander Status Card */}
        <div className="mb-7 px-7 py-3 rounded-2xl bg-[#081026]/90 border border-cyan-400/50 backdrop-blur-2xl shadow-2xl flex items-center gap-5 sm:gap-7 glow-cyan-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center text-xl shadow">
              🧑‍🚀
            </div>
            <div className="text-left">
              <div className="text-[10px] text-cyan-300/80 font-mono uppercase font-bold">Chỉ Huy</div>
              <div className="font-['Orbitron'] font-bold text-sm text-white tracking-wide">
                {profile.username}
              </div>
            </div>
          </div>

          <div className="h-7 w-px bg-cyan-400/40" />

          <div className="flex items-center gap-3 text-xs sm:text-sm font-['Orbitron'] font-bold">
            <span className="text-amber-400">Lv.{profile.level}</span>
            <span className="text-gray-500">•</span>
            <span className="text-yellow-300 flex items-center gap-1">
              🪙 {profile.credits.toLocaleString()}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-purple-300 flex items-center gap-1">
              💎 {profile.stellarGems}
            </span>
          </div>
        </div>

        {/* Big Start Button */}
        <button
          onClick={onStartGame}
          className="group relative px-14 sm:px-20 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-['Orbitron'] font-black text-lg sm:text-2xl tracking-wider hover:opacity-95 transition-all duration-300 shadow-[0_0_55px_rgba(239,68,68,0.85)] hover:scale-105 active:scale-95 flex items-center justify-center gap-4 cursor-pointer glow-red"
        >
          <div className="absolute inset-0 rounded-2xl bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Play className="w-7 h-7 fill-white animate-pulse" />
          <span>VÀO CĂN CỨ VŨ TRỤ</span>
        </button>

        <p className="text-[11px] text-cyan-200/80 mt-3 font-mono">
          Nhấn để tải dữ liệu hành tinh & phi đội tàu chiến
        </p>

      </div>

      {/* Bottom Spacer (No Footer, completely clean) */}
      <div className="h-2" />

    </div>
  );
};
