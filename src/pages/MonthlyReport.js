import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function MonthlyReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    setLoading(true);
    // Fetching from the View we created in SQL
    const { data } = await supabase
      .from('monthly_revenue_report')
      .select('*')
      .order('admin_zone');
    
    setReportData(data || []);
    setLoading(false);
  }

  const calculateTotal = (key) => reportData.reduce((acc, curr) => acc + Number(curr[key]), 0);

  if (loading) return <div className="p-20 text-center font-bold">Generating Financial Insights...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-black text-slate-900">Bureau Performance Report</h1>
        <p className="text-slate-500 font-medium">Monthly revenue and conversion breakdown by Admin Zone</p>
      </header>

      <main className="max-w-6xl mx-auto space-y-10">
        
        {/* TOP STATS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Total Revenue</p>
            <h2 className="text-4xl font-black mt-2">₹{calculateTotal('total_revenue')}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Confirmed</p>
            <h2 className="text-4xl font-black text-slate-800 mt-2">{calculateTotal('confirmed_tuitions')}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Global Success Rate</p>
            <h2 className="text-4xl font-black text-slate-800 mt-2">
              {Math.round((calculateTotal('confirmed_tuitions') / calculateTotal('total_tuitions')) * 100) || 0}%
            </h2>
          </div>
        </div>

        {/* ADMIN-WISE COMPARISON TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-6 font-bold uppercase text-xs">Admin Zone</th>
                <th className="p-6 font-bold uppercase text-xs">Total Inquiries</th>
                <th className="p-6 font-bold uppercase text-xs">Confirmed</th>
                <th className="p-6 font-bold uppercase text-xs text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-blue-50 transition">
                  <td className="p-6 font-black text-slate-700">{row.admin_zone}</td>
                  <td className="p-6 text-slate-600 font-medium">{row.total_tuitions}</td>
                  <td className="p-6">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      {row.confirmed_tuitions} Successes
                    </span>
                  </td>
                  <td className="p-6 text-right font-black text-blue-700 text-lg">
                    ₹{row.total_revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* INSIGHTS FOOTER */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">Business Health Check</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase">Top Performing Branch</p>
              <p className="text-lg font-bold text-slate-700 mt-1">
                {reportData.length > 0 ? reportData.sort((a,b) => b.total_revenue - a.total_revenue)[0].admin_zone : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase">Average Ticket Size</p>
              <p className="text-lg font-bold text-slate-700 mt-1">
                ₹{Math.round(calculateTotal('total_revenue') / calculateTotal('confirmed_tuitions')) || 0} / Tuition
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}