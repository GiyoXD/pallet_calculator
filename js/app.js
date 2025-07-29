// Main Application Module
class App {
    constructor() {
        this.state = new AppState();
        this.dom = new DOMElements();
        this.palletGenerator = new PalletGenerator(this.dom, this.state);
        this.calculations = new Calculations(this.dom, this.state);
        this.excelExporter = new ExcelExporter(this.state, this.calculations);
        this.eventHandlers = new EventHandlers(
            this.dom, 
            this.state, 
            this.palletGenerator, 
            this.calculations, 
            this.excelExporter
        );
        
        // Make instances globally available for event handlers
        window.palletGenerator = this.palletGenerator;
        
        this.initialize();
    }

    initialize() {
        // Enable auto-save
        this.state.enableAutoSave();
        
        // Try to load from cache first
        const loadedFromCache = this.state.initialize();
        
        if (loadedFromCache) {
            console.log('Restored from cache:', this.state.chunks.length, 'chunks');
            // Load the saved current chunk
            this.loadChunk(this.state.currentChunkIndex);
            // Update summary visibility
            this.dom.toggleSummaryVisibility(this.state.summaryVisible);
        } else {
            console.log('Starting fresh - no cache found');
            // Create initial chunk
            const initialChunkData = this.state.createNewChunkData(this.dom.getConfigValues());
            this.state.addChunk(initialChunkData);
            // Load the initial chunk
            this.loadChunk(0);
        }
        
        // Set initial pallet count button state
        this.dom.decPalletBtn.disabled = parseInt(this.dom.palletCountInput.value) <= 1;
        
        // Show cache info in console for debugging
        this.showCacheInfo();
    }

    showCacheInfo() {
        const cacheInfo = this.state.storage.getCacheInfo();
        if (cacheInfo) {
            console.log('Cache Info:', cacheInfo);
        }
    }

    saveCurrentChunk() {
        const currentPallets = [];
        document.querySelectorAll('.pallet-card').forEach(card => {
            const palletData = this.extractPalletData(card);
            currentPallets.push(palletData);
        });
        
        const chunkData = {
            config: this.dom.getConfigValues(),
            pallets: currentPallets
        };
        
        this.state.updateChunk(this.state.currentChunkIndex, chunkData);
    }

    extractPalletData(card) {
        if (this.state.inputMode === 'gross-cbm') {
            return {
                grossWt: card.querySelector('.pallet-gross-weight-input')?.value || '',
                cbm: card.querySelector('.pallet-cbm-input')?.value || ''
            };
        } else if (this.state.inputMode === 'sqft-pcs-gross-cbm') {
            return {
                sqft: card.querySelector('.pallet-sqft-input')?.value || '',
                pcs: card.querySelector('.pallet-pcs-input')?.value || '',
                grossWt: card.querySelector('.pallet-gross-weight-input')?.value || '',
                cbm: card.querySelector('.pallet-cbm-input')?.value || ''
            };
        } else {
            return {
                pcs: card.querySelector('.pallet-pcs-input')?.value || '',
                grossWt: card.querySelector('.pallet-gross-weight-input')?.value || '',
                cbm: card.querySelector('.pallet-cbm-input')?.value || ''
            };
        }
    }

    loadChunk(index) {
        const chunk = this.state.chunks[index];
        if (!chunk) return;
        
        this.dom.setConfigValues(chunk.config);
        this.state.setInputMode(chunk.config.inputMode || 'gross-cbm');
        this.palletGenerator.generatePalletInputs(chunk.pallets);
        this.updateCalculations();
        this.updateNavigation();
    }

    updateCalculations() {
        this.calculations.updateCalculations();
    }

    updateNavigation() {
        this.dom.updateNavigationButtons(this.state.currentChunkIndex, this.state.chunks.length);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});