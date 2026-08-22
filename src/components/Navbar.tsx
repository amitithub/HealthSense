import React from 'react';
import { 
  Users, 
  FileText, 
  GitCompare, 
  Share2, 
  Activity, 
  PlusCircle, 
  Database, 
  ShieldCheck,
  Search,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { FamilyMember } from '../types';

interface NavbarProps {
  members: FamilyMember[];
  selectedMemberId: string; // 'all' or member.id
  onSelectMember: (id: string) => void;
  activeTab: 'reports' | 'compare' | 'trends' | 'doctor-share' | 'members';
  onChangeTab: (tab: 'reports' | 'compare' | 'trends' | 'doctor-share' | 'members') => void;
  onOpenUpload: () => void;
  onOpenManageMembers: () => void;
  onOpenBackup: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  activeTab,
  onChangeTab,
  onOpenUpload,
  onOpenManageMembers,
  onOpenBackup,
  searchQuery,
  onSearchChange,
}) => {
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  return (
    <header id="main-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner / Brand & Global Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  FamHealth<span className="text-indigo-600">Vault</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Clinical & Doctor Share
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Track, Compare & Share Family Medical Reports
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="header-global-search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search reports, lab markers (e.g. HbA1c, Lipids), doctors..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Upload Button */}
            <button
              id="header-upload-btn"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-sm transition hover:shadow cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Report</span>
              <span className="sm:hidden">Upload</span>
            </button>

            {/* Manage Family Members */}
            <button
              id="header-members-manage-btn"
              onClick={onOpenManageMembers}
              title="Manage Family Profiles"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-600" />
              <span className="hidden lg:inline">Family Profiles</span>
            </button>

            {/* Data backup / Sample reset */}
            <button
              id="header-backup-btn"
              onClick={onOpenBackup}
              title="Backup & Database Settings"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <Database className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Secondary Sub-Navbar: Family Member Selector & Views Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 border-t border-slate-100 gap-3">
          
          {/* Family Member Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Profile:
            </span>
            <button
              id="member-tab-all"
              onClick={() => onSelectMember('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedMemberId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>All Family</span>
              <span className="bg-slate-700 text-slate-200 text-[10px] px-1.5 py-0.2 rounded-full">
                {members.length}
              </span>
            </button>

            {members.map((member) => {
              const isSelected = selectedMemberId === member.id;
              return (
                <button
                  key={member.id}
                  id={`member-tab-${member.id}`}
                  onClick={() => onSelectMember(member.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-indigo-500'
                  }`} />
                  <span>{member.name}</span>
                  <span className={`text-[10px] opacity-80 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                    ({member.relationship})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation View Tabs */}
          <nav id="header-nav-tabs" className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto shrink-0">
            <button
              id="nav-tab-reports"
              onClick={() => onChangeTab('reports')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Reports</span>
            </button>

            <button
              id="nav-tab-compare"
              onClick={() => onChangeTab('compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'compare'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Reports</span>
            </button>

            <button
              id="nav-tab-trends"
              onClick={() => onChangeTab('trends')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'trends'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Biomarker Trends</span>
            </button>

            <button
              id="nav-tab-doctor-share"
              onClick={() => onChangeTab('doctor-share')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'doctor-share'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Doctor Share</span>
            </button>
          </nav>
        </div>

        {/* Selected Member Quick Patient Bar (if a specific member is active) */}
        {selectedMember && (
          <div className="py-2 px-3 mb-2 bg-indigo-50/70 border border-indigo-100 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Active Profile: {selectedMember.name}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-600">Age: <strong>{selectedMember.age || 'N/A'}</strong></span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-600">Blood Group: <strong className="text-rose-600 font-bold">{selectedMember.bloodGroup || 'O+'}</strong></span>
              {selectedMember.allergies.length > 0 && (
                <>
                  <span className="text-slate-500">|</span>
                  <span className="text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded font-medium">
                    Allergies: {selectedMember.allergies.join(', ')}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedMember.primaryDoctor && (
                <span className="text-slate-600">
                  Doctor: <strong>{selectedMember.primaryDoctor.name}</strong> ({selectedMember.primaryDoctor.specialty})
                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
