import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';

// Hero3D: lightweight Three.js scene that renders floating translucent glass shapes
// Usage: <Hero3D fullScreen={true} /> or place inside a section for hero area
export default function Hero3D({ fullScreen = false, className = '' }) {
  const mountRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const dpr = (typeof globalThis !== 'undefined' && globalThis.devicePixelRatio) ? globalThis.devicePixelRatio : 1;
    renderer.setPixelRatio(Math.min(dpr, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0xffffff, 0); // transparent to let page bg show
    mount.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();

    // Camera: isometric-like using an OrthographicCamera tilted for depth
    const aspect = (typeof globalThis !== 'undefined' && globalThis.innerWidth && globalThis.innerHeight) ? (globalThis.innerWidth / globalThis.innerHeight) : (mount.clientWidth / mount.clientHeight || 1);
    const frustum = 600;
    const camera = new THREE.OrthographicCamera(
      ( -frustum * aspect ) / 2,
      ( frustum * aspect ) / 2,
      frustum / 2,
      -frustum / 2,
      0.1,
      2000
    );
    camera.position.set(500, 400, 500);
    camera.lookAt(0, 0, 0);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x202040, 0.6);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(200, 400, 300);
    key.castShadow = false;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.35);
    rim.position.set(-300, 200, -200);
    scene.add(rim);

    // Group to hold objects
    const group = new THREE.Group();
    scene.add(group);

    // Shared materials
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.06,
      transmission: 0.95,
      transparent: true,
      opacity: 1,
      ior: 1.45,
      thickness: 0.6,
      clearcoat: 1.0,
      envMapIntensity: 1.0
    });

    const iridescentMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.18,
      clearcoat: 1.0,
      reflectivity: 0.8,
      envMapIntensity: 1.2,
      transparent: true,
      opacity: 0.98
    });

    // Create floating shapes (spheres + polyhedra + torus)
    const geomSphere = new THREE.SphereGeometry(60, 48, 48);
    const geomIco = new THREE.IcosahedronGeometry(90, 1);
    const geomTorus = new THREE.TorusKnotGeometry(40, 10, 120, 16);

    const sphere = new THREE.Mesh(geomSphere, iridescentMaterial);
    sphere.position.set(-140, 20, -40);
    group.add(sphere);

    const glass1 = new THREE.Mesh(geomIco, glassMaterial);
    glass1.scale.set(0.9, 0.9, 0.9);
    glass1.position.set(120, -20, 40);
    group.add(glass1);

    const knot = new THREE.Mesh(geomTorus, iridescentMaterial);
    knot.position.set(40, 80, -120);
    knot.scale.set(1.05, 1.05, 1.05);
    group.add(knot);

    // Add a few smaller floating spheres
    const smallSpheres = [];
    const smallGeo = new THREE.SphereGeometry(18, 32, 32);
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(smallGeo, glassMaterial.clone());
      m.material.color.setHSL(0.55 + Math.random() * 0.3, 0.6, 0.6);
      m.position.set((Math.random() - 0.5) * 360, (Math.random() - 0.5) * 220, (Math.random() - 0.5) * 360);
      group.add(m);
      smallSpheres.push(m);
    }

    // Subtle ambient fog for depth
    scene.fog = new THREE.FogExp2(0xffffff, 0.0006);

    // Composer for bloom + optional bokeh/DOF
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth || 800, mount.clientHeight || 600), 0.6, 0.4, 0.1);
    bloom.threshold = 0.85;
    bloom.strength = 0.4; // subtle glow
    bloom.radius = 0.7;
    composer.addPass(bloom);

    // BokehPass (depth-of-field) - subtle values
    const bokehParams = {
      focus: 800.0,
      aperture: 0.0008, // smaller = subtle
      maxblur: 0.001
    };
    try {
      const bokehPass = new BokehPass(scene, camera, {
        focus: bokehParams.focus,
        aperture: bokehParams.aperture,
        maxblur: bokehParams.maxblur,

        width: mount.clientWidth || 800,
        height: mount.clientHeight || 600
      });
      composer.addPass(bokehPass);
    } catch (e) {
      // ignore if not available; keep composer with bloom
    }

    // Resize helper
    function onResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      composer.setSize(w, h);

      const aspectLocal = w / h || 1;
      camera.left = (-frustum * aspectLocal) / 2;
      camera.right = (frustum * aspectLocal) / 2;
      camera.top = frustum / 2;
      camera.bottom = -frustum / 2;
      camera.updateProjectionMatrix();
    }

    // Animation loop with slow floating motion and zero-gravity rotation
    let frame = 0;
    function animate() {
      frame += 0.005;
      // slow group rotation
      group.rotation.y = Math.sin(frame * 0.3) * 0.12;
      group.rotation.x = Math.sin(frame * 0.11) * 0.06;

      // floating
      sphere.position.y = 10 + Math.sin(frame * 1.1) * 14;
      glass1.position.y = -10 + Math.cos(frame * 0.9) * 12;
      knot.position.y = 40 + Math.sin(frame * 0.7) * 18;

      smallSpheres.forEach((s, i) => {
        s.position.x += Math.sin(frame * (0.2 + i * 0.05)) * 0.2;
        s.position.y += Math.cos(frame * (0.25 + i * 0.03)) * 0.15;
        s.position.z += Math.sin(frame * (0.15 + i * 0.02)) * 0.1;
      });

      // subtle parallax camera slight movement based on scroll
      const scrollY = (typeof globalThis !== 'undefined' && (globalThis.scrollY || globalThis.pageYOffset)) || 0;
      camera.position.x = 500 + (scrollY * 0.06);

      composer.render();
      (typeof globalThis !== 'undefined' && typeof globalThis.requestAnimationFrame === 'function' ? globalThis.requestAnimationFrame(animate) : setTimeout(animate, 16));
    }

    // initial sizing
    onResize();
    (typeof globalThis !== 'undefined' && typeof globalThis.addEventListener === 'function') ? globalThis.addEventListener('resize', onResize) : null;

    // start
    animate();

    // store cleanup
    cleanupRef.current = () => {
      if (typeof globalThis !== 'undefined' && typeof globalThis.removeEventListener === 'function') globalThis.removeEventListener('resize', onResize);
      if (mount && renderer && renderer.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  const style = fullScreen
    ? { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }
    : { width: '100%', height: '480px' };

  return (
    <div className={className} style={style}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
