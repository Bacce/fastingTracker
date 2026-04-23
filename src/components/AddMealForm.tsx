import React, { useState, useEffect } from "react";
import { Utensils, Clock, PlusCircle } from "lucide-react";
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
  const [timeTouched, setTimeTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await addMeal(meal.trim(), timestamp);
      setMeal("");
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
    <div className="relative bg-slate-800 rounded-2xl p-6 shadow-xl border border-white/5 transition-all duration-300 overflow-hidden">
      {/* Top gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-80" />

      <div className="flex items-center gap-2.5 mb-5">
        <Utensils size={24} className="text-blue-500" />
        <h2 className="text-lg font-semibold text-slate-100">Log a Meal</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Meal input */}
        <div className="flex flex-col gap-2 mb-4">
          <label
            htmlFor="meal-input"
            className="text-xs text-slate-400 font-medium uppercase tracking-wider"
          >
            What did you eat?
          </label>
          <div className="relative flex items-center">
            <Utensils size={18} className="absolute left-4 text-slate-400" />
            <input
              type="text"
              id="meal-input"
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
              placeholder="e.g. Chicken Salad"
              required
              className="w-full bg-slate-900/50 border border-white/10 text-slate-100 pl-11 pr-4 py-3.5 rounded-xl text-[15px] transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20 placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Time input */}
        <div className="flex flex-col gap-2 mb-4">
          <label
            htmlFor="time-input"
            className="text-xs text-slate-400 font-medium uppercase tracking-wider"
          >
            Time
          </label>
          <div className="relative flex items-center">
            <Clock
              size={18}
              className="absolute left-4 text-slate-400 pointer-events-none"
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
              className="w-full bg-slate-900/50 border border-white/10 text-slate-100 pl-11 pr-4 py-3.5 rounded-xl text-[15px] transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!meal.trim() || isSubmitting}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white border-none py-3.5 px-5 rounded-xl text-base font-semibold cursor-pointer flex justify-center items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-px disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          <PlusCircle size={20} />
          {isSubmitting ? "Saving..." : "Add Meal"}
        </button>
      </form>
    </div>
  );
}
