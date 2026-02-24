import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken } from '@/app/actions/auth';
import { createRecoveryMethods } from '@/lib/rift-recovery';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const user = await getUserByToken(token);
  if (!user || !user.bearerToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 });
  }

  const result = await createRecoveryMethods(user.bearerToken, {
    externalId: user.externalId,
    password: body.password,
    emailRecovery: body.emailRecovery,
    phoneRecovery: body.phoneRecovery,
  });

  return NextResponse.json(result.data, { status: result.status });
}
