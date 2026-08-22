import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check, 
  Loader2, 
  Image as ImageIcon, 
  Eye,
  FileCode,
  Calendar,
  User,
  Building,
  Activity,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { MedicalReport, FamilyMember, ReportCategory, ReportStatus, LabMarker, MarkerFlag } from '../types';
import { FileParserService, ParsedFileResult } from '../services/fileParser';
import { AIService } from '../services/aiService';

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  initialMemberId?: string;
  reportToEdit?: MedicalReport | null;
  onSaveReport: (reportData: Omit<MedicalReport, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
}

const CATEGORIES: ReportCategory[] = [
  'Blood Test',
  'Lipid Profile',
  'Metabolic & Diabetes',
  'Thyroid Panel',
  'Cardiology & ECG',
  'Imaging & Radiology',
  'Kidney & Renal',
  'Liver Function',
  'Prescription & Visit',
  'Urine & Stool',
  'Pathology & Biopsy',
  'Vaccination',
  'Other',
];

export const ReportUploadModal: React.FC<ReportUploadModalProps> = ({
  isOpen,
  onClose,
  members,
  initialMemberId,
  reportToEdit,
  onSaveReport,
}) => {
  const [memberId, setMemberId] = useState<string>(initialMemberId || members[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Blood Test');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [labName, setLabName] = useState('');
  const [orderingDoctor, setOrderingDoctor] = useState('');
  const [status, setStatus] = useState<ReportStatus>('Normal');
  const [summary, setSummary] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // File states (supports any format)
  const [fileResult, setFileResult] = useState<ParsedFileResult | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string>('');
  const [existingFileName, setExistingFileName] = useState<string>('');
  const [existingFileType, setExistingFileType] = useState<string>('');
  const [existingFileSize, setExistingFileSize] = useState<number>(0);
  const [showFilePreview, setShowFilePreview] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lab markers
  const [markers, setMarkers] = useState<LabMarker[]>([]);
  const [keyFindings, setKeyFindings] = useState<string[]>([]);

  // AI Extraction state
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (reportToEdit) {
      setMemberId(reportToEdit.memberId);
      setTitle(reportToEdit.title);
      setCategory(reportToEdit.category);
      setReportDate(reportToEdit.reportDate);
      setLabName(reportToEdit.labName);
      setOrderingDoctor(reportToEdit.orderingDoctor);
      setStatus(reportToEdit.status);
      setSummary(reportToEdit.summary || '');
      setDoctorNotes(reportToEdit.doctorNotes || '');
      setTagsText(reportToEdit.tags?.join(', ') || '');
      setFollowUpDate(reportToEdit.followUpDate || '');
      setMarkers(reportToEdit.markers || []);
      setKeyFindings(reportToEdit.keyFindings || []);
      setExistingFileName(reportToEdit.fileName || '');
      setExistingFileType(reportToEdit.fileType || '');
      setExistingFileSize(reportToEdit.fileSize || 0);
      setExistingFileUrl(reportToEdit.fileDataUrl || '');
    } else {
      setMemberId(initialMemberId && initialMemberId !== 'all' ? initialMemberId : members[0]?.id || '');
      setTitle('');
      setCategory('Blood Test');
      setReportDate(new Date().toISOString().split('T')[0]);
      setLabName('');
      setOrderingDoctor('');
      setStatus('Normal');
      setSummary('');
      setDoctorNotes('');
      setTagsText('');
      setFollowUpDate('');
      setMarkers([]);
      setKeyFindings([]);
      setFileResult(null);
      setExistingFileName('');
      setExistingFileType('');
      setExistingFileSize(0);
      setExistingFileUrl('');
    }
    setAiAnalysisError(null);
    setAiSuccessMessage(null);
  }, [reportToEdit, isOpen, initialMemberId, members]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await FileParserService.parseUploadedFile(file);
      setFileResult(parsed);
      
      // If title is empty, pre-fill from filename
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    } catch (err) {
      console.error('File parsing error:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      const parsed = await FileParserService.parseUploadedFile(file);
      setFileResult(parsed);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    } catch (err) {
      console.error('File drop parse error:', err);
    }
  };

  // Run AI extraction
  const handleAIExtract = async () => {
    setIsAnalyzingAI(true);
    setAiAnalysisError(null);
    setAiSuccessMessage(null);

    const activeMember = members.find((m) => m.id === memberId);

    try {
      const result = await AIService.analyzeReport({
        reportText: fileResult?.extractedText || summary || title,
        imageData: fileResult?.isImage ? fileResult.dataUrl : undefined,
        mimeType: fileResult?.fileType,
        patientInfo: activeMember
          ? {
              name: activeMember.name,
              age: activeMember.age,
              gender: activeMember.gender,
              conditions: activeMember.conditions,
            }
          : undefined,
      });

      if (result.success && result.data) {
        const d = result.data;
        if (d.title && !title) setTitle(d.title);
        if (d.category) setCategory(d.category as ReportCategory);
        if (d.reportDate) setReportDate(d.reportDate);
        if (d.labName && !labName) setLabName(d.labName);
        if (d.orderingDoctor && !orderingDoctor) setOrderingDoctor(d.orderingDoctor);
        if (d.status) setStatus(d.status);
        if (d.summary) setSummary(d.summary);
        if (d.keyFindings && d.keyFindings.length > 0) setKeyFindings(d.keyFindings);

        if (d.markers && d.markers.length > 0) {
          const formattedMarkers: LabMarker[] = d.markers.map((m, idx) => ({
            id: `ai-m-${Date.now()}-${idx}`,
            name: m.name,
            value: m.value ?? null,
            textValue: m.textValue,
            unit: m.unit || '',
            minRef: m.minRef ?? null,
            maxRef: m.maxRef ?? null,
            referenceRangeText: m.referenceRangeText || (m.minRef !== undefined && m.maxRef !== undefined ? `${m.minRef} - ${m.maxRef}` : ''),
            flag: m.flag || 'Normal',
          }));
          setMarkers(formattedMarkers);
        }

        setAiSuccessMessage(`Successfully extracted ${d.markers?.length || 0} biomarkers & clinical fields!`);
      } else {
        setAiAnalysisError(result.error || 'Could not automatically extract all parameters.');
      }
    } catch (err: any) {
      setAiAnalysisError(err.message || 'AI extraction failed.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Marker Management
  const addEmptyMarker = () => {
    const newMarker: LabMarker = {
      id: `m-${Date.now()}`,
      name: '',
      value: null,
      unit: 'mg/dL',
      minRef: null,
      maxRef: null,
      referenceRangeText: '',
      flag: 'Normal',
    };
    setMarkers([...markers, newMarker]);
  };

  const updateMarker = (id: string, updates: Partial<LabMarker>) => {
    setMarkers(
      markers.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, ...updates };

        // Auto calculate flag if numeric value and ranges exist
        if (updated.value !== null && updated.minRef !== null && updated.minRef !== undefined && updated.maxRef !== null && updated.maxRef !== undefined) {
          if (updated.value < updated.minRef) {
            updated.flag = 'Low';
          } else if (updated.value > updated.maxRef * 1.5) {
            updated.flag = 'Critical';
          } else if (updated.value > updated.maxRef) {
            updated.flag = 'High';
          } else {
            updated.flag = 'Normal';
          }
        }
        return updated;
      })
    );
  };

  const removeMarker = (id: string) => {
    setMarkers(markers.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedMember = members.find((m) => m.id === memberId);
    const memberName = selectedMember ? selectedMember.name : 'Unknown';

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const reportPayload: Omit<MedicalReport, 'id' | 'createdAt' | 'updatedAt'> = {
      memberId,
      memberName,
      title: title.trim(),
      category,
      reportDate,
      labName: labName.trim() || 'General Diagnostics',
      orderingDoctor: orderingDoctor.trim() || (selectedMember?.primaryDoctor?.name || 'Attending Physician'),
      status,
      fileName: fileResult?.fileName || existingFileName || 'Report_Document.pdf',
      fileType: fileResult?.fileType || existingFileType || 'application/pdf',
      fileSize: fileResult?.fileSize || existingFileSize || 150000,
      fileDataUrl: fileResult?.dataUrl || existingFileUrl || '',
      fileTextContent: fileResult?.extractedText || '',
      markers,
      summary: summary.trim() || `Laboratory evaluation recorded for ${memberName}.`,
      keyFindings: keyFindings.length > 0 ? keyFindings : markers.filter((m) => m.flag !== 'Normal').map((m) => `${m.name}: ${m.value} ${m.unit} (${m.flag})`),
      doctorNotes: doctorNotes.trim(),
      tags: tags.length > 0 ? tags : [category],
      followUpDate: followUpDate || undefined,
    };

    onSaveReport(reportPayload, reportToEdit ? reportToEdit.id : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {reportToEdit ? 'Edit Medical Report' : 'Upload Medical Report'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {reportToEdit ? 'Update details, biomarkers, or status.' : 'Upload file or manually enter lab results.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: File Upload & Drag & Drop Area */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Attach Report Document / Lab Scan (Any Format)
            </label>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                fileResult || existingFileName
                  ? 'border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/60'
                  : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="*/*"
                onChange={handleFileChange}
              />

              {fileResult || existingFileName ? (
                <div className="flex items-center gap-3 w-full max-w-md bg-white p-3 rounded-lg border border-indigo-200 shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    {fileResult?.isImage ? (
                      <ImageIcon className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {fileResult?.fileName || existingFileName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {fileResult ? FileParserService.formatBytes(fileResult.fileSize) : FileParserService.formatBytes(existingFileSize)} • {fileResult?.fileType || existingFileType || 'File loaded'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {(fileResult?.dataUrl || existingFileUrl) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFilePreview(!showFilePreview);
                        }}
                        className="p-1.5 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Toggle Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileResult(null);
                        setExistingFileName('');
                        setExistingFileUrl('');
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Drag and drop your report here, or <span className="text-indigo-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      PDF, JPG/PNG Scans, DICOM images, Word doc, CSV, Text files supported
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* In-Modal Inline Preview if toggled */}
            {showFilePreview && (fileResult?.dataUrl || existingFileUrl) && (
              <div className="mt-3 p-3 bg-slate-900 rounded-xl text-white relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700 text-xs">
                  <span className="font-semibold text-slate-200">Embedded Document Inspector</span>
                  <button
                    type="button"
                    onClick={() => setShowFilePreview(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Close Preview
                  </button>
                </div>
                <div className="mt-2 max-h-72 overflow-auto flex items-center justify-center bg-slate-950 rounded-lg p-2">
                  {fileResult?.isImage || existingFileType.startsWith('image/') ? (
                    <img
                      src={fileResult?.dataUrl || existingFileUrl}
                      alt="Report preview"
                      className="max-h-64 object-contain rounded"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-400 text-xs">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                      <p className="text-slate-300 font-semibold">{fileResult?.fileName || existingFileName}</p>
                      <p className="mt-1">Document loaded for processing.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Smart AI Extraction Banner */}
            <div className="flex flex-wrap items-center justify-between bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 p-3 rounded-xl border border-indigo-100 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">Gemini Clinical Auto-Extractor</h4>
                  <p className="text-[11px] text-indigo-700">
                    Instantly extract lab parameters, reference ranges, and doctor notes from uploaded file
                  </p>
                </div>
              </div>

              <button
                id="ai-auto-extract-btn"
                type="button"
                onClick={handleAIExtract}
                disabled={isAnalyzingAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Auto-Fill Form</span>
                  </>
                )}
              </button>
            </div>

            {aiSuccessMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            {aiAnalysisError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{aiAnalysisError}</span>
              </div>
            )}
          </div>

          {/* Section 2: Core Metadata */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Report Information
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-sm">
              {/* Family Member */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Family Member *
                </label>
                <select
                  id="report-form-member"
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relationship})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report / Test Title *
                </label>
                <input
                  id="report-form-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Comprehensive Metabolic Panel & Lipid Profile"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  id="report-form-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Test / Encounter Date *
                </label>
                <input
                  id="report-form-date"
                  type="date"
                  required
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Status
                </label>
                <select
                  id="report-form-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReportStatus)}
                  className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                    status === 'Normal'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : status === 'Critical'
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                  }`}
                >
                  <option value="Normal">Normal / Optimal</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Critical">Critical Alert</option>
                  <option value="Pending Review">Pending Review</option>
                </select>
              </div>

              {/* Laboratory Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Laboratory / Diagnostic Facility
                </label>
                <input
                  id="report-form-lab"
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="e.g. Quest Diagnostics, Labcorp, Hospital Lab"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Ordering Doctor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ordering / Attending Doctor
                </label>
                <input
                  id="report-form-doctor"
                  type="text"
                  value={orderingDoctor}
                  onChange={(e) => setOrderingDoctor(e.target.value)}
                  placeholder="e.g. Dr. Robert Vance, MD"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Follow-up date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recommended Follow-up Date
                </label>
                <input
                  id="report-form-followup"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Lab Biomarkers & Numerical Values */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Extracted Biomarkers & Test Parameters ({markers.length})
                </label>
                <p className="text-[11px] text-slate-500">
                  These numeric values are used for side-by-side comparison and historical trend curves
                </p>
              </div>

              <button
                id="add-biomarker-row-btn"
                type="button"
                onClick={addEmptyMarker}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Marker</span>
              </button>
            </div>

            {markers.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No lab markers added yet. Click &ldquo;AI Auto-Fill Form&rdquo; above or click &ldquo;Add Marker&rdquo; to input manually.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Parameter Name</th>
                      <th className="py-2 px-2 w-24">Value</th>
                      <th className="py-2 px-2 w-20">Unit</th>
                      <th className="py-2 px-2 w-20">Min Ref</th>
                      <th className="py-2 px-2 w-20">Max Ref</th>
                      <th className="py-2 px-2 w-28">Status / Flag</th>
                      <th className="py-2 px-2 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {markers.map((marker) => (
                      <tr key={marker.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={marker.name}
                            onChange={(e) => updateMarker(marker.id, { name: e.target.value })}
                            placeholder="e.g. HbA1c, Fasting Glucose"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-medium"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            step="any"
                            value={marker.value !== null ? marker.value : ''}
                            onChange={(e) =>
                              updateMarker(marker.id, {
                                value: e.target.value === '' ? null : Number(e.target.value),
                              })
                            }
                            placeholder="Value"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-900"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={marker.unit}
                            onChange={(e) => updateMarker(marker.id, { unit: e.target.value })}
                            placeholder="mg/dL, %"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-600"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            step="any"
                            value={marker.minRef !== null && marker.minRef !== undefined ? marker.minRef : ''}
                            onChange={(e) =>
                              updateMarker(marker.id, {
                                minRef: e.target.value === '' ? null : Number(e.target.value),
                              })
                            }
                            placeholder="Min"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-500"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            step="any"
                            value={marker.maxRef !== null && marker.maxRef !== undefined ? marker.maxRef : ''}
                            onChange={(e) =>
                              updateMarker(marker.id, {
                                maxRef: e.target.value === '' ? null : Number(e.target.value),
                              })
                            }
                            placeholder="Max"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-500"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            value={marker.flag}
                            onChange={(e) => updateMarker(marker.id, { flag: e.target.value as MarkerFlag })}
                            className={`w-full px-2 py-1 rounded font-semibold text-[11px] border ${
                              marker.flag === 'Normal'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : marker.flag === 'Critical'
                                ? 'bg-rose-50 border-rose-300 text-rose-800'
                                : marker.flag === 'High'
                                ? 'bg-amber-50 border-amber-300 text-amber-800'
                                : 'bg-blue-50 border-blue-200 text-blue-800'
                            }`}
                          >
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Low">Low</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeMarker(marker.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Summary & Clinical Notes */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              4. Clinical Summary & Doctor Notes
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Report Clinical Summary / Key Impressions
              </label>
              <textarea
                id="report-form-summary"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief clinical takeaway or summary of findings..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doctor&apos;s Advice & Prescribed Plan
                </label>
                <textarea
                  id="report-form-doc-notes"
                  rows={2}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="e.g. Adjust metformin dosage, repeat in 6 months..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags & Keywords (comma-separated)
                </label>
                <input
                  id="report-form-tags"
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="e.g. Annual Checkup, Prediabetes, Lipids"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-report-submit-btn"
              type="submit"
              className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition hover:shadow cursor-pointer"
            >
              {reportToEdit ? 'Update Medical Report' : 'Save Report to Vault'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
