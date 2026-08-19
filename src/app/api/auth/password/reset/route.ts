import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth/sessionCookies';
import { getBackendApiUrl } from '@/lib/config/backend';

const API_URL = getBackendApiUrl();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(`${API_URL}/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    const res = NextResponse.json(data, { status: response.status });
    return response.ok ? clearAuthCookies(res) : res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal server error', error: message }, { status: 500 });
  }
}
