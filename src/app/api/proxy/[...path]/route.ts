import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const url = `${API_URL}/${path}${req.nextUrl.search}`;

    const headers = new Headers(req.headers);
    // Remove host header to avoid issues with proxying
    headers.delete('host');
    headers.delete('origin');
    headers.delete('referer');
    headers.delete('content-length');
    headers.delete('connection');
    headers.delete('accept-encoding');
    headers.set('accept', 'application/json');

    // Attach tokens from HttpOnly cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('vendora_access_token')?.value;
    const businessId = cookieStore.get('vendora_business_id')?.value;

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    if (businessId) {
      // Depending on backend, maybe it expects X-Business-ID header, or we don't need it if JWT handles it.
      // We will attach it just in case.
      headers.set('X-Business-ID', businessId);
    }

    // Only forward bodies for non-GET/HEAD
    const hasBody = !['GET', 'HEAD'].includes(req.method);

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      redirect: 'manual',
    };

    if (hasBody && req.body) {
      fetchOptions.body = req.body;
      // @ts-ignore - Required for passing ReadableStream to fetch in Node
      fetchOptions.duplex = 'half';
    }

    const response = await fetch(url, fetchOptions);

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding'); // let NextJS handle encoding

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Proxy Error', error: error.message }, { status: 500 });
  }
}

// Export supported methods
export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = handleProxy;
