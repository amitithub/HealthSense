import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  GitCompare, 
  Share2, 
  Users, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Sparkles, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  ArrowUpDown,
  Stethoscope,
  HeartPulse,
  Info,
  ShieldCheck,
  FolderHeart
} from 'lucide-react';
import { MedicalReport, FamilyMember, ReportCategory, ReportStatus } from './types';
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { ReportCard } from './components/ReportCard';
import { ReportUploadModal } from './components/ReportUploadModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { ReportComparisonView } from './components/ReportComparisonView';
import { DoctorShareView } from './components/DoctorShareView';
import { FamilyMemberManager } from './components/FamilyMemberManager';
import { ChartBuilder } from './components/ChartBuilder';

const ALL_CATEGORIES: Array<{ label: string; value: string }> = [
  { label: 'All Categories', value: 'all' },
  { label: 'Blood Test', value: 'Blood Test' },
  { label: 'Lipid Profile', value: 'Lipid Profile' },
  { label: 'Metabolic & Diabetes', value: 'Metabolic & Diabetes' },
  { label: 'Thyroid Panel', value: 'Thyroid Panel' },
  { label: 'Cardiology & ECG', value: 'Cardiology & ECG' },
  { label: 'Imaging & Radiology', value: 'Imaging & Radiology' },
  { label: 'Kidney & Renal', value: 'Kidney & Renal' },
  { label: 'Liver Function', value: 'Liver Function' },
  { label: 'Prescription & Visit', value: 'Prescription & Visit' },
  { label: 'Vaccination', value: 'Vaccination' },
  { label: 'Other', value: 'Other' },
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'vault' | 'compare' | 'doctor' | 'members' | 'chart-builder'>('vault');

  // Core Data States
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title' | 'status'>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Multi-selection for Comparison
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [reportToEdit, setReportToEdit] = useState<MedicalReport | null>(null);
  const [detailModalReport, setDetailModalReport] = useState<MedicalReport | null>(null);
  const [isMemberManagerOpen, setIsMemberManagerOpen] = useState<boolean>(false);
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial data from StorageService
  const refreshData = () => {
    const loadedMembers = StorageService.getMembers();
    const loadedReports = StorageService.getReports();
    setMembers(loadedMembers);
    setReports(loadedReports);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filtered & Sorted Reports list
  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        // Member filter
        if (selectedMemberId !== 'all' && report.memberId !== selectedMemberId) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && report.category !== categoryFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all' && report.status !== statusFilter) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = report.title.toLowerCase().includes(q);
          const matchMember = report.memberName.toLowerCase().includes(q);
          const matchLab = report.labName.toLowerCase().includes(q);
          const matchDoctor = report.orderingDoctor.toLowerCase().includes(q);
          const matchTags = report.tags?.some((t) => t.toLowerCase().includes(q));
          const matchMarkers = report.markers.some((m) => m.name.toLowerCase().includes(q));
          const matchSummary = report.summary.toLowerCase().includes(q);

          if (!matchTitle && !matchMember && !matchLab && !matchDoctor && !matchTags && !matchMarkers && !matchSummary) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'status') {
          const priority = { Critical: 3, 'Needs Attention': 2, 'Pending Review': 1, Normal: 0 };
          return (priority[b.status] || 0) - (priority[a.status] || 0);
        }
        return 0;
      });
  }, [reports, selectedMemberId, categoryFilter, statusFilter, searchQuery, sortBy]);

  // Overall Family Health Pulse Statistics
  const stats = useMemo(() => {
    const totalReports = reports.length;
    const criticalReports = reports.filter((r) => r.status === 'Critical').length;
    const attentionReports = reports.filter((r) => r.status === 'Needs Attention').length;
    const totalMarkersTracked = reports.reduce((acc, r) => acc + r.markers.length, 0);
    const upcomingFollowUps = reports.filter((r) => r.followUpDate && new Date(r.followUpDate) >= new Date()).length;

    return {
      totalReports,
      criticalReports,
      attentionReports,
      totalMarkersTracked,
      upcomingFollowUps,
      totalMembers: members.length,
    };
  }, [reports, members]);

  // Handler: Save / Update Report
  const handleSaveReport = (reportData: Omit<MedicalReport, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => {
    if (editId) {
      StorageService.updateReport(editId, reportData);
      showToast('Report updated successfully');
    } else {
      StorageService.addReport(reportData);
      showToast('New report successfully saved to vault');
    }
    refreshData();
  };

  // Handler: Delete Report
  const handleDeleteReport = (id: string) => {
    StorageService.deleteReport(id);
    setSelectedReportIds((prev) => prev.filter((item) => item !== id));
    showToast('Report removed from records', 'info');
    refreshData();
  };

  // Handler: Toggle compare selection
  const handleToggleCompare = (id: string) => {
    setSelectedReportIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handler: Save / Update Member
  const handleSaveMember = (memberData: Omit<FamilyMember, 'id' | 'createdAt'>, editId?: string) => {
    if (editId) {
      StorageService.updateMember(editId, memberData);
      showToast('Family profile updated');
    } else {
      StorageService.addMember(memberData);
      showToast('New family member profile added');
    }
    refreshData();
  };

  // Handler: Delete Member
  const handleDeleteMember = (id: string) => {
    StorageService.deleteMember(id);
    if (selectedMemberId === id) setSelectedMemberId('all');
    showToast('Family member profile deleted', 'info');
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab === 'vault' ? 'reports' : activeTab === 'doctor' ? 'doctor-share' : activeTab as any}
        onChangeTab={(tab) => {
          if (tab === 'reports') setActiveTab('vault');
          else if (tab === 'doctor-share') setActiveTab('doctor');
          else if (tab === 'compare') setActiveTab('compare');
          else if (tab === 'members') setActiveTab('members');
          else if (tab === 'chart-builder') setActiveTab('chart-builder');
        }}
        members={members}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
        onOpenUpload={() => {
          setReportToEdit(null);
          setIsUploadModalOpen(true);
        }}
        onOpenManageMembers={() => setIsMemberManagerOpen(true)}
        onOpenBackup={() => showToast('Backup coming soon', 'info')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
            <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-indigo-900 text-white border-indigo-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* ================= VIEW 1: MEDICAL REPORTS HUB (VAULT) ================= */}
        {activeTab === 'vault' && (
          <div className="space-y-6">
            
            {/* Quick Health Pulse Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              
              {/* Total Reports */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Total Reports</span>
                  <span className="text-2xl font-black text-slate-900 mt-0.5 block">{stats.totalReports}</span>
                  <span className="text-[11px] text-slate-400">Across {stats.totalMembers} family profiles</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              {/* Biomarkers Tracked */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Biomarkers Tracked</span>
                  <span className="text-2xl font-black text-slate-900 mt-0.5 block">{stats.totalMarkersTracked}</span>
                  <span className="text-[11px] text-emerald-600 font-medium">Ready for comparison</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              {/* Attention & Critical Flags */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Requires Attention</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-amber-600">{stats.attentionReports}</span>
                    {stats.criticalReports > 0 && (
                      <span className="text-xs font-bold text-rose-600">({stats.criticalReports} Critical)</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">Lab threshold warnings</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              {/* Doctor Consultation Ready */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Doctor Share Status</span>
                  <span className="text-sm font-bold text-emerald-700 mt-1 block flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Ready to Consult
                  </span>
                  <span className="text-[11px] text-slate-400">SBAR Briefs active</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Family Member Profile Pills Switcher */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                  Family Profile:
                </span>
                <button
                  onClick={() => setSelectedMemberId('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedMemberId === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Family ({reports.length})
                </button>

                {members.map((m) => {
                  const memberReportCount = reports.filter((r) => r.memberId === m.id).length;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedMemberId === m.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{m.name}</span>
                      <span className="opacity-70 text-[10px]">({memberReportCount})</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setMemberToEdit(null);
                  setIsMemberManagerOpen(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Profile</span>
              </button>
            </div>

            {/* Search, Category, Status Filters & Action Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="search-reports-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by test name, biomarkers (HbA1c, Glucose), doctor, facility, tags..."
                    className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Primary Upload CTA Button */}
                <div className="flex items-center gap-2">
                  <button
                    id="upload-report-primary-btn"
                    onClick={() => {
                      setReportToEdit(null);
                      setIsUploadModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Record Report</span>
                  </button>
                </div>
              </div>

              {/* Filter controls strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter */}
                  <select
                    id="filter-category-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    id="filter-status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Clinical Statuses</option>
                    <option value="Normal">Normal</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Critical">Critical Alert</option>
                  </select>

                  {/* Sort by */}
                  <select
                    id="sort-reports-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="date-desc">Newest Encounter First</option>
                    <option value="date-asc">Oldest Encounter First</option>
                    <option value="status">Status Priority (Critical First)</option>
                    <option value="title">Test Title (A-Z)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">
                    Showing <strong>{filteredReports.length}</strong> of {reports.length} reports
                  </span>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 rounded-md transition ${
                        viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1 rounded-md transition ${
                        viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                      }`}
                      title="List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Floating Comparison Toolbar if reports selected */}
            {selectedReportIds.length > 0 && (
              <div className="sticky top-20 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between gap-3 animate-in slide-in-from-top-3">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                    {selectedReportIds.length}
                  </span>
                  <span className="font-semibold">
                    Reports selected for side-by-side comparison
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('compare');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Launch Comparison Matrix</span>
                  </button>
                  <button
                    onClick={() => setSelectedReportIds([])}
                    className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            )}

            {/* Reports Grid / List */}
            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-900">No medical reports found</h3>
                  <p className="text-xs text-slate-500">
                    {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                      ? 'No reports match your current filter settings. Try resetting your search query.'
                      : 'Get started by uploading your family members’ first diagnostic report, scan, or lab results.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setReportToEdit(null);
                    setIsUploadModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Medical Report (Any Format)</span>
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                  : 'space-y-3'
              }>
                {filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onViewDetail={(r) => setDetailModalReport(r)}
                    onEdit={(r) => {
                      setReportToEdit(r);
                      setIsUploadModalOpen(true);
                    }}
                    onDelete={handleDeleteReport}
                    isSelectedForCompare={selectedReportIds.includes(report.id)}
                    onToggleCompare={handleToggleCompare}
                    onQuickShare={(r) => {
                      setSelectedMemberId(r.memberId);
                      setActiveTab('doctor');
                    }}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* ================= VIEW 2: LONGITUDINAL REPORT COMPARISON ================= */}
        {activeTab === 'compare' && (
          <ReportComparisonView
            reports={reports}
            members={members}
            selectedMemberId={selectedMemberId}
            selectedReportIds={selectedReportIds}
            onToggleReportSelection={handleToggleCompare}
            onOpenDoctorShare={(selected) => {
              if (selected[0]) {
                setSelectedMemberId(selected[0].memberId);
              }
              setActiveTab('doctor');
            }}
          />
        )}

        {/* ================= VIEW 3: DOCTOR CLINICAL REFERENCE & SHARE ================= */}
        {activeTab === 'doctor' && (
          <DoctorShareView
            members={members}
            reports={reports}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
          />
        )}

        {/* ================= VIEW: CHART BUILDER ================= */}
        {activeTab === 'chart-builder' && (
          <ChartBuilder reports={reports} selectedMemberId={selectedMemberId} />
        )}

        {/* ================= VIEW 4: FAMILY MEMBERS PROFILE MANAGER ================= */}
        {activeTab === 'members' && (
          <FamilyMemberManager
            members={members}
            reports={reports}
            onAddMember={() => {
              setMemberToEdit(null);
              setIsMemberManagerOpen(true);
            }}
            onEditMember={(m) => {
              setMemberToEdit(m);
              setIsMemberManagerOpen(true);
            }}
            onDeleteMember={handleDeleteMember}
            onSelectMemberForView={(id) => {
              setSelectedMemberId(id);
              setActiveTab('vault');
            }}
          />
        )}

      </main>

      {/* ================= MODALS ================= */}

      {/* 1. Report Upload / Edit Modal */}
      <ReportUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setReportToEdit(null);
        }}
        members={members}
        initialMemberId={selectedMemberId !== 'all' ? selectedMemberId : members[0]?.id}
        reportToEdit={reportToEdit}
        onSaveReport={handleSaveReport}
      />

      {/* 2. Full Detailed Clinical Report Inspector */}
      <ReportDetailModal
        isOpen={!!detailModalReport}
        onClose={() => setDetailModalReport(null)}
        report={detailModalReport}
        patient={members.find((m) => m.id === detailModalReport?.memberId)}
        onEdit={(r) => {
          setDetailModalReport(null);
          setReportToEdit(r);
          setIsUploadModalOpen(true);
        }}
        onCompareWithOthers={(id) => {
          if (!selectedReportIds.includes(id)) {
            setSelectedReportIds([...selectedReportIds, id]);
          }
          setActiveTab('compare');
        }}
        onShareWithDoctor={(r) => {
          setSelectedMemberId(r.memberId);
          setActiveTab('doctor');
        }}
      />

      {/* 3. Family Member Add/Edit Modal */}
      {isMemberManagerOpen && (
        <FamilyMemberModal
          isOpen={isMemberManagerOpen}
          onClose={() => {
            setIsMemberManagerOpen(false);
            setMemberToEdit(null);
          }}
          memberToEdit={memberToEdit}
          onSave={handleSaveMember}
        />
      )}

    </div>
  );
}

// Submodal for Family Member creation/editing
interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit: FamilyMember | null;
  onSave: (memberData: Omit<FamilyMember, 'id' | 'createdAt'>, editId?: string) => void;
}

function FamilyMemberModal({ isOpen, onClose, memberToEdit, onSave }: FamilyMemberModalProps) {
  const [name, setName] = useState(memberToEdit?.name || '');
  const [relationship, setRelationship] = useState(memberToEdit?.relationship || 'Self');
  const [age, setAge] = useState<number | ''>(memberToEdit?.age || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(memberToEdit?.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState(memberToEdit?.bloodGroup || 'O+');
  const [dob, setDob] = useState(memberToEdit?.dob || '');
  const [allergiesText, setAllergiesText] = useState(memberToEdit?.allergies.join(', ') || '');
  const [conditionsText, setConditionsText] = useState(memberToEdit?.conditions.join(', ') || '');
  const [medicationsText, setMedicationsText] = useState(memberToEdit?.medications.join(', ') || '');
  const [doctorName, setDoctorName] = useState(memberToEdit?.primaryDoctor?.name || '');
  const [doctorSpecialty, setDoctorSpecialty] = useState(memberToEdit?.primaryDoctor?.specialty || '');
  const [doctorPhone, setDoctorPhone] = useState(memberToEdit?.primaryDoctor?.phone || '');
  const [emergencyName, setEmergencyName] = useState(memberToEdit?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(memberToEdit?.emergencyContact?.phone || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Omit<FamilyMember, 'id' | 'createdAt'> = {
      name: name.trim(),
      relationship,
      age: age === '' ? undefined : Number(age),
      gender,
      bloodGroup,
      dob: dob || undefined,
      allergies: allergiesText.split(',').map((s) => s.trim()).filter(Boolean),
      conditions: conditionsText.split(',').map((s) => s.trim()).filter(Boolean),
      medications: medicationsText.split(',').map((s) => s.trim()).filter(Boolean),
      primaryDoctor: doctorName
        ? {
            name: doctorName,
            specialty: doctorSpecialty || 'General Medicine',
            phone: doctorPhone || '555-0100',
            hospital: 'General Hospital',
          }
        : undefined,
      emergencyContact: emergencyName
        ? {
            name: emergencyName,
            phone: emergencyPhone || '555-0199',
            relationship: 'Family Contact',
          }
        : undefined,
    };

    onSave(payload, memberToEdit ? memberToEdit.id : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <h2 className="text-base font-bold text-slate-900">
            {memberToEdit ? `Edit Profile: ${memberToEdit.name}` : 'Add Family Member Profile'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Miller"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="Self">Self</option>
                <option value="Spouse">Spouse</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 42"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none font-bold"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Chronic Conditions (comma-separated)</label>
            <input
              type="text"
              value={conditionsText}
              onChange={(e) => setConditionsText(e.target.value)}
              placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Known Allergies (comma-separated)</label>
            <input
              type="text"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              placeholder="e.g. Penicillin, Peanuts, Sulfa"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Active Medications (comma-separated)</label>
            <input
              type="text"
              value={medicationsText}
              onChange={(e) => setMedicationsText(e.target.value)}
              placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Doctor Name</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Robert Vance, MD"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Contact (Name & Phone)</label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. Jane Doe (555-0192)"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              {memberToEdit ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
