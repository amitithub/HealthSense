import React, { useState, useMemo, useEffect } from 'react';
import { 
  GitCompare, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Share2, 
  Printer, 
  ArrowRight,
  Filter,
  Activity,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { MedicalReport, FamilyMember, ComparisonReportInsight } from '../types';
import { AIService } from '../services/aiService';

interface ReportComparisonViewProps {
  reports: MedicalReport[];
  members: FamilyMember[];
  selectedMemberId: string;
  selectedReportIds: string[];
  onToggleReportSelection: (id: string) => void;
  onOpenDoctorShare: (selectedReports: MedicalReport[]) => void;
}

export const ReportComparisonView: React.FC<ReportComparisonViewProps> = ({
  reports,
  members,
  selectedMemberId,
  selectedReportIds,
  onToggleReportSelection,
  onOpenDoctorShare,
}) => {
  const [filterMemberId, setFilterMemberId] = useState<string>(selectedMemberId !== 'all' ? selectedMemberId : 'all');
  const [aiInsight, setAiInsight] = useState<ComparisonReportInsight | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [selectedChartMetric, setSelectedChartMetric] = useState<string>('all');

  // Filter available reports based on member selection
  const availableReports = useMemo(() => {
    let list = reports;
    if (filterMemberId !== 'all') {
      list = list.filter((r) => r.memberId === filterMemberId);
    }
    return list.sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime());
  }, [reports, filterMemberId]);

  // Chosen reports sorted chronologically
  const activeCompareReports = useMemo(() => {
    return reports
      .filter((r) => selectedReportIds.includes(r.id))
      .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime());
  }, [reports, selectedReportIds]);

  // Extract all unique biomarker names across the compared reports
  const allMarkerNames = useMemo(() => {
    const namesSet = new Set<string>();
    activeCompareReports.forEach((r) => {
      r.markers.forEach((m) => {
        if (m.name) namesSet.add(m.name.trim());
      });
    });
    return Array.from(namesSet);
  }, [activeCompareReports]);

  // Generate comparison rows with delta calculations
  const comparisonRows = useMemo(() => {
    return allMarkerNames.map((markerName) => {
      const records = activeCompareReports.map((report) => {
        const found = report.markers.find(
          (m) => m.name.trim().toLowerCase() === markerName.toLowerCase()
        );
        return {
          reportId: report.id,
          reportDate: report.reportDate,
          marker: found,
        };
      });

      // Find earliest available numeric value and latest available numeric value
      const validNumeric = records.filter((r) => r.marker && r.marker.value !== null);
      let deltaPercent: number | null = null;
      let assessment: 'Improved' | 'Worsened' | 'Stable' | 'N/A' = 'N/A';

      if (validNumeric.length >= 2) {
        const firstVal = validNumeric[0].marker!.value!;
        const lastVal = validNumeric[validNumeric.length - 1].marker!.value!;
        if (firstVal !== 0) {
          deltaPercent = parseFloat((((lastVal - firstVal) / firstVal) * 100).toFixed(1));
        }

        const lastMarker = validNumeric[validNumeric.length - 1].marker!;
        const firstMarker = validNumeric[0].marker!;

        // Assessment heuristics:
        // For Glucose, HbA1c, Cholesterol, Triglycerides, Creatinine, lower (toward normal) is improvement
        // For HDL, Vitamin D, eGFR, higher is improvement
        const isHigherBetter = /hdl|egfr|vitamin\s*d|hemoglobin/i.test(markerName);

        if (lastMarker.flag === 'Normal' && firstMarker.flag !== 'Normal') {
          assessment = 'Improved';
        } else if (lastMarker.flag === 'Critical' || (firstMarker.flag === 'Normal' && lastMarker.flag !== 'Normal')) {
          assessment = 'Worsened';
        } else if (deltaPercent !== null) {
          if (isHigherBetter) {
            assessment = deltaPercent > 2 ? 'Improved' : deltaPercent < -2 ? 'Worsened' : 'Stable';
          } else {
            assessment = deltaPercent < -2 ? 'Improved' : deltaPercent > 2 ? 'Worsened' : 'Stable';
          }
        }
      }

      const unit = records.find((r) => r.marker?.unit)?.marker?.unit || '';
      const refRange = records.find((r) => r.marker?.referenceRangeText)?.marker?.referenceRangeText || '';

      return {
        markerName,
        unit,
        refRange,
        records,
        deltaPercent,
        assessment,
      };
    });
  }, [allMarkerNames, activeCompareReports]);

  // Chart data formatting for Recharts
  const chartData = useMemo(() => {
    const dateCounts: Record<string, number> = {};

    return activeCompareReports.map((report) => {
      let uniqueDate = report.reportDate;
      if (dateCounts[uniqueDate] !== undefined) {
        dateCounts[uniqueDate] += 1;
        uniqueDate = `${uniqueDate} (V${dateCounts[uniqueDate]})`;
      } else {
        dateCounts[uniqueDate] = 1;
      }

      const entry: any = {
        date: uniqueDate, // Unique label prevents Recharts from merging overlapping points
        title: report.title,
      };
      
      report.markers.forEach((m) => {
        if (m.value !== null && !isNaN(m.value)) {
          entry[m.name] = m.value;
        }
      });
      return entry;
    });
  }, [activeCompareReports]);

  // Generate AI comparison insight
  const fetchAIComparison = async () => {
    if (activeCompareReports.length < 2) return;
    setIsLoadingAI(true);
    const activeMember = members.find((m) => m.id === activeCompareReports[0]?.memberId);

    try {
      const res = await AIService.compareReports(activeCompareReports, activeMember);
      if (res.success && res.comparison) {
        setAiInsight(res.comparison);
      }
    } catch (e) {
      console.error('AI comparison error:', e);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    if (activeCompareReports.length >= 2) {
      fetchAIComparison();
    } else {
      setAiInsight(null);
    }
  }, [activeCompareReports.length, selectedReportIds]);

  // Quick Select Preset (e.g. All reports for a member)
  const selectAllForMember = (memberId: string) => {
    const memReports = reports.filter((r) => r.memberId === memberId).map((r) => r.id);
    memReports.forEach((id) => {
      if (!selectedReportIds.includes(id)) {
        onToggleReportSelection(id);
      }
    });
  };

  const clearSelection = () => {
    selectedReportIds.forEach((id) => onToggleReportSelection(id));
  };

  const chartColors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

  return (
    <div id="report-comparison-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner / Selection bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <GitCompare className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Side-by-Side Clinical Report Comparison
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select 2 or more reports to track quantitative progress, delta improvements, and trajectory over time
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeCompareReports.length >= 2 && (
              <button
                id="share-comparison-doctor-btn"
                onClick={() => onOpenDoctorShare(activeCompareReports)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Comparison with Doctor</span>
              </button>
            )}

            {selectedReportIds.length > 0 && (
              <button
                id="clear-comparison-selection-btn"
                onClick={clearSelection}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
              >
                Clear Selection ({selectedReportIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Filter Reports by Member & Selectable Pills */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              Select Reports to Compare ({selectedReportIds.length} Selected):
            </span>

            {filterMemberId !== 'all' && (
              <button
                onClick={() => selectAllForMember(filterMemberId)}
                className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                Select all for this profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {availableReports.map((report) => {
              const isSelected = selectedReportIds.includes(report.id);
              return (
                <div
                  key={report.id}
                  onClick={() => onToggleReportSelection(report.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleReportSelection(report.id)}
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {report.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{report.memberName}</span>
                      <span className="font-semibold text-slate-700">{report.reportDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* STATE 1: Less than 2 reports selected prompt */}
      {activeCompareReports.length < 2 && (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <GitCompare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Select at least 2 reports to generate clinical comparison
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Check the boxes above on two or more historical lab reports (for example, John Miller&apos;s Jan 2025 vs Jul 2025 vs Jan 2026 reports) to visualize biomarker trends and progress.
          </p>
          {reports.length >= 2 && (
            <button
              onClick={() => {
                // Pre-select first 2-3 reports
                const firstTwo = reports.slice(0, 3).map((r) => r.id);
                firstTwo.forEach((id) => {
                  if (!selectedReportIds.includes(id)) onToggleReportSelection(id);
                });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Comparison (John Miller Baseline vs Progress)</span>
            </button>
          )}
        </div>
      )}

      {/* STATE 2: Full Comparison Matrix & Analytics */}
      {activeCompareReports.length >= 2 && (
        <div className="space-y-6">
          
          {/* AI Clinical Comparison Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Gemini AI Longitudinal Clinical Assessment
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Comparing {activeCompareReports.length} reports from {activeCompareReports[0]?.reportDate} to {activeCompareReports[activeCompareReports.length - 1]?.reportDate}
                  </p>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-200">
                {aiInsight?.overallTrend || 'Multi-Encounter Progress Evaluated'}
              </div>
            </div>

            {isLoadingAI ? (
              <div className="py-6 text-center text-xs text-indigo-200 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Generating physician-grade comparative analysis...</span>
              </div>
            ) : aiInsight ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Summary & Improvements */}
                <div className="space-y-3 md:col-span-2">
                  <p className="text-slate-200 leading-relaxed text-xs">
                    {aiInsight.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Positive Improvements */}
                    <div className="bg-emerald-950/50 border border-emerald-500/30 p-3 rounded-xl space-y-1.5">
                      <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 uppercase text-[11px]">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Positive Improvements
                      </h4>
                      <ul className="space-y-1 text-slate-300 text-[11px]">
                        {aiInsight.improvements?.map((imp, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-emerald-400">•</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas for Attention */}
                    <div className="bg-amber-950/50 border border-amber-500/30 p-3 rounded-xl space-y-1.5">
                      <h4 className="font-bold text-amber-300 flex items-center gap-1.5 uppercase text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Markers to Monitor
                      </h4>
                      <ul className="space-y-1 text-slate-300 text-[11px]">
                        {aiInsight.concerningChanges?.map((conc, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-amber-400">•</span>
                            <span>{conc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Doctor Discussion Points */}
                <div className="bg-indigo-950/70 border border-indigo-700/50 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-indigo-200 uppercase text-[11px] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                    Recommended Questions for Doctor
                  </h4>
                  <ul className="space-y-2 text-slate-300 text-[11px]">
                    {aiInsight.doctorDiscussionPoints?.map((q, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          {/* Interactive Biomarker Trend Chart (Recharts) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Chronological Trajectory Chart
                </h3>
                <p className="text-xs text-slate-500">
                  Visual trend line across recorded test dates
                </p>
              </div>

              {/* Metric filter for chart */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Highlight:</span>
                <select
                  value={selectedChartMetric}
                  onChange={(e) => setSelectedChartMetric(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="all">All Available Markers</option>
                  {allMarkerNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-72 w-full pt-2">
              {allMarkerNames.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                  <AlertCircle className="w-8 h-8 mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">No Biomarkers Found</p>
                  <p className="text-xs">The selected reports do not contain any recorded lab metrics to plot.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.75rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    {allMarkerNames
                      .filter((name) => selectedChartMetric === 'all' || selectedChartMetric === name)
                      .map((markerName, index) => (
                        <Line
                          key={markerName}
                          type="monotone"
                          dataKey={markerName}
                          stroke={chartColors[index % chartColors.length]}
                          strokeWidth={2.5}
                          activeDot={{ r: 6 }}
                          connectNulls
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Side-by-Side Parameter Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Side-by-Side Lab Biomarkers Comparison Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Direct delta comparison across {activeCompareReports.length} test instances
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-600 bg-slate-200/60 px-2.5 py-1 rounded-md">
                {comparisonRows.length} Parameters Matched
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 min-w-[180px]">Test Parameter & Reference</th>
                    {activeCompareReports.map((r, i) => (
                      <th key={r.id} className="py-3 px-4 min-w-[140px]">
                        <div className="font-bold text-slate-900">{r.reportDate}</div>
                        <div className="text-[10px] text-slate-500 font-normal truncate max-w-[130px]">
                          {r.title}
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-4 min-w-[110px] text-center">Net Delta ($\Delta$)</th>
                    <th className="py-3 px-4 min-w-[120px] text-center">Clinical Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {comparisonRows.map((row) => (
                    <tr key={row.markerName} className="hover:bg-slate-50/80 transition">
                      
                      {/* Parameter Name & Range */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{row.markerName}</div>
                        <div className="text-[10px] text-slate-400">
                          {row.unit} {row.refRange ? `• Ref: ${row.refRange}` : ''}
                        </div>
                      </td>

                      {/* Values per report */}
                      {row.records.map((rec, i) => (
                        <td key={i} className="py-3 px-4">
                          {rec.marker ? (
                            <div className="space-y-0.5">
                              <span className={`text-sm font-extrabold ${
                                rec.marker.flag === 'Critical'
                                  ? 'text-rose-700'
                                  : rec.marker.flag === 'High'
                                  ? 'text-amber-700'
                                  : rec.marker.flag === 'Low'
                                  ? 'text-blue-700'
                                  : 'text-slate-900'
                              }`}>
                                {rec.marker.value !== null ? rec.marker.value : rec.marker.textValue}
                              </span>
                              <div className="text-[10px]">
                                <span className={`px-1.5 py-0.2 rounded font-semibold ${
                                  rec.marker.flag === 'Normal'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : rec.marker.flag === 'Critical'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-50 text-amber-800'
                                }`}>
                                  {rec.marker.flag}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300 italic">Not measured</span>
                          )}
                        </td>
                      ))}

                      {/* Net Delta */}
                      <td className="py-3 px-4 text-center font-bold">
                        {row.deltaPercent !== null ? (
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs ${
                            row.assessment === 'Improved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.assessment === 'Worsened'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {row.deltaPercent > 0 ? `+${row.deltaPercent}%` : `${row.deltaPercent}%`}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Clinical Assessment */}
                      <td className="py-3 px-4 text-center">
                        {row.assessment === 'Improved' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Improved
                          </span>
                        )}
                        {row.assessment === 'Worsened' && (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <TrendingDown className="w-3.5 h-3.5" />
                            Elevated
                          </span>
                        )}
                        {row.assessment === 'Stable' && (
                          <span className="inline-flex items-center gap-1 text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded">
                            <Minus className="w-3.5 h-3.5" />
                            Stable
                          </span>
                        )}
                        {row.assessment === 'N/A' && (
                          <span className="text-slate-400 text-[11px]">Baseline</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
