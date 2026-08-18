import { NextRequest } from 'next/server';
import { getBackendApiUrl } from '@/lib/config/backend';
import { handlePaginatedProxy } from '@/app/api/proxy/_paginated';

const API_URL = getBackendApiUrl();

export async function GET(req: NextRequest) {
  return handlePaginatedProxy(req, (headers) => {
    const backendUrl = new URL(`${API_URL}/inventory`);
    const locationId = req.nextUrl.searchParams.get('location_id');
    const productId = req.nextUrl.searchParams.get('product_id');

    if (locationId) {
      backendUrl.searchParams.set('location_id', locationId);
    }

    if (productId) {
      backendUrl.searchParams.set('product_id', productId);
    }

    return fetch(backendUrl, {
      method: 'GET',
      headers,
      redirect: 'manual',
    });
  });
}
