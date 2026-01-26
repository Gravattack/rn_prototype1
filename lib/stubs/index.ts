import { AsyncStorageStub } from './async-storage';
import {
    CameraStub,
    GeolocationStub,
    PermissionsStub,
    ClipboardStub,
    createUnsupportedStub,
} from './unsupported';

/**
 * Registry of all API stubs
 * Maps module names to their stub implementations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const API_STUBS: Record<string, any> = {
    // AsyncStorage - works with localStorage!
    '@react-native-async-storage/async-storage': AsyncStorageStub,
    '@react-native-community/async-storage': AsyncStorageStub,

    // Location - browser fallback
    '@react-native-community/geolocation': GeolocationStub,
    'react-native-geolocation-service': GeolocationStub,

    // Clipboard - browser fallback
    '@react-native-clipboard/clipboard': ClipboardStub,
    '@react-native-community/clipboard': ClipboardStub,

    // Unsupported native modules
    'react-native-camera': CameraStub,
    'react-native-permissions': PermissionsStub,
    'react-native-contacts': createUnsupportedStub('Contacts', 'contacts API'),
    'react-native-fs': createUnsupportedStub('FileSystem', 'file system API'),
    'react-native-bluetooth': createUnsupportedStub('Bluetooth', 'bluetooth API'),
    'react-native-sensors': createUnsupportedStub('Sensors', 'sensors API'),
};

/**
 * Get stub for a module, if available
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getStub(moduleName: string): any | undefined {
    return API_STUBS[moduleName];
}

/**
 * Check if module is stubbed
 */
export function isStubbed(moduleName: string): boolean {
    return moduleName in API_STUBS;
}

/**
 * Get all stubbed module names
 */
export function getAllStubbedModules(): string[] {
    return Object.keys(API_STUBS);
}

export { AsyncStorageStub, CameraStub, GeolocationStub, PermissionsStub, ClipboardStub };
