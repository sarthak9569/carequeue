import Constants from 'expo-constants';

const API_PORT = (process.env.EXPO_PUBLIC_API_PORT ?? '5000').replace(/^:/, '');

function stripHost(input: string): string {
  return input.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
}

/** True for common LAN / loopback hosts we can safely use for a local API. */
function isUsableLanHost(host: string): boolean {
  if (host === 'localhost' || host === '127.0.0.1') return true;
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/**
 * Hostname of the machine running Metro (your laptop on the current network).
 * Override with EXPO_PUBLIC_API_HOST if Metro uses a tunnel URL (ngrok) but the API is on LAN.
 */
export function getBackendHost(): string {
  const envHost = process.env.EXPO_PUBLIC_API_HOST?.trim();
  if (envHost) return stripHost(envHost);

  const fromUri = Constants.expoConfig?.hostUri?.split(':')[0];
  if (fromUri && isUsableLanHost(fromUri)) return fromUri;

  if (__DEV__ && fromUri && !isUsableLanHost(fromUri)) {
    console.warn(
      `[CareQueue] Metro host "${fromUri}" is not a LAN address. ` +
        'Set EXPO_PUBLIC_API_HOST to your PC IPv4 (same Wi‑Fi as the phone) so the API on port ' +
        `${API_PORT} is reachable.`,
    );
  }

  return '127.0.0.1';
}

export function getApiBaseUrl(): string {
  return `http://${getBackendHost()}:${API_PORT}/api`;
}

export function getSocketUrl(): string {
  return `http://${getBackendHost()}:${API_PORT}`;
}
