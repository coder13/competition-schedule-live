import { promises as dns } from 'dns';
import type { LookupAddress, LookupOptions } from 'dns';
import https from 'https';
import type { LookupFunction } from 'net';
import ipaddr from 'ipaddr.js';

const LOCAL_HOSTNAMES = new Set(['localhost']);

const isIpAddress = (host: string) => ipaddr.isValid(host);

const assertPublicAddress = (address: string) => {
  const parsedAddress = ipaddr.process(address);

  if (parsedAddress.range() !== 'unicast') {
    throw new Error('Webhook URL cannot target private addresses');
  }
};

const createLookupError = () => {
  const error = new Error(
    'Webhook URL host could not be resolved to a public address'
  ) as NodeJS.ErrnoException;
  error.code = 'ENOTFOUND';
  return error;
};

const pickAddress = (
  addresses: LookupAddress[],
  options: LookupOptions
): LookupAddress[] => {
  const family = typeof options.family === 'number' ? options.family : undefined;

  if (!family) {
    return addresses;
  }

  return addresses.filter((address) => address.family === family);
};

const createPinnedHttpsAgent = (addresses: LookupAddress[]) => {
  const lookup: LookupFunction = (_hostname, options, callback) => {
    const candidates = pickAddress(addresses, options);
    const family = typeof options.family === 'number' ? options.family : 0;

    if (!candidates.length) {
      callback(createLookupError(), options.all ? [] : '', family);
      return;
    }

    if (options.all) {
      callback(null, candidates);
      return;
    }

    callback(null, candidates[0].address, candidates[0].family);
  };

  return new https.Agent({ lookup });
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

  if (isIpAddress(hostname)) {
    assertPublicAddress(hostname);
  }

  return url.toString();
};

export const assertWebhookUrlResolvesPublicly = async (value: string) => {
  const { url } = await resolvePublicWebhookUrl(value);
  return url;
};

export const resolvePublicWebhookUrl = async (value: string) => {
  const normalizedUrl = assertValidWebhookUrl(value);
  const { hostname } = new URL(normalizedUrl);
  const normalizedHostname = hostname.replace(/^\[|\]$/g, '').toLowerCase();

  if (isIpAddress(normalizedHostname)) {
    return { url: normalizedUrl };
  }

  const addresses = await dns.lookup(normalizedHostname, { all: true });
  if (!addresses.length) {
    throw new Error('Webhook URL host could not be resolved');
  }

  addresses.forEach(({ address }) => {
    assertPublicAddress(address);
  });

  return {
    url: normalizedUrl,
    agent: createPinnedHttpsAgent(addresses),
  };
};
