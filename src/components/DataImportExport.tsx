import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { getDB } from '../db';

export function DataImportExport({ onImport }: { onImport: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const db = await getDB();
      const meals = await db.getAll('meals');
      const water = await db.getAll('water');

      const data = { meals, water };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `fasting-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        const db = await getDB();
        const tx = db.transaction(['meals', 'water'], 'readwrite');
        
        if (data.meals && Array.isArray(data.meals)) {
          await tx.objectStore('meals').clear();
          for (const meal of data.meals) {
            await tx.objectStore('meals').add(meal);
          }
        }
        
        if (data.water && Array.isArray(data.water)) {
          await tx.objectStore('water').clear();
          for (const w of data.water) {
            await tx.objectStore('water').add(w);
          }
        }

        await tx.done;
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        onImport();
        alert('Data imported successfully!');
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('Failed to import data. Please ensure the file is valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleExport}
        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-200 text-sm font-semibold py-3 px-4 rounded-xl shadow-lg transition-colors duration-200"
      >
        <Download size={16} className="text-blue-400" />
        Export Data
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-200 text-sm font-semibold py-3 px-4 rounded-xl shadow-lg transition-colors duration-200"
      >
        <Upload size={16} className="text-emerald-400" />
        Import Data
      </button>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
