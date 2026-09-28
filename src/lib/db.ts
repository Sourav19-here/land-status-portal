import { District, Mandal, Village, LandRecord, FlagRecord, SearchParams, LandRecordSubmission } from '@/types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  INITIAL_DISTRICTS,
  INITIAL_MANDALS,
  INITIAL_VILLAGES,
  INITIAL_LAND_RECORDS,
  INITIAL_FLAGS,
} from './seedData';

// Maintain in-memory state on globalThis to persist across API requests & Fast Refresh
interface InMemoryStore {
  districts: District[];
  mandals: Mandal[];
  villages: Village[];
  landRecords: LandRecord[];
  flags: FlagRecord[];
}

declare global {
  // eslint-disable-next-line no-var
  var __LAND_STATUS_DB__: InMemoryStore | undefined;
}

function getStore(): InMemoryStore {
  if (!globalThis.__LAND_STATUS_DB__) {
    globalThis.__LAND_STATUS_DB__ = {
      districts: [...INITIAL_DISTRICTS],
      mandals: [...INITIAL_MANDALS],
      villages: [...INITIAL_VILLAGES],
      landRecords: [...INITIAL_LAND_RECORDS],
      flags: [...INITIAL_FLAGS],
    };
  }
  return globalThis.__LAND_STATUS_DB__;
}

export async function getDistricts(): Promise<District[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('districts').select('*').order('name');
    if (!error && data) return data;
  }
  return getStore().districts.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMandals(districtId?: string): Promise<Mandal[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('mandals').select('*').order('name');
    if (districtId) query = query.eq('district_id', districtId);
    const { data, error } = await query;
    if (!error && data) return data;
  }

  const mandals = getStore().mandals;
  const filtered = districtId ? mandals.filter(m => m.district_id === districtId) : mandals;
  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getVillages(mandalId?: string): Promise<Village[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('villages').select('*').order('name');
    if (mandalId) query = query.eq('mandal_id', mandalId);
    const { data, error } = await query;
    if (!error && data) return data;
  }

  const villages = getStore().villages;
  const filtered = mandalId ? villages.filter(v => v.mandal_id === mandalId) : villages;
  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}

export async function findExistingRecord(villageId: string, surveyNumber: string): Promise<LandRecord | null> {
  const normSurvey = surveyNumber.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from('land_records')
      .select('*, villages(name, mandal_id, mandals(name, district_id, districts(name)))')
      .eq('village_id', villageId)
      .ilike('survey_number', normSurvey)
      .maybeSingle();

    if (data) {
      return formatSupabaseRecord(data);
    }
  }

  const store = getStore();
  const match = store.landRecords.find(
    r => r.village_id === villageId && r.survey_number.trim().toLowerCase() === normSurvey
  );
  return match || null;
}

export async function searchLandRecords(params: SearchParams): Promise<LandRecord[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('land_records')
      .select('*, villages!inner(name, mandal_id, mandals!inner(name, district_id, districts!inner(name)))')
      .order('created_at', { ascending: false });

    if (params.village_id) query = query.eq('village_id', params.village_id);
    if (params.survey_number) query = query.ilike('survey_number', `%${params.survey_number.trim()}%`);
    if (params.owner_name) query = query.ilike('owner_name', `%${params.owner_name.trim()}%`);
    if (params.passbook_number) query = query.ilike('passbook_number', `%${params.passbook_number.trim()}%`);
    if (params.classification) query = query.eq('classification', params.classification);
    if (params.verification_status) query = query.eq('verification_status', params.verification_status);
    if (params.extent_min !== undefined) query = query.gte('extent_acres', params.extent_min);
    if (params.extent_max !== undefined) query = query.lte('extent_acres', params.extent_max);

    const { data, error } = await query;
    if (!error && data) {
      return data.map(formatSupabaseRecord);
    }
  }

  // Local In-Memory search
  const store = getStore();
  let results = [...store.landRecords];

  if (params.district_id) {
    results = results.filter(r => r.district_id === params.district_id);
  }
  if (params.mandal_id) {
    results = results.filter(r => r.mandal_id === params.mandal_id);
  }
  if (params.village_id) {
    results = results.filter(r => r.village_id === params.village_id);
  }
  if (params.survey_number) {
    const q = params.survey_number.trim().toLowerCase();
    results = results.filter(r => r.survey_number.toLowerCase().includes(q));
  }
  if (params.owner_name) {
    const q = params.owner_name.trim().toLowerCase();
    results = results.filter(r => r.owner_name.toLowerCase().includes(q));
  }
  if (params.passbook_number) {
    const q = params.passbook_number.trim().toLowerCase();
    results = results.filter(r => r.passbook_number?.toLowerCase().includes(q));
  }
  if (params.classification) {
    results = results.filter(r => r.classification === params.classification);
  }
  if (params.verification_status) {
    results = results.filter(r => r.verification_status === params.verification_status);
  }
  if (params.extent_min !== undefined && !isNaN(params.extent_min)) {
    results = results.filter(r => r.extent_acres >= (params.extent_min as number));
  }
  if (params.extent_max !== undefined && !isNaN(params.extent_max)) {
    results = results.filter(r => r.extent_acres <= (params.extent_max as number));
  }

  return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createLandRecord(submission: LandRecordSubmission, userId: string): Promise<LandRecord> {
  const existing = await findExistingRecord(submission.village_id, submission.survey_number);
  if (existing) {
    throw new Error('DUPLICATE_PARCEL');
  }

  const store = getStore();
  const village = store.villages.find(v => v.id === submission.village_id);
  const mandal = village ? store.mandals.find(m => m.id === village.mandal_id) : undefined;
  const district = mandal ? store.districts.find(d => d.id === mandal.district_id) : undefined;

  const now = new Date().toISOString();
  const newRecord: LandRecord = {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    village_id: submission.village_id,
    survey_number: submission.survey_number.trim(),
    owner_name: submission.owner_name.trim(),
    father_name: submission.father_name?.trim() || null,
    extent_acres: Number(submission.extent_acres),
    classification: submission.classification,
    passbook_number: submission.passbook_number?.trim() || null,
    khata_number: submission.khata_number?.trim() || null,
    verification_status: 'unverified',
    submitted_by: userId,
    created_at: now,
    updated_at: now,
    village_name: village?.name || 'Village',
    mandal_name: mandal?.name || 'Mandal',
    district_name: district?.name || 'District',
    mandal_id: mandal?.id,
    district_id: district?.id,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('land_records')
      .insert({
        village_id: submission.village_id,
        survey_number: submission.survey_number.trim(),
        owner_name: submission.owner_name.trim(),
        father_name: submission.father_name?.trim() || null,
        extent_acres: Number(submission.extent_acres),
        classification: submission.classification,
        passbook_number: submission.passbook_number?.trim() || null,
        khata_number: submission.khata_number?.trim() || null,
        verification_status: 'unverified',
        submitted_by: userId,
      })
      .select('*, villages(name, mandal_id, mandals(name, district_id, districts(name)))')
      .single();

    if (!error && data) {
      return formatSupabaseRecord(data);
    }
  }

  store.landRecords.unshift(newRecord);
  return newRecord;
}

export async function getUserLandRecords(userId: string): Promise<LandRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('land_records')
      .select('*, villages(name, mandal_id, mandals(name, district_id, districts(name)))')
      .eq('submitted_by', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map(formatSupabaseRecord);
    }
  }

  const store = getStore();
  return store.landRecords
    .filter(r => r.submitted_by === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateLandRecord(
  id: string,
  userId: string,
  updates: Partial<LandRecordSubmission>
): Promise<LandRecord> {
  const store = getStore();
  const record = store.landRecords.find(r => r.id === id);
  if (!record) {
    throw new Error('RECORD_NOT_FOUND');
  }

  if (record.submitted_by !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  const now = new Date().toISOString();

  if (updates.owner_name !== undefined) record.owner_name = updates.owner_name.trim();
  if (updates.father_name !== undefined) record.father_name = updates.father_name?.trim() || null;
  if (updates.extent_acres !== undefined) record.extent_acres = Number(updates.extent_acres);
  if (updates.classification !== undefined) record.classification = updates.classification;
  if (updates.passbook_number !== undefined) record.passbook_number = updates.passbook_number?.trim() || null;
  if (updates.khata_number !== undefined) record.khata_number = updates.khata_number?.trim() || null;
  record.updated_at = now;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('land_records')
      .update({
        owner_name: record.owner_name,
        father_name: record.father_name,
        extent_acres: record.extent_acres,
        classification: record.classification,
        passbook_number: record.passbook_number,
        khata_number: record.khata_number,
        updated_at: now,
      })
      .eq('id', id)
      .eq('submitted_by', userId)
      .select('*, villages(name, mandal_id, mandals(name, district_id, districts(name)))')
      .single();

    if (!error && data) {
      return formatSupabaseRecord(data);
    }
  }

  return record;
}

export async function deleteLandRecord(id: string, userId: string): Promise<boolean> {
  const store = getStore();
  const index = store.landRecords.findIndex(r => r.id === id);
  if (index === -1) {
    throw new Error('RECORD_NOT_FOUND');
  }

  const record = store.landRecords[index];
  if (record.submitted_by !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('land_records')
      .delete()
      .eq('id', id)
      .eq('submitted_by', userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  store.landRecords.splice(index, 1);
  // Also clean up any associated flags
  store.flags = store.flags.filter(f => f.land_record_id !== id);

  return true;
}


export async function flagLandRecord(
  recordId: string,
  userId: string,
  reason: string,
  userEmail?: string
): Promise<{ success: boolean; flag: FlagRecord }> {
  const store = getStore();
  const record = store.landRecords.find(r => r.id === recordId);
  if (!record) {
    throw new Error('RECORD_NOT_FOUND');
  }

  const now = new Date().toISOString();
  const flag: FlagRecord = {
    id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    land_record_id: recordId,
    flagged_by: userId,
    reason: reason.trim(),
    created_at: now,
    user_email: userEmail || 'user@example.com',
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('flags').insert({
      land_record_id: recordId,
      flagged_by: userId,
      reason: reason.trim(),
    });

    await supabase
      .from('land_records')
      .update({ verification_status: 'flagged' })
      .eq('id', recordId);
  }

  // Update in-memory
  record.verification_status = 'flagged';
  record.flag_count = (record.flag_count || 0) + 1;
  store.flags.unshift(flag);

  return { success: true, flag };
}

export async function getRecordFlags(recordId: string): Promise<FlagRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from('flags')
      .select('*')
      .eq('land_record_id', recordId)
      .order('created_at', { ascending: false });
    if (data) return data;
  }

  const store = getStore();
  return store.flags.filter(f => f.land_record_id === recordId);
}

// Helper to format Supabase joined structure into flat LandRecord
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatSupabaseRecord(data: any): LandRecord {
  const village = data.villages;
  const mandal = village?.mandals;
  const district = mandal?.districts;

  return {
    id: data.id,
    village_id: data.village_id,
    survey_number: data.survey_number,
    owner_name: data.owner_name,
    father_name: data.father_name,
    extent_acres: Number(data.extent_acres),
    classification: data.classification,
    passbook_number: data.passbook_number,
    khata_number: data.khata_number,
    verification_status: data.verification_status,
    submitted_by: data.submitted_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    village_name: village?.name,
    mandal_name: mandal?.name,
    district_name: district?.name,
    mandal_id: village?.mandal_id,
    district_id: mandal?.district_id,
  };
}
