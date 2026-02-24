const BASE_URL = 'https://payment.riftfi.xyz';

function getHeaders(bearerToken?: string): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.RIFT_API_KEY || '',
  };
  if (bearerToken) {
    h['Authorization'] = `Bearer ${bearerToken}`;
  }
  return h;
}

async function request(
  method: string,
  path: string,
  options?: { body?: any; bearerToken?: string; query?: Record<string, string> }
): Promise<{ data: any; status: number }> {
  let url = `${BASE_URL}${path}`;
  if (options?.query) {
    const params = new URLSearchParams(options.query);
    url += `?${params.toString()}`;
  }

  const res = await fetch(url, {
    method,
    headers: getHeaders(options?.bearerToken),
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { data, status: res.status };
}

// --- Password Reset (public) ---

export function getRecoveryOptions(externalId: string) {
  return request('GET', `/recovery/options/${encodeURIComponent(externalId)}`);
}

export function requestPasswordReset(externalId: string, method: 'emailRecovery' | 'phoneRecovery') {
  return request('POST', '/recovery/request-reset', {
    body: { externalId, method },
  });
}

export function validateToken(token: string) {
  return request('GET', `/recovery/validate-token/${encodeURIComponent(token)}`);
}

export function resetPassword(token: string, newPassword: string) {
  return request('POST', '/recovery/reset-password', {
    body: { token, newPassword },
  });
}

// --- Account Recovery (public) ---

export function getRecoveryOptionsByIdentifier(identifier: string, identifierType: 'email' | 'phone') {
  return request('GET', '/recovery/options-by-identifier', {
    query: { identifier, identifierType },
  });
}

export function requestAccountRecovery(identifier: string, identifierType: string, method: string) {
  return request('POST', '/recovery/request-account-recovery', {
    body: { identifier, identifierType, method },
  });
}

export function sendOtp(payload: { email?: string; phone?: string }) {
  return request('POST', '/otp/send', { body: payload });
}

export function recoverAccount(token: string, newIdentifier: string, identifierType: string, otpCode: string) {
  return request('POST', '/recovery/recover-account', {
    body: { token, newIdentifier, identifierType, otpCode },
  });
}

// --- Recovery Setup (authenticated) ---
// externalId users require password in body for middleware authentication

export function createRecoveryMethods(bearerToken: string, body: { externalId: string; password: string; emailRecovery?: string; phoneRecovery?: string }) {
  return request('POST', '/recovery/create', { body, bearerToken });
}

export function addMethod(bearerToken: string, body: { externalId: string; password: string; method: string; value: string }) {
  return request('POST', '/recovery/add-method', { body, bearerToken });
}

export function updateMethod(bearerToken: string, body: { externalId: string; password: string; method: string; value: string }) {
  return request('PUT', '/recovery/update-method', { body, bearerToken });
}

export function removeMethod(bearerToken: string, body: { externalId: string; password: string; method: string }) {
  return request('DELETE', '/recovery/remove-method', { body, bearerToken });
}

export function getMyMethods(bearerToken: string, body: { externalId: string; password: string }) {
  return request('POST', '/recovery/my-methods', { body, bearerToken });
}

export function deleteAllMethods(bearerToken: string, body: { externalId: string; password: string }) {
  return request('DELETE', '/recovery/delete-all', { body, bearerToken });
}
