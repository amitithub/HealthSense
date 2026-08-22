import { FamilyMember, MedicalReport, DoctorShareToken, LabMarker } from '../types';

const STORAGE_KEYS = {
  MEMBERS: 'famhealth_members_v1',
  REPORTS: 'famhealth_reports_v1',
  SHARE_TOKENS: 'famhealth_share_tokens_v1',
  SETTINGS: 'famhealth_settings_v1',
};

// Initial realistic sample data
const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'mem-1',
    name: 'John Miller',
    relationship: 'Self',
    dob: '1982-06-14',
    age: 44,
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    conditions: ['Prediabetes (Borderline HbA1c)', 'Mild Hyperlipidemia'],
    medications: ['Metformin 500mg (Daily)', 'Omega-3 Fish Oil 1000mg', 'Vitamin D3 2000IU'],
    emergencyContact: {
      name: 'Sarah Miller',
      phone: '+1 (555) 234-5678',
      relationship: 'Spouse',
    },
    primaryDoctor: {
      name: 'Dr. Robert Vance, MD',
      specialty: 'Internal Medicine',
      phone: '+1 (555) 890-1234',
      hospital: 'Metro Health Endocrinology Clinic',
    },
    avatarColor: 'indigo',
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2026-01-15T10:30:00.000Z',
  },
  {
    id: 'mem-2',
    name: 'Sarah Miller',
    relationship: 'Spouse',
    dob: '1985-09-22',
    age: 41,
    gender: 'Female',
    bloodGroup: 'A+',
    allergies: ['Latex'],
    conditions: ['Hypothyroidism', 'Iron Deficiency (Resolved)'],
    medications: ['Levothyroxine 75mcg (Morning)', 'Ferrous Bisglycinate 28mg'],
    emergencyContact: {
      name: 'John Miller',
      phone: '+1 (555) 234-8899',
      relationship: 'Spouse',
    },
    primaryDoctor: {
      name: 'Dr. Clara Adams, MD',
      specialty: 'Endocrinology & Women\'s Health',
      phone: '+1 (555) 777-3322',
      hospital: 'St. Jude Comprehensive Care',
    },
    avatarColor: 'teal',
    createdAt: '2025-01-10T08:30:00.000Z',
    updatedAt: '2026-02-01T14:15:00.000Z',
  },
  {
    id: 'mem-3',
    name: 'Eleanor Miller',
    relationship: 'Mother',
    dob: '1954-03-18',
    age: 72,
    gender: 'Female',
    bloodGroup: 'B+',
    allergies: ['Aspirin', 'Iodine contrast dye'],
    conditions: ['Hypertension', 'Osteopenia', 'Mild Chronic Kidney Disease (Stage 2)'],
    medications: ['Amlodipine 5mg', 'Losartan 50mg', 'Calcium Citrate + Vitamin D'],
    emergencyContact: {
      name: 'John Miller',
      phone: '+1 (555) 234-8899',
      relationship: 'Son',
    },
    primaryDoctor: {
      name: 'Dr. Howard Sterling, MD',
      specialty: 'Cardiology & Geriatrics',
      phone: '+1 (555) 444-9988',
      hospital: 'University Heart & Vascular Center',
    },
    avatarColor: 'purple',
    createdAt: '2025-01-12T09:00:00.000Z',
    updatedAt: '2026-01-20T11:00:00.000Z',
  },
  {
    id: 'mem-4',
    name: 'Ethan Miller',
    relationship: 'Child',
    dob: '2015-11-05',
    age: 11,
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: ['Peanuts (Severe - EpiPen)', 'Tree Nuts'],
    conditions: ['Mild Pediatric Asthma'],
    medications: ['Albuterol Inhaler (PRN)', 'Cetirizine 5mg (Seasonal)'],
    emergencyContact: {
      name: 'Sarah Miller',
      phone: '+1 (555) 234-5678',
      relationship: 'Mother',
    },
    primaryDoctor: {
      name: 'Dr. Linda Patel, MD',
      specialty: 'Pediatrics & Allergy',
      phone: '+1 (555) 333-1122',
      hospital: 'Valley Children\'s Clinic',
    },
    avatarColor: 'amber',
    createdAt: '2025-02-01T10:00:00.000Z',
    updatedAt: '2025-11-10T16:00:00.000Z',
  },
];

const INITIAL_MEDICAL_REPORTS: MedicalReport[] = [
  // John's Baseline Metabolic (Jan 2025)
  {
    id: 'rep-101',
    memberId: 'mem-1',
    memberName: 'John Miller',
    title: 'Annual Comprehensive Metabolic & Lipid Panel',
    category: 'Metabolic & Diabetes',
    reportDate: '2025-01-15',
    labName: 'Quest Diagnostics Inc.',
    orderingDoctor: 'Dr. Robert Vance, MD',
    status: 'Needs Attention',
    fileName: 'Quest_Lab_JohnMiller_Jan2025.pdf',
    fileType: 'application/pdf',
    fileSize: 245000,
    summary: 'Annual checkup lab report showing elevated fasting blood glucose (118 mg/dL) and borderline HbA1c (6.3%), indicative of prediabetes. Total cholesterol and LDL are also mildly high.',
    keyFindings: [
      'Fasting Blood Glucose: 118 mg/dL (High, ref 70-99)',
      'HbA1c: 6.3% (High, ref < 5.7%)',
      'Total Cholesterol: 228 mg/dL (High, ref < 200)',
      'LDL Cholesterol: 145 mg/dL (High, ref < 100)',
      'Serum Creatinine: 0.95 mg/dL (Normal)',
    ],
    markers: [
      { id: 'm1', name: 'Fasting Blood Glucose', value: 118, unit: 'mg/dL', minRef: 70, maxRef: 99, referenceRangeText: '70 - 99 mg/dL', flag: 'High' },
      { id: 'm2', name: 'HbA1c (Glycated Hemoglobin)', value: 6.3, unit: '%', minRef: 4.0, maxRef: 5.6, referenceRangeText: '4.0 - 5.6%', flag: 'High' },
      { id: 'm3', name: 'Total Cholesterol', value: 228, unit: 'mg/dL', minRef: 125, maxRef: 200, referenceRangeText: '< 200 mg/dL', flag: 'High' },
      { id: 'm4', name: 'LDL Cholesterol', value: 145, unit: 'mg/dL', minRef: 0, maxRef: 100, referenceRangeText: '< 100 mg/dL', flag: 'High' },
      { id: 'm5', name: 'HDL Cholesterol', value: 44, unit: 'mg/dL', minRef: 40, maxRef: 60, referenceRangeText: '> 40 mg/dL', flag: 'Normal' },
      { id: 'm6', name: 'Triglycerides', value: 195, unit: 'mg/dL', minRef: 0, maxRef: 150, referenceRangeText: '< 150 mg/dL', flag: 'High' },
      { id: 'm7', name: 'Serum Creatinine', value: 0.95, unit: 'mg/dL', minRef: 0.7, maxRef: 1.3, referenceRangeText: '0.7 - 1.3 mg/dL', flag: 'Normal' },
      { id: 'm8', name: 'eGFR', value: 98, unit: 'mL/min/1.73m²', minRef: 90, maxRef: 120, referenceRangeText: '> 90', flag: 'Normal' },
      { id: 'm9', name: 'ALT (Liver Enzyme)', value: 32, unit: 'U/L', minRef: 7, maxRef: 56, referenceRangeText: '7 - 56 U/L', flag: 'Normal' },
    ],
    doctorNotes: 'Initiated lifestyle modifications: low glycemic index Mediterranean diet, 30 min daily brisk walking. Prescribed Metformin 500mg daily. Re-check in 6 months.',
    tags: ['Annual Checkup', 'Prediabetes', 'Lipids', 'Metformin'],
    followUpDate: '2025-07-15',
    createdAt: '2025-01-16T10:00:00.000Z',
    updatedAt: '2025-01-16T10:00:00.000Z',
  },
  // John's Follow-up (Jul 2025)
  {
    id: 'rep-102',
    memberId: 'mem-1',
    memberName: 'John Miller',
    title: '6-Month Glycemic & Lipid Progress Check',
    category: 'Metabolic & Diabetes',
    reportDate: '2025-07-20',
    labName: 'Quest Diagnostics Inc.',
    orderingDoctor: 'Dr. Robert Vance, MD',
    status: 'Needs Attention',
    fileName: 'Quest_Lab_JohnMiller_Jul2025.pdf',
    fileType: 'application/pdf',
    fileSize: 220000,
    summary: 'Clear improvements observed after 6 months of lifestyle changes and Metformin. Fasting glucose reduced to 104 mg/dL and HbA1c lowered from 6.3% to 5.9%. Lipids moderately improved.',
    keyFindings: [
      'Fasting Blood Glucose: 104 mg/dL (Improved from 118 mg/dL)',
      'HbA1c: 5.9% (Improved from 6.3%)',
      'Total Cholesterol: 210 mg/dL (Down from 228 mg/dL)',
      'LDL Cholesterol: 128 mg/dL (Down from 145 mg/dL)',
      'Triglycerides: 165 mg/dL (Down from 195 mg/dL)',
    ],
    markers: [
      { id: 'm1', name: 'Fasting Blood Glucose', value: 104, unit: 'mg/dL', minRef: 70, maxRef: 99, referenceRangeText: '70 - 99 mg/dL', flag: 'High' },
      { id: 'm2', name: 'HbA1c (Glycated Hemoglobin)', value: 5.9, unit: '%', minRef: 4.0, maxRef: 5.6, referenceRangeText: '4.0 - 5.6%', flag: 'High' },
      { id: 'm3', name: 'Total Cholesterol', value: 210, unit: 'mg/dL', minRef: 125, maxRef: 200, referenceRangeText: '< 200 mg/dL', flag: 'High' },
      { id: 'm4', name: 'LDL Cholesterol', value: 128, unit: 'mg/dL', minRef: 0, maxRef: 100, referenceRangeText: '< 100 mg/dL', flag: 'High' },
      { id: 'm5', name: 'HDL Cholesterol', value: 49, unit: 'mg/dL', minRef: 40, maxRef: 60, referenceRangeText: '> 40 mg/dL', flag: 'Normal' },
      { id: 'm6', name: 'Triglycerides', value: 165, unit: 'mg/dL', minRef: 0, maxRef: 150, referenceRangeText: '< 150 mg/dL', flag: 'High' },
      { id: 'm7', name: 'Serum Creatinine', value: 0.92, unit: 'mg/dL', minRef: 0.7, maxRef: 1.3, referenceRangeText: '0.7 - 1.3 mg/dL', flag: 'Normal' },
      { id: 'm8', name: 'eGFR', value: 99, unit: 'mL/min/1.73m²', minRef: 90, maxRef: 120, referenceRangeText: '> 90', flag: 'Normal' },
      { id: 'm9', name: 'ALT (Liver Enzyme)', value: 28, unit: 'U/L', minRef: 7, maxRef: 56, referenceRangeText: '7 - 56 U/L', flag: 'Normal' },
    ],
    doctorNotes: 'Positive response to Metformin and exercise regimen. Continue current dosage. Add Omega-3 supplementation for triglycerides.',
    tags: ['Follow-up', 'Progress Check', 'Prediabetes', 'Metformin'],
    followUpDate: '2026-01-20',
    createdAt: '2025-07-21T11:00:00.000Z',
    updatedAt: '2025-07-21T11:00:00.000Z',
  },
  // John's 1-Year Follow-up (Jan 2026)
  {
    id: 'rep-103',
    memberId: 'mem-1',
    memberName: 'John Miller',
    title: '1-Year Metabolic, Lipid & Cardiovascular Review',
    category: 'Metabolic & Diabetes',
    reportDate: '2026-01-18',
    labName: 'Quest Diagnostics Inc.',
    orderingDoctor: 'Dr. Robert Vance, MD',
    status: 'Normal',
    fileName: 'Quest_Lab_JohnMiller_Jan2026.pdf',
    fileType: 'application/pdf',
    fileSize: 250000,
    summary: 'Superb clinical milestone: HbA1c normalized to 5.5% (Non-diabetic range). Fasting glucose is 94 mg/dL. Total cholesterol is 185 mg/dL, LDL is 96 mg/dL, and Triglycerides are within normal limits (128 mg/dL).',
    keyFindings: [
      'HbA1c normalized to 5.5% (Optimal, down from 6.3%)',
      'Fasting Glucose: 94 mg/dL (Normal, down from 118 mg/dL)',
      'Total Cholesterol: 185 mg/dL (Optimal, down from 228 mg/dL)',
      'LDL: 96 mg/dL (Optimal, down from 145 mg/dL)',
      'Triglycerides: 128 mg/dL (Optimal, down from 195 mg/dL)',
    ],
    markers: [
      { id: 'm1', name: 'Fasting Blood Glucose', value: 94, unit: 'mg/dL', minRef: 70, maxRef: 99, referenceRangeText: '70 - 99 mg/dL', flag: 'Normal' },
      { id: 'm2', name: 'HbA1c (Glycated Hemoglobin)', value: 5.5, unit: '%', minRef: 4.0, maxRef: 5.6, referenceRangeText: '4.0 - 5.6%', flag: 'Normal' },
      { id: 'm3', name: 'Total Cholesterol', value: 185, unit: 'mg/dL', minRef: 125, maxRef: 200, referenceRangeText: '< 200 mg/dL', flag: 'Normal' },
      { id: 'm4', name: 'LDL Cholesterol', value: 96, unit: 'mg/dL', minRef: 0, maxRef: 100, referenceRangeText: '< 100 mg/dL', flag: 'Normal' },
      { id: 'm5', name: 'HDL Cholesterol', value: 54, unit: 'mg/dL', minRef: 40, maxRef: 60, referenceRangeText: '> 40 mg/dL', flag: 'Normal' },
      { id: 'm6', name: 'Triglycerides', value: 128, unit: 'mg/dL', minRef: 0, maxRef: 150, referenceRangeText: '< 150 mg/dL', flag: 'Normal' },
      { id: 'm7', name: 'Serum Creatinine', value: 0.90, unit: 'mg/dL', minRef: 0.7, maxRef: 1.3, referenceRangeText: '0.7 - 1.3 mg/dL', flag: 'Normal' },
      { id: 'm8', name: 'eGFR', value: 101, unit: 'mL/min/1.73m²', minRef: 90, maxRef: 120, referenceRangeText: '> 90', flag: 'Normal' },
      { id: 'm9', name: 'ALT (Liver Enzyme)', value: 24, unit: 'U/L', minRef: 7, maxRef: 56, referenceRangeText: '7 - 56 U/L', flag: 'Normal' },
      { id: 'm10', name: 'High Sensitivity CRP (Inflammation)', value: 0.8, unit: 'mg/L', minRef: 0, maxRef: 1.0, referenceRangeText: '< 1.0 mg/L', flag: 'Normal' },
    ],
    doctorNotes: 'Outstanding reversal of prediabetes markers. Maintain current diet and exercise routine. Can trial stepping down Metformin if next 6-month HbA1c remains under 5.6%.',
    tags: ['Annual Checkup', 'Full Remission', 'Optimal Vitals'],
    followUpDate: '2026-07-20',
    createdAt: '2026-01-19T09:30:00.000Z',
    updatedAt: '2026-01-19T09:30:00.000Z',
  },
  // Sarah's Thyroid & Complete Blood Count (Nov 2025)
  {
    id: 'rep-201',
    memberId: 'mem-2',
    memberName: 'Sarah Miller',
    title: 'Thyroid Function & Complete Blood Count (CBC)',
    category: 'Thyroid Panel',
    reportDate: '2025-11-12',
    labName: 'Labcorp Diagnostics',
    orderingDoctor: 'Dr. Clara Adams, MD',
    status: 'Normal',
    fileName: 'Labcorp_Sarah_Thyroid_CBC.pdf',
    fileType: 'application/pdf',
    fileSize: 198000,
    summary: 'Thyroid hormones TSH (2.1 uIU/mL) and Free T4 (1.2 ng/dL) are well-stabilized on Levothyroxine 75mcg. Ferritin and Hemoglobin are recovered after iron supplementation.',
    keyFindings: [
      'TSH: 2.10 uIU/mL (Optimal euthyroid range 0.45 - 4.5)',
      'Free T4: 1.25 ng/dL (Normal)',
      'Hemoglobin: 13.6 g/dL (Healthy normal)',
      'Serum Ferritin: 58 ng/mL (Normal, resolved anemia)',
      'Vitamin D (25-OH): 42 ng/mL (Optimal)',
    ],
    markers: [
      { id: 's1', name: 'TSH (Thyroid Stimulating Hormone)', value: 2.10, unit: 'uIU/mL', minRef: 0.45, maxRef: 4.5, referenceRangeText: '0.45 - 4.50 uIU/mL', flag: 'Normal' },
      { id: 's2', name: 'Free T4', value: 1.25, unit: 'ng/dL', minRef: 0.82, maxRef: 1.77, referenceRangeText: '0.82 - 1.77 ng/dL', flag: 'Normal' },
      { id: 's3', name: 'Free T3', value: 3.1, unit: 'pg/mL', minRef: 2.0, maxRef: 4.4, referenceRangeText: '2.0 - 4.4 pg/mL', flag: 'Normal' },
      { id: 's4', name: 'Hemoglobin', value: 13.6, unit: 'g/dL', minRef: 12.0, maxRef: 16.0, referenceRangeText: '12.0 - 16.0 g/dL', flag: 'Normal' },
      { id: 's5', name: 'Hematocrit', value: 40.2, unit: '%', minRef: 36.0, maxRef: 46.0, referenceRangeText: '36.0 - 46.0%', flag: 'Normal' },
      { id: 's6', name: 'Serum Ferritin', value: 58, unit: 'ng/mL', minRef: 15, maxRef: 150, referenceRangeText: '15 - 150 ng/mL', flag: 'Normal' },
      { id: 's7', name: 'Vitamin D, 25-Hydroxy', value: 42, unit: 'ng/mL', minRef: 30, maxRef: 100, referenceRangeText: '30 - 100 ng/mL', flag: 'Normal' },
    ],
    doctorNotes: 'Levothyroxine dosage is appropriate. Iron stores are healthy. Discontinue daily iron and transition to dietary maintenance.',
    tags: ['Thyroid', 'CBC', 'Ferritin', 'Endocrine'],
    followUpDate: '2026-05-15',
    createdAt: '2025-11-13T12:00:00.000Z',
    updatedAt: '2025-11-13T12:00:00.000Z',
  },
  // Eleanor's Echocardiogram & Renal Panel (Dec 2025)
  {
    id: 'rep-301',
    memberId: 'mem-3',
    memberName: 'Eleanor Miller',
    title: 'Echocardiogram & Comprehensive Renal Chemistry',
    category: 'Cardiology & ECG',
    reportDate: '2025-12-04',
    labName: 'University Heart & Vascular Center',
    orderingDoctor: 'Dr. Howard Sterling, MD',
    status: 'Needs Attention',
    fileName: 'Eleanor_Echo_Renal_Dec2025.pdf',
    fileType: 'application/pdf',
    fileSize: 380000,
    summary: 'Transthoracic Echocardiogram demonstrates normal Left Ventricular Ejection Fraction (LVEF 60-65%), mild left atrial enlargement, and grade 1 diastolic dysfunction. Serum Creatinine 1.28 mg/dL (eGFR 54 mL/min) reflects stable Stage 2 CKD.',
    keyFindings: [
      'LVEF (Ejection Fraction): 62% (Preserved, ref > 50%)',
      'Blood Pressure (Clinical): 132/82 mmHg (Well-controlled)',
      'Serum Creatinine: 1.28 mg/dL (Mild elevation)',
      'eGFR: 54 mL/min/1.73m² (Stage 2 CKD, stable baseline)',
      'Serum Potassium: 4.4 mEq/L (Normal)',
    ],
    markers: [
      { id: 'e1', name: 'Ejection Fraction (LVEF)', value: 62, unit: '%', minRef: 50, maxRef: 75, referenceRangeText: '50 - 75%', flag: 'Normal' },
      { id: 'e2', name: 'Systolic Blood Pressure', value: 132, unit: 'mmHg', minRef: 90, maxRef: 120, referenceRangeText: '< 130 mmHg', flag: 'High' },
      { id: 'e3', name: 'Diastolic Blood Pressure', value: 82, unit: 'mmHg', minRef: 60, maxRef: 80, referenceRangeText: '< 80 mmHg', flag: 'High' },
      { id: 'e4', name: 'Serum Creatinine', value: 1.28, unit: 'mg/dL', minRef: 0.5, maxRef: 1.1, referenceRangeText: '0.5 - 1.1 mg/dL', flag: 'High' },
      { id: 'e5', name: 'eGFR', value: 54, unit: 'mL/min/1.73m²', minRef: 60, maxRef: 120, referenceRangeText: '> 60', flag: 'Low' },
      { id: 'e6', name: 'Serum Potassium', value: 4.4, unit: 'mEq/L', minRef: 3.5, maxRef: 5.2, referenceRangeText: '3.5 - 5.2 mEq/L', flag: 'Normal' },
      { id: 'e7', name: 'Serum Sodium', value: 140, unit: 'mEq/L', minRef: 135, maxRef: 145, referenceRangeText: '135 - 145 mEq/L', flag: 'Normal' },
    ],
    doctorNotes: 'Cardiac function is preserved. BP is well managed on Losartan and Amlodipine. Renal function remains at expected stable baseline for age. Maintain adequate hydration and avoid NSAIDs.',
    tags: ['Echocardiogram', 'Cardiology', 'Renal', 'Hypertension'],
    followUpDate: '2026-06-01',
    createdAt: '2025-12-05T14:00:00.000Z',
    updatedAt: '2025-12-05T14:00:00.000Z',
  },
  // Ethan's Pediatric Allergy & Pulmonary Report (Oct 2025)
  {
    id: 'rep-401',
    memberId: 'mem-4',
    memberName: 'Ethan Miller',
    title: 'Pediatric IgE Allergy Panel & Spirometry',
    category: 'Other',
    reportDate: '2025-10-15',
    labName: 'Valley Children\'s Clinic Lab',
    orderingDoctor: 'Dr. Linda Patel, MD',
    status: 'Needs Attention',
    fileName: 'Ethan_Pediatric_Allergy_IgE.pdf',
    fileType: 'application/pdf',
    fileSize: 175000,
    summary: 'IgE quantification shows high sensitivity to Peanut (Ara h 1, Ara h 2 > 100 kU/L) and Walnut. Spirometry / Peak flow is within 95% predicted for age. Albuterol inhaler prescription renewed.',
    keyFindings: [
      'Peanut Specific IgE: > 100 kU/L (Class 6 Extreme Sensitivity)',
      'Walnut Specific IgE: 14.5 kU/L (Class 3 Sensitivity)',
      'FEV1 / FVC ratio: 88% (Normal airway mechanics)',
      'Total Serum IgE: 320 IU/mL (Elevated)',
    ],
    markers: [
      { id: 'et1', name: 'Peanut Specific IgE', value: 100, unit: 'kU/L', minRef: 0, maxRef: 0.35, referenceRangeText: '< 0.35 kU/L', flag: 'Critical' },
      { id: 'et2', name: 'Walnut Specific IgE', value: 14.5, unit: 'kU/L', minRef: 0, maxRef: 0.35, referenceRangeText: '< 0.35 kU/L', flag: 'High' },
      { id: 'et3', name: 'Total Serum IgE', value: 320, unit: 'IU/mL', minRef: 0, maxRef: 100, referenceRangeText: '< 100 IU/mL', flag: 'High' },
      { id: 'et4', name: 'Peak Expiratory Flow (PEF)', value: 280, unit: 'L/min', minRef: 240, maxRef: 320, referenceRangeText: '240 - 320 L/min', flag: 'Normal' },
      { id: 'et5', name: 'FEV1 / FVC Ratio', value: 88, unit: '%', minRef: 80, maxRef: 100, referenceRangeText: '> 80%', flag: 'Normal' },
    ],
    doctorNotes: 'Keep 2 active EpiPen auto-injectors available at home and school. Anaphylaxis action plan updated and signed for school nurse.',
    tags: ['Pediatric', 'Allergy', 'IgE', 'EpiPen', 'Asthma'],
    followUpDate: '2026-10-15',
    createdAt: '2025-10-16T15:00:00.000Z',
    updatedAt: '2025-10-16T15:00:00.000Z',
  }
];

export class StorageService {
  // Members CRUD
  static getMembers(): FamilyMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (!data) {
        this.saveMembers(INITIAL_FAMILY_MEMBERS);
        return INITIAL_FAMILY_MEMBERS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to get members:', e);
      return INITIAL_FAMILY_MEMBERS;
    }
  }

  static saveMembers(members: FamilyMember[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save members:', e);
    }
  }

  static getMemberById(id: string): FamilyMember | undefined {
    const members = this.getMembers();
    return members.find((m) => m.id === id);
  }

  static addMember(member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): FamilyMember {
    const members = this.getMembers();
    const newMember: FamilyMember = {
      ...member,
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    members.push(newMember);
    this.saveMembers(members);
    return newMember;
  }

  static updateMember(id: string, updates: Partial<FamilyMember>): FamilyMember | null {
    const members = this.getMembers();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const updated: FamilyMember = {
      ...members[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    members[index] = updated;
    this.saveMembers(members);

    // Also update memberName in existing reports if name changed
    if (updates.name && updates.name !== members[index].name) {
      const reports = this.getReports();
      let changed = false;
      const updatedReports = reports.map((r) => {
        if (r.memberId === id) {
          changed = true;
          return { ...r, memberName: updates.name! };
        }
        return r;
      });
      if (changed) this.saveReports(updatedReports);
    }

    return updated;
  }

  static deleteMember(id: string): boolean {
    let members = this.getMembers();
    const initialLen = members.length;
    members = members.filter((m) => m.id !== id);
    if (members.length === initialLen) return false;

    this.saveMembers(members);
    // Optionally delete or keep associated reports
    let reports = this.getReports();
    reports = reports.filter((r) => r.memberId !== id);
    this.saveReports(reports);
    return true;
  }

  // Reports CRUD
  static getReports(): MedicalReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (!data) {
        this.saveReports(INITIAL_MEDICAL_REPORTS);
        return INITIAL_MEDICAL_REPORTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to get reports:', e);
      return INITIAL_MEDICAL_REPORTS;
    }
  }

  static saveReports(reports: MedicalReport[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save reports:', e);
    }
  }

  static getReportById(id: string): MedicalReport | undefined {
    const reports = this.getReports();
    return reports.find((r) => r.id === id);
  }

  static getReportsByMember(memberId: string): MedicalReport[] {
    const reports = this.getReports();
    return reports
      .filter((r) => r.memberId === memberId)
      .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  }

  static addReport(report: Omit<MedicalReport, 'id' | 'createdAt' | 'updatedAt'>): MedicalReport {
    const reports = this.getReports();
    const newReport: MedicalReport = {
      ...report,
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    this.saveReports(reports);
    return newReport;
  }

  static updateReport(id: string, updates: Partial<MedicalReport>): MedicalReport | null {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated: MedicalReport = {
      ...reports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    reports[index] = updated;
    this.saveReports(reports);
    return updated;
  }

  static deleteReport(id: string): boolean {
    let reports = this.getReports();
    const initialLen = reports.length;
    reports = reports.filter((r) => r.id !== id);
    if (reports.length === initialLen) return false;
    this.saveReports(reports);
    return true;
  }

  // Doctor Share Tokens
  static getShareTokens(): DoctorShareToken[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHARE_TOKENS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static createShareToken(memberId: string, options?: { notes?: string; accessPin?: string; selectedReportIds?: string[] }): DoctorShareToken {
    const tokens = this.getShareTokens();
    const newToken: DoctorShareToken = {
      id: `tok-${Date.now()}`,
      token: `doc-ref-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      memberId,
      createdDate: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      notes: options?.notes,
      accessPin: options?.accessPin,
      selectedReportIds: options?.selectedReportIds,
    };
    tokens.push(newToken);
    localStorage.setItem(STORAGE_KEYS.SHARE_TOKENS, JSON.stringify(tokens));
    return newToken;
  }

  // Reset to Sample Data
  static resetToSampleData(): void {
    this.saveMembers(INITIAL_FAMILY_MEMBERS);
    this.saveReports(INITIAL_MEDICAL_REPORTS);
  }

  // Export all family health records as JSON
  static exportFullBackup(): string {
    const payload = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      appName: 'Family Health Report Tracker',
      members: this.getMembers(),
      reports: this.getReports(),
    };
    return JSON.stringify(payload, null, 2);
  }

  // Import backup JSON
  static importFullBackup(jsonString: string): { success: boolean; memberCount: number; reportCount: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.members) && Array.isArray(parsed.reports)) {
        this.saveMembers(parsed.members);
        this.saveReports(parsed.reports);
        return {
          success: true,
          memberCount: parsed.members.length,
          reportCount: parsed.reports.length,
        };
      }
      throw new Error('Invalid JSON structure: missing members or reports arrays.');
    } catch (e: any) {
      console.error('Import error:', e);
      throw new Error(e.message || 'Failed to import backup');
    }
  }
}
