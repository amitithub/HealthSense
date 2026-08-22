import React from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  GitCompare, 
  Share2,
  FileSpreadsheet,
  FileImage,
  Tag
} from 'lucide-react';
import { MedicalReport } from '../types';

interface ReportCardProps {
  report: MedicalReport;
  onViewDetail: (report: MedicalReport) => void;
  onEdit: (report: MedicalReport) => void;
  onDelete: (id: string) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (id: string) => void;
  onQuickShare: (report: MedicalReport) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onViewDetail,
  onEdit,
  onDelete,
  isSelectedForCompare,
  onToggleCompare,
  onQuickShare,
}) => {
  const abnormalMarkers = report.markers.filter((m) => m.flag !== 'Normal');
  const criticalMarkers = report.markers.filter((m) => m.flag === 'Critical');

  const getStatusBadge = () => {
    switch (report.status) {
      case 'Normal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Normal
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            Critical Alert
          </span>
        );
      case 'Needs Attention':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Needs Attention
          </span>
        );
    }
  };

  const isImage = report.fileType.startsWith('image/') || /\.(png|jpg|jpeg|webp)$/i.test(report.fileName);

  return (
    <div 
      id={`report-card-${report.id}`}
      className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
        isSelectedForCompare
          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/10'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div>
        {/* Top Bar: Compare Checkbox, Category, Status */}
        <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3 border-b border-slate-100/80 bg-slate-50/40">
          <div className="flex items-center gap-2.5">
            <label className="relative flex items-center cursor-pointer" title="Select for side-by-side comparison">
              <input
                type="checkbox"
                checked={isSelectedForCompare}
                onChange={() => onToggleCompare(report.id)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition cursor-pointer"
              />
            </label>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {report.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Card Main Info */}
        <div className="p-4 sm:p-5 pt-3.5 space-y-3">
          
          {/* Title & Patient */}
          <div>
            <h3 
              onClick={() => onViewDetail(report)}
              className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition cursor-pointer leading-snug"
            >
              {report.title}
            </h3>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                {report.memberName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {report.reportDate}
              </span>
            </div>
          </div>

          {/* Facility & Doctor info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{report.labName || 'Diagnostic Lab'}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{report.orderingDoctor || 'Physician'}</span>
            </div>
          </div>

          {/* Summary Excerpt */}
          {report.summary && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {report.summary}
            </p>
          )}

          {/* Abnormal / Flagged Biomarkers pills */}
          {report.markers.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Lab Biomarkers ({report.markers.length})</span>
                {abnormalMarkers.length > 0 ? (
                  <span className="text-rose-600 font-bold">
                    {abnormalMarkers.length} abnormal
                  </span>
                ) : (
                  <span className="text-emerald-600">All within range</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {report.markers.slice(0, 4).map((m) => (
                  <span
                    key={m.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                      m.flag === 'Critical'
                        ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold'
                        : m.flag === 'High'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : m.flag === 'Low'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{m.name}:</span>
                    <strong className="font-semibold">{m.value !== null ? m.value : m.textValue}</strong>
                    <span className="text-[10px] opacity-75">{m.unit}</span>
                  </span>
                ))}
                {report.markers.length > 4 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                    +{report.markers.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Attached file indicator */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              {isImage ? <FileImage className="w-3.5 h-3.5 text-indigo-500" /> : <FileText className="w-3.5 h-3.5 text-slate-500" />}
              <span className="truncate">{report.fileName}</span>
            </span>
            {report.followUpDate && (
              <span className="text-indigo-600 font-medium">
                Follow-up: {report.followUpDate}
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            id={`card-view-${report.id}`}
            onClick={() => onViewDetail(report)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>

          <button
            id={`card-compare-btn-${report.id}`}
            onClick={() => onToggleCompare(report.id)}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              isSelectedForCompare
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
            title="Toggle Comparison"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSelectedForCompare ? 'Selected' : 'Compare'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            id={`card-share-${report.id}`}
            onClick={() => onQuickShare(report)}
            className="p-1.5 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
            title="Share with Doctor"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            id={`card-edit-${report.id}`}
            onClick={() => onEdit(report)}
            className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
            title="Edit Report"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            id={`card-delete-${report.id}`}
            onClick={() => {
              if (window.confirm(`Delete "${report.title}"?`)) {
                onDelete(report.id);
              }
            }}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Delete Report"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
