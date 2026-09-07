"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function centerAndFit(m: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(m);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
      const targetH = 0.4;
  const s = targetH / Math.max(size.y, 1e-6);
  m.scale.setScalar(s);

  const box2 = new THREE.Box3().setFromObject(m);
  const c2 = box2.getCenter(new THREE.Vector3());
  const s2 = box2.getSize(new THREE.Vector3());
  m.position.x -= c2.x;
  m.position.z -= c2.z;
  m.position.y -= c2.y - s2.y / 2;
  m.position.y -= targetH / 2;
  m.position.y += 1.4;
}

export default function MeshBg() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.15, 5.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xfff8f0, 0xe8dfd3, 0.55);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff1e4, 1.8);
    key.position.set(4, 7, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xdde4ff, 0.75);
    fill.position.set(-5, 3, -2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 1.3);
    rim.position.set(-1.5, 5, -6);
    scene.add(rim);

    let model: THREE.Object3D | null = null;
    let mixer: THREE.AnimationMixer | null = null;

    const loader = new GLTFLoader();
    loader.load(
      "/textured_mesh.glb",
      (gltf) => {
        const m = gltf.scene;
        centerAndFit(m);
        model = m;
        scene.add(m);
        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(m);
          mixer.clipAction(gltf.animations[0]).play();
        }
      },
      undefined,
      () => {
        // GLB load failed — render empty scene
      }
    );

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();

      mixer?.update(dt);

      if (model) {
        model.position.y += Math.sin(t * 2) * 0.008 - Math.sin((t - dt) * 2) * 0.008;
        model.rotation.z = Math.sin(t * 0.9) * 0.02;

        const targetY = mouse.x * 1.2;
        const targetX = -mouse.y * 0.95;
        model.rotation.y += (targetY - model.rotation.y) * 0.08;
        const xDiff = targetX - model.rotation.x;
        const xLerp = xDiff > 0 ? 0.18 : 0.05;
        model.rotation.x += xDiff * xLerp;
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full overflow-visible" />;
}
