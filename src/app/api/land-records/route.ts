import { NextRequest, NextResponse } from 'next/server';
import { createLandRecord, findExistingRecord } from '@/lib/db';
import { LandRecordSubmission } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      village_id,
      survey_number,
      owner_name,
      father_name,
      extent_acres,
      classification,
      passbook_number,
      khata_number,
      user_id,
    } = body;

    // Basic validation
    if (!village_id || !survey_number || !owner_name || !extent_acres || !classification) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please fill in all required fields: Village, Survey Number, Owner Name, Extent, and Classification.',
        },
        { status: 400 }
      );
    }

    const parsedExtent = parseFloat(extent_acres);
    if (isNaN(parsedExtent) || parsedExtent <= 0) {
      return NextResponse.json(
        { success: false, error: 'Extent in acres must be a valid positive number.' },
        { status: 400 }
      );
    }

    // Default or provided user ID (Supabase Auth UID or demo session user)
    const effectiveUserId = user_id || request.headers.get('x-user-id') || 'demo-citizen-user';

    // Duplicate check: (village_id, survey_number)
    const existing = await findExistingRecord(village_id, survey_number);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          code: 'DUPLICATE_PARCEL',
          error: "This parcel already has a submission — you can flag it if you believe it's incorrect.",
          existingRecord: existing,
        },
        { status: 409 }
      );
    }

    const submission: LandRecordSubmission = {
      village_id,
      survey_number: survey_number.trim(),
      owner_name: owner_name.trim(),
      father_name: father_name?.trim() || undefined,
      extent_acres: parsedExtent,
      classification,
      passbook_number: passbook_number?.trim() || undefined,
      khata_number: khata_number?.trim() || undefined,
    };

    const newRecord = await createLandRecord(submission, effectiveUserId);

    return NextResponse.json(
      {
        success: true,
        message: 'Land record submitted successfully as unverified self-declaration.',
        data: newRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.message === 'DUPLICATE_PARCEL') {
      return NextResponse.json(
        {
          success: false,
          code: 'DUPLICATE_PARCEL',
          error: "This parcel already has a submission — you can flag it if you believe it's incorrect.",
        },
        { status: 409 }
      );
    }
    console.error('Error creating land record:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while saving the record.' },
      { status: 500 }
    );
  }
}
