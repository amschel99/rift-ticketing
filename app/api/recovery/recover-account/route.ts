import { NextRequest, NextResponse } from 'next/server';
import { recoverAccount } from '@/lib/rift-recovery';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { token, newIdentifier, identifierType, otpCode } = body;

  if (!token || !newIdentifier || !identifierType || !otpCode) {
    return NextResponse.json({ error: 'token, newIdentifier, identifierType, and otpCode are required' }, { status: 400 });
  }

  const result = await recoverAccount(token, newIdentifier, identifierType, otpCode);
  return NextResponse.json(result.data, { status: result.status });
}
