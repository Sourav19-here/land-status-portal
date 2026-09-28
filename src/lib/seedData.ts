import { District, Mandal, Village, LandRecord, FlagRecord } from '@/types';

export const INITIAL_DISTRICTS: District[] = [
  { id: 'd1000000-0000-0000-0000-000000000001', name: 'Rangareddy', code: 'RR' },
  { id: 'd1000000-0000-0000-0000-000000000002', name: 'Medchal-Malkajgiri', code: 'MM' },
  { id: 'd1000000-0000-0000-0000-000000000003', name: 'Sangareddy', code: 'SR' },
  { id: 'd1000000-0000-0000-0000-000000000004', name: 'Nalgonda', code: 'NG' },
  { id: 'd1000000-0000-0000-0000-000000000005', name: 'Yadadri Bhuvanagiri', code: 'YB' },
];

export const INITIAL_MANDALS: Mandal[] = [
  // Rangareddy
  { id: 'm1000000-0000-0000-0000-000000000001', district_id: 'd1000000-0000-0000-0000-000000000001', name: 'Shamshabad' },
  { id: 'm1000000-0000-0000-0000-000000000002', district_id: 'd1000000-0000-0000-0000-000000000001', name: 'Rajendranagar' },
  { id: 'm1000000-0000-0000-0000-000000000003', district_id: 'd1000000-0000-0000-0000-000000000001', name: 'Chevella' },
  // Medchal-Malkajgiri
  { id: 'm1000000-0000-0000-0000-000000000004', district_id: 'd1000000-0000-0000-0000-000000000002', name: 'Ghatkesar' },
  { id: 'm1000000-0000-0000-0000-000000000005', district_id: 'd1000000-0000-0000-0000-000000000002', name: 'Medchal' },
  // Sangareddy
  { id: 'm1000000-0000-0000-0000-000000000006', district_id: 'd1000000-0000-0000-0000-000000000003', name: 'Patancheru' },
  { id: 'm1000000-0000-0000-0000-000000000007', district_id: 'd1000000-0000-0000-0000-000000000003', name: 'Ameenpur' },
  // Nalgonda
  { id: 'm1000000-0000-0000-0000-000000000008', district_id: 'd1000000-0000-0000-0000-000000000004', name: 'Miryalaguda' },
  // Yadadri Bhuvanagiri
  { id: 'm1000000-0000-0000-0000-000000000009', district_id: 'd1000000-0000-0000-0000-000000000005', name: 'Bhongir' },
];

export const INITIAL_VILLAGES: Village[] = [
  // Shamshabad
  { id: 'v1000000-0000-0000-0000-000000000001', mandal_id: 'm1000000-0000-0000-0000-000000000001', name: 'Mamidipally' },
  { id: 'v1000000-0000-0000-0000-000000000002', mandal_id: 'm1000000-0000-0000-0000-000000000001', name: 'Mankhal' },
  { id: 'v1000000-0000-0000-0000-000000000003', mandal_id: 'm1000000-0000-0000-0000-000000000001', name: 'Ootapally' },
  // Rajendranagar
  { id: 'v1000000-0000-0000-0000-000000000004', mandal_id: 'm1000000-0000-0000-0000-000000000002', name: 'Budvel' },
  { id: 'v1000000-0000-0000-0000-000000000005', mandal_id: 'm1000000-0000-0000-0000-000000000002', name: 'Kismatpur' },
  // Chevella
  { id: 'v1000000-0000-0000-0000-000000000003', mandal_id: 'm1000000-0000-0000-0000-000000000003', name: 'Aloor' },
  { id: 'v1000000-0000-0000-0000-000000000007', mandal_id: 'm1000000-0000-0000-0000-000000000003', name: 'Damargidda' },
  // Ghatkesar
  { id: 'v1000000-0000-0000-0000-000000000008', mandal_id: 'm1000000-0000-0000-0000-000000000004', name: 'Kondapur' },
  { id: 'v1000000-0000-0000-0000-000000000009', mandal_id: 'm1000000-0000-0000-0000-000000000004', name: 'Pocharam' },
  // Patancheru
  { id: 'v1000000-0000-0000-0000-000000000010', mandal_id: 'm1000000-0000-0000-0000-000000000006', name: 'Muthangi' },
  { id: 'v1000000-0000-0000-0000-000000000011', mandal_id: 'm1000000-0000-0000-0000-000000000006', name: 'Rudraram' },
];

export const INITIAL_LAND_RECORDS: LandRecord[] = [
  {
    id: 'r1000000-0000-0000-0000-000000000001',
    village_id: 'v1000000-0000-0000-0000-000000000001',
    survey_number: '142/A',
    owner_name: 'Kotha Venkataiah',
    father_name: 'K. Ramulu',
    extent_acres: 2.45,
    classification: 'Agricultural',
    passbook_number: 'T0712004589',
    khata_number: 'KH-1042',
    verification_status: 'unverified',
    submitted_by: 'demo-user-1',
    created_at: '2026-09-20T10:30:00Z',
    updated_at: '2026-09-20T10:30:00Z',
    village_name: 'Mamidipally',
    mandal_name: 'Shamshabad',
    district_name: 'Rangareddy',
    mandal_id: 'm1000000-0000-0000-0000-000000000001',
    district_id: 'd1000000-0000-0000-0000-000000000001',
  },
  {
    id: 'r1000000-0000-0000-0000-000000000002',
    village_id: 'v1000000-0000-0000-0000-000000000001',
    survey_number: '142/B',
    owner_name: 'Guduru Lakshmi Devi',
    father_name: 'G. Narasimha Rao',
    extent_acres: 1.80,
    classification: 'Agricultural',
    passbook_number: 'T0712004590',
    khata_number: 'KH-1043',
    verification_status: 'unverified',
    submitted_by: 'demo-user-2',
    created_at: '2026-09-21T14:15:00Z',
    updated_at: '2026-09-21T14:15:00Z',
    village_name: 'Mamidipally',
    mandal_name: 'Shamshabad',
    district_name: 'Rangareddy',
    mandal_id: 'm1000000-0000-0000-0000-000000000001',
    district_id: 'd1000000-0000-0000-0000-000000000001',
  },
  {
    id: 'r1000000-0000-0000-0000-000000000003',
    village_id: 'v1000000-0000-0000-0000-000000000004',
    survey_number: '208/2',
    owner_name: 'Bandi Srikanth Reddy',
    father_name: 'B. Mohan Reddy',
    extent_acres: 0.75,
    classification: 'Residential',
    passbook_number: 'T0715009121',
    khata_number: 'KH-2309',
    verification_status: 'unverified',
    submitted_by: 'demo-user-1',
    created_at: '2026-09-22T09:40:00Z',
    updated_at: '2026-09-22T09:40:00Z',
    village_name: 'Budvel',
    mandal_name: 'Rajendranagar',
    district_name: 'Rangareddy',
    mandal_id: 'm1000000-0000-0000-0000-000000000002',
    district_id: 'd1000000-0000-0000-0000-000000000001',
  },
  {
    id: 'r1000000-0000-0000-0000-000000000004',
    village_id: 'v1000000-0000-0000-0000-000000000008',
    survey_number: '87/1',
    owner_name: 'Chintala Ramesh',
    father_name: 'Ch. Narayana',
    extent_acres: 4.20,
    classification: 'Commercial',
    passbook_number: 'T0821003412',
    khata_number: 'KH-4412',
    verification_status: 'flagged',
    submitted_by: 'demo-user-3',
    created_at: '2026-09-24T16:20:00Z',
    updated_at: '2026-09-26T11:00:00Z',
    village_name: 'Kondapur',
    mandal_name: 'Ghatkesar',
    district_name: 'Medchal-Malkajgiri',
    mandal_id: 'm1000000-0000-0000-0000-000000000004',
    district_id: 'd1000000-0000-0000-0000-000000000002',
    flag_count: 1,
  },
  {
    id: 'r1000000-0000-0000-0000-000000000005',
    village_id: 'v1000000-0000-0000-0000-000000000010',
    survey_number: '315/P',
    owner_name: 'Mohammed Abdul Razak',
    father_name: 'Md. Ismail',
    extent_acres: 3.10,
    classification: 'Agricultural',
    passbook_number: 'T0932007623',
    khata_number: 'KH-5120',
    verification_status: 'unverified',
    submitted_by: 'demo-user-2',
    created_at: '2026-09-25T11:10:00Z',
    updated_at: '2026-09-25T11:10:00Z',
    village_name: 'Muthangi',
    mandal_name: 'Patancheru',
    district_name: 'Sangareddy',
    mandal_id: 'm1000000-0000-0000-0000-000000000006',
    district_id: 'd1000000-0000-0000-0000-000000000003',
  }
];

export const INITIAL_FLAGS: FlagRecord[] = [
  {
    id: 'f1000000-0000-0000-0000-000000000001',
    land_record_id: 'r1000000-0000-0000-0000-000000000004',
    flagged_by: 'demo-user-1',
    reason: 'Survey number 87/1 classification is contested. Extent boundary overlaps with adjacent parcel 87/2.',
    created_at: '2026-09-26T11:00:00Z',
    user_email: 'sourav@example.com'
  }
];
