import React, { useState, useEffect, useMemo } from 'react';
import { 
  Share2, 
  Printer, 
  Copy, 
  Check, 
  QrCode, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Pill, 
  Heart, 
  User, 
  FileText, 
  Download, 
  Send,
  Stethoscope,
  Clock,
  PlusCircle
} from 'lucide-react';
import { MedicalReport, FamilyMember, DoctorBriefSBAR, DoctorShareToken } from '../types';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storage';

interface DoctorShareViewProps {
  members: FamilyMember[];
  reports: MedicalReport[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  preSelectedReports?: MedicalReport[];
}

export const DoctorShareView: React.FC<DoctorShareViewProps> = ({
  members,
  reports,
  selectedMemberId,
  onSelectMember,
  preSelectedReports,
}) => {
  const [activeMemberId, setActiveMemberId] = useState<string>(
    selectedMemberId !== 'all' ? selectedMemberId : members[0]?.id || ''
  );
  const [doctorBrief, setDoctorBrief] = useState<DoctorBriefSBAR | null>(null);
  const [isLoadingBrief, setIsLoadingBrief] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [shareToken, setShareToken] = useState<DoctorShareToken | null>(null);
  const [accessPin, setAccessPin] = useState<string>('4829');
  const [showQR, setShowQR] = useState<boolean>(false);

  // Doctor Consultation Logger state
  const [doctorNoteInput, setDoctorNoteInput] = useState<string>('');
  const [newMedicationInput, setNewMedicationInput] = useState<string>('');
  const [nextFollowupInput, setNextFollowupInput] = useState<string>('');
  const [consultSavedNotice, setConsultSavedNotice] = useState<string | null>(null);

  const currentMember = useMemo(() => {
    return members.find((m) => m.id === activeMemberId) || members[0];
  }, [members, activeMemberId]);

  const memberReports = useMemo(() => {
    if (!currentMember) return [];
    return reports
      .filter((r) => r.memberId === currentMember.id)
      .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  }, [reports, currentMember]);

  // Generate Doctor Brief SBAR via AI
  const fetchDoctorBrief = async () => {
    if (!currentMember) return;
    setIsLoadingBrief(true);
    try {
      const res = await AIService.generateDoctorBrief(currentMember, memberReports);
      if (res.success && res.brief) {
        setDoctorBrief(res.brief);
      }
    } catch (e) {
      console.error('Doctor brief error:', e);
    } finally {
      setIsLoadingBrief(false);
    }
  };

  useEffect(() => {
    if (currentMember) {
      fetchDoctorBrief();
      // Generate or retrieve share token
      const token = StorageService.createShareToken(currentMember.id, {
        accessPin: accessPin,
        notes: `Clinical Consultation Access for ${currentMember.name}`,
      });
      setShareToken(token);
    }
  }, [currentMember?.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/#doctor-portal?token=${shareToken?.token}&pin=${accessPin}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Collect all abnormal markers from recent reports
  const abnormalMarkersList = useMemo(() => {
    const list: Array<{ reportTitle: string; date: string; markerName: string; value: string; unit: string; flag: string }> = [];
    memberReports.forEach((r) => {
      r.markers
        .filter((m) => m.flag !== 'Normal')
        .forEach((m) => {
          list.push({
            reportTitle: r.title,
            date: r.reportDate,
            markerName: m.name,
            value: `${m.value !== null ? m.value : m.textValue}`,
            unit: m.unit,
            flag: m.flag,
          });
        });
    });
    return list;
  }, [memberReports]);

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) return;

    const updates: Partial<FamilyMember> = {};
    if (newMedicationInput.trim()) {
      updates.medications = [...currentMember.medications, newMedicationInput.trim()];
    }

    StorageService.updateMember(currentMember.id, updates);

    // If there's a recent report, append notes to it
    if (memberReports.length > 0 && doctorNoteInput.trim()) {
      const latest = memberReports[0];
      const combinedNotes = latest.doctorNotes
        ? `${latest.doctorNotes}\n[Consult ${new Date().toISOString().split('T')[0]}]: ${doctorNoteInput.trim()}`
        : `[Consult ${new Date().toISOString().split('T')[0]}]: ${doctorNoteInput.trim()}`;

      StorageService.updateReport(latest.id, {
        doctorNotes: combinedNotes,
        followUpDate: nextFollowupInput || latest.followUpDate,
      });
    }

    setDoctorNoteInput('');
    setNewMedicationInput('');
    setNextFollowupInput('');
    setConsultSavedNotice('Consultation remarks & medication plan saved successfully.');
    setTimeout(() => setConsultSavedNotice(null), 4000);
  };

  if (!currentMember) {
    return (
      <div className="p-12 text-center text-slate-500">
        Please add a family member profile to view clinical share portal.
      </div>
    );
  }

  return (
    <div id="doctor-share-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner: Member Selector, Share Link & Print Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Doctor Clinical Reference Portal</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Physician View
              </span>
            </div>
            <p className="text-xs text-slate-500">
              High-density clinical summary formatted for 5-minute doctor consultations
            </p>
          </div>
        </div>

        {/* Member Selector dropdown & actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeMemberId}
            onChange={(e) => {
              setActiveMemberId(e.target.value);
              onSelectMember(e.target.value);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                Patient: {m.name} ({m.relationship})
              </option>
            ))}
          </select>

          <button
            id="doctor-print-summary-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Clinical Handout</span>
          </button>

          <button
            id="doctor-copy-link-btn"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-xs cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link with Doctor</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Shareable Link & PIN Info Bar (collapsible) */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-emerald-900">
              Doctor Access Reference Token: <span className="font-mono text-emerald-700 font-extrabold">{shareToken?.token}</span>
            </p>
            <p className="text-[11px] text-emerald-700">
              Passcode: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{accessPin}</strong> • 30-Day Encrypted Access Token
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQR(!showQR)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{showQR ? 'Hide QR' : 'Show QR Code'}</span>
          </button>
        </div>
      </div>

      {/* QR Code Card modal view if toggled */}
      {showQR && (
        <div className="p-6 bg-white rounded-2xl border border-emerald-200 shadow-md text-center max-w-sm mx-auto space-y-3 print:hidden">
          <h4 className="font-bold text-slate-900 text-sm">Scan to Open Doctor Consultation Brief</h4>
          <div className="w-44 h-44 bg-slate-900 p-3 rounded-xl mx-auto flex items-center justify-center">
            {/* Visual SVG QR Simulation */}
            <div className="grid grid-cols-6 gap-1.5 w-full h-full bg-white p-2 rounded-lg">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-xs ${
                    i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35
                      ? 'bg-slate-900'
                      : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono">Token: {shareToken?.token}</p>
        </div>
      )}

      {/* ================= CLINICAL HANDOUT DOCUMENT ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-white">
                  CONFIDENTIAL MEDICAL RECORD
                </span>
                <span className="text-xs text-slate-500">
                  Ref Date: {new Date().toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                Clinical Health Summary & Diagnostic History
              </h1>
              <p className="text-xs text-slate-600">
                Prepared for Primary Care Physician & Specialist Review
              </p>
            </div>

            {currentMember.primaryDoctor && (
              <div className="text-left sm:text-right text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900">Attending Physician:</p>
                <p>{currentMember.primaryDoctor.name}</p>
                <p className="text-slate-500">{currentMember.primaryDoctor.specialty} • {currentMember.primaryDoctor.hospital}</p>
              </div>
            )}
          </div>

          {/* Patient Bio Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Patient Name</span>
              <strong className="text-slate-900 text-sm">{currentMember.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Age & Gender</span>
              <strong className="text-slate-900">{currentMember.age || 'N/A'} yrs • {currentMember.gender}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Blood Group</span>
              <strong className="text-rose-600 text-sm font-extrabold">{currentMember.bloodGroup || 'O+'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Date of Birth</span>
              <strong className="text-slate-900">{currentMember.dob || '—'}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block font-medium">Emergency Contact</span>
              <strong className="text-slate-900">
                {currentMember.emergencyContact?.name} ({currentMember.emergencyContact?.phone})
              </strong>
            </div>
          </div>
        </div>

        {/* Clinical Alerts Strip: Allergies, Chronic Conditions, Active Meds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Allergies */}
          <div className={`p-4 rounded-xl border text-xs space-y-1 ${
            currentMember.allergies.length > 0
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <h4 className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-rose-800">
              <AlertTriangle className="w-3.5 h-3.5" />
              Documented Allergies
            </h4>
            <p className="font-semibold">
              {currentMember.allergies.length > 0 ? currentMember.allergies.join(', ') : 'NKDA (No Known Drug Allergies)'}
            </p>
          </div>

          {/* Chronic Conditions */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Medical Conditions / History
            </h4>
            <p className="text-slate-700">
              {currentMember.conditions.length > 0 ? currentMember.conditions.join(', ') : 'No chronic conditions recorded.'}
            </p>
          </div>

          {/* Active Medications */}
          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-xs space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-indigo-600" />
              Active Prescribed Medications
            </h4>
            <p className="text-indigo-950 font-medium">
              {currentMember.medications.length > 0 ? currentMember.medications.join(', ') : 'None listed.'}
            </p>
          </div>

        </div>

        {/* AI SBAR Executive Clinical Brief */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:border-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 print:hidden" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 print:text-slate-900">
                SBAR Executive Clinical Assessment
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 print:text-slate-600">
              Synthesized from {memberReports.length} Historical Lab Records
            </span>
          </div>

          {isLoadingBrief ? (
            <div className="py-4 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Generating concise clinical brief...</span>
            </div>
          ) : doctorBrief ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2.5">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block print:text-slate-600">Situation</span>
                  <p className="text-slate-200 print:text-slate-800">{doctorBrief.situation}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block print:text-slate-600">Background</span>
                  <p className="text-slate-200 print:text-slate-800">{doctorBrief.background}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block print:text-slate-600">Assessment & Trends</span>
                  <p className="text-slate-200 print:text-slate-800">{doctorBrief.assessment}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block print:text-slate-600">Suggested Action / Review</span>
                  <ul className="list-disc list-inside text-slate-200 print:text-slate-800 space-y-0.5">
                    {doctorBrief.recommendations?.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Abnormal Findings Table */}
        {abnormalMarkersList.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Recent Abnormal & Attention Laboratory Markers ({abnormalMarkersList.length})
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Encounter Date</th>
                    <th className="py-2 px-3">Report Context</th>
                    <th className="py-2 px-3">Biomarker</th>
                    <th className="py-2 px-3">Measured Result</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {abnormalMarkersList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">{item.date}</td>
                      <td className="py-2 px-3 text-slate-600">{item.reportTitle}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{item.markerName}</td>
                      <td className="py-2 px-3 font-extrabold text-slate-900">
                        {item.value} {item.unit}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          item.flag === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.flag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Complete Diagnostic Timeline (All reports for this member) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            Complete Diagnostic Reports Log ({memberReports.length})
          </h3>

          <div className="space-y-3">
            {memberReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{report.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {report.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <span>Date: <strong>{report.reportDate}</strong></span>
                    <span>•</span>
                    <span>Facility: {report.labName}</span>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">{report.summary}</p>

                {report.markers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {report.markers.map((m) => (
                      <span
                        key={m.id}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          m.flag === 'Critical'
                            ? 'bg-rose-100 text-rose-800 font-bold border-rose-300'
                            : m.flag === 'High'
                            ? 'bg-amber-50 text-amber-800 font-semibold border-amber-300'
                            : m.flag === 'Low'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {m.name}: <strong>{m.value !== null ? m.value : m.textValue}</strong> {m.unit}
                      </span>
                    ))}
                  </div>
                )}

                {report.doctorNotes && (
                  <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 text-indigo-950 font-medium mt-1">
                    <strong>Physician Advice:</strong> {report.doctorNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Action Plan & Consultation Logger (Print Hidden) */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              Log Consultation Remarks & Medication Plan
            </h3>
            <span className="text-xs text-slate-500">Record during doctor visit</span>
          </div>

          <form onSubmit={handleSaveConsultation} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Doctor Remarks & Advice from Today&apos;s Consultation
              </label>
              <textarea
                rows={2}
                value={doctorNoteInput}
                onChange={(e) => setDoctorNoteInput(e.target.value)}
                placeholder="e.g. Continue Metformin 500mg, repeat HbA1c in 6 months, add low-dose statin if LDL remains above 100..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New / Adjusted Medication to Add
                </label>
                <input
                  type="text"
                  value={newMedicationInput}
                  onChange={(e) => setNewMedicationInput(e.target.value)}
                  placeholder="e.g. Atorvastatin 10mg (Bedtime)"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Next Scheduled Follow-up Date
                </label>
                <input
                  type="date"
                  value={nextFollowupInput}
                  onChange={(e) => setNextFollowupInput(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {consultSavedNotice && (
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{consultSavedNotice}</span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                id="save-consult-log-btn"
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Consultation Record</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
