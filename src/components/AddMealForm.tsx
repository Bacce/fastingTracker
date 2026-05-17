import React, { useState, useEffect } from "react";
import { Utensils, Clock, PlusCircle, Flame, Sparkles, Loader2 } from "lucide-react";
import { addMeal } from "../db";

interface AddMealFormProps {
  onMealAdded: () => void;
}

/** Returns a datetime-local string (YYYY-MM-DDTHH:mm) for the current local time */
const nowLocalString = () => {
  const d = new Date();
  d.setSeconds(0, 0);
  // toISOString gives UTC; offset to local
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};

export function AddMealForm({ onMealAdded }: AddMealFormProps) {
  const [meal, setMeal] = useState("");
  const [time, setTime] = useState(nowLocalString);
  const [calories, setCalories] = useState("");
  const [timeTouched, setTimeTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCalories, setIsFetchingCalories] = useState(false);

  const handleFetchCalories = async () => {
    if (!meal.trim()) return;
    setIsFetchingCalories(true);
    try {
      const response = await fetch("https://calory-api.makosbab.workers.dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": import.meta.env.VITE_API_SECRET || "",
        },
        body: JSON.stringify({ meal: meal.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.calories === "number") {
          setCalories(data.calories.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch calories:", error);
    } finally {
      setIsFetchingCalories(false);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !timeTouched) {
        setTime(nowLocalString());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [timeTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meal.trim()) return;

    setIsSubmitting(true);
    try {
      const timestamp = new Date(time).getTime();
      const kcal = calories !== "" ? parseInt(calories, 10) : undefined;
      await addMeal(meal.trim(), timestamp, kcal);
      setMeal("");
      setCalories("");
      setTime(nowLocalString());
      setTimeTouched(false);
      onMealAdded();
    } catch (error) {
      console.error("Failed to add meal", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-[#f4f0e6] dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-black/10 dark:border-white/5 transition-all duration-300 overflow-hidden">
      {/* Top gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-80" />

      <div className="flex items-center gap-2.5 mb-5">
        <Utensils size={24} className="text-blue-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Log a Meal</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Meal + Calories row */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="meal-input"
              className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wider"
            >
              What did you eat?
            </label>
            <label
              htmlFor="calories-input"
              className="text-xs text-slate-600 font-medium"
            >
              kcal (optional)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center flex-1">
              <Utensils size={18} className="absolute left-4 text-slate-600 dark:text-slate-400" />
              <input
                type="text"
                id="meal-input"
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
                placeholder="e.g. Chicken Salad"
                required
                className="w-full bg-[#fcfaf7] dark:bg-slate-900/50 border border-black/20 dark:border-white/10 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-3.5 rounded-xl text-[15px] transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20 placeholder:text-slate-600"
              />
            </div>
            <div className="relative flex items-center w-24">
              <Flame size={14} className="absolute left-3 text-slate-500 dark:text-slate-500" />
              <input
                type="number"
                id="calories-input"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="450"
                min={0}
                className="w-full bg-[#fcfaf7] dark:bg-slate-900/50 border border-black/20 dark:border-white/10 text-slate-900 dark:text-slate-100 pl-8 pr-2 py-3.5 rounded-xl text-[13px] transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20 placeholder:text-slate-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <button
              type="button"
              onClick={handleFetchCalories}
              disabled={!meal.trim() || isFetchingCalories}
              className="flex items-center justify-center p-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50 disabled:hover:bg-blue-500"
              title="Estimate calories"
            >
              {isFetchingCalories ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Time input */}
        <div className="flex flex-col gap-2 mb-4">
          <label
            htmlFor="time-input"
            className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wider"
          >
            Time
          </label>
          <div className="relative flex items-center">
            <Clock
              size={18}
              className="absolute left-4 text-slate-600 dark:text-slate-400 pointer-events-none"
            />
            <input
              type="datetime-local"
              id="time-input"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                setTimeTouched(true);
              }}
              required
              className="w-full bg-[#fcfaf7] dark:bg-slate-900/50 border border-black/20 dark:border-white/10 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-3.5 rounded-xl text-[15px] transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20 dark:[color-scheme:dark]"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!meal.trim() || isSubmitting}
          className={`w-full mt-6 py-3.5 px-5 rounded-xl text-base font-semibold flex justify-center items-center gap-2 transition-all duration-200 ${!meal.trim() || isSubmitting
            ? "bg-[#e6e2d6] dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-px"
            }`}
        >
          <PlusCircle size={20} />
          {isSubmitting ? "Saving..." : "Add Meal"}
        </button>
      </form>
    </div>
  );
}
