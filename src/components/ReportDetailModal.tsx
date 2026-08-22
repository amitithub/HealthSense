import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  GitCompare, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Sparkles, 
  Edit3,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { MedicalReport, FamilyMember } from '../types';

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: MedicalReport | null;
  patient?: FamilyMember;
  onEdit: (report: MedicalReport) => void;
  onCompareWithOthers: (reportId: string) => void;
  onShareWithDoctor: (report: MedicalReport) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  isOpen,
  onClose,
  report,
  patient,
  onEdit,
  onCompareWithOthers,
  onShareWithDoctor,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'document' | 'markers'>('overview');

  if (!isOpen || !report) return null;

  const abnormalMarkers = report.markers.filter((m) => m.flag !== 'Normal');
  const isImage = report.fileType.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif|bmp)$/i.test(report.fileName);
  const isPdf = report.fileType === 'application/pdf' || /\.pdf$/i.test(report.fileName);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (report.fileDataUrl) {
      const a = document.createElement('a');
      a.href = report.fileDataUrl;
      a.download = report.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a printable text backup file
      const reportText = `
CLINICAL REPORT: ${report.title}
Patient: ${report.memberName}
Date of Test: ${report.reportDate}
Facility: ${report.labName}
Ordering Doctor: ${report.orderingDoctor}
Status: ${report.status}

SUMMARY:
${report.summary}

LAB BIOMARKERS:
${report.markers.map((m) => `${m.name}: ${m.value !== null ? m.value : m.textValue} ${m.unit} [Ref: ${m.referenceRangeText || 'N/A'}] - ${m.flag}`).join('\n')}

DOCTOR NOTES:
${report.doctorNotes || 'None'}
`;
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.fileName.replace(/\.[^/.]+$/, '')}_Report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div 
        id="report-detail-inspector"
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:max-h-none print:shadow-none print:border-none print:rounded-none"
      >
        {/* Top Header Controls */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 leading-tight truncate max-w-md sm:max-w-xl">
                  {report.title}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {report.category}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-800">{report.memberName}</strong> • Date: {report.reportDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="detail-print-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              title="Print Clinical Summary"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              id="detail-download-btn"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              title="Download Document"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              id="detail-compare-btn"
              onClick={() => {
                onCompareWithOthers(report.id);
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer"
              title="Compare with other reports"
            >
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </button>

            <button
              id="detail-share-btn"
              onClick={() => {
                onShareWithDoctor(report);
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"
              title="Doctor Share"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              id="detail-edit-btn"
              onClick={() => {
                onEdit(report);
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
              title="Edit Report"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              id="detail-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center justify-between print:hidden">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview & Biomarkers ({report.markers.length})
            </button>
            <button
              onClick={() => setActiveTab('document')}
              className={`py-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'document'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Document & Scan Viewer</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-normal">
                {report.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Status:{' '}
            <span className={`font-bold ${
              report.status === 'Normal'
                ? 'text-emerald-600'
                : report.status === 'Critical'
                ? 'text-rose-600'
                : 'text-amber-600'
            }`}>
              {report.status}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* PRINT ONLY CLINICAL HEADER */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-slate-900">CLINICAL LABORATORY REPORT SUMMARY</h1>
                <p className="text-sm font-semibold text-slate-700">{report.title}</p>
                <p className="text-xs text-slate-500">Facility: {report.labName} • Ordering Physician: {report.orderingDoctor}</p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p><strong>Patient:</strong> {report.memberName}</p>
                <p><strong>Date:</strong> {report.reportDate}</p>
                <p><strong>Status:</strong> {report.status}</p>
              </div>
            </div>
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Metadata Banner Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Patient Profile</span>
                  <strong className="text-slate-900 text-sm">{report.memberName}</strong>
                  {patient && <span className="text-slate-500 block">({patient.relationship}, Age {patient.age || 'N/A'})</span>}
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Test Encounter Date</span>
                  <strong className="text-slate-900 text-sm">{report.reportDate}</strong>
                  {report.followUpDate && <span className="text-indigo-600 block">Follow-up: {report.followUpDate}</span>}
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Diagnostic Facility</span>
                  <strong className="text-slate-900 text-sm">{report.labName || 'Diagnostic Lab'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Ordering Doctor</span>
                  <strong className="text-slate-900 text-sm">{report.orderingDoctor || 'Physician'}</strong>
                </div>
              </div>

              {/* Clinical Summary & Key Findings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Clinical Executive Summary
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {report.summary || 'No narrative summary entered for this record.'}
                    </p>
                  </div>

                  {report.doctorNotes && (
                    <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 space-y-1.5">
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-700" />
                        Physician Advice & Prescription Adjustments
                      </h4>
                      <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                        {report.doctorNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Key Findings Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Key Clinical Findings
                  </h4>
                  {report.keyFindings && report.keyFindings.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {report.keyFindings.map((finding, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">No specific flags noted.</p>
                  )}
                </div>
              </div>

              {/* Lab Biomarkers Detailed Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Laboratory Biomarkers & Quantitative Results ({report.markers.length})
                  </h3>
                  {abnormalMarkers.length > 0 && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      {abnormalMarkers.length} Attention Flag(s)
                    </span>
                  )}
                </div>

                {report.markers.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No discrete lab biomarkers were recorded in this document.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Test Parameter</th>
                          <th className="py-2.5 px-3">Measured Result</th>
                          <th className="py-2.5 px-3">Unit</th>
                          <th className="py-2.5 px-3">Clinical Reference Range</th>
                          <th className="py-2.5 px-3">Clinical Flag</th>
                          <th className="py-2.5 px-3">Status Interpretation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {report.markers.map((marker) => {
                          const isHigh = marker.flag === 'High' || marker.flag === 'Critical';
                          const isLow = marker.flag === 'Low';
                          const isNormal = marker.flag === 'Normal';

                          return (
                            <tr 
                              key={marker.id} 
                              className={`hover:bg-slate-50/80 transition ${
                                marker.flag === 'Critical' ? 'bg-rose-50/40' : marker.flag === 'High' ? 'bg-amber-50/30' : ''
                              }`}
                            >
                              <td className="py-2.5 px-4 font-bold text-slate-900">
                                {marker.name}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`text-sm font-extrabold ${
                                  marker.flag === 'Critical'
                                    ? 'text-rose-700'
                                    : marker.flag === 'High'
                                    ? 'text-amber-700'
                                    : marker.flag === 'Low'
                                    ? 'text-blue-700'
                                    : 'text-slate-900'
                                }`}>
                                  {marker.value !== null ? marker.value : marker.textValue || '—'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 font-medium">
                                {marker.unit || '—'}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {marker.referenceRangeText || (
                                  marker.minRef !== null && marker.maxRef !== null && marker.minRef !== undefined && marker.maxRef !== undefined
                                    ? `${marker.minRef} - ${marker.maxRef} ${marker.unit}`
                                    : 'Standard Range'
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                                  marker.flag === 'Critical'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : marker.flag === 'High'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : marker.flag === 'Low'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                  {marker.flag === 'Critical' && <AlertCircle className="w-3 h-3" />}
                                  {marker.flag === 'High' && <AlertTriangle className="w-3 h-3" />}
                                  {marker.flag === 'Normal' && <CheckCircle2 className="w-3 h-3" />}
                                  {marker.flag}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                                {isNormal && 'Within optimal target range'}
                                {isHigh && (marker.flag === 'Critical' ? 'Significantly above threshold' : 'Elevated above reference target')}
                                {isLow && 'Below normal reference limit'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* DOCUMENT / SCAN VIEWER TAB */}
          {activeTab === 'document' && (
            <div className="space-y-4">
              {/* Document Toolbar */}
              <div className="flex flex-wrap items-center justify-between bg-slate-900 text-white p-3 rounded-xl gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold truncate max-w-xs">{report.fileName}</span>
                  <span className="text-[11px] text-slate-400">({report.fileType})</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {isImage && (
                    <>
                      <button
                        onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-mono text-slate-300 w-10 text-center">
                        {zoomLevel}%
                      </span>
                      <button
                        onClick={() => setZoomLevel(Math.min(300, zoomLevel + 25))}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRotation((rotation + 90) % 360)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                        title="Rotate"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setHighContrast(!highContrast)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                          highContrast ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {highContrast ? 'High Contrast: ON' : 'Enhance Contrast'}
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Viewer Canvas Container */}
              <div className="bg-slate-950 rounded-xl p-4 min-h-[400px] max-h-[70vh] overflow-auto flex flex-col gap-6 items-center border border-slate-800">
                {(report.attachments && report.attachments.length > 0
                  ? report.attachments
                  : [{
                      fileName: report.fileName,
                      fileType: report.fileType,
                      fileDataUrl: report.fileDataUrl,
                      fileTextContent: report.fileTextContent
                    }]
                ).map((att, idx) => {
                  const attIsImage = att.fileType.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif|bmp)$/i.test(att.fileName);
                  const attIsPdf = att.fileType === 'application/pdf' || /\.pdf$/i.test(att.fileName);

                  if (!att.fileDataUrl && !att.fileTextContent) {
                    return (
                      <div key={idx} className="w-full text-center p-8 text-slate-500 text-xs bg-slate-900 rounded-lg">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                        <p className="font-semibold text-slate-400">{att.fileName}</p>
                        <p className="mt-1">This report was recorded with direct lab metrics.</p>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="w-full flex flex-col items-center bg-slate-900/50 p-2 rounded-lg relative">
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                        {att.fileName}
                      </div>
                      {att.fileDataUrl ? (
                        attIsImage ? (
                          <div className="transition-transform duration-150 flex items-center justify-center pt-8">
                            <img
                              src={att.fileDataUrl}
                              alt="Medical Document Scan"
                              style={{
                                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                                filter: highContrast ? 'contrast(160%) brightness(95%) grayscale(20%)' : 'none',
                              }}
                              className="max-h-[550px] object-contain rounded shadow-lg"
                            />
                          </div>
                        ) : attIsPdf ? (
                          <div className="w-full h-[550px] bg-slate-900 rounded-lg flex flex-col items-center justify-center p-6 text-white text-center pt-8">
                            <FileText className="w-16 h-16 text-indigo-400 mb-3" />
                            <h4 className="text-base font-bold">{att.fileName}</h4>
                            <div className="flex gap-2 mt-4">
                              <a
                                href={att.fileDataUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>Open in Full Tab</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full max-w-2xl bg-slate-900 p-4 rounded-lg text-slate-200 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-[500px] pt-8">
                            {att.fileTextContent || 'File uploaded.'}
                          </div>
                        )
                      ) : (
                        <div className="w-full max-w-2xl bg-slate-900 p-4 rounded-lg text-slate-200 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-[500px] pt-8">
                          {att.fileTextContent || 'Text file content rendered.'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <div className="flex items-center gap-2">
            <span>Tags:</span>
            {report.tags?.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px]">
                #{tag}
              </span>
            ))}
          </div>
          <button
            id="detail-done-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
