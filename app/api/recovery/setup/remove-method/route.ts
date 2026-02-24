import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken } from '@/app/actions/auth';
import { removeMethod } from '@/lib/rift-recovery';

export async function DELETE(request: NextRequest) {
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
  if (!body.method) {
    return NextResponse.json({ error: 'method is required' }, { status: 400 });
  }

  const result = await removeMethod(user.bearerToken, {
    externalId: user.externalId,
    password: body.password,
    method: body.method,
  });

  return NextResponse.json(result.data, { status: result.status });
}
