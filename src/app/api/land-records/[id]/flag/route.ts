import { NextRequest, NextResponse } from 'next/server';
import { flagLandRecord, getRecordFlags } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { reason, user_id, user_email } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: 'A clear reason for flagging this parcel is required.' },
        { status: 400 }
      );
    }

    const effectiveUserId = user_id || request.headers.get('x-user-id') || 'demo-citizen-user';

    const result = await flagLandRecord(id, effectiveUserId, reason, user_email);

    return NextResponse.json({
      success: true,
      message: 'Land record has been flagged for dispute review.',
      flag: result.flag,
    });
  } catch (error: any) {
    if (error?.message === 'RECORD_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: 'Land record not found.' },
        { status: 404 }
      );
    }
    console.error('Error flagging record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to flag land record.' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const flags = await getRecordFlags(id);
    return NextResponse.json({ success: true, count: flags.length, data: flags });
  } catch (error) {
    console.error('Error getting flags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dispute flags' },
      { status: 500 }
    );
  }
}
