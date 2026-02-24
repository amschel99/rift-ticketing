import { NextRequest, NextResponse } from 'next/server';
import { requestAccountRecovery } from '@/lib/rift-recovery';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { identifier, identifierType, method } = body;

  if (!identifier || !identifierType || !method) {
    return NextResponse.json({ error: 'identifier, identifierType, and method are required' }, { status: 400 });
  }

  const result = await requestAccountRecovery(identifier, identifierType, method);
  return NextResponse.json(result.data, { status: result.status });
}
