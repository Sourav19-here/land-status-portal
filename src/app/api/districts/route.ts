import { NextResponse } from 'next/server';
import { getDistricts } from '@/lib/db';

export async function GET() {
  try {
    const districts = await getDistricts();
    return NextResponse.json({ success: true, data: districts });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}
