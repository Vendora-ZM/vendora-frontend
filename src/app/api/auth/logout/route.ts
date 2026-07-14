import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });

  // Clear the cookies
  res.cookies.set('vendora_access_token', '', { maxAge: 0, path: '/' });
  res.cookies.set('vendora_refresh_token', '', { maxAge: 0, path: '/' });
  res.cookies.set('vendora_business_id', '', { maxAge: 0, path: '/' });

  return res;
}
