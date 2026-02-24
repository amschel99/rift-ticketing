import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/rift-recovery';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  const result = await validateToken(token);
  return NextResponse.json(result.data, { status: result.status });
}
