export type AppEnvironment = 'local' | 'staging' | 'production';
export interface Environment {
  readonly APP_ENV: AppEnvironment;
  readonly API_BASE_URL: string;
}

/** Validate without URL/URLSearchParams: Hermes' built-in URL support is partial.
 * Origins use a DNS name or IPv4 host and an optional TCP port. No normalization,
 * credentials, paths, query, fragment, whitespace or silent defaults are allowed.
 */
export function resolveEnvironment(raw: {
  APP_ENV?: string;
  API_BASE_URL?: string;
}): Environment {
  const {APP_ENV, API_BASE_URL} = raw;
  if (APP_ENV !== 'local' && APP_ENV !== 'staging' && APP_ENV !== 'production') {
    throw new Error('[Environment] APP_ENV must be local, staging, or production. Select an explicit ENVFILE and rebuild the native app.');
  }
  const match = typeof API_BASE_URL === 'string'
    ? /^(https?):\/\/([a-zA-Z0-9.-]+)(?::([0-9]{1,5}))?$/.exec(API_BASE_URL)
    : null;
  const host = match?.[2] ?? '';
  const validHost = host.length <= 253 && host.split('.').every(label =>
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label),
  );
  const validIp = !/^[0-9.]+$/.test(host) ||
    (host.split('.').length === 4 && host.split('.').every(part =>
      /^(0|[1-9][0-9]{0,2})$/.test(part) && Number(part) <= 255,
    ));
  const validPort = !match?.[3] || (Number(match[3]) >= 1 && Number(match[3]) <= 65535);
  // `$` alone can match before a final newline in JavaScript.
  if (!match || match[0] !== API_BASE_URL || !validHost || !validIp || !validPort) {
    throw new Error('[Environment] API_BASE_URL must be a full http(s) origin (DNS/IPv4, optional port), with no endpoint or trailing slash. Select ENVFILE and rebuild.');
  }
  if (APP_ENV !== 'local' && match[1] !== 'https') {
    throw new Error('[Environment] API_BASE_URL requires HTTPS for staging and production.');
  }
  return Object.freeze({APP_ENV, API_BASE_URL: API_BASE_URL!});
}
