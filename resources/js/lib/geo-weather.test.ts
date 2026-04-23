import { describe, it, expect } from 'vitest';
import { formatCoordinates, getGoogleMapsUrl, getConnectionStatus } from './geo-weather';

describe('formatCoordinates', () => {
    it('formats positive coordinates (N, E)', () => {
        const result = formatCoordinates(-6.2088, 106.8456);
        expect(result).toBe('6.208800° S, 106.845600° E');
    });

    it('formats negative latitude as S', () => {
        const result = formatCoordinates(-7.5, 110.4);
        expect(result).toContain('S');
    });

    it('formats positive latitude as N', () => {
        const result = formatCoordinates(35.6762, 139.6503);
        expect(result).toContain('N');
        expect(result).toContain('E');
    });

    it('formats negative longitude as W', () => {
        const result = formatCoordinates(40.7128, -74.006);
        expect(result).toContain('N');
        expect(result).toContain('W');
    });

    it('formats zero coordinates', () => {
        const result = formatCoordinates(0, 0);
        expect(result).toBe('0.000000° N, 0.000000° E');
    });
});

describe('getGoogleMapsUrl', () => {
    it('generates correct Google Maps URL', () => {
        const url = getGoogleMapsUrl(-6.2088, 106.8456);
        expect(url).toBe('https://www.google.com/maps?q=-6.2088,106.8456');
    });

    it('handles negative coordinates', () => {
        const url = getGoogleMapsUrl(-7.5, -110.4);
        expect(url).toContain('-7.5,-110.4');
    });
});

describe('getConnectionStatus', () => {
    it('returns online when navigator.onLine is true', () => {
        // Mock navigator for Node environment
        const originalNavigator = globalThis.navigator;
        Object.defineProperty(globalThis, 'navigator', {
            value: { onLine: true },
            writable: true,
            configurable: true,
        });

        const status = getConnectionStatus();
        expect(status).toBe('online');

        // Restore
        Object.defineProperty(globalThis, 'navigator', {
            value: originalNavigator,
            writable: true,
            configurable: true,
        });
    });

    it('returns offline when navigator.onLine is false', () => {
        const originalNavigator = globalThis.navigator;
        Object.defineProperty(globalThis, 'navigator', {
            value: { onLine: false },
            writable: true,
            configurable: true,
        });

        const status = getConnectionStatus();
        expect(status).toBe('offline');

        Object.defineProperty(globalThis, 'navigator', {
            value: originalNavigator,
            writable: true,
            configurable: true,
        });
    });
});
