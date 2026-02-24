import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/rift-recovery';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { token, newPassword } = body;

  if (!token || !newPassword) {
    return NextResponse.json({ error: 'token and newPassword are required' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const result = await resetPassword(token, newPassword);
  return NextResponse.json(result.data, { status: result.status });
}
