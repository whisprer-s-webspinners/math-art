import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildStrip } from "@/lib/mobius-surface";
import { fragmentShader, vertexShader } from "@/lib/mobius-shader";
import { twilight } from "@/lib/twilight";

export type StageSettings = {
  /** Radians per second about the vertical. */
  spin: number;
  /** Radians per second added to the colour phase φ. */
  flow: number;
  paused: boolean;
  resetToken: number;
};

const INITIAL_AZIMUTH = 0.62;
const INITIAL_POLAR = Math.PI / 2 - (28 * Math.PI) / 180;

type Props = {
  settings: StageSettings;
};

export function MobiusStage({ settings }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const kickRef = useRef<() => void>(() => {});

  useEffect(() => {
    kickRef.current();
  }, [settings.paused, settings.resetToken]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const root = host;

    const nu = window.innerWidth < 720 ? 360 : 520;
    const nv = window.innerWidth < 720 ? 64 : 88;
    const strip = buildStrip(nu, nv);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(strip.positions, 3));
    geometry.setAttribute("aU", new THREE.BufferAttribute(strip.paramU, 1));
    geometry.setAttribute("aV", new THREE.BufferAttribute(strip.paramV, 1));
    geometry.setIndex(new THREE.BufferAttribute(strip.indices, 1));
    geometry.computeBoundingSphere();

    const pixels = new Uint8Array(256 * 4);
    for (let i = 0; i < 256; i++) {
      const [r, g, b] = twilight(i / 256);
      pixels[i * 4] = Math.round(r * 255);
      pixels[i * 4 + 1] = Math.round(g * 255);
      pixels[i * 4 + 2] = Math.round(b * 255);
      pixels[i * 4 + 3] = 255;
    }
    const texture = new THREE.DataTexture(pixels, 256, 1, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uPhase: { value: 0 },
        uMap: { value: texture },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    const mesh = new THREE.Mesh(geometry, material);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03040b);
    scene.add(mesh);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 40);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "block h-full w-full";
    renderer.domElement.setAttribute(
      "aria-label",
      "A Möbius strip turning slowly, coloured by a wave on its surface",
    );
    renderer.domElement.setAttribute("role", "img");
    root.appendChild(renderer.domElement);

    let azimuth = INITIAL_AZIMUTH;
    let polar = INITIAL_POLAR;
    let zoom = 1;
    let spinAngle = 0.4;
    let phase = 0;
    let baseDist = 4;
    let lookY = -0.08;
    let lastReset = settingsRef.current.resetToken;
    let last = performance.now();
    let halted = false;
    let dragging = false;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;

    const look = new THREE.Vector3();

    function frameDistance() {
      const aspect = camera.aspect;
      const halfY = Math.tan((camera.fov * Math.PI) / 360);
      const halfX = halfY * Math.max(aspect, 0.2);
      const extent = 1.7;
      baseDist = Math.max(extent / halfY, extent / halfX) * (aspect < 0.9 ? 1.22 : 1.06);
      lookY = aspect < 0.9 ? -0.34 : -0.06;
    }

    function placeCamera() {
      const dist = baseDist * zoom;
      const y = dist * Math.cos(polar);
      const radial = dist * Math.sin(polar);
      camera.position.set(radial * Math.sin(azimuth), y, radial * Math.cos(azimuth));
      look.set(0, lookY, 0);
      camera.lookAt(look);
    }

    function resize() {
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (w < 2 || h < 2) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      frameDistance();
      renderer.setSize(w, h, false);
      placeCamera();
    }

    function renderFrame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = settingsRef.current;

      if (s.resetToken !== lastReset) {
        lastReset = s.resetToken;
        azimuth = INITIAL_AZIMUTH;
        polar = INITIAL_POLAR;
        zoom = 1;
      }

      if (!s.paused && !dragging) {
        spinAngle += s.spin * dt;
        phase += s.flow * dt;
      }

      mesh.rotation.y = spinAngle;
      material.uniforms.uPhase.value = phase;
      placeCamera();
      renderer.render(scene, camera);

      if (s.paused && !dragging) {
        renderer.setAnimationLoop(null);
        halted = true;
      }
    }

    function kick() {
      if (!halted) return;
      last = performance.now();
      halted = false;
      renderer.setAnimationLoop(renderFrame);
    }
    kickRef.current = kick;

    function pinchDistance(): number {
      const pts = [...pointers.values()];
      if (pts.length < 2) return 0;
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }

    function onPointerDown(event: PointerEvent) {
      if ((event.target as HTMLElement | null)?.closest?.("[data-ui]")) return;
      root.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      dragging = true;
      pinch = pointers.size >= 2 ? pinchDistance() : 0;
      kick();
    }

    function onPointerMove(event: PointerEvent) {
      const prev = pointers.get(event.pointerId);
      if (!prev) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 1) {
        const dx = event.clientX - prev.x;
        const dy = event.clientY - prev.y;
        azimuth -= dx * 0.0052;
        polar = clamp(polar + dy * 0.0046, 0.22, Math.PI - 0.22);
      } else if (pointers.size >= 2) {
        const d = pinchDistance();
        if (pinch > 0 && d > 0) zoom = clamp(zoom * (pinch / d), 0.62, 2.5);
        pinch = d;
      }
    }

    function onPointerUp(event: PointerEvent) {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinch = 0;
      dragging = pointers.size > 0;
      if (!dragging && settingsRef.current.paused) {
        renderer.render(scene, camera);
      }
    }

    function onWheel(event: WheelEvent) {
      if ((event.target as HTMLElement | null)?.closest?.("[data-ui]")) return;
      event.preventDefault();
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
      zoom = clamp(zoom * Math.exp(event.deltaY * scale * 0.0011), 0.62, 2.5);
      kick();
      if (halted) {
        placeCamera();
        renderer.render(scene, camera);
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
      kick();
      if (settingsRef.current.paused) {
        placeCamera();
        renderer.render(scene, camera);
      }
    });
    resizeObserver.observe(root);

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    root.addEventListener("wheel", onWheel, { passive: false });

    resize();
    renderer.setAnimationLoop(renderFrame);

    return () => {
      kickRef.current = () => {};
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      root.removeEventListener("wheel", onWheel);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="absolute inset-0 touch-none" />;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
