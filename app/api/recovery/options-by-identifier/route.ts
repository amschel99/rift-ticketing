import { NextRequest, NextResponse } from 'next/server';
import { getRecoveryOptionsByIdentifier } from '@/lib/rift-recovery';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');
  const identifierType = searchParams.get('identifierType') as 'email' | 'phone' | null;

  if (!identifier || !identifierType) {
    return NextResponse.json({ error: 'identifier and identifierType are required' }, { status: 400 });
  }

  const result = await getRecoveryOptionsByIdentifier(identifier, identifierType);
  return NextResponse.json(result.data, { status: result.status });
}
