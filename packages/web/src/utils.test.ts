import { afterEach, describe, it, expect } from 'vitest';
import { computeRoute, getScriptSrc } from './utils';

describe('utils', () => {
  describe('computeRoute()', () => {
    it('returns unchanged pathname if no pathParams provided', () => {
      expect(computeRoute('/vercel/next-site/analytics', null)).toBe(
        '/vercel/next-site/analytics',
      );
    });

    it('returns null for null pathname', () => {
      expect(computeRoute(null, {})).toBe(null);
    });

    it('replaces segments', () => {
      const input = '/vercel/next-site/analytics';
      const params = {
        teamSlug: 'vercel',
        project: 'next-site',
      };
      const expected = '/[teamSlug]/[project]/analytics';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('replaces segments even one param is not used', () => {
      const input = '/vercel/next-site/analytics';
      const params = {
        lang: 'en',
        teamSlug: 'vercel',
        project: 'next-site',
      };
      const expected = '/[teamSlug]/[project]/analytics';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('must not replace partial segments', () => {
      const input = '/next-site/vercel-site';
      const params = {
        teamSlug: 'vercel',
      };
      const expected = '/next-site/vercel-site'; // remains unchanged because "vercel" is a partial match
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('handles array segments', () => {
      const input = '/en/us/next-site';
      const params = {
        langs: ['en', 'us'],
      };
      const expected = '/[...langs]/next-site';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('handles array segments and individual segments', () => {
      const input = '/en/us/next-site';
      const params = {
        langs: ['en', 'us'],
        team: 'next-site',
      };
      const expected = '/[...langs]/[team]';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('handles special characters in url', () => {
      const input = '/123/test(test';
      const params = {
        teamSlug: '123',
        project: 'test(test',
      };

      const expected = '/[teamSlug]/[project]';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('handles special more characters', () => {
      const input = '/123/tes\\t(test/3.*';
      const params = {
        teamSlug: '123',
      };

      const expected = '/[teamSlug]/tes\\t(test/3.*';
      expect(computeRoute(input, params)).toBe(expected);
    });

    it('parallel routes where params matched both individually and within arrays', () => {
      const params = {
        catchAll: ['m', 'john', 'p', 'shirt'],
        merchantId: 'john',
        productSlug: 'shirt',
      };
      expect(computeRoute('/m/john/p/shirt', params)).toBe(
        '/m/[merchantId]/p/[productSlug]',
      );
    });

    describe('edge case handling (same values for multiple params)', () => {
      it('replaces based on the priority of the pathParams keys', () => {
        const input = '/test/test';
        const params = {
          teamSlug: 'test',
          project: 'test',
        };
        const expected = '/[teamSlug]/[project]'; // 'teamSlug' takes priority over 'project' based on their order in the params object
        expect(computeRoute(input, params)).toBe(expected);
      });

      it('handles reversed priority', () => {
        const input = '/test/test';
        const params = {
          project: 'test',
          teamSlug: 'test',
        };
        const expected = '/[project]/[teamSlug]'; // 'project' takes priority over 'teamSlug' here due to the reversed order in the params object
        expect(computeRoute(input, params)).toBe(expected);
      });
    });
  });

  describe('getScriptSrc()', () => {
    const envSave = { ...process.env };

    afterEach(() => {
      process.env = { ...envSave };
    });

    it('returns debug script in development', () => {
      process.env.NODE_ENV = 'development';
      expect(getScriptSrc({})).toBe(
        'https://va.vercel-scripts.com/v1/speed-insights/script.debug.js',
      );
    });

    it('returns the specified prop in development', () => {
      process.env.NODE_ENV = 'development';
      const scriptSrc = `https://example.com/${Math.random()}/script.js`;
      expect(getScriptSrc({ scriptSrc })).toBe(scriptSrc);
    });

    it('returns generic route in production', () => {
      process.env.NODE_ENV = 'production';
      expect(getScriptSrc({})).toBe('/_vercel/speed-insights/script.js');
    });

    it('returns absolute route in production when using dsn', () => {
      process.env.NODE_ENV = 'production';
      expect(getScriptSrc({ dsn: 'test' })).toBe(
        'https://va.vercel-scripts.com/v1/speed-insights/script.js',
      );
    });

    it('returns base path in production', () => {
      process.env.NODE_ENV = 'production';
      const basePath = `/_vercel-${Math.random()}`;
      expect(getScriptSrc({ basePath })).toBe(
        `${basePath}/speed-insights/script.js`,
      );
    });

    it('ignores base path when using dsn and bas', () => {
      process.env.NODE_ENV = 'production';
      const basePath = `/_vercel-${Math.random()}`;
      expect(getScriptSrc({ basePath, dsn: 'test' })).toBe(
        'https://va.vercel-scripts.com/v1/speed-insights/script.js',
      );
    });

    it('returns the specified prop in production', () => {
      process.env.NODE_ENV = 'production';
      const scriptSrc = `https://example.com/${Math.random()}/script.js`;
      expect(getScriptSrc({ scriptSrc })).toBe(scriptSrc);
    });

    it('returns the specified prop in production when using dsn', () => {
      process.env.NODE_ENV = 'production';
      const scriptSrc = `https://example.com/${Math.random()}/script.js`;
      expect(getScriptSrc({ scriptSrc, dsn: 'test' })).toBe(scriptSrc);
    });
  });
});
