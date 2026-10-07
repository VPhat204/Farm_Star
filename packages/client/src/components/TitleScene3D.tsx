import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const TitleScene3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.4);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x223355, 2.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ea, 4.5);
    sunLight.position.set(7, 5, 6);
    scene.add(sunLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00f2fe, 3.2);
    cyanRimLight.position.set(-7, -3, -4);
    scene.add(cyanRimLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3.0, 30);
    purpleLight.position.set(0, 4, 3);
    scene.add(purpleLight);

    // 4. Background Starfield (2,500+ Stars)
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const colorChoices = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x00f2fe),
      new THREE.Color(0xa855f7),
      new THREE.Color(0xfde047),
      new THREE.Color(0x93c5fd),
      new THREE.Color(0x34d399),
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 25 + Math.random() * 55;
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
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5. Planet Gaia Prime (Centered behind Hero text)
    const planetGroup = new THREE.Group();
    planetGroup.position.set(0, -0.15, 0);
    scene.add(planetGroup);

    const planetRadius = 1.6;

    // Procedural Planet Texture
    const createPlanetTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Deep Ocean Gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#041630');
      oceanGrad.addColorStop(0.5, '#083363');
      oceanGrad.addColorStop(1, '#031024');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Bioluminescent Emerald & Jade Continents
      const drawContinent = (cx: number, cy: number, r: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.16) {
          const dist = r * (0.7 + Math.sin(a * 4) * 0.28 + Math.cos(a * 3) * 0.18);
          const x = cx + Math.cos(a) * dist;
          const y = cy + Math.sin(a) * dist;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      };

      drawContinent(280, 190, 135, '#0d6b53');
      drawContinent(310, 210, 100, '#10b981');
      drawContinent(760, 270, 155, '#0a5244');
      drawContinent(790, 290, 115, '#059669');
      drawContinent(520, 370, 125, '#0e7c7c');
      drawContinent(140, 340, 90, '#047857');
      drawContinent(910, 160, 100, '#065f46');

      // Glowing Cyber City Lights
      ctx.fillStyle = '#00f2fe';
      for (let i = 0; i < 350; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.8 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fde047';
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.5 + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createPlanetTexture();
    planetTexture.wrapS = THREE.RepeatWrapping;
    planetTexture.wrapT = THREE.ClampToEdgeWrapping;

    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
      roughness: 0.5,
      metalness: 0.35,
      bumpScale: 0.08,
    });

    const planetGeometry = new THREE.SphereGeometry(planetRadius, 64, 64);
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetGroup.add(planetMesh);

    // 6. Dynamic Atmosphere Clouds Layer
    const createCloudTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, 1024, 512);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
      for (let i = 0; i < 90; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const rx = 50 + Math.random() * 90;
        const ry = 18 + Math.random() * 35;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: createCloudTexture(),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(planetRadius + 0.035, 48, 48),
      cloudsMaterial
    );
    planetGroup.add(cloudsMesh);

    // 7. Atmosphere Fresnel Shader
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
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.0, 0.95, 1.0, 1.0) * intensity * 2.0;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    const atmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(planetRadius + 0.32, 48, 48),
      atmosphereMaterial
    );
    planetGroup.add(atmosphereMesh);

    // 8. Dual Planetary Rings
    const ringGeo = new THREE.RingGeometry(planetRadius + 0.5, planetRadius + 1.25, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.25;
    ringMesh.rotation.y = Math.PI / 12;
    planetGroup.add(ringMesh);

    const ring2Geo = new THREE.RingGeometry(planetRadius + 1.3, planetRadius + 1.55, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = Math.PI / 2.25;
    ring2Mesh.rotation.y = Math.PI / 12;
    planetGroup.add(ring2Mesh);

    // 9. Orbiting Starships
    const orbitShips: { group: THREE.Group; angle: number; speed: number; radius: number; tilt: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const shipGroup = new THREE.Group();
      const shipGeo = new THREE.ConeGeometry(0.05, 0.18, 4);
      const shipMat = new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.9,
        metalness: 0.9,
      });
      const shipCone = new THREE.Mesh(shipGeo, shipMat);
      shipCone.rotation.x = Math.PI / 2;
      shipGroup.add(shipCone);

      const thrusterGeo = new THREE.SphereGeometry(0.025, 8, 8);
      const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
      thruster.position.z = -0.09;
      shipGroup.add(thruster);

      scene.add(shipGroup);
      orbitShips.push({
        group: shipGroup,
        angle: (i * Math.PI * 2) / 4,
        speed: 0.008 + i * 0.0025,
        radius: planetRadius + 0.68 + i * 0.22,
        tilt: 0.35 + i * 0.25,
      });
    }

    // 10. Mouse Parallax Motion
    let targetCameraX = 0;
    let targetCameraY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetCameraX = mouseX * 0.5;
      targetCameraY = mouseY * 0.35;
    };
    window.addEventListener('mousemove', onMouseMove);

    // 11. Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 12. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Planet rotation
      planetGroup.rotation.y += 0.0025;
      cloudsMesh.rotation.y += 0.0009;

      // Parallax camera damping
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, -0.15, 0);

      // Starfield subtle drift
      starField.rotation.y -= 0.00015;

      // Orbit Ships
      orbitShips.forEach((s) => {
        s.angle += s.speed;
        const sx = Math.cos(s.angle) * s.radius;
        const sz = Math.sin(s.angle) * s.radius;
        const sy = -0.15 + Math.sin(s.angle * 2) * s.tilt;

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

    // 13. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
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
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#030714]"
    />
  );
};
