import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.63.19.154/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { data = { message: text }; }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Success! Extract tokens
    const { access_token, refresh_token, business } = data.data || data;

    const res = NextResponse.json({ success: true, business });

    // Set secure HttpOnly cookies
    res.cookies.set('vendora_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15, // 15 minutes (match backend logic)
    });

    if (refresh_token) {
      res.cookies.set('vendora_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    if (business && business.id) {
      res.cookies.set('vendora_business_id', business.id, {
        httpOnly: true, // we hide business_id from client JS too to be safe, though not strictly necessary
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return res;
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}


