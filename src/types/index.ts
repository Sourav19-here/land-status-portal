export type VerificationStatus = 'unverified' | 'flagged' | 'verified';

export type LandClassification =
  | 'Agricultural'
  | 'Residential'
  | 'Commercial'
  | 'Industrial'
  | 'Mixed Use'
  | 'Government / Assigned';

export interface District {
  id: string;
  name: string;
  code?: string;
}

export interface Mandal {
  id: string;
  district_id: string;
  name: string;
}

export interface Village {
  id: string;
  mandal_id: string;
  name: string;
}

export interface LandRecord {
  id: string;
  village_id: string;
  survey_number: string;
  owner_name: string;
  father_name?: string | null;
  extent_acres: number;
  classification: string;
  passbook_number?: string | null;
  khata_number?: string | null;
  verification_status: VerificationStatus;
  submitted_by: string;
  created_at: string;
  updated_at: string;
  // Joined relation fields for convenience
  village_name?: string;
  mandal_name?: string;
  district_name?: string;
  mandal_id?: string;
  district_id?: string;
  flag_count?: number;
}

export interface FlagRecord {
  id: string;
  land_record_id: string;
  flagged_by: string;
  reason: string;
  created_at: string;
  user_email?: string;
}

export interface SearchParams {
  district_id?: string;
  mandal_id?: string;
  village_id?: string;
  survey_number?: string;
  owner_name?: string;
  passbook_number?: string;
  classification?: string;
  extent_min?: number;
  extent_max?: number;
  verification_status?: VerificationStatus;
}

export interface LandRecordSubmission {
  village_id: string;
  survey_number: string;
  owner_name: string;
  father_name?: string;
  extent_acres: number;
  classification: string;
  passbook_number?: string;
  khata_number?: string;
}

export interface Profile {
  id: string;
  display_name?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserSession {
  id: string;
  email?: string;
  phone?: string;
  display_name?: string;
}

