/**
 * Geolocation + Weather + Connection Status Utilities
 *
 * Handles:
 * - VAR 4: Suhu (°C) via OpenWeatherMap API
 * - VAR 6: Titik Koordinat via Browser Geolocation API
 * - VAR 7: Status Koneksi via navigator.onLine
 */

export interface GeoPosition {
    latitude: number;
    longitude: number;
}

export interface WeatherData {
    temperature: number; // °C
    description: string;
    humidity: number; // %
}

export interface EnvironmentData {
    position: GeoPosition | null;
    weather: WeatherData | null;
    connectionStatus: 'online' | 'offline';
    error?: string;
}

/**
 * Get current GPS position using Browser Geolocation API
 */
export function getCurrentPosition(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation tidak didukung oleh browser ini.'));

            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject(new Error('Izin lokasi ditolak. Aktifkan izin lokasi di browser.'));
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error('Informasi lokasi tidak tersedia.'));
                        break;
                    case error.TIMEOUT:
                        reject(new Error('Permintaan lokasi timeout.'));
                        break;
                    default:
                        reject(new Error('Gagal mendapatkan lokasi.'));
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // Cache for 5 minutes
            }
        );
    });
}

/**
 * Get temperature via backend proxy (API key stays server-side)
 *
 * Note: Set OPENWEATHERMAP_API_KEY in your .env file (not VITE_ prefix)
 */
export async function getTemperature(lat: number, lon: number): Promise<WeatherData> {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
    });

    if (!response.ok) {
        const body = await response.json().catch(() => null);

        throw new Error(body?.error ?? `Gagal mengambil data cuaca: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Get current connection status
 */
export function getConnectionStatus(): 'online' | 'offline' {
    return navigator.onLine ? 'online' : 'offline';
}

/**
 * Gather all environment data (position, weather, connection)
 * This is the main function to call before scanning
 */
export async function gatherEnvironmentData(): Promise<EnvironmentData> {
    const connectionStatus = getConnectionStatus();
    let position: GeoPosition | null = null;
    let weather: WeatherData | null = null;
    let error: string | undefined;

    try {
        position = await getCurrentPosition();
    } catch (e) {
        error = e instanceof Error ? e.message : 'Gagal mendapatkan lokasi';
    }

    if (position && connectionStatus === 'online') {
        try {
            weather = await getTemperature(position.latitude, position.longitude);
        } catch (e) {
            // Weather is optional, don't fail the whole process
            const weatherError = e instanceof Error ? e.message : 'Gagal mengambil data cuaca';
            error = error ? `${error}; ${weatherError}` : weatherError;
        }
    }

    return {
        position,
        weather,
        connectionStatus,
        error,
    };
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lon: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';

    return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lon).toFixed(6)}° ${lonDir}`;
}

/**
 * Get Google Maps URL for coordinates
 */
export function getGoogleMapsUrl(lat: number, lon: number): string {
    return `https://www.google.com/maps?q=${lat},${lon}`;
}
