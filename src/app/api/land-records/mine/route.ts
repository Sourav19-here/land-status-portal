import { NextRequest, NextResponse } from 'next/server';
import { getUserLandRecords } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || request.headers.get('x-user-id') || 'demo-citizen-user';

    const records = await getUserLandRecords(userId);

    return NextResponse.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching user land records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch your land records' },
      { status: 500 }
    );
  }
}
