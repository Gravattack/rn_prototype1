/**
 * AsyncStorage stub using localStorage as fallback
 * Works in web preview!
 */
export const AsyncStorageStub = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            const value = localStorage.getItem(key);
            console.log(`[AsyncStorage] getItem: ${key} = ${value}`);
            return value;
        } catch (error) {
            console.error('[AsyncStorage] getItem failed:', error);
            return null;
        }
    },

    setItem: async (key: string, value: string): Promise<void> => {
        try {
            localStorage.setItem(key, value);
            console.log(`[AsyncStorage] setItem: ${key} = ${value}`);
        } catch (error) {
            console.error('[AsyncStorage] setItem failed:', error);
        }
    },

    removeItem: async (key: string): Promise<void> => {
        try {
            localStorage.removeItem(key);
            console.log(`[AsyncStorage] removeItem: ${key}`);
        } catch (error) {
            console.error('[AsyncStorage] removeItem failed:', error);
        }
    },

    clear: async (): Promise<void> => {
        try {
            localStorage.clear();
            console.log('[AsyncStorage] clear: all items removed');
        } catch (error) {
            console.error('[AsyncStorage] clear failed:', error);
        }
    },

    getAllKeys: async (): Promise<string[]> => {
        try {
            const keys = Object.keys(localStorage);
            console.log(`[AsyncStorage] getAllKeys: ${keys.length} keys`);
            return keys;
        } catch (error) {
            console.error('[AsyncStorage] getAllKeys failed:', error);
            return [];
        }
    },
};
