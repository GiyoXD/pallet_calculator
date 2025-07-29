// State Management Module
class AppState {
    constructor() {
        this.chunks = [];
        this.currentChunkIndex = 0;
        this.inputMode = 'gross-cbm';
        this.latestSuggestedWeight = 0;
        this.summaryVisible = true;
        this.storage = new Storage();
        this.autoSave = null;
    }

    // Initialize state from cache or defaults
    initialize() {
        const savedState = this.storage.loadState();
        if (savedState && savedState.chunks.length > 0) {
            this.chunks = savedState.chunks;
            this.currentChunkIndex = savedState.currentChunkIndex;
            this.inputMode = savedState.inputMode;
            this.summaryVisible = savedState.summaryVisible;
            return true; // Indicates data was loaded from cache
        }
        return false; // Indicates fresh start
    }

    // Setup auto-save functionality
    enableAutoSave() {
        this.autoSave = this.storage.setupAutoSave(this);
    }

    // Trigger save (called after state changes)
    save() {
        if (this.autoSave) {
            this.autoSave();
        }
    }

    createNewChunkData(config) {
        const palletCount = parseInt(config.palletCount) || 12;
        let pallets;

        if (this.inputMode === 'gross-cbm') {
            pallets = Array(palletCount).fill(null).map(() => ({ grossWt: '', cbm: '' }));
        } else if (this.inputMode === 'sqft-pcs-gross-cbm') {
            pallets = Array(palletCount).fill(null).map(() => ({ sqft: '', pcs: '', grossWt: '', cbm: '' }));
        } else {
            pallets = Array(palletCount).fill(null).map(() => ({ pcs: '', grossWt: '', cbm: '' }));
        }

        return {
            config: { 
                ...config, 
                inputMode: this.inputMode,
                companyName: config.companyName || 'TONG HONG TANNERY (VIET NAM) JOINT STOCK COMPANY',
                unitPrice: config.unitPrice || '2.50'
            },
            pallets: pallets
        };
    }

    getCurrentChunk() {
        return this.chunks[this.currentChunkIndex];
    }

    addChunk(chunkData) {
        this.chunks.push(chunkData);
        this.save();
    }

    updateChunk(index, chunkData) {
        if (index >= 0 && index < this.chunks.length) {
            this.chunks[index] = chunkData;
            this.save();
        }
    }

    setCurrentChunkIndex(index) {
        if (index >= 0 && index < this.chunks.length) {
            this.currentChunkIndex = index;
            this.save();
        }
    }

    setInputMode(mode) {
        this.inputMode = mode;
        this.save();
    }

    setSuggestedWeight(weight) {
        this.latestSuggestedWeight = weight;
        // Don't save for suggested weight as it's calculated, not user input
    }

    toggleSummaryVisibility() {
        this.summaryVisible = !this.summaryVisible;
        this.save();
        return this.summaryVisible;
    }

    // Clear all data and cache
    clearAllData() {
        this.chunks = [];
        this.currentChunkIndex = 0;
        this.inputMode = 'gross-cbm';
        this.summaryVisible = true;
        this.storage.clearCache();
    }
}

// Export for use in other modules
window.AppState = AppState;