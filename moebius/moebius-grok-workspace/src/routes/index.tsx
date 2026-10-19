import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, RotateCcw } from "lucide-react";
import { MobiusStage } from "@/components/mobius-stage";

export const Route = createFileRoute("/")({ component: Home });

const TWO_PI = Math.PI * 2;

function Home() {
  const [spin, setSpin] = useState(TWO_PI / 46);
  const [flow, setFlow] = useState(0.11);
  const [paused, setPaused] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) setPaused(true);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
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

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <MobiusStage settings={{ spin, flow, paused, resetToken }} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, transparent 42%, color-mix(in oklab, var(--color-bg) 62%, transparent) 100%)",
        }}
        aria-hidden="true"
      />

      <header className="pointer-events-none absolute top-0 left-0 z-10 max-w-xs p-5 sm:p-7">
        <p className="font-sans text-xs tracking-widest text-gold uppercase">A single surface</p>
        <h1 className="font-serif mt-1 text-4xl leading-none font-medium tracking-tight text-balance italic sm:text-5xl">
          Möbius
        </h1>
        <p className="mt-3 max-w-[16rem] font-sans text-sm leading-snug text-pretty text-muted">
          One side, one edge. It turns slowly while a wave of colour travels the same parameters.
        </p>
      </header>

      <section
        data-ui
        className="absolute bottom-0 left-0 z-10 w-full max-w-xs p-5 sm:p-7"
        aria-label="Motion"
      >
        <div className="font-mono text-xs leading-relaxed text-muted">
          <p>x = (1 + v cos(u/2)) cos u</p>
          <p>y = (1 + v cos(u/2)) sin u</p>
          <p>z = v sin(u/2)</p>
          <p className="mt-1 text-fg/80">c = ½ (sin(9u + 7v + φ) + cos(13u − 11v − φ))</p>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <label className="flex items-baseline justify-between gap-3 font-sans text-xs text-muted">
            <span>Turn</span>
            <span className="tabular-nums text-fg">{turnLabel(spin)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={TWO_PI / 8}
            step={0.001}
            value={spin}
            aria-valuetext={turnLabel(spin)}
            onChange={(event) => setSpin(Number(event.target.value))}
          />
        </div>

        <div className="mt-1 flex flex-col gap-1">
          <label className="flex items-baseline justify-between gap-3 font-sans text-xs text-muted">
            <span>Drift</span>
            <span className="tabular-nums text-fg">{flow < 0.01 ? "still" : "along the strip"}</span>
          </label>
          <input
            type="range"
            min={0}
            max={0.55}
            step={0.001}
            value={flow}
            aria-valuetext={flow < 0.01 ? "Colour still" : "Colour drifting"}
            onChange={(event) => setFlow(Number(event.target.value))}
          />
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-bg/80 px-4 font-sans text-sm text-fg backdrop-blur-sm"
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
            {paused ? "Play" : "Pause"}
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-bg/80 px-4 font-sans text-sm text-fg backdrop-blur-sm"
            onClick={() => setResetToken((value) => value + 1)}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </button>
        </div>
        <p className="mt-3 font-sans text-xs text-muted">Drag to look. Scroll to come closer. Space pauses.</p>
      </section>
    </main>
  );
}

function turnLabel(spin: number): string {
  if (spin < 0.008) return "still";
  const seconds = Math.round(TWO_PI / spin);
  if (seconds >= 90) return `one turn · ${Math.round(seconds / 60)} min`;
  return `one turn · ${seconds}s`;
}
