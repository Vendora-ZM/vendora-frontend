export type AuthPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_ttl_seconds?: number;
  business?: { id?: string; permissions?: string[] };
  message?: string;
  data?: AuthPayload;
};

export type ResolvedAuthPayload = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_ttl_seconds?: number;
  business?: { id?: string; permissions?: string[] };
};

export function resolveAuthPayload(payload: AuthPayload): ResolvedAuthPayload {
  const auth = payload.data ?? payload;

  if (typeof auth.access_token !== 'string' || auth.access_token.length === 0) {
    throw new Error('Missing access token in auth response');
  }

  return {
    access_token: auth.access_token,
    refresh_token: typeof auth.refresh_token === 'string' ? auth.refresh_token : undefined,
    expires_in: typeof auth.expires_in === 'number' ? auth.expires_in : undefined,
    refresh_ttl_seconds: typeof auth.refresh_ttl_seconds === 'number' ? auth.refresh_ttl_seconds : undefined,
    business: auth.business,
  };
}
