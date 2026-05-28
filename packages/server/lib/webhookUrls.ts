import net from 'net';
import { promises as dns } from 'dns';

const LOCAL_HOSTNAMES = new Set(['localhost']);

const isPrivateIpv4 = (host: string) => {
  const parts = host.split('.').map(Number);
  const [first, second] = parts;

  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19))
  );
};

const isPrivateIpv6 = (host: string) => {
  const normalized = host.toLowerCase();
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('ff')
  );
};

const assertPublicAddress = (address: string) => {
  const ipVersion = net.isIP(address);
  if (
    (ipVersion === 4 && isPrivateIpv4(address)) ||
    (ipVersion === 6 && isPrivateIpv6(address))
  ) {
    throw new Error('Webhook URL cannot target private addresses');
  }
};

export const assertValidWebhookUrl = (value: string) => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error('Invalid webhook URL');
  }

  if (url.protocol !== 'https:') {
    throw new Error('Webhook URL must use HTTPS');
  }

  if (url.username || url.password) {
    throw new Error('Webhook URL cannot include credentials');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (
    LOCAL_HOSTNAMES.has(hostname) ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.localhost')
  ) {
    throw new Error('Webhook URL cannot target local hosts');
  }

  const ipVersion = net.isIP(hostname);
  if (ipVersion) {
    assertPublicAddress(hostname);
  }

  return url.toString();
};

export const assertWebhookUrlResolvesPublicly = async (value: string) => {
  const normalizedUrl = assertValidWebhookUrl(value);
  const { hostname } = new URL(normalizedUrl);
  const normalizedHostname = hostname.replace(/^\[|\]$/g, '').toLowerCase();

  if (net.isIP(normalizedHostname)) {
    return normalizedUrl;
  }

  const addresses = await dns.lookup(normalizedHostname, { all: true });
  if (!addresses.length) {
    throw new Error('Webhook URL host could not be resolved');
  }

  addresses.forEach(({ address }) => {
    assertPublicAddress(address);
  });

  return normalizedUrl;
};
