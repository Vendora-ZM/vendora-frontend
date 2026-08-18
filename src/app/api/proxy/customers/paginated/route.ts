import { NextRequest } from 'next/server';
import { getBackendApiUrl } from '@/lib/config/backend';
import { handlePaginatedProxy } from '@/app/api/proxy/_paginated';

const API_URL = getBackendApiUrl();

export async function GET(req: NextRequest) {
  return handlePaginatedProxy(req, (headers) => {
    const backendUrl = new URL(`${API_URL}/customers`);
    const search = req.nextUrl.searchParams.get('search');

    if (search) {
      backendUrl.searchParams.set('search', search);
    }

    return fetch(backendUrl, {
      method: 'GET',
      headers,
      redirect: 'manual',
    });
  });
}
