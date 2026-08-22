export type Relationship = 
  | 'Self'
  | 'Spouse'
  | 'Child'
  | 'Father'
  | 'Mother'
  | 'Grandparent'
  | 'Sibling'
  | 'Relative'
  | 'Other';

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export type ReportCategory =
  | 'Blood Test'
  | 'Lipid Profile'
  | 'Metabolic & Diabetes'
  | 'Thyroid Panel'
  | 'Cardiology & ECG'
  | 'Imaging & Radiology'
  | 'Kidney & Renal'
  | 'Liver Function'
  | 'Prescription & Visit'
  | 'Urine & Stool'
  | 'Pathology & Biopsy'
  | 'Vaccination'
  | 'Other';

export type ReportStatus = 'Normal' | 'Needs Attention' | 'Critical' | 'Pending Review';

export type MarkerFlag = 'Normal' | 'Low' | 'High' | 'Critical';

export interface LabMarker {
  id: string;
  name: string;
  category?: string;
  value: number | null;
  textValue?: string;
  unit: string;
  minRef?: number | null;
  maxRef?: number | null;
  referenceRangeText?: string;
  flag: MarkerFlag;
  notes?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: Relationship;
  dob?: string; // YYYY-MM-DD
  age?: number;
  gender: Gender;
  bloodGroup?: string; // e.g. "O+", "A+", "B+", "AB-", "Unknown"
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  primaryDoctor?: {
    name: string;
    specialty: string;
    phone: string;
    hospital: string;
  };
  avatarColor?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MedicalReport {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  category: ReportCategory;
  reportDate: string; // YYYY-MM-DD
  labName: string;
  orderingDoctor: string;
  status: ReportStatus;
  
  // File details (supports any format)
  fileName: string;
  fileType: string; // MIME type or extension like "application/pdf", "image/png", "text/csv", etc.
  fileSize: number; // bytes
  fileDataUrl?: string; // Base64 or Blob URL for preview
  fileTextContent?: string; // Extracted raw text or document content
  
  // Lab / Diagnostic details
  markers: LabMarker[];
  summary: string;
  keyFindings: string[];
  doctorNotes?: string;
  patientNotes?: string;
  tags: string[];
  followUpDate?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface DoctorShareToken {
  id: string;
  token: string;
  memberId: string;
  createdDate: string;
  expiresAt: string;
  notes?: string;
  accessPin?: string;
  selectedReportIds?: string[];
}

export interface BiomarkerDelta {
  markerName: string;
  unit: string;
  earlierDate: string;
  earlierValue: number | string;
  latestDate: string;
  latestValue: number | string;
  deltaPercent?: number | string;
  assessment: 'Improved' | 'Worsened' | 'Stable' | 'Fluctuating';
  flag: MarkerFlag;
  clinicalNote?: string;
}

export interface ComparisonReportInsight {
  overallTrend: string;
  summary: string;
  improvements: string[];
  concerningChanges: string[];
  stableMarkers: string[];
  deltaHighlights?: {
    markerName: string;
    earlierValue: string;
    latestValue: string;
    deltaPercent: string;
    assessment: 'Improved' | 'Worsened' | 'Stable' | 'Fluctuating';
    clinicalNote: string;
  }[];
  doctorDiscussionPoints: string[];
  lifestyleAndFollowUpAdvice?: string[];
}

export interface DoctorBriefSBAR {
  headline: string;
  situation: string;
  background: string;
  assessment: string;
  recommendations: string[];
  keyAbnormalities: {
    marker: string;
    value: string;
    date?: string;
    note: string;
  }[];
  questionsForDoctor?: string[];
}
