import { useEffect, useState } from "react";
import { Calendar, Flame } from "lucide-react";
import { getMeals } from "../db";

interface WeeklyTimelineProps {
  refreshKey?: number;
}

interface Meal {
  id: number;
  meal: string;
  timestamp: number;
  calories?: number;
}

interface DayData {
  label: string;
  shortDate: string;
  dateKey: string;
  meals: Meal[];
  isToday: boolean;
  fastingHours: string | null;
  dailyCalories: number | null;
}



// ── helpers ──────────────────────────────────────────────────────────────────

const TRACK_H = 200; // px — full 24-hour height

/** Local YYYY-MM-DD string (no UTC shift) */
const localDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

/** Vertical position of a timestamp within a 24-hour day, as a % */
const mealTopPct = (ts: number) => {
  const d = new Date(ts);
  return ((d.getHours() + d.getMinutes() / 60) / 24) * 100;
};

const nowPct = () => {
  const d = new Date();
  return ((d.getHours() + d.getMinutes() / 60) / 24) * 100;
};

const formatShortTime = (ts: number) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));

const TIME_AXIS = [
  { label: "0h", pct: 0 },
  { label: "6h", pct: (6 / 24) * 100 },
  { label: "12h", pct: (12 / 24) * 100 },
  { label: "18h", pct: (18 / 24) * 100 },
  { label: "24h", pct: 100 },
];

const buildDays = (allMeals: Meal[]): DayData[] => {
  const sortedMeals = [...allMeals].sort((a, b) => a.timestamp - b.timestamp);

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - i)); // i=0 → 4 days ago … i=4 → today
    const dateKey = localDateKey(d);
    const isToday = i === 4;
    const label = isToday
      ? "Today"
      : d.toLocaleDateString("en-US", { weekday: "short" });
    const shortDate = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const meals = sortedMeals.filter(
      (m) => localDateKey(new Date(m.timestamp)) === dateKey
    );

    let fastingHours: string | null = null;
    if (meals.length > 0) {
      const firstMeal = meals[0];
      const idx = sortedMeals.findIndex((m) => m.id === firstMeal.id);
      if (idx > 0) {
        const prevMeal = sortedMeals[idx - 1];
        const diffHours = (firstMeal.timestamp - prevMeal.timestamp) / 3600000;
        fastingHours = (Math.round(diffHours * 10) / 10) + "h";
      }
    }

    const mealsWithCalories = meals.filter((m) => m.calories !== undefined);
    const dailyCalories =
      mealsWithCalories.length > 0
        ? mealsWithCalories.reduce((sum, m) => sum + (m.calories ?? 0), 0)
        : null;

    return { label, shortDate, dateKey, meals, isToday, fastingHours, dailyCalories };
  });
};

// ── component ─────────────────────────────────────────────────────────────────

export function WeeklyTimeline({ refreshKey = 0 }: WeeklyTimelineProps) {
  const [days, setDays] = useState<DayData[]>([]);
  const [currentNowPct, setCurrentNowPct] = useState(nowPct);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Fetch meals and handle visibility changes
  useEffect(() => {
    const fetchMeals = () => {
      getMeals()
        .then((all) => setDays(buildDays(all as Meal[])))
        .catch((err) => console.error("WeeklyTimeline:", err));
    };

    // Initial load
    fetchMeals();

    // Refresh on app resume
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchMeals();
        setCurrentNowPct(nowPct());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refreshKey]);

  // Tick "now" indicator every minute
  useEffect(() => {
    const id = setInterval(() => setCurrentNowPct(nowPct()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative bg-slate-800 rounded-2xl p-6 shadow-xl border border-white/5 overflow-hidden">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500 opacity-80" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <Calendar size={22} className="text-violet-400" />
        <h2 className="text-lg font-semibold text-slate-100">Last 5 Days</h2>
      </div>

      {/* Row 1: column headers */}
      <div className="flex gap-2 mb-2">
        {/* Spacer matching Y-axis width */}
        <div className="shrink-0 w-8" />
        {days.map((day) => (
          <div key={day.dateKey} className="flex-1 text-center">
            <div
              className={`text-xs font-semibold ${day.isToday ? "text-violet-400" : "text-slate-400"
                }`}
            >
              {day.label}
            </div>
            <div className="text-[10px] text-slate-600">{day.shortDate}</div>
          </div>
        ))}
      </div>

      {/* Row 2: Y-axis + tracks — perfectly aligned */}
      <div className="flex gap-2">
        {/* Y-axis labels */}
        <div className="relative shrink-0 w-8" style={{ height: TRACK_H }}>
          {TIME_AXIS.map(({ label, pct }) => (
            <span
              key={label}
              className="absolute right-1 text-[10px] leading-none text-slate-500"
              style={{
                top: `${pct}%`,
                transform:
                  pct === 0
                    ? "translateY(0)"
                    : pct === 100
                      ? "translateY(-100%)"
                      : "translateY(-50%)",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Day tracks */}
        {days.map((day) => {
          const isSelected = selectedDay === day.dateKey;
          return (
            <div key={day.dateKey} className="flex flex-col flex-1 min-w-0">
              {/* Track — clickable */}
              <div
                className={`relative rounded-lg border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-slate-700/60 border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                    : "bg-slate-900/50 border-white/5 hover:border-white/15"
                }`}
                style={{ height: TRACK_H }}
                onClick={() => setSelectedDay(isSelected ? null : day.dateKey)}
              >
                {/* Grid lines */}
                {TIME_AXIS.map(({ label, pct }) => (
                  <div
                    key={label}
                    className="absolute left-0 right-0 border-t border-white/[0.06]"
                    style={{ top: `${pct}%` }}
                  />
                ))}

                {/* "Now" indicator — today only */}
                {day.isToday && (
                  <div
                    className="absolute left-0 right-0 z-10 pointer-events-none"
                    style={{ top: `${currentNowPct}%` }}
                  >
                    <div className="absolute -left-px -right-px h-px bg-rose-500 opacity-70" />
                    <div className="absolute left-1 -top-[3px] w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </div>
                )}

                {/* Meal markers */}
                {day.meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="absolute left-1.5 right-1.5 rounded-full h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 opacity-75"
                    style={{
                      top: `${mealTopPct(meal.timestamp)}%`,
                      transform: "translateY(-50%)",
                    }}
                  />
                ))}
              </div>

              {/* Meal count badge, Fasting duration & Daily calories */}
              <div className="mt-1.5 flex flex-col items-center">
                <span className="text-[10px] text-slate-500" title="Meals today">
                  {day.meals.length > 0 ? `${day.meals.length} meals` : "—"}
                </span>
                <span
                  className="text-[16px] font-medium text-pink-400 mt-0.5"
                  title="Fasting duration before first meal"
                >
                  {day.fastingHours || ""}
                </span>
                {day.dailyCalories !== null && (
                  <span
                    className="flex items-center gap-0.5 text-[10px] text-orange-400/80 mt-0.5"
                    title="Total calories logged"
                  >
                    <Flame size={10} />
                    {day.dailyCalories} kcal
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded day meal list */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          selectedDay ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        {(() => {
          const day = days.find((d) => d.dateKey === selectedDay);
          if (!day) return null;
          return (
            <div className="bg-slate-900/60 border border-violet-500/20 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-violet-400">
                  {day.label} — {day.shortDate}
                </span>
                <span className="text-[10px] text-slate-500">
                  {day.meals.length} meal{day.meals.length !== 1 ? "s" : ""}
                </span>
              </div>
              {day.meals.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-500 italic">No meals recorded.</p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {day.meals.map((meal) => (
                    <li key={meal.id} className="px-4 py-2.5 flex items-center justify-between">
                      <span className="text-sm text-slate-100">{meal.meal}</span>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        {meal.calories !== undefined && (
                          <span className="flex items-center gap-0.5 text-[11px] text-orange-400/80">
                            <Flame size={10} />
                            {meal.calories} kcal
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{formatShortTime(meal.timestamp)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
