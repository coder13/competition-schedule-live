/* eslint-disable import/first */
const dnsLookup = jest.fn();

jest.mock('dns', () => ({
  promises: {
    lookup: dnsLookup,
  },
}));

import {
  assertValidWebhookUrl,
  assertWebhookUrlResolvesPublicly,
} from './webhookUrls';

describe('assertValidWebhookUrl', () => {
  it('accepts HTTPS webhook URLs', () => {
    expect(assertValidWebhookUrl('https://hooks.example/notify')).toBe(
      'https://hooks.example/notify'
    );
  });

  it('rejects non-HTTPS URLs', () => {
    expect(() => assertValidWebhookUrl('http://hooks.example/notify')).toThrow(
      'Webhook URL must use HTTPS'
    );
  });

  it('rejects local and private targets', () => {
    expect(() => assertValidWebhookUrl('https://localhost/notify')).toThrow(
      'Webhook URL cannot target local hosts'
    );
    expect(() => assertValidWebhookUrl('https://127.0.0.1/notify')).toThrow(
      'Webhook URL cannot target private addresses'
    );
    expect(() => assertValidWebhookUrl('https://192.168.1.10/notify')).toThrow(
      'Webhook URL cannot target private addresses'
    );
  });

  it('rejects URLs with credentials', () => {
    expect(() =>
      assertValidWebhookUrl('https://user:pass@hooks.example/notify')
    ).toThrow('Webhook URL cannot include credentials');
  });

  it('rejects broader private and reserved IP ranges', () => {
    expect(() => assertValidWebhookUrl('https://100.64.0.1/notify')).toThrow(
      'Webhook URL cannot target private addresses'
    );
    expect(() => assertValidWebhookUrl('https://[::1]/notify')).toThrow(
      'Webhook URL cannot target private addresses'
    );
  });
});

describe('assertWebhookUrlResolvesPublicly', () => {
  beforeEach(() => {
    dnsLookup.mockReset();
  });

  it('accepts hostnames resolving to public addresses', async () => {
    dnsLookup.mockResolvedValue([{ address: '203.0.113.10', family: 4 }]);

    await expect(
      assertWebhookUrlResolvesPublicly('https://hooks.example/notify')
    ).resolves.toBe('https://hooks.example/notify');

    expect(dnsLookup).toHaveBeenCalledWith('hooks.example', { all: true });
  });

  it('rejects hostnames resolving to private addresses', async () => {
    dnsLookup.mockResolvedValue([{ address: '10.0.0.5', family: 4 }]);

    await expect(
      assertWebhookUrlResolvesPublicly('https://hooks.example/notify')
    ).rejects.toThrow('Webhook URL cannot target private addresses');
  });
});
