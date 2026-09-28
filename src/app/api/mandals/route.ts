import { NextRequest, NextResponse } from 'next/server';
import { getMandals } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('district_id') || undefined;
    const mandals = await getMandals(districtId);
    return NextResponse.json({ success: true, data: mandals });
  } catch (error) {
    console.error('Error fetching mandals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mandals' },
      { status: 500 }
    );
  }
}
