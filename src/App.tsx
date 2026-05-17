import { useState } from "react";
import { AddMealForm } from "./components/AddMealForm";
import { MealCard } from "./components/MealCard";
import { FastingStatus } from "./components/FastingStatus";
import { WeeklyTimeline } from "./components/WeeklyTimeline";
import { DataImportExport } from "./components/DataImportExport";
import { ThemeSelector } from "./components/ThemeSelector";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMealAdded = () => setRefreshKey((k) => k + 1);

  return (
    <div className="max-w-[480px] mx-auto min-h-screen px-4 py-6 flex flex-col gap-6">
      <FastingStatus refreshKey={refreshKey} />
      <AddMealForm onMealAdded={handleMealAdded} />
      <WeeklyTimeline refreshKey={refreshKey} onMealEdited={handleMealAdded} />
      <MealCard refreshKey={refreshKey} onMealEdited={handleMealAdded} />
      <DataImportExport onImport={handleMealAdded} />
      <ThemeSelector />
    </div>
  );
}

export default App;
