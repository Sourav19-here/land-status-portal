import { NextRequest, NextResponse } from 'next/server';
import { updateLandRecord, deleteLandRecord } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { user_id, updates } = body;

    const effectiveUserId = user_id || request.headers.get('x-user-id');
    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to edit parcel declaration.' },
        { status: 401 }
      );
    }

    const updated = await updateLandRecord(id, effectiveUserId, updates || body);
    return NextResponse.json({
      success: true,
      message: 'Land parcel declaration updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to edit this record.' },
        { status: 403 }
      );
    }
    if (error?.message === 'RECORD_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: 'Land record not found.' },
        { status: 404 }
      );
    }
    console.error('Error updating land record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update land record.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to delete parcel declaration.' },
        { status: 401 }
      );
    }

    await deleteLandRecord(id, userId);
    return NextResponse.json({
      success: true,
      message: 'Land parcel record removed successfully. Survey number is now freed.',
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to delete this record.' },
        { status: 403 }
      );
    }
    if (error?.message === 'RECORD_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: 'Land record not found.' },
        { status: 404 }
      );
    }
    console.error('Error deleting land record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete land record.' },
      { status: 500 }
    );
  }
}
