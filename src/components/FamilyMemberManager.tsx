import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  UserCheck, 
  Heart, 
  AlertTriangle, 
  Pill, 
  Phone, 
  User, 
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { FamilyMember, Relationship, Gender } from '../types';

interface FamilyMemberManagerProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateMember: (id: string, updates: Partial<FamilyMember>) => void;
  onDeleteMember: (id: string) => void;
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
}

export const FamilyMemberManager: React.FC<FamilyMemberManagerProps> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  selectedMemberId,
  onSelectMember,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('Self');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [medicationsText, setMedicationsText] = useState('');
  
  // Emergency contact
  const [emerName, setEmerName] = useState('');
  const [emerPhone, setEmerPhone] = useState('');
  const [emerRel, setEmerRel] = useState('');

  // Primary doctor
  const [docName, setDocName] = useState('');
  const [docSpec, setDocSpec] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docHosp, setDocHosp] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setRelationship('Self');
    setDob('');
    setAge('');
    setGender('Male');
    setBloodGroup('O+');
    setAllergiesText('');
    setConditionsText('');
    setMedicationsText('');
    setEmerName('');
    setEmerPhone('');
    setEmerRel('');
    setDocName('');
    setDocSpec('');
    setDocPhone('');
    setDocHosp('');
    setIsEditing(false);
    setEditingId(null);
  };

  const startEdit = (m: FamilyMember) => {
    setIsEditing(true);
    setEditingId(m.id);
    setName(m.name);
    setRelationship(m.relationship);
    setDob(m.dob || '');
    setAge(m.age || '');
    setGender(m.gender);
    setBloodGroup(m.bloodGroup || 'O+');
    setAllergiesText(m.allergies.join(', '));
    setConditionsText(m.conditions.join(', '));
    setMedicationsText(m.medications.join(', '));
    setEmerName(m.emergencyContact?.name || '');
    setEmerPhone(m.emergencyContact?.phone || '');
    setEmerRel(m.emergencyContact?.relationship || '');
    setDocName(m.primaryDoctor?.name || '');
    setDocSpec(m.primaryDoctor?.specialty || '');
    setDocPhone(m.primaryDoctor?.phone || '');
    setDocHosp(m.primaryDoctor?.hospital || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parseList = (str: string) =>
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const payload = {
      name: name.trim(),
      relationship,
      dob: dob || new Date().toISOString().split('T')[0],
      age: age ? Number(age) : undefined,
      gender,
      bloodGroup,
      allergies: parseList(allergiesText),
      conditions: parseList(conditionsText),
      medications: parseList(medicationsText),
      emergencyContact: {
        name: emerName,
        phone: emerPhone,
        relationship: emerRel,
      },
      primaryDoctor: docName
        ? {
            name: docName,
            specialty: docSpec || 'General Physician',
            phone: docPhone,
            hospital: docHosp,
          }
        : undefined,
      avatarColor: 'indigo',
    };

    if (editingId) {
      onUpdateMember(editingId, payload);
    } else {
      onAddMember(payload);
    }

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="family-members-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Family Health Profiles</h2>
              <p className="text-xs text-slate-500">Manage individual medical identities, allergies, and doctors</p>
            </div>
          </div>
          <button
            id="close-family-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* List of existing members */}
          {!isEditing && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                  Registered Members ({members.length})
                </h3>
                <button
                  id="add-new-member-btn"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Family Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    id={`member-card-${member.id}`}
                    className={`p-4 rounded-xl border transition relative ${
                      selectedMemberId === member.id
                        ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-base">{member.name}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {member.relationship}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {member.age ? `${member.age} yrs` : ''} {member.gender} • Blood: <strong className="text-rose-600">{member.bloodGroup || 'O+'}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          id={`edit-member-${member.id}`}
                          onClick={() => startEdit(member)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {members.length > 1 && (
                          <button
                            id={`delete-member-${member.id}`}
                            onClick={() => setConfirmDeleteId(member.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Member Details Badges */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                      {member.allergies.length > 0 && (
                        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Allergies: <strong>{member.allergies.join(', ')}</strong></span>
                        </div>
                      )}
                      {member.conditions.length > 0 && (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>Conditions: {member.conditions.join(', ')}</span>
                        </div>
                      )}
                      {member.medications.length > 0 && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Pill className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>Active Meds: {member.medications.join(', ')}</span>
                        </div>
                      )}
                      {member.primaryDoctor && (
                        <div className="flex items-center gap-1.5 text-slate-600 pt-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Doctor: {member.primaryDoctor.name} ({member.primaryDoctor.specialty})</span>
                        </div>
                      )}
                    </div>

                    {/* Set Active Button */}
                    <div className="mt-3 flex justify-end">
                      <button
                        id={`select-active-${member.id}`}
                        onClick={() => onSelectMember(member.id)}
                        className={`text-xs font-semibold px-3 py-1 rounded-md transition cursor-pointer ${
                          selectedMemberId === member.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {selectedMemberId === member.id ? '✓ Active Profile' : 'Select as Active'}
                      </button>
                    </div>

                    {/* Delete Confirmation Overlay */}
                    {confirmDeleteId === member.id && (
                      <div className="absolute inset-0 bg-white/95 rounded-xl p-4 flex flex-col items-center justify-center text-center z-10 animate-in fade-in">
                        <AlertCircle className="w-8 h-8 text-rose-600 mb-1" />
                        <h5 className="font-bold text-slate-900 text-sm">Delete {member.name}?</h5>
                        <p className="text-xs text-slate-500 mb-3">All associated lab reports will also be removed.</p>
                        <div className="flex items-center gap-2">
                          <button
                            id={`cancel-delete-${member.id}`}
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            id={`confirm-delete-${member.id}`}
                            onClick={() => {
                              onDeleteMember(member.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700 cursor-pointer"
                          >
                            Yes, Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member Add/Edit Form */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-base">
                  {editingId ? 'Edit Family Member Profile' : 'Add New Family Member'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel & Return to List
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    id="member-form-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    id="member-form-rel"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as Relationship)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Self">Self</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Relative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    id="member-form-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    id="member-form-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                      if (e.target.value) {
                        const birthYear = new Date(e.target.value).getFullYear();
                        const currentYear = new Date().getFullYear();
                        setAge(currentYear - birthYear);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    id="member-form-age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 42"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    id="member-form-blood"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-rose-700"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              {/* Medical background */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Allergies (comma-separated)
                  </label>
                  <input
                    id="member-form-allergies"
                    type="text"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts, Latex"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Known Medical Conditions / Chronic Illnesses (comma-separated)
                  </label>
                  <input
                    id="member-form-conditions"
                    type="text"
                    value={conditionsText}
                    onChange={(e) => setConditionsText(e.target.value)}
                    placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Medications & Dosages (comma-separated)
                  </label>
                  <input
                    id="member-form-meds"
                    type="text"
                    value={medicationsText}
                    onChange={(e) => setMedicationsText(e.target.value)}
                    placeholder="e.g. Metformin 500mg, Levothyroxine 75mcg"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Emergency Contact & Primary Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    Emergency Contact
                  </h4>
                  <input
                    id="member-form-emer-name"
                    type="text"
                    value={emerName}
                    onChange={(e) => setEmerName(e.target.value)}
                    placeholder="Contact Name"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="member-form-emer-phone"
                      type="text"
                      value={emerPhone}
                      onChange={(e) => setEmerPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                    <input
                      id="member-form-emer-rel"
                      type="text"
                      value={emerRel}
                      onChange={(e) => setEmerRel(e.target.value)}
                      placeholder="Relationship"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Primary Care Physician
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="member-form-doc-name"
                      type="text"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="Doctor Name (e.g. Dr. Vance)"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                    <input
                      id="member-form-doc-spec"
                      type="text"
                      value={docSpec}
                      onChange={(e) => setDocSpec(e.target.value)}
                      placeholder="Specialty (e.g. Endocrinology)"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="member-form-doc-phone"
                      type="text"
                      value={docPhone}
                      onChange={(e) => setDocPhone(e.target.value)}
                      placeholder="Clinic Phone"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                    <input
                      id="member-form-doc-hosp"
                      type="text"
                      value={docHosp}
                      onChange={(e) => setDocHosp(e.target.value)}
                      placeholder="Clinic / Hospital Name"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="save-member-submit-btn"
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                >
                  {editingId ? 'Update Member Profile' : 'Save Member'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{members.length} Family profile(s) configured.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
