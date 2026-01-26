/**
 * Generic stub for unsupported native modules
 */
export function createUnsupportedStub(moduleName: string, apiType: string = 'native module') {
    const errorMessage = `❌ ${moduleName} is not supported in web preview.\n\nThis ${apiType} requires native device capabilities that are not available in the browser.\n\nTo test this feature:\n• Use a real device or emulator\n• Use Expo Go app\n• Build and run on iOS/Android`;

    return new Proxy(
        {},
        {
            get: (_target, prop) => {
                if (prop === 'then' || prop === Symbol.toStringTag) {
                    return undefined;
                }
                return () => {
                    throw new Error(errorMessage);
                };
            },
        }
    );
}

/**
 * Camera module stub
 */
export const CameraStub = createUnsupportedStub('Camera', 'camera API');

interface GeolocationPosition {
    coords: {
        latitude: number;
        longitude: number;
        altitude: number | null;
        accuracy: number;
        altitudeAccuracy: number | null;
        heading: number | null;
        speed: number | null;
    };
    timestamp: number;
}

interface GeolocationError {
    code: number;
    message: string;
    PERMISSION_DENIED: number;
    POSITION_UNAVAILABLE: number;
    TIMEOUT: number;
}

/**
 * Location/Geolocation stub with browser fallback
 */
export const GeolocationStub = {
    getCurrentPosition: (
        success: (position: GeolocationPosition) => void,
        error?: (error: GeolocationError) => void
    ) => {
        if (navigator.geolocation) {
            console.log('[Geolocation] Using browser navigator.geolocation');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    success({
                        coords: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            altitude: position.coords.altitude,
                            accuracy: position.coords.accuracy,
                            altitudeAccuracy: position.coords.altitudeAccuracy,
                            heading: position.coords.heading,
                            speed: position.coords.speed,
                        },
                        timestamp: position.timestamp,
                    });
                },
                (err) => {
                    if (error) {
                        // Map DOMException/GeolocationPositionError to GeolocationError interface
                        const geoError = {
                            code: (err as unknown as GeolocationError).code || 0,
                            message: err.message,
                            PERMISSION_DENIED: 1,
                            POSITION_UNAVAILABLE: 2,
                            TIMEOUT: 3,
                        };
                        error(geoError);
                    }
                }
            );
        } else {
            const err = {
                code: 2, // POSITION_UNAVAILABLE
                message: '📍 Geolocation is not supported by your browser.\n\nThis API requires browser location permissions.',
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3,
            };
            if (error) error(err);
        }
    },

    watchPosition: (
        success: (position: GeolocationPosition) => void,
        error?: (error: GeolocationError) => void
    ) => {
        if (navigator.geolocation) {
            console.log('[Geolocation] Using browser navigator.geolocation.watchPosition');
            return navigator.geolocation.watchPosition(
                (position) => {
                    success({
                        coords: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            altitude: position.coords.altitude,
                            accuracy: position.coords.accuracy,
                            altitudeAccuracy: position.coords.altitudeAccuracy,
                            heading: position.coords.heading,
                            speed: position.coords.speed,
                        },
                        timestamp: position.timestamp,
                    });
                },
                (err) => {
                    if (error) {
                        const geoError = {
                            code: (err as unknown as GeolocationError).code || 0,
                            message: err.message,
                            PERMISSION_DENIED: 1,
                            POSITION_UNAVAILABLE: 2,
                            TIMEOUT: 3,
                        };
                        error(geoError);
                    }
                }
            );
        } else {
            throw new Error('📍 Geolocation is not supported by your browser');
        }
    },

    clearWatch: (watchId: number) => {
        if (navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
        }
    },
};

/**
 * Permissions stub
 */
export const PermissionsStub = createUnsupportedStub('Permissions', 'permissions API');

/**
 * Clipboard stub with browser fallback
 */
export const ClipboardStub = {
    getString: async (): Promise<string> => {
        if (navigator.clipboard) {
            try {
                const text = await navigator.clipboard.readText();
                console.log('[Clipboard] Read from clipboard');
                return text;
            } catch (error) {
                console.error('[Clipboard] Failed to read:', error);
                return '';
            }
        }
        throw new Error('📋 Clipboard API is not supported by your browser');
    },

    setString: async (text: string): Promise<void> => {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                console.log('[Clipboard] Wrote to clipboard');
            } catch (error) {
                console.error('[Clipboard] Failed to write:', error);
            }
        } else {
            throw new Error('📋 Clipboard API is not supported by your browser');
        }
    },
};
