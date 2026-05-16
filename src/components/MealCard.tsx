import { useEffect, useState } from "react";
import { Utensils, Pencil, Check, X, Flame, ChevronDown } from "lucide-react";
import { getMeals, updateMeal } from "../db";

interface MealCardProps {
  refreshKey?: number;
}

interface Meal {
  id: number;
  meal: string;
  timestamp: number;
  calories?: number;
}

// ── helpers ───────────────────────────────────────────────────────────────────

const formatTime = (ts: number) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "numeric",
  }).format(new Date(ts));

/** Local datetime-local string (YYYY-MM-DDTHH:mm) */
const toLocalDTString = (ts: number) => {
  const d = new Date(ts);
  d.setSeconds(0, 0);
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};

// ── component ─────────────────────────────────────────────────────────────────

export function MealCard({ refreshKey = 0 }: MealCardProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMeal, setEditMeal] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editCalories, setEditCalories] = useState("");
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const load = () =>
    getMeals()
      .then((all) => {
        const sorted = [...all].sort((a, b) => b.timestamp - a.timestamp);
        setMeals(sorted.slice(0, 5) as Meal[]);
      })
      .catch((err) => console.error("MealCard:", err));

  useEffect(() => { load(); }, [refreshKey]);

  const startEdit = (m: Meal) => {
    setEditingId(m.id);
    setEditMeal(m.meal);
    setEditTime(toLocalDTString(m.timestamp));
    setEditCalories(m.calories !== undefined ? String(m.calories) : "");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async () => {
    if (editingId === null || !editMeal.trim()) return;
    setSaving(true);
    try {
      const kcal = editCalories !== "" ? parseInt(editCalories, 10) : undefined;
      await updateMeal(editingId, editMeal.trim(), new Date(editTime).getTime(), kcal);
      setEditingId(null);
      await load();
    } catch (err) {
      console.error("Failed to update meal", err);
    } finally {
      setSaving(false);
    }
  };

  if (meals.length === 0) return null;

  return (
    <div className="relative bg-slate-800 rounded-2xl p-6 shadow-xl border border-white/5 overflow-hidden">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-80" />

      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-2.5 group"
        aria-expanded={!collapsed}
      >
        <Utensils size={22} className="text-blue-500" />
        <h2 className="text-lg font-semibold text-slate-100 flex-1 text-left">Recent Meals</h2>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-300 group-hover:text-slate-200 ${collapsed ? "" : "rotate-180"
            }`}
        />
      </button>

      {/* Meal rows */}
      <div
        className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${collapsed ? "max-h-0 opacity-0" : "max-h-[600px] opacity-100 mt-5"
          }`}
      >
        {meals.map((item) =>
          editingId === item.id ? (
            /* ── Edit row ── */
            <div
              key={item.id}
              className="bg-slate-900/40 border border-blue-500/30 px-4 py-3 rounded-xl flex flex-col gap-3"
            >
              <input
                type="text"
                value={editMeal}
                onChange={(e) => setEditMeal(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 text-slate-100 px-3 py-2 rounded-lg text-[14px] focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20"
                placeholder="Meal name"
                autoFocus
              />
              {/* Calories edit */}
              <div className="relative flex items-center">
                <Flame size={15} className="absolute left-3 text-slate-500" />
                <input
                  type="number"
                  value={editCalories}
                  onChange={(e) => setEditCalories(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 text-slate-100 pl-9 pr-3 py-2 rounded-lg text-[14px] focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  placeholder="Calories (optional)"
                  min={0}
                />
              </div>
              <input
                type="datetime-local"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 text-slate-100 px-3 py-2 rounded-lg text-[14px] focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20 [color-scheme:dark]"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  disabled={saving || !editMeal.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg transition-colors duration-150"
                >
                  <Check size={15} />
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold py-2 rounded-lg transition-colors duration-150"
                >
                  <X size={15} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ── Display row ── */
            <div
              key={item.id}
              className="group bg-slate-900/30 border border-white/5 px-4 py-3 rounded-xl flex items-center gap-3 transition-colors duration-200 hover:bg-slate-900/60"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 shrink-0">
                <Utensils size={15} className="text-blue-400" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="font-medium text-[15px] text-slate-100 truncate">
                  {item.meal}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-slate-400">
                    {formatTime(item.timestamp)}
                  </span>
                  {item.calories !== undefined && (
                    <span className="flex items-center gap-0.5 text-xs text-orange-400/80">
                      <Flame size={11} />
                      {item.calories} kcal
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => startEdit(item)}
                className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 shrink-0"
                aria-label="Edit meal"
              >
                <Pencil size={14} />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
