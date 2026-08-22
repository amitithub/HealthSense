import { FamilyMember, MedicalReport, DoctorShareToken, LabMarker } from '../types';

const STORAGE_KEYS = {
  MEMBERS: 'healthsense_members_v2',
  REPORTS: 'healthsense_reports_v2',
  SHARE_TOKENS: 'healthsense_share_tokens_v2',
  SETTINGS: 'healthsense_settings_v2',
};

// Initial realistic sample data
const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [];
const INITIAL_MEDICAL_REPORTS: MedicalReport[] = [];

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
      appName: 'HealthSense',
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
