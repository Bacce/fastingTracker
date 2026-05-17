import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { AddMealForm } from "./components/AddMealForm";
import { MealCard } from "./components/MealCard";
import { FastingStatus } from "./components/FastingStatus";
import { WeeklyTimeline } from "./components/WeeklyTimeline";
import { DataImportExport } from "./components/DataImportExport";
import { ThemeSelector } from "./components/ThemeSelector";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Show loading screen for a short time, then start fade out
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // Remove from DOM after fade out completes
      setTimeout(() => setShowLoading(false), 300);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleMealAdded = () => setRefreshKey((k) => k + 1);

  return (
    <>
      {showLoading && (
        <div 
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#e6e0d3] dark:bg-[#0f172a] transition-opacity duration-300 ease-in-out ${
            isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center gap-5">
            <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-500 to-emerald-500 rounded-3xl shadow-2xl shadow-emerald-500/20 rotate-3 animate-[pulse_2s_ease-in-out_infinite]">
              <div className="absolute inset-0 bg-white/20 rounded-3xl blur-md"></div>
              <Flame size={38} className="text-white relative z-10 -rotate-3" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 opacity-90">
              FastTrack
            </h1>
          </div>
        </div>
      )}

      <div className="max-w-[480px] mx-auto min-h-screen px-4 py-6 flex flex-col gap-6">
        <FastingStatus refreshKey={refreshKey} />
        <AddMealForm onMealAdded={handleMealAdded} />
        <WeeklyTimeline refreshKey={refreshKey} onMealEdited={handleMealAdded} />
        <MealCard refreshKey={refreshKey} onMealEdited={handleMealAdded} />
        <DataImportExport onImport={handleMealAdded} />
        <ThemeSelector />
      </div>
    </>
  );
}

export default App;
