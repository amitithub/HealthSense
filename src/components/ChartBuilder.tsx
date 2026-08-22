import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { MedicalReport } from '../types';
import { Activity, AlertCircle } from 'lucide-react';

interface ChartBuilderProps {
  reports: MedicalReport[];
  selectedMemberId: string;
}

export const ChartBuilder: React.FC<ChartBuilderProps> = ({ reports, selectedMemberId }) => {
  const [selectedMarker, setSelectedMarker] = useState<string>('');

  // Get a unique list of all numeric markers for the selected member
  const availableMarkers = useMemo(() => {
    const memberReports = selectedMemberId === 'all' 
      ? reports 
      : reports.filter(r => r.memberId === selectedMemberId);
    
    const markers = new Set<string>();
    memberReports.forEach(report => {
      report.markers.forEach(m => {
        if (m.value !== null && m.value !== undefined) {
          markers.add(m.name);
        }
      });
    });
    return Array.from(markers).sort();
  }, [reports, selectedMemberId]);

  // Set default marker if available and none selected
  React.useEffect(() => {
    if (availableMarkers.length > 0 && !selectedMarker) {
      setSelectedMarker(availableMarkers[0]);
    }
  }, [availableMarkers, selectedMarker]);

  // Prepare data for the selected marker
  const chartData = useMemo(() => {
    if (!selectedMarker) return [];
    
    const memberReports = selectedMemberId === 'all' 
      ? reports 
      : reports.filter(r => r.memberId === selectedMemberId);

    // Sort chronologically
    const sorted = [...memberReports].sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime());

    const data: any[] = [];
    let minRef: number | null = null;
    let maxRef: number | null = null;

    sorted.forEach(report => {
      const marker = report.markers.find(m => m.name === selectedMarker);
      if (marker && marker.value !== null) {
        data.push({
          date: report.reportDate,
          title: report.title,
          value: marker.value,
          unit: marker.unit,
        });
        if (minRef === null && marker.minRef !== null) minRef = marker.minRef;
        if (maxRef === null && marker.maxRef !== null) maxRef = marker.maxRef;
      }
    });

    return { data, minRef, maxRef };
  }, [reports, selectedMemberId, selectedMarker]);

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <Activity className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Reports Available</h3>
        <p className="text-slate-500 dark:text-slate-500 mt-2">Upload a medical report with numeric biomarkers to start building charts.</p>
      </div>
    );
  }

  if (availableMarkers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Numeric Biomarkers</h3>
        <p className="text-slate-500 dark:text-slate-500 mt-2">None of the reports for this profile contain numeric lab values.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Biomarker History Chart
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Visualize how your lab results change over time
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Parameter:</label>
            <select
              value={selectedMarker}
              onChange={(e) => setSelectedMarker(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
            >
              {availableMarkers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {chartData.data.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                  labelStyle={{ fontWeight: 'bold', color: '#cbd5e1', marginBottom: '4px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                
                {chartData.minRef !== null && (
                  <ReferenceLine y={chartData.minRef} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'Min Ref', fill: '#10b981', fontSize: 12 }} />
                )}
                {chartData.maxRef !== null && (
                  <ReferenceLine y={chartData.maxRef} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Max Ref', fill: '#ef4444', fontSize: 12 }} />
                )}
                
                <Bar 
                  dataKey="value" 
                  name={`${selectedMarker} ${chartData.data[0]?.unit ? `(${chartData.data[0].unit})` : ''}`}
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-slate-500 dark:text-slate-400">Not enough data to chart.</p>
          </div>
        )}
      </div>
    </div>
  );
};
