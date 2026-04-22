import { useEffect, useState } from "react";
import { Utensils } from "lucide-react";
import { getMeals } from "../db";

interface MealCardProps {
  /** Increment this value from the parent to trigger a re-fetch */
  refreshKey?: number;
}

interface Meal {
  id: number;
  meal: string;
  timestamp: number;
}

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));

export function MealCard({ refreshKey = 0 }: MealCardProps) {
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    getMeals()
      .then((all) => {
        const sorted = [...all].sort((a, b) => b.timestamp - a.timestamp);
        setMeals(sorted.slice(0, 5) as Meal[]);
      })
      .catch((err) => console.error("Failed to load meals", err));
  }, [refreshKey]);

  if (meals.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
        Recent Logs
      </h3>

      {meals.map((item) => (
        <div
          key={item.id}
          className="bg-slate-900/30 border border-white/5 px-4 py-3 rounded-xl flex items-center gap-3 transition-colors duration-200 hover:bg-slate-900/60"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 shrink-0">
            <Utensils size={15} className="text-blue-400" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-medium text-[15px] text-slate-100 truncate">
              {item.meal}
            </span>
            <span className="text-xs text-slate-400">
              {formatTime(item.timestamp)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
