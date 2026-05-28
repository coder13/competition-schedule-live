import { promises as dns } from 'dns';
import ipaddr from 'ipaddr.js';

const LOCAL_HOSTNAMES = new Set(['localhost']);

const isIpAddress = (host: string) => ipaddr.isValid(host);

const assertPublicAddress = (address: string) => {
  const parsedAddress = ipaddr.process(address);

  if (parsedAddress.range() !== 'unicast') {
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

  if (isIpAddress(hostname)) {
    assertPublicAddress(hostname);
  }

  return url.toString();
};

export const assertWebhookUrlResolvesPublicly = async (value: string) => {
  const normalizedUrl = assertValidWebhookUrl(value);
  const { hostname } = new URL(normalizedUrl);
  const normalizedHostname = hostname.replace(/^\[|\]$/g, '').toLowerCase();

  if (isIpAddress(normalizedHostname)) {
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
