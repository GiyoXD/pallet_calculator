// Storage Module - Handles persistent caching to localStorage
class Storage {
    constructor() {
        this.STORAGE_KEY = 'pallet-calculator-data';
        this.VERSION = '1.0';
    }

    // Save application state to localStorage
    saveState(appState) {
        try {
            const dataToSave = {
                version: this.VERSION,
                timestamp: Date.now(),
                chunks: appState.chunks,
                currentChunkIndex: appState.currentChunkIndex,
                inputMode: appState.inputMode,
                summaryVisible: appState.summaryVisible
            };
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    // Load application state from localStorage
    loadState() {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (!savedData) {
                console.log('No saved data found');
                return null;
            }

            const parsedData = JSON.parse(savedData);
            
            // Check version compatibility
            if (parsedData.version !== this.VERSION) {
                console.warn('Saved data version mismatch, clearing cache');
                this.clearCache();
                return null;
            }

            // Check if data is not too old (optional - 30 days)
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            if (parsedData.timestamp < thirtyDaysAgo) {
                console.log('Saved data is too old, clearing cache');
                this.clearCache();
                return null;
            }

            console.log('Loaded data from localStorage');
            return {
                chunks: parsedData.chunks || [],
                currentChunkIndex: parsedData.currentChunkIndex || 0,
                inputMode: parsedData.inputMode || 'gross-cbm',
                summaryVisible: parsedData.summaryVisible !== undefined ? parsedData.summaryVisible : true
            };
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            this.clearCache();
            return null;
        }
    }

    // Clear all cached data
    clearCache() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('Cache cleared');
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }

    // Get cache info for debugging
    getCacheInfo() {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (!savedData) return null;

            const parsedData = JSON.parse(savedData);
            return {
                version: parsedData.version,
                timestamp: new Date(parsedData.timestamp).toLocaleString(),
                chunksCount: parsedData.chunks?.length || 0,
                sizeKB: Math.round(savedData.length / 1024 * 100) / 100
            };
        } catch (error) {
            return null;
        }
    }

    // Auto-save with debouncing to prevent excessive saves
    setupAutoSave(appState, debounceMs = 1000) {
        let saveTimeout;
        
        return () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveState(appState);
            }, debounceMs);
        };
    }
}

// Export for use in other modules
window.Storage = Storage;