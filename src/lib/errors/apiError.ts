type NestedErrorPayload = {
  code?: unknown;
  message?: unknown;
  error?: unknown;
};

type ErrorLike = {
  status?: unknown;
  data?: unknown;
  error?: unknown;
  message?: unknown;
};

export type ApiErrorDetails = {
  status?: number;
  code?: string;
  message?: string;
};

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readNestedErrorPayload(value: unknown): NestedErrorPayload | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return value as NestedErrorPayload;
}

export function getApiErrorDetails(error: unknown): ApiErrorDetails | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const typedError = error as ErrorLike;
  const status = typeof typedError.status === 'number' ? typedError.status : undefined;
  const details: ApiErrorDetails = { status };

  const payload = readNestedErrorPayload(typedError.data);
  const nestedError = payload?.error;
  const nestedPayload = readNestedErrorPayload(nestedError);

  details.code =
    readString(payload?.code) ??
    readString(nestedPayload?.code) ??
    (typeof nestedError === 'string' ? nestedError : undefined) ??
    undefined;

  details.message =
    readString(payload?.message) ??
    readString(nestedPayload?.message) ??
    readString(typedError.message) ??
    readString(typedError.error);

  if (!details.code && !details.message && details.status === undefined) {
    return null;
  }

  return details;
}

export function isBillingAccessError(error: unknown) {
  const details = getApiErrorDetails(error);
  if (!details) {
    return false;
  }

  const message = (details.message ?? '').toLowerCase();

  return (
    details.status === 403 ||
    details.code === 'forbidden' ||
    (message.includes('billing') && (message.includes('required') || message.includes('locked')))
  );
}

export function getFriendlyErrorMessage(error: unknown, fallback: string) {
  const details = getApiErrorDetails(error);
  return details?.message ?? fallback;
}
