const LOCAL_BACKEND_API_URL = 'http://localhost:8081/api/v1';

export function getBackendApiUrl() {
  return (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    LOCAL_BACKEND_API_URL
  );
}
