import { useEffect, useState } from "react";
import { getMeals } from "../db";
import { Zap } from "lucide-react";

interface FastingStatusProps {
  refreshKey?: number;
}

interface Phase {
  minHours: number;
  maxHours: number | null;
  label: string;
  state: string;
  description: string;
  benefit: string;
  /** Tailwind gradient from/to for the accent bar */
  gradient: string;
  /** Tailwind text color for the label badge */
  badgeColor: string;
}

const PHASES: Phase[] = [
  {
    minHours: 0,
    maxHours: 4,
    label: "Fed State",
    state: "0–4 h",
    description:
      "Blood sugar rises and insulin is elevated; the body uses incoming glucose for energy and stores excess as glycogen.",
    benefit: "Immediate energy availability and nutrient absorption.",
    gradient: "from-amber-500 to-orange-500",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    minHours: 4,
    maxHours: 12,
    label: "Post-absorptive",
    state: "4–12 h",
    description:
      "Blood sugar begins to fall; insulin drops and glucagon rises, triggering glycogen breakdown in the liver.",
    benefit: "Stable blood sugar without food, gradual shift toward using stored energy.",
    gradient: "from-yellow-500 to-amber-500",
    badgeColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  },
  {
    minHours: 12,
    maxHours: 16,
    label: "Early Fasting",
    state: "12–16 h",
    description:
      "Liver glycogen becomes depleted; the body starts increasing fat breakdown and producing small amounts of ketones.",
    benefit: "Improved fat utilization and metabolic flexibility.",
    gradient: "from-lime-500 to-emerald-500",
    badgeColor: "text-lime-400 bg-lime-500/10 border-lime-500/20",
  },
  {
    minHours: 16,
    maxHours: 24,
    label: "Fasting State",
    state: "16–24 h",
    description:
      "Ketone production rises and growth hormone increases; insulin remains low.",
    benefit: "Enhanced fat burning and early cellular cleanup processes (autophagy begins increasing).",
    gradient: "from-emerald-500 to-teal-500",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    minHours: 24,
    maxHours: 36,
    label: "Prolonged Fasting",
    state: "24–36 h",
    description:
      "Glycogen is largely gone; ketones become a major fuel source, and insulin is very low.",
    benefit: "Deeper autophagy, reduced inflammation signals, and improved insulin sensitivity.",
    gradient: "from-teal-500 to-cyan-500",
    badgeColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  },
  {
    minHours: 36,
    maxHours: 48,
    label: "Deep Fasting",
    state: "36–48 h",
    description:
      "Ketones significantly elevate and the brain adapts to them; protein breakdown is minimized as the body conserves muscle.",
    benefit: "Sustained fat loss and more pronounced cellular repair processes.",
    gradient: "from-cyan-500 to-blue-500",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    minHours: 48,
    maxHours: null,
    label: "Extended Fasting",
    state: "48+ h",
    description:
      "The body is fully adapted to ketosis; metabolic rate may slightly adjust and autophagy remains active.",
    benefit: "Continued cellular maintenance, though diminishing returns and higher stress if prolonged excessively.",
    gradient: "from-blue-500 to-violet-500",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
];

const getPhase = (hours: number): Phase =>
  PHASES.find(
    (p) => hours >= p.minHours && (p.maxHours === null || hours < p.maxHours)
  ) ?? PHASES[0];

const formatElapsed = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
};

/** Progress within the current phase, 0–1 */
const phaseProgress = (hours: number, phase: Phase) => {
  if (phase.maxHours === null) return 1;
  const span = phase.maxHours - phase.minHours;
  return Math.min((hours - phase.minHours) / span, 1);
};

export function FastingStatus({ refreshKey = 0 }: FastingStatusProps) {
  const [lastMealTs, setLastMealTs] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  // Fetch last meal timestamp whenever refreshKey changes
  useEffect(() => {
    getMeals()
      .then((all) => {
        if (all.length === 0) { setLastMealTs(null); return; }
        const latest = all.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
        setLastMealTs(latest.timestamp);
      })
      .catch((err) => console.error("FastingStatus: failed to load meals", err));
  }, [refreshKey]);

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (lastMealTs === null) return null;

  const elapsedMs = Math.max(0, now - lastMealTs);
  const elapsedHours = elapsedMs / 3_600_000;
  const phase = getPhase(elapsedHours);
  const progress = phaseProgress(elapsedHours, phase);
  const { h, m, s } = formatElapsed(elapsedMs);

  return (
    <div className="relative bg-slate-800 rounded-2xl p-6 shadow-xl border border-white/5 overflow-hidden">
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${phase.gradient} opacity-80`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Zap size={22} className="text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-100">Fasting Status</h2>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${phase.badgeColor}`}>
          {phase.label}
        </span>
      </div>

      {/* Timer */}
      <div className="flex items-end gap-1 mb-5">
        <div className="flex items-baseline gap-0.5">
          <span className="text-5xl font-bold tabular-nums text-slate-100 tracking-tight">{h}</span>
          <span className="text-2xl font-bold text-slate-400 mb-0.5">h</span>
        </div>
        <div className="flex items-baseline gap-0.5 ml-2">
          <span className="text-5xl font-bold tabular-nums text-slate-100 tracking-tight">{m}</span>
          <span className="text-2xl font-bold text-slate-400 mb-0.5">m</span>
        </div>
        <div className="flex items-baseline gap-0.5 ml-2">
          <span className="text-5xl font-bold tabular-nums text-slate-300 tracking-tight">{s}</span>
          <span className="text-2xl font-bold text-slate-500 mb-0.5">s</span>
        </div>
      </div>

      {/* Phase progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{phase.state}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${phase.gradient} rounded-full transition-all duration-1000`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Description + benefit */}
      <div className="bg-slate-900/40 border border-white/5 rounded-xl px-4 py-3.5 flex flex-col gap-2">
        <p className="text-sm text-slate-300 leading-relaxed">{phase.description}</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="text-emerald-400 font-medium">Benefit: </span>
          {phase.benefit}
        </p>
      </div>
    </div>
  );
}
