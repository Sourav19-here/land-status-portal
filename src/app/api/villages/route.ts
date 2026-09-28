import { NextRequest, NextResponse } from 'next/server';
import { getVillages } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mandalId = searchParams.get('mandal_id') || undefined;
    const villages = await getVillages(mandalId);
    return NextResponse.json({ success: true, data: villages });
  } catch (error) {
    console.error('Error fetching villages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch villages' },
      { status: 500 }
    );
  }
}
