import { NextRequest, NextResponse } from 'next/server';
import { getRecoveryOptions } from '@/lib/rift-recovery';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ externalId: string }> }
) {
  const { externalId } = await params;
  if (!externalId) {
    return NextResponse.json({ error: 'externalId is required' }, { status: 400 });
  }

  const result = await getRecoveryOptions(externalId);
  return NextResponse.json(result.data, { status: result.status });
}
