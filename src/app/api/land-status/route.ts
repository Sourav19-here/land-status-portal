import { NextRequest, NextResponse } from 'next/server';
import { searchLandRecords } from '@/lib/db';
import { VerificationStatus } from '@/types';

// Simple in-memory rate-limiter for public search (60 requests / minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 60;

  const current = rateLimitMap.get(ip);
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (current.count >= maxRequests) {
    return true;
  }

  current.count++;
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait a moment before searching again.',
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);

    const district_id = searchParams.get('district_id') || undefined;
    const mandal_id = searchParams.get('mandal_id') || undefined;
    const village_id = searchParams.get('village_id') || undefined;
    const survey_number = searchParams.get('survey_number') || undefined;
    const owner_name = searchParams.get('owner_name') || undefined;
    const passbook_number = searchParams.get('passbook_number') || undefined;
    const classification = searchParams.get('classification') || undefined;
    const verification_status = (searchParams.get('verification_status') as VerificationStatus) || undefined;

    const rawMin = searchParams.get('extent_min');
    const rawMax = searchParams.get('extent_max');
    const extent_min = rawMin !== null && rawMin !== '' ? parseFloat(rawMin) : undefined;
    const extent_max = rawMax !== null && rawMax !== '' ? parseFloat(rawMax) : undefined;

    const results = await searchLandRecords({
      district_id,
      mandal_id,
      village_id,
      survey_number,
      owner_name,
      passbook_number,
      classification,
      extent_min,
      extent_max,
      verification_status,
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Error searching land records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search land records' },
      { status: 500 }
    );
  }
}
