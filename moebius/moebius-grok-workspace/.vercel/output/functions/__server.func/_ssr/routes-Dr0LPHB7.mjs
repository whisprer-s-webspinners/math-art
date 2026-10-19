import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Pause, n as RotateCcw, r as Play } from "../_libs/lucide-react.mjs";
import { a as Color, c as Mesh, d as RepeatWrapping, f as SRGBColorSpace, h as Vector3, i as ClampToEdgeWrapping, l as PerspectiveCamera, m as ShaderMaterial, n as BufferAttribute, o as DataTexture, p as Scene, r as BufferGeometry, s as LinearFilter, t as WebGLRenderer, u as RGBAFormat } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dr0LPHB7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Half-width of the strip, matching the original plot. */
var HALF_WIDTH = .48;
/**
* Möbius strip.
* x = (1 + v cos(u/2)) cos u
* y = (1 + v cos(u/2)) sin u
* z = v sin(u/2)
*
* u runs [0, 2π) once. The seam stitches (u → 2π, v) to (u = 0, −v),
* which is the same point in space — one surface, one edge.
* Positions are Y-up: math (x, y, z) → (x, z, −y), so the ring lies flat
* and a turn about Y is a turntable spin.
*/
function mobiusPoint(u, v) {
	const radius = 1 + v * Math.cos(u * .5);
	const x = radius * Math.cos(u);
	const y = radius * Math.sin(u);
	return [
		x,
		v * Math.sin(u * .5),
		-y
	];
}
function buildStrip(nu, nv) {
	const count = nu * nv;
	const positions = new Float32Array(count * 3);
	const paramU = new Float32Array(count);
	const paramV = new Float32Array(count);
	const twoPi = Math.PI * 2;
	for (let i = 0; i < nu; i++) {
		const u = i / nu * twoPi;
		for (let j = 0; j < nv; j++) {
			const v = -.48 + j / (nv - 1) * (HALF_WIDTH * 2);
			const [x, y, z] = mobiusPoint(u, v);
			const k = i * nv + j;
			positions[k * 3] = x;
			positions[k * 3 + 1] = y;
			positions[k * 3 + 2] = z;
			paramU[k] = u;
			paramV[k] = v;
		}
	}
	const indices = new Uint32Array(nu * (nv - 1) * 6);
	let p = 0;
	for (let i = 0; i < nu; i++) {
		const i2 = (i + 1) % nu;
		const wrap = i2 === 0;
		for (let j = 0; j < nv - 1; j++) {
			const a = i * nv + j;
			const c = i * nv + j + 1;
			const b = wrap ? jMirror(0, nv, j) : i2 * nv + j;
			const d = wrap ? jMirror(0, nv, j + 1) : i2 * nv + j + 1;
			indices[p++] = a;
			indices[p++] = b;
			indices[p++] = d;
			indices[p++] = a;
			indices[p++] = d;
			indices[p++] = c;
		}
	}
	return {
		positions,
		paramU,
		paramV,
		indices,
		nu,
		nv
	};
}
function jMirror(iBase, nv, j) {
	return iBase * nv + (nv - 1 - j);
}
var vertexShader = `
attribute float aU;
attribute float aV;
varying float vU;
varying float vV;
varying vec3 vN;
varying vec3 vWorld;

void main() {
  vU = aU;
  vV = aV;

  float u = aU;
  float v = aV;
  float c = cos(u * 0.5);
  float s = sin(u * 0.5);
  float cu = cos(u);
  float su = sin(u);
  float R = 1.0 + v * c;
  float Ru = -0.5 * v * s;

  vec3 dPu = vec3(Ru * cu - R * su, Ru * su + R * cu, 0.5 * v * c);
  vec3 dPv = vec3(c * cu, c * su, s);
  vec3 nMath = cross(dPu, dPv);
  float nLen = length(nMath);
  vec3 nUnit = nLen > 1e-5 ? nMath / nLen : vec3(0.0, 0.0, 1.0);
  vec3 nYup = vec3(nUnit.x, nUnit.z, -nUnit.y);
  vN = normalize(mat3(modelMatrix) * nYup);

  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;
var fragmentShader = `
uniform float uPhase;
uniform sampler2D uMap;
varying float vU;
varying float vV;
varying vec3 vN;
varying vec3 vWorld;

void main() {
  float field = 0.5 * (
    sin(9.0 * vU + 7.0 * vV + uPhase) +
    cos(13.0 * vU - 11.0 * vV - uPhase)
  );
  float t = clamp(field * 0.5 + 0.5, 0.0, 1.0);
  vec3 base = texture2D(uMap, vec2(fract(t + 0.5), 0.5)).rgb;

  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = normalize(vec3(0.42, 0.86, 0.28));
  float ndl = abs(dot(N, L));
  float ndv = abs(dot(N, V));
  float rim = pow(1.0 - ndv, 2.05);
  float edge = smoothstep(0.26, 0.48, abs(vV));

  vec3 col = base * (0.8 + 0.22 * ndl);
  col += base * rim * 0.42;
  col += vec3(0.95, 0.86, 0.7) * edge * (0.1 + rim * 0.38);

  gl_FragColor = vec4(col, 1.0);
}
`;
/** Matplotlib-style twilight, sampled as linear-light RGB. Cyclic: t=0 and t=1 meet. */
var STOPS = [
	[
		0,
		.137,
		.071,
		.243
	],
	[
		.08,
		.31,
		.11,
		.45
	],
	[
		.16,
		.58,
		.17,
		.5
	],
	[
		.24,
		.8,
		.3,
		.47
	],
	[
		.32,
		.91,
		.5,
		.45
	],
	[
		.4,
		.94,
		.73,
		.55
	],
	[
		.48,
		.86,
		.87,
		.72
	],
	[
		.56,
		.58,
		.85,
		.8
	],
	[
		.64,
		.26,
		.68,
		.76
	],
	[
		.72,
		.12,
		.44,
		.64
	],
	[
		.8,
		.09,
		.24,
		.48
	],
	[
		.88,
		.09,
		.12,
		.33
	],
	[
		.94,
		.11,
		.075,
		.26
	],
	[
		1,
		.137,
		.071,
		.243
	]
];
function smooth(u) {
	return u * u * (3 - 2 * u);
}
/** sRGB twilight at t in [0, 1]. */
function twilight(t) {
	const x = (t % 1 + 1) % 1;
	let i = 0;
	while (i < STOPS.length - 2 && STOPS[i + 1][0] < x) i++;
	const a = STOPS[i];
	const b = STOPS[i + 1];
	const u = smooth((x - a[0]) / (b[0] - a[0]));
	return [
		a[1] + (b[1] - a[1]) * u,
		a[2] + (b[2] - a[2]) * u,
		a[3] + (b[3] - a[3]) * u
	];
}
var INITIAL_AZIMUTH = .62;
var INITIAL_POLAR = Math.PI / 2 - 28 * Math.PI / 180;
function MobiusStage({ settings }) {
	const hostRef = (0, import_react.useRef)(null);
	const settingsRef = (0, import_react.useRef)(settings);
	settingsRef.current = settings;
	const kickRef = (0, import_react.useRef)(() => {});
	(0, import_react.useEffect)(() => {
		kickRef.current();
	}, [settings.paused, settings.resetToken]);
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		if (!host) return;
		const strip = buildStrip(window.innerWidth < 720 ? 360 : 520, window.innerWidth < 720 ? 64 : 88);
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", new BufferAttribute(strip.positions, 3));
		geometry.setAttribute("aU", new BufferAttribute(strip.paramU, 1));
		geometry.setAttribute("aV", new BufferAttribute(strip.paramV, 1));
		geometry.setIndex(new BufferAttribute(strip.indices, 1));
		geometry.computeBoundingSphere();
		const pixels = /* @__PURE__ */ new Uint8Array(1024);
		for (let i = 0; i < 256; i++) {
			const [r, g, b] = twilight(i / 256);
			pixels[i * 4] = Math.round(r * 255);
			pixels[i * 4 + 1] = Math.round(g * 255);
			pixels[i * 4 + 2] = Math.round(b * 255);
			pixels[i * 4 + 3] = 255;
		}
		const texture = new DataTexture(pixels, 256, 1, RGBAFormat);
		texture.colorSpace = SRGBColorSpace;
		texture.wrapS = RepeatWrapping;
		texture.wrapT = ClampToEdgeWrapping;
		texture.magFilter = LinearFilter;
		texture.minFilter = LinearFilter;
		texture.generateMipmaps = false;
		texture.needsUpdate = true;
		const material = new ShaderMaterial({
			uniforms: {
				uPhase: { value: 0 },
				uMap: { value: texture }
			},
			vertexShader,
			fragmentShader,
			side: 2,
			toneMapped: false
		});
		const mesh = new Mesh(geometry, material);
		const scene = new Scene();
		scene.background = new Color(197643);
		scene.add(mesh);
		const camera = new PerspectiveCamera(38, 1, .05, 40);
		const renderer = new WebGLRenderer({
			antialias: true,
			alpha: false,
			powerPreference: "high-performance"
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.domElement.className = "block h-full w-full";
		renderer.domElement.setAttribute("aria-label", "A Möbius strip turning slowly, coloured by a wave on its surface");
		renderer.domElement.setAttribute("role", "img");
		host.appendChild(renderer.domElement);
		let azimuth = INITIAL_AZIMUTH;
		let polar = INITIAL_POLAR;
		let zoom = 1;
		let spinAngle = .4;
		let phase = 0;
		let baseDist = 4;
		let lookY = -.08;
		let lastReset = settingsRef.current.resetToken;
		let last = performance.now();
		let halted = false;
		let dragging = false;
		const pointers = /* @__PURE__ */ new Map();
		let pinch = 0;
		const look = new Vector3();
		function frameDistance() {
			const aspect = camera.aspect;
			const halfY = Math.tan(camera.fov * Math.PI / 360);
			const halfX = halfY * Math.max(aspect, .2);
			const extent = 1.7;
			baseDist = Math.max(extent / halfY, extent / halfX) * (aspect < .9 ? 1.22 : 1.06);
			lookY = aspect < .9 ? -.34 : -.06;
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
			const w = host.clientWidth;
			const h = host.clientHeight;
			if (w < 2 || h < 2) return;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			frameDistance();
			renderer.setSize(w, h, false);
			placeCamera();
		}
		function renderFrame(now) {
			const dt = Math.min((now - last) / 1e3, .05);
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
		function pinchDistance() {
			const pts = [...pointers.values()];
			if (pts.length < 2) return 0;
			return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
		}
		function onPointerDown(event) {
			if (event.target?.closest?.("[data-ui]")) return;
			host.setPointerCapture(event.pointerId);
			pointers.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY
			});
			dragging = true;
			pinch = pointers.size >= 2 ? pinchDistance() : 0;
			kick();
		}
		function onPointerMove(event) {
			const prev = pointers.get(event.pointerId);
			if (!prev) return;
			pointers.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY
			});
			if (pointers.size === 1) {
				const dx = event.clientX - prev.x;
				const dy = event.clientY - prev.y;
				azimuth -= dx * .0052;
				polar = clamp(polar + dy * .0046, .22, Math.PI - .22);
			} else if (pointers.size >= 2) {
				const d = pinchDistance();
				if (pinch > 0 && d > 0) zoom = clamp(zoom * (pinch / d), .62, 2.5);
				pinch = d;
			}
		}
		function onPointerUp(event) {
			pointers.delete(event.pointerId);
			if (pointers.size < 2) pinch = 0;
			dragging = pointers.size > 0;
			if (!dragging && settingsRef.current.paused) renderer.render(scene, camera);
		}
		function onWheel(event) {
			if (event.target?.closest?.("[data-ui]")) return;
			event.preventDefault();
			const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
			zoom = clamp(zoom * Math.exp(event.deltaY * scale * .0011), .62, 2.5);
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
		resizeObserver.observe(host);
		host.addEventListener("pointerdown", onPointerDown);
		host.addEventListener("pointermove", onPointerMove);
		host.addEventListener("pointerup", onPointerUp);
		host.addEventListener("pointercancel", onPointerUp);
		host.addEventListener("wheel", onWheel, { passive: false });
		resize();
		renderer.setAnimationLoop(renderFrame);
		return () => {
			kickRef.current = () => {};
			renderer.setAnimationLoop(null);
			resizeObserver.disconnect();
			host.removeEventListener("pointerdown", onPointerDown);
			host.removeEventListener("pointermove", onPointerMove);
			host.removeEventListener("pointerup", onPointerUp);
			host.removeEventListener("pointercancel", onPointerUp);
			host.removeEventListener("wheel", onWheel);
			geometry.dispose();
			material.dispose();
			texture.dispose();
			renderer.dispose();
			renderer.domElement.remove();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: hostRef,
		className: "absolute inset-0 touch-none"
	});
}
function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
var TWO_PI = Math.PI * 2;
function Home() {
	const [spin, setSpin] = (0, import_react.useState)(TWO_PI / 46);
	const [flow, setFlow] = (0, import_react.useState)(.11);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const [resetToken, setResetToken] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
	}, []);
	(0, import_react.useEffect)(() => {
		function onKey(event) {
			const tag = event.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA") return;
			if (event.code === "Space" && tag === "BUTTON") return;
			if (event.code === "Space") {
				event.preventDefault();
				setPaused((value) => !value);
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobiusStage, { settings: {
				spin,
				flow,
				paused,
				resetToken
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0",
				style: { background: "radial-gradient(ellipse at 50% 42%, transparent 42%, color-mix(in oklab, var(--color-bg) 62%, transparent) 100%)" },
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pointer-events-none absolute top-0 left-0 z-10 max-w-xs p-5 sm:p-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-xs tracking-widest text-gold uppercase",
						children: "A single surface"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif mt-1 text-4xl leading-none font-medium tracking-tight text-balance italic sm:text-5xl",
						children: "Möbius"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-[16rem] font-sans text-sm leading-snug text-pretty text-muted",
						children: "One side, one edge. It turns slowly while a wave of colour travels the same parameters."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"data-ui": true,
				className: "absolute bottom-0 left-0 z-10 w-full max-w-xs p-5 sm:p-7",
				"aria-label": "Motion",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-mono text-xs leading-relaxed text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "x = (1 + v cos(u/2)) cos u" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "y = (1 + v cos(u/2)) sin u" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "z = v sin(u/2)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-fg/80",
								children: "c = ½ (sin(9u + 7v + φ) + cos(13u − 11v − φ))"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-baseline justify-between gap-3 font-sans text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Turn" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums text-fg",
								children: turnLabel(spin)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: TWO_PI / 8,
							step: .001,
							value: spin,
							"aria-valuetext": turnLabel(spin),
							onChange: (event) => setSpin(Number(event.target.value))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex flex-col gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-baseline justify-between gap-3 font-sans text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Drift" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums text-fg",
								children: flow < .01 ? "still" : "along the strip"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: .55,
							step: .001,
							value: flow,
							"aria-valuetext": flow < .01 ? "Colour still" : "Colour drifting",
							onChange: (event) => setFlow(Number(event.target.value))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-bg/80 px-4 font-sans text-sm text-fg backdrop-blur-sm",
							onClick: () => setPaused((value) => !value),
							children: [paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
								className: "size-4",
								"aria-hidden": "true"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {
								className: "size-4",
								"aria-hidden": "true"
							}), paused ? "Play" : "Pause"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-bg/80 px-4 font-sans text-sm text-fg backdrop-blur-sm",
							onClick: () => setResetToken((value) => value + 1),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Reset"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-sans text-xs text-muted",
						children: "Drag to look. Scroll to come closer. Space pauses."
					})
				]
			})
		]
	});
}
function turnLabel(spin) {
	if (spin < .008) return "still";
	const seconds = Math.round(TWO_PI / spin);
	if (seconds >= 90) return `one turn · ${Math.round(seconds / 60)} min`;
	return `one turn · ${seconds}s`;
}
//#endregion
export { Home as component };
