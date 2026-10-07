import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const TitleScene3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030714, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.6, 4.8);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x1a264a, 2.0);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3db, 3.8);
    sunLight.position.set(6, 5, 5);
    scene.add(sunLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00f2fe, 2.5);
    cyanRimLight.position.set(-6, -3, -4);
    scene.add(cyanRimLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2.2, 25);
    purpleLight.position.set(2, 3, 2);
    scene.add(purpleLight);

    // 4. Background Starfield (2500+ stars)
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
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 30 + Math.random() * 60;
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
      opacity: 0.9,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5. Planet Gaia Prime (Centered slightly below hero text)
    const planetGroup = new THREE.Group();
    planetGroup.position.set(0, -0.4, 0);
    scene.add(planetGroup);

    const planetRadius = 1.75;

    // Procedural Texture on Canvas
    const createPlanetTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Deep Space Ocean Gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#020b1a');
      oceanGrad.addColorStop(0.5, '#041e3d');
      oceanGrad.addColorStop(1, '#010814');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Sci-Fi Continents with Bioluminescent Emerald & Jade
      const drawContinent = (cx: number, cy: number, r: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.18) {
          const dist = r * (0.7 + Math.sin(a * 4) * 0.28 + Math.cos(a * 3) * 0.18);
          const x = cx + Math.cos(a) * dist;
          const y = cy + Math.sin(a) * dist;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      };

      drawContinent(280, 190, 130, '#0d5c48');
      drawContinent(310, 210, 95, '#10b981');
      drawContinent(760, 270, 150, '#0a473b');
      drawContinent(790, 290, 110, '#059669');
      drawContinent(520, 370, 120, '#0d6e6e');
      drawContinent(140, 340, 85, '#047857');
      drawContinent(910, 160, 95, '#065f46');

      // Glowing Cyber Cities
      ctx.fillStyle = '#00f2fe';
      for (let i = 0; i < 280; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.6 + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fde047';
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.4 + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(canvas);
    };

    const planetTexture = createPlanetTexture();
    planetTexture.wrapS = THREE.RepeatWrapping;
    planetTexture.wrapT = THREE.ClampToEdgeWrapping;

    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
      roughness: 0.55,
      metalness: 0.4,
      bumpScale: 0.06,
    });

    const planetGeometry = new THREE.SphereGeometry(planetRadius, 64, 64);
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetGroup.add(planetMesh);

    // 6. Dynamic Clouds Layer
    const createCloudTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, 1024, 512);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const rx = 45 + Math.random() * 85;
        const ry = 15 + Math.random() * 32;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: createCloudTexture(),
      transparent: true,
      opacity: 0.45,
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
          float intensity = pow(0.62 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.0, 0.95, 1.0, 1.0) * intensity * 1.8;
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
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.25;
    ringMesh.rotation.y = Math.PI / 12;
    planetGroup.add(ringMesh);

    const ring2Geo = new THREE.RingGeometry(planetRadius + 1.3, planetRadius + 1.52, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.28,
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
      const shipGeo = new THREE.ConeGeometry(0.045, 0.16, 4);
      const shipMat = new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.9,
        metalness: 0.9,
      });
      const shipCone = new THREE.Mesh(shipGeo, shipMat);
      shipCone.rotation.x = Math.PI / 2;
      shipGroup.add(shipCone);

      const thrusterGeo = new THREE.SphereGeometry(0.022, 8, 8);
      const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
      thruster.position.z = -0.08;
      shipGroup.add(thruster);

      scene.add(shipGroup);
      orbitShips.push({
        group: shipGroup,
        angle: (i * Math.PI * 2) / 4,
        speed: 0.007 + i * 0.0025,
        radius: planetRadius + 0.65 + i * 0.22,
        tilt: 0.35 + i * 0.25,
      });
    }

    // 10. Mouse Parallax Motion
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0.6;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / width) * 2 - 1;
      mouseY = -(e.clientY / height) * 2 + 1;
      targetCameraX = mouseX * 0.6;
      targetCameraY = 0.6 + mouseY * 0.4;
    };
    window.addEventListener('mousemove', onMouseMove);

    // 11. Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
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
      planetGroup.rotation.y += 0.0022;
      cloudsMesh.rotation.y += 0.0008;

      // Parallax camera damping
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, -0.2, 0);

      // Starfield subtle drift
      starField.rotation.y -= 0.00015;

      // Orbit Ships
      orbitShips.forEach((s) => {
        s.angle += s.speed;
        const sx = Math.cos(s.angle) * s.radius;
        const sz = Math.sin(s.angle) * s.radius;
        const sy = -0.4 + Math.sin(s.angle * 2) * s.tilt;

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
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden bg-[#030714]"
    />
  );
};
