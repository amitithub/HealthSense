import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { MedicalReport } from '../types';
import {
  Activity,
  AlertCircle,
  BarChart3,
  LineChart as LineChartIcon,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

interface ChartBuilderProps {
  reports: MedicalReport[];
  selectedMemberId: string;
}

const PALETTE = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#14b8a6', // Teal
];

export const ChartBuilder: React.FC<ChartBuilderProps> = ({ reports, selectedMemberId }) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [timeGrouping, setTimeGrouping] = useState<'exact' | 'month' | 'year'>('exact');
  const [selectedMarker, setSelectedMarker] = useState<string>('');
  const [secondaryMarkers, setSecondaryMarkers] = useState<string[]>([]);
  const [showRefRanges, setShowRefRanges] = useState<boolean>(true);

  // Filter reports by selected member
  const memberReports = useMemo(() => {
    return selectedMemberId === 'all'
      ? reports
      : reports.filter((r) => r.memberId === selectedMemberId);
  }, [reports, selectedMemberId]);

  // Extract all unique numeric biomarkers available
  const availableMarkers = useMemo(() => {
    const markers = new Set<string>();
    memberReports.forEach((report) => {
      report.markers.forEach((m) => {
        if (m.value !== null && m.value !== undefined && !isNaN(m.value)) {
          markers.add(m.name.trim());
        }
      });
    });
    return Array.from(markers).sort();
  }, [memberReports]);

  // Auto-select first marker
  React.useEffect(() => {
    if (availableMarkers.length > 0 && (!selectedMarker || !availableMarkers.includes(selectedMarker))) {
      setSelectedMarker(availableMarkers[0]);
    }
  }, [availableMarkers, selectedMarker]);

  // Active markers to plot
  const activeMarkers = useMemo(() => {
    if (!selectedMarker) return [];
    return [selectedMarker, ...secondaryMarkers.filter((m) => m !== selectedMarker)];
  }, [selectedMarker, secondaryMarkers]);

  // Format and group data chronologically
  const { chartData, minRef, maxRef, unit, stats } = useMemo(() => {
    if (!selectedMarker || memberReports.length === 0) {
      return { chartData: [], minRef: null, maxRef: null, unit: '', stats: null };
    }

    // Sort chronologically
    const sorted = [...memberReports].sort(
      (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
    );

    let foundMinRef: number | null = null;
    let foundMaxRef: number | null = null;
    let foundUnit = '';

    // Grouping map for 'month' or 'year'
    const groupedMap = new Map<string, any>();

    sorted.forEach((report) => {
      let groupKey = report.reportDate;
      const d = new Date(report.reportDate);

      if (timeGrouping === 'month') {
        groupKey = isNaN(d.getTime())
          ? report.reportDate
          : d.toLocaleString('default', { month: 'short', year: 'numeric' });
      } else if (timeGrouping === 'year') {
        groupKey = isNaN(d.getTime()) ? report.reportDate : d.getFullYear().toString();
      }

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          date: groupKey,
          rawDate: report.reportDate,
          title: report.title,
          count: 0,
        });
      }

      const entry = groupedMap.get(groupKey);
      entry.count += 1;

      activeMarkers.forEach((mName) => {
        const marker = report.markers.find(
          (m) => m.name.trim().toLowerCase() === mName.toLowerCase()
        );
        if (marker && marker.value !== null && !isNaN(marker.value)) {
          if (mName === selectedMarker) {
            if (foundMinRef === null && marker.minRef !== null && marker.minRef !== undefined) {
              foundMinRef = marker.minRef;
            }
            if (foundMaxRef === null && marker.maxRef !== null && marker.maxRef !== undefined) {
              foundMaxRef = marker.maxRef;
            }
            if (!foundUnit && marker.unit) foundUnit = marker.unit;
          }

          // If grouped, average values
          if (entry[mName] !== undefined) {
            entry[mName] = Number(((entry[mName] + marker.value) / 2).toFixed(1));
          } else {
            entry[mName] = marker.value;
          }
        }
      });
    });

    const dataArray = Array.from(groupedMap.values());

    // Calculate summary statistics for primary marker
    const values = dataArray
      .map((d) => d[selectedMarker])
      .filter((v) => v !== undefined && v !== null);

    let statsObj = null;
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const latest = values[values.length - 1];
      const first = values[0];
      const delta = values.length > 1 ? Number((latest - first).toFixed(1)) : 0;
      const avg = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));

      statsObj = { min, max, latest, delta, avg, count: values.length };
    }

    return {
      chartData: dataArray,
      minRef: foundMinRef,
      maxRef: foundMaxRef,
      unit: foundUnit,
      stats: statsObj,
    };
  }, [memberReports, activeMarkers, selectedMarker, timeGrouping]);

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <Activity className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Reports in Vault</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs max-w-sm">
          Upload medical reports with test biomarkers to visualize your health trajectories.
        </p>
      </div>
    );
  }

  if (availableMarkers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Biomarkers Found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-md">
          The records for this profile do not contain any recorded numeric test values. Upload a new report using AI Extraction to plot charts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
        
        {/* Header and Chart Type Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Interactive Clinical Chart Builder
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualize longitudinal trends, reference thresholds, and metric deltas across encounters
            </p>
          </div>

          {/* Chart Type & Grouping Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Chart Type */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setChartType('line')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  chartType === 'line'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                <span>Line</span>
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  chartType === 'bar'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Bar</span>
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  chartType === 'area'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Area</span>
              </button>
            </div>

            {/* Time Grouping */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setTimeGrouping('exact')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  timeGrouping === 'exact'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Exact Date
              </button>
              <button
                onClick={() => setTimeGrouping('month')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  timeGrouping === 'month'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                By Month
              </button>
              <button
                onClick={() => setTimeGrouping('year')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  timeGrouping === 'year'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                By Year
              </button>
            </div>
          </div>
        </div>

        {/* Primary Biomarker Selector & Multi-Metric Pill Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Primary Biomarker:
            </label>
            <select
              value={selectedMarker}
              onChange={(e) => setSelectedMarker(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableMarkers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Compare With Additional Biomarkers:
              </label>
              {secondaryMarkers.length > 0 && (
                <button
                  onClick={() => setSecondaryMarkers([])}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Clear secondary
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
              {availableMarkers
                .filter((m) => m !== selectedMarker)
                .map((m) => {
                  const isSelected = secondaryMarkers.includes(m);
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setSecondaryMarkers((prev) =>
                          isSelected ? prev.filter((item) => item !== m) : [...prev, m]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {m}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Statistical Summary Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Latest Reading
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                {stats.latest} <span className="text-[11px] font-normal text-slate-500">{unit}</span>
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Net Trajectory
              </span>
              <span
                className={`text-base font-extrabold mt-0.5 flex items-center gap-1 ${
                  stats.delta > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : stats.delta < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {stats.delta > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : stats.delta < 0 ? (
                  <ArrowDownRight className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                {stats.delta > 0 ? `+${stats.delta}` : stats.delta}
                <span className="text-[10px] font-normal text-slate-500">{unit}</span>
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Average Value
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                {stats.avg} <span className="text-[11px] font-normal text-slate-500">{unit}</span>
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Historical Range
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                {stats.min} – {stats.max}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Clinical Range
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {minRef !== null && maxRef !== null
                  ? `${minRef} - ${maxRef} ${unit}`
                  : minRef !== null
                  ? `> ${minRef} ${unit}`
                  : maxRef !== null
                  ? `< ${maxRef} ${unit}`
                  : 'No standard range'}
              </span>
            </div>
          </div>
        )}

        {/* Main Chart Area */}
        <div className="h-[420px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />

                {showRefRanges && minRef !== null && (
                  <ReferenceLine
                    y={minRef}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{ value: `Min: ${minRef}`, fill: '#10b981', fontSize: 11, position: 'insideBottomLeft' }}
                  />
                )}
                {showRefRanges && maxRef !== null && (
                  <ReferenceLine
                    y={maxRef}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{ value: `Max: ${maxRef}`, fill: '#ef4444', fontSize: 11, position: 'insideTopLeft' }}
                  />
                )}

                {activeMarkers.map((mName, idx) => (
                  <Line
                    key={mName}
                    type="monotone"
                    dataKey={mName}
                    name={`${mName} ${mName === selectedMarker && unit ? `(${unit})` : ''}`}
                    stroke={PALETTE[idx % PALETTE.length]}
                    strokeWidth={3}
                    dot={{ r: 5, fill: PALETTE[idx % PALETTE.length] }}
                    activeDot={{ r: 8 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />

                {showRefRanges && minRef !== null && (
                  <ReferenceLine y={minRef} stroke="#10b981" strokeDasharray="4 4" />
                )}
                {showRefRanges && maxRef !== null && (
                  <ReferenceLine y={maxRef} stroke="#ef4444" strokeDasharray="4 4" />
                )}

                {activeMarkers.map((mName, idx) => (
                  <Bar
                    key={mName}
                    dataKey={mName}
                    name={`${mName} ${mName === selectedMarker && unit ? `(${unit})` : ''}`}
                    fill={PALETTE[idx % PALETTE.length]}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                ))}
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <defs>
                  {activeMarkers.map((mName, idx) => (
                    <linearGradient key={mName} id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE[idx % PALETTE.length]} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={PALETTE[idx % PALETTE.length]} stopOpacity={0.0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />

                {activeMarkers.map((mName, idx) => (
                  <Area
                    key={mName}
                    type="monotone"
                    dataKey={mName}
                    name={`${mName} ${mName === selectedMarker && unit ? `(${unit})` : ''}`}
                    stroke={PALETTE[idx % PALETTE.length]}
                    fillOpacity={1}
                    fill={`url(#grad-${idx})`}
                    strokeWidth={2.5}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

