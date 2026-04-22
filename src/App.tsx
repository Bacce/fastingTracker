import { useState } from "react";
import { AddMealForm } from "./components/AddMealForm";
import { MealCard } from "./components/MealCard";
import { FastingStatus } from "./components/FastingStatus";
import { WeeklyTimeline } from "./components/WeeklyTimeline";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMealAdded = () => setRefreshKey((k) => k + 1);

  return (
    <div className="max-w-[480px] mx-auto min-h-screen px-4 py-6 flex flex-col gap-6">
      <FastingStatus refreshKey={refreshKey} />
      <AddMealForm onMealAdded={handleMealAdded} />
      <WeeklyTimeline refreshKey={refreshKey} />
      <MealCard refreshKey={refreshKey} />
    </div>
  );
}

export default App;
