import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerProfile } from '@starfarm/shared';
import {
  Sprout,
  Rocket,
  Store,
  Sparkles,
  Swords,
  Factory,
  RotateCcw,
  Compass,
  Maximize2,
  Info
} from 'lucide-react';

export interface FacilityNode {
  id: 'FARM' | 'HANGAR' | 'MARKET' | 'GACHA' | 'BATTLE' | 'FACTORY';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: string;
  lat: number; // Latitude in degrees
  lon: number; // Longitude in degrees
  altitude: number; // Height above planet surface
  color: number; // Hex color
  glowColor: string;
}

interface PlanetScene3DProps {
  profile: PlayerProfile;
  onOpenFarm: () => void;
  onOpenHangar: () => void;
  onOpenMarket: () => void;
  onOpenGacha: () => void;
  onOpenInventory: () => void;
  onStartBattle: () => void;
}

export const PlanetScene3D: React.FC<PlanetScene3DProps> = ({
  profile,
  onOpenFarm,
  onOpenHangar,
  onOpenMarket,
  onOpenGacha,
  onOpenInventory,
  onStartBattle,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredFacility, setHoveredFacility] = useState<FacilityNode | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [screenCoords, setScreenCoords] = useState<{ x: number; y: number } | null>(null);

  const readyCropsCount = profile.farmPlots.filter((p) => p.status === 'READY').length;
  const growingCropsCount = profile.farmPlots.filter((p) => p.status === 'GROWING').length;
  const equippedShip = profile.ships.find((s) => s.isEquipped) || profile.ships[0];

  const facilities: FacilityNode[] = [
    {
      id: 'FARM',
      title: 'VƯỜN SINH HỌC BIO-DOME',
      subtitle: readyCropsCount > 0 ? `${readyCropsCount} ô đất đã chín!` : `${growingCropsCount} ô đất đang lớn`,
      badge: readyCropsCount > 0 ? 'Thu Hoạch' : 'Sẵn Sàng',
      badgeColor: 'bg-emerald-500 text-black',
      icon: '🌱',
      lat: 18,
      lon: 45,
      altitude: 0.15,
      color: 0x10b981,
      glowColor: '#10b981',
    },
    {
      id: 'HANGAR',
      title: 'NHÀ CHỨA CHIẾN CƠ HANGAR',
      subtitle: `${profile.ships.length} phi thuyền • Cấp ${equippedShip?.level || 1}`,
      badge: 'Xuất Kích',
      badgeColor: 'bg-cyan-500 text-black',
      icon: '🛸',
      lat: -22,
      lon: 110,
      altitude: 0.22,
      color: 0x00f2fe,
      glowColor: '#00f2fe',
    },
    {
      id: 'MARKET',
      title: 'CHỢ LIÊN HÀNH TINH',
      subtitle: 'Giao thương nông sản & khoáng sản',
      badge: 'Thị Trường',
      badgeColor: 'bg-amber-400 text-black',
      icon: '🏪',
      lat: 35,
      lon: 190,
      altitude: 0.18,
      color: 0xf59e0b,
      glowColor: '#f59e0b',
    },
    {
      id: 'GACHA',
      title: 'CỔNG WARP TRIỆU HỒI',
      subtitle: `Bảo hiểm SSR: ${profile.pityCount}/10`,
      badge: 'Gacha SSR',
      badgeColor: 'bg-purple-500 text-white animate-pulse',
      icon: '🌌',
      lat: -15,
      lon: -60,
      altitude: 0.28,
      color: 0xa855f7,
      glowColor: '#a855f7',
    },
    {
      id: 'BATTLE',
      title: 'TRẠM RADAR CHIẾN DỊCH',
      subtitle: 'Quét quái ngoại vi & Boss chiến hạm',
      badge: 'Tác Chiến',
      badgeColor: 'bg-red-500 text-white animate-pulse',
      icon: '⚔️',
      lat: 52,
      lon: -140,
      altitude: 0.25,
      color: 0xef4444,
      glowColor: '#ef4444',
    },
    {
      id: 'FACTORY',
      title: 'NHÀ MÁY NĂNG LƯỢNG QUANTUM',
      subtitle: 'Chế tạo linh kiện & nạp pin',
      badge: 'Chế Tạo',
      badgeColor: 'bg-indigo-400 text-black',
      icon: '🏭',
      lat: -40,
      lon: -175,
      altitude: 0.16,
      color: 0x6366f1,
      glowColor: '#6366f1',
    },
  ];

  // Map lat/lon to 3D Cartesian coordinates on sphere
  const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040816, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x182442, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 3.2);
    sunLight.position.set(8, 6, 6);
    scene.add(sunLight);

    const blueRimLight = new THREE.DirectionalLight(0x00f2fe, 2.0);
    blueRimLight.position.set(-8, -4, -5);
    scene.add(blueRimLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 20);
    purpleLight.position.set(0, 4, 3);
    scene.add(purpleLight);

    // 4. Background Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const colorChoices = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x00f2fe),
      new THREE.Color(0xa855f7),
      new THREE.Color(0xfde047),
      new THREE.Color(0x60a5fa),
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 35 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const col = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5. Planet Gaia Prime
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const planetRadius = 1.6;

    // Procedural Procedural Texture Generation on Canvas
    const createPlanetTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Deep Ocean Base
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#031024');
      oceanGrad.addColorStop(0.5, '#06264d');
      oceanGrad.addColorStop(1, '#020b18');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Sci-Fi Continents with Bioluminescent Green & Cyan
      const drawContinent = (cx: number, cy: number, r: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.2) {
          const dist = r * (0.7 + Math.sin(a * 5) * 0.25 + Math.cos(a * 3) * 0.15);
          const x = cx + Math.cos(a) * dist;
          const y = cy + Math.sin(a) * dist;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      };

      // Draw Continents
      drawContinent(300, 200, 120, '#0d5c48');
      drawContinent(320, 220, 90, '#10b981');
      drawContinent(750, 280, 140, '#0a473b');
      drawContinent(780, 290, 100, '#059669');
      drawContinent(500, 380, 110, '#0d6e6e');
      drawContinent(150, 360, 80, '#047857');
      drawContinent(900, 150, 90, '#065f46');

      // Glowing City Lights & Sci-Fi Grids
      ctx.fillStyle = '#00f2fe';
      for (let i = 0; i < 240; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fde047';
      for (let i = 0; i < 120; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.2 + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createPlanetTexture();
    planetTexture.wrapS = THREE.RepeatWrapping;
    planetTexture.wrapT = THREE.ClampToEdgeWrapping;

    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
      roughness: 0.65,
      metalness: 0.35,
      bumpScale: 0.05,
    });

    const planetGeometry = new THREE.SphereGeometry(planetRadius, 64, 64);
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetGroup.add(planetMesh);

    // 6. Clouds Layer
    const createCloudTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, 1024, 512);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 70; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const rx = 40 + Math.random() * 80;
        const ry = 15 + Math.random() * 30;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: createCloudTexture(),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(planetRadius + 0.03, 48, 48), cloudsMaterial);
    planetGroup.add(cloudsMesh);

    // 7. Atmosphere Glow Shell
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.0, 0.95, 1.0, 1.0) * intensity * 1.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    const atmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(planetRadius + 0.28, 48, 48),
      atmosphereMaterial
    );
    planetGroup.add(atmosphereMesh);

    // 8. Planetary Rings System
    const ringGeo = new THREE.RingGeometry(planetRadius + 0.45, planetRadius + 1.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    ringMesh.rotation.y = Math.PI / 10;
    planetGroup.add(ringMesh);

    // Secondary Gold Ring
    const ring2Geo = new THREE.RingGeometry(planetRadius + 1.25, planetRadius + 1.45, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = Math.PI / 2.3;
    ring2Mesh.rotation.y = Math.PI / 10;
    planetGroup.add(ring2Mesh);

    // 9. Interactive 3D Facility Nodes
    const facilityObjects: {
      mesh: THREE.Object3D;
      beaconRing: THREE.Mesh;
      facility: FacilityNode;
    }[] = [];

    facilities.forEach((fac) => {
      const pos = latLonToVector3(fac.lat, fac.lon, planetRadius + fac.altitude);

      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(pos);
      nodeGroup.lookAt(new THREE.Vector3(0, 0, 0));
      nodeGroup.rotateX(Math.PI); // Point outward

      // Central Holographic Orb / Building Base
      const coreGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const coreMat = new THREE.MeshStandardMaterial({
        color: fac.color,
        emissive: fac.color,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.8,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      nodeGroup.add(coreMesh);

      // Pulsing Hologram Beacon Ring
      const ringGeom = new THREE.RingGeometry(0.12, 0.16, 24);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: fac.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const beaconRing = new THREE.Mesh(ringGeom, ringMaterial);
      beaconRing.position.z = 0.02;
      nodeGroup.add(beaconRing);

      // Vertical Sci-Fi Light Beam
      const beamGeo = new THREE.CylinderGeometry(0.015, 0.04, 0.4, 12);
      const beamMat = new THREE.MeshBasicMaterial({
        color: fac.color,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.z = 0.2;
      beamMesh.rotation.x = Math.PI / 2;
      nodeGroup.add(beamMesh);

      // Attach facility data to mesh for raycasting
      coreMesh.userData = { facility: fac };
      planetGroup.add(nodeGroup);

      facilityObjects.push({
        mesh: coreMesh,
        beaconRing,
        facility: fac,
      });
    });

    // 10. Orbiting Starships
    const orbitShips: { group: THREE.Group; angle: number; speed: number; radius: number; tilt: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const shipGroup = new THREE.Group();
      const shipGeo = new THREE.ConeGeometry(0.04, 0.14, 4);
      const shipMat = new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.8,
        metalness: 0.9,
      });
      const shipCone = new THREE.Mesh(shipGeo, shipMat);
      shipCone.rotation.x = Math.PI / 2;
      shipGroup.add(shipCone);

      // Engine Thruster Flame
      const thrusterGeo = new THREE.SphereGeometry(0.02, 8, 8);
      const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
      thruster.position.z = -0.07;
      shipGroup.add(thruster);

      scene.add(shipGroup);
      orbitShips.push({
        group: shipGroup,
        angle: (i * Math.PI * 2) / 3,
        speed: 0.008 + i * 0.003,
        radius: planetRadius + 0.6 + i * 0.25,
        tilt: 0.4 + i * 0.3,
      });
    }

    // 11. Interactive Drag / Rotation Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationX = 0.2;
    let targetRotationY = 0;
    let autoRotateSpeed = 0.002;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.006;
        targetRotationX += deltaY * 0.006;
        targetRotationX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, targetRotationX));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      // Raycasting for Hover Detection
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const interactiveMeshes = facilityObjects.map((f) => f.mesh);
      const intersects = raycaster.intersectObjects(interactiveMeshes, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const facility = hit.userData.facility as FacilityNode;
        if (facility) {
          setHoveredFacility(facility);
          setScreenCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredFacility(null);
        setScreenCoords(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Click to Open Facility Modal
    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const interactiveMeshes = facilityObjects.map((f) => f.mesh);
      const intersects = raycaster.intersectObjects(interactiveMeshes, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const fac = hit.userData.facility as FacilityNode;
        if (fac) {
          handleFacilityClick(fac.id);
        }
      }
    };

    // Touch Support for Mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.007;
        targetRotationX += deltaY * 0.007;
        targetRotationX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, targetRotationX));

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 12. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 13. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Auto Planet Rotation
      if (isAutoRotating && !isDragging) {
        targetRotationY += autoRotateSpeed;
      }

      // Smooth Inertia Damping
      planetGroup.rotation.y += (targetRotationY - planetGroup.rotation.y) * 0.08;
      planetGroup.rotation.x += (targetRotationX - planetGroup.rotation.x) * 0.08;

      // Clouds independent slight drift
      cloudsMesh.rotation.y += 0.0006;

      // Starfield subtle rotation
      starField.rotation.y -= 0.0002;

      // Facility Beacon Pulsing
      facilityObjects.forEach((obj, idx) => {
        const pulse = Math.sin(time * 3 + idx) * 0.25 + 1.0;
        obj.beaconRing.scale.set(pulse, pulse, pulse);
        (obj.beaconRing.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(time * 4) * 0.3;
      });

      // Orbit Ships movement
      orbitShips.forEach((s) => {
        s.angle += s.speed;
        const sx = Math.cos(s.angle) * s.radius;
        const sz = Math.sin(s.angle) * s.radius;
        const sy = Math.sin(s.angle * 2) * s.tilt;

        s.group.position.set(sx, sy, sz);
        const forward = new THREE.Vector3(
          -Math.sin(s.angle) * s.radius,
          Math.cos(s.angle * 2) * 2 * s.tilt,
          Math.cos(s.angle) * s.radius
        ).normalize();
        s.group.lookAt(s.group.position.clone().add(forward));
      });

      renderer.render(scene, camera);
    };

    animate();

    // 14. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      scene.clear();
      renderer.dispose();
      planetGeometry.dispose();
      planetMaterial.dispose();
      planetTexture.dispose();
      cloudsMaterial.dispose();
      atmosphereMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [isAutoRotating]);

  const handleFacilityClick = (id: FacilityNode['id']) => {
    switch (id) {
      case 'FARM':
        onOpenFarm();
        break;
      case 'HANGAR':
        onOpenHangar();
        break;
      case 'MARKET':
        onOpenMarket();
        break;
      case 'GACHA':
        onOpenGacha();
        break;
      case 'BATTLE':
        onStartBattle();
        break;
      case 'FACTORY':
        onOpenMarket();
        break;
    }
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[620px] md:h-[680px] rounded-3xl overflow-hidden border border-cyan-500/30 bg-[#040816] shadow-[0_0_50px_rgba(0,242,254,0.15)] group select-none">
      
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Holographic Base Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2.5 bg-[#081026]/85 backdrop-blur-xl px-4 py-2 rounded-2xl border border-cyan-400/40 shadow-xl pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-['Orbitron'] font-bold text-xs tracking-wider text-cyan-200">
            HÀNH TINH 3D: <strong className="text-emerald-400">GAIA PRIME</strong>
          </span>
          <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
            [TỌA ĐỘ: SECTOR-07]
          </span>
        </div>

        {/* 3D View Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-2.5 rounded-xl border transition backdrop-blur-xl shadow-lg cursor-pointer ${
              isAutoRotating
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 glow-cyan-sm'
                : 'bg-[#081026]/80 border-gray-700 text-gray-400 hover:text-white'
            }`}
            title={isAutoRotating ? 'Tắt tự động xoay' : 'Bật tự động xoay'}
          >
            <RotateCcw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dynamic Hover Tooltip HUD */}
      {hoveredFacility && screenCoords && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-4 animate-fade-in"
          style={{
            left: `${screenCoords.x}px`,
            top: `${screenCoords.y - 12}px`,
          }}
        >
          <div className="p-3.5 rounded-2xl bg-[#080f24]/95 border-2 border-cyan-400 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,242,254,0.5)] min-w-[220px]">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{hoveredFacility.icon}</span>
                <span className="font-['Orbitron'] font-bold text-xs text-white">
                  {hoveredFacility.title}
                </span>
              </div>
              {hoveredFacility.badge && (
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-['Orbitron'] ${hoveredFacility.badgeColor}`}
                >
                  {hoveredFacility.badge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-cyan-200/90">{hoveredFacility.subtitle}</p>
            <div className="mt-2 pt-1.5 border-t border-cyan-500/30 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>CHẠM ĐỂ TRUY CẬP</span>
              <span className="text-cyan-400">➔</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Quick Facility Bar (Touch & Click Accessible) */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-center pointer-events-none">
        <div className="flex flex-wrap items-center justify-center gap-2 bg-[#081026]/90 backdrop-blur-2xl p-2 rounded-2xl border border-cyan-500/30 shadow-2xl pointer-events-auto max-w-2xl">
          {facilities.map((fac) => (
            <button
              key={fac.id}
              onClick={() => handleFacilityClick(fac.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-950/80 border border-gray-800 hover:border-cyan-400 transition-all hover:scale-105 active:scale-95 text-xs text-white group cursor-pointer"
            >
              <span className="text-base group-hover:animate-bounce">{fac.icon}</span>
              <span className="font-['Orbitron'] font-bold text-[11px] text-gray-200 group-hover:text-cyan-300">
                {fac.title.split(' ')[0]}
              </span>
              {fac.id === 'FARM' && readyCropsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Helper Interaction Guide Overlay */}
      <div className="absolute bottom-4 left-4 hidden lg:flex items-center gap-2 text-[10px] text-cyan-300/70 font-mono pointer-events-none bg-[#081026]/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/20">
        <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
        <span>Kéo chuột để xoay hành tinh 360° • Click công trình để vào</span>
      </div>

    </div>
  );
};
