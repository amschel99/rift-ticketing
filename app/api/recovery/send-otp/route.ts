import { NextRequest, NextResponse } from 'next/server';
import { sendOtp } from '@/lib/rift-recovery';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  if (!body.email && !body.phone) {
    return NextResponse.json({ error: 'email or phone is required' }, { status: 400 });
  }

  const result = await sendOtp({
    email: body.email || undefined,
    phone: body.phone || undefined,
  });

  return NextResponse.json(result.data, { status: result.status });
}
