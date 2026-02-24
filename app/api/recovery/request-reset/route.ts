import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/rift-recovery';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { externalId, method } = body;

  if (!externalId || !method) {
    return NextResponse.json({ error: 'externalId and method are required' }, { status: 400 });
  }

  const result = await requestPasswordReset(externalId, method);
  return NextResponse.json(result.data, { status: result.status });
}
