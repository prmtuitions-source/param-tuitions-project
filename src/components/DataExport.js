import { supabase } from '../utils/supabaseClient';
import Papa from 'papaparse';

export default function DataExport() {
  
  const exportTable = async (tableName) => {
    // 1. Fetch all data for the requested table
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      alert(`Error exporting ${tableName}: ` + error.message);
      return;
    }

    // 2. Convert JSON to CSV
    const csv = Papa.unparse(data);

    // 3. Create a download link and click it automatically
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Param_Tuitions_${tableName}_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <h3 className="text-xl font-black text-slate-800 mb-6">Master Data Backup</h3>
      <p className="text-sm text-slate-500 mb-6">
        Download your latest bureau records as CSV files for offline storage.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => exportTable('profiles')}
          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border transition group"
        >
          <span className="font-bold text-slate-700">All Users (Teachers/Parents)</span>
          <span className="text-blue-600 group-hover:translate-y-1 transition">⬇️</span>
        </button>

        <button 
          onClick={() => exportTable('tuitions')}
          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border transition group"
        >
          <span className="font-bold text-slate-700">Revenue & Tuition Records</span>
          <span className="text-blue-600 group-hover:translate-y-1 transition">⬇️</span>
        </button>

        <button 
          onClick={() => exportTable('teacher_details')}
          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border transition group"
        >
          <span className="font-bold text-slate-700">Teacher Qualifications</span>
          <span className="text-blue-600 group-hover:translate-y-1 transition">⬇️</span>
        </button>

        <button 
          onClick={() => exportTable('applications')}
          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border transition group"
        >
          <span className="font-bold text-slate-700">Full Application History</span>
          <span className="text-blue-600 group-hover:translate-y-1 transition">⬇️</span>
        </button>
      </div>
    </div>
  );
}