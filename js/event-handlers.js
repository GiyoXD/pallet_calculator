// Event Handlers Module
class EventHandlers {
    constructor(domElements, appState, palletGenerator, calculations, excelExporter) {
        this.dom = domElements;
        this.state = appState;
        this.palletGenerator = palletGenerator;
        this.calculations = calculations;
        this.excelExporter = excelExporter;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Configuration change handlers
        this.dom.palletCountInput.addEventListener('input', () => this.handlePalletCountChange());
        this.dom.inputModeSelect.addEventListener('change', () => this.handleInputModeChange());
        
        // Pallet count buttons
        this.dom.incPalletBtn.addEventListener('click', () => this.handlePalletCountButton(1));
        this.dom.decPalletBtn.addEventListener('click', () => this.handlePalletCountButton(-1));
        
        // Navigation handlers
        this.dom.prevChunkBtn.addEventListener('click', () => this.handleChunkNavigation(-1));
        this.dom.nextChunkBtn.addEventListener('click', () => this.handleChunkNavigation(1));
        this.dom.archiveButton.addEventListener('click', () => this.handleArchiveChunk());
        
        // Action button handlers
        this.dom.exportButton.addEventListener('click', () => this.handleExport());
        this.dom.resetButton.addEventListener('click', () => this.handleResetRequest());
        
        // Modal handlers
        this.dom.confirmResetBtn.addEventListener('click', () => this.handleConfirmReset());
        this.dom.cancelResetBtn.addEventListener('click', () => this.handleCancelReset());
        
        // Cache management handlers
        this.dom.clearCacheButton.addEventListener('click', () => this.handleClearCacheRequest());
        this.dom.cacheInfoButton.addEventListener('click', () => this.handleCacheInfoRequest());
        this.dom.confirmClearCacheBtn.addEventListener('click', () => this.handleConfirmClearCache());
        this.dom.cancelClearCacheBtn.addEventListener('click', () => this.handleCancelClearCache());
        this.dom.closeCacheInfoBtn.addEventListener('click', () => this.handleCloseCacheInfo());
        
        // Summary toggle handler
        this.dom.toggleSummaryBtn.addEventListener('click', () => this.handleToggleSummary());
        
        // Configuration input handlers
        [this.dom.companyNameSelect, this.dom.poNumberInput, this.dom.cbmPrefixInput, 
         this.dom.maxWeightInput, this.dom.palletWeightInput, this.dom.unitPriceInput].forEach(input => {
            input.addEventListener('input', () => this.handleConfigChange());
            input.addEventListener('change', () => this.handleConfigChange());
        });
    }

    handlePalletCountChange() {
        const currentCount = parseInt(this.dom.palletCountInput.value) || 0;
        this.dom.decPalletBtn.disabled = currentCount <= 1;
        
        if (window.app) {
            window.app.saveCurrentChunk();
            this.palletGenerator.generatePalletInputs(this.state.getCurrentChunk()?.pallets || []);
            this.calculations.updateCalculations();
        }
    }

    handleInputModeChange() {
        this.state.setInputMode(this.dom.inputModeSelect.value);
        if (window.app) {
            window.app.saveCurrentChunk();
            this.palletGenerator.generatePalletInputs(this.state.getCurrentChunk()?.pallets || []);
            this.calculations.updateCalculations();
        }
    }

    handlePalletCountButton(delta) {
        const currentCount = parseInt(this.dom.palletCountInput.value) || 0;
        const newCount = Math.max(1, currentCount + delta);
        this.dom.palletCountInput.value = newCount.toString();
        this.handlePalletCountChange();
    }

    handleChunkNavigation(direction) {
        if (window.app) {
            window.app.saveCurrentChunk();
            const newIndex = this.state.currentChunkIndex + direction;
            if (newIndex >= 0 && newIndex < this.state.chunks.length) {
                this.state.setCurrentChunkIndex(newIndex);
                window.app.loadChunk(newIndex);
            }
        }
    }

    handleArchiveChunk() {
        if (window.app) {
            window.app.saveCurrentChunk();
            const newChunkData = this.state.createNewChunkData(this.dom.getConfigValues());
            this.state.addChunk(newChunkData);
            this.state.setCurrentChunkIndex(this.state.chunks.length - 1);
            window.app.loadChunk(this.state.currentChunkIndex);
        }
    }

    async handleExport() {
        if (window.app) {
            window.app.saveCurrentChunk();
            this.dom.exportButton.disabled = true;
            this.dom.exportButton.textContent = 'Exporting...';
            
            try {
                await this.excelExporter.exportToXLSX();
            } finally {
                this.dom.exportButton.disabled = false;
                this.dom.exportButton.textContent = 'Export Shipping List';
            }
        }
    }

    handleResetRequest() {
        this.dom.showModal();
    }

    handleConfirmReset() {
        if (window.app) {
            const newChunkData = this.state.createNewChunkData(this.dom.getConfigValues());
            this.state.updateChunk(this.state.currentChunkIndex, newChunkData);
            window.app.loadChunk(this.state.currentChunkIndex);
        }
        this.dom.hideModal();
    }

    handleCancelReset() {
        this.dom.hideModal();
    }

    handleToggleSummary() {
        const visible = this.state.toggleSummaryVisibility();
        this.dom.toggleSummaryVisibility(visible);
    }

    handleConfigChange() {
        if (window.app) {
            window.app.saveCurrentChunk();
            this.calculations.updateCalculations();
        }
    }

    handleClearCacheRequest() {
        this.dom.showClearCacheModal();
    }

    handleCacheInfoRequest() {
        const cacheInfo = this.state.storage.getCacheInfo();
        this.dom.showCacheInfoModal(cacheInfo);
    }

    handleConfirmClearCache() {
        this.state.clearAllData();
        this.dom.hideClearCacheModal();
        
        // Reinitialize the app with fresh data
        if (window.app) {
            const initialChunkData = this.state.createNewChunkData(this.dom.getConfigValues());
            this.state.addChunk(initialChunkData);
            window.app.loadChunk(0);
        }
        
        alert('All data has been cleared successfully.');
    }

    handleCancelClearCache() {
        this.dom.hideClearCacheModal();
    }

    handleCloseCacheInfo() {
        this.dom.hideCacheInfoModal();
    }
}

// Export for use in other modules
window.EventHandlers = EventHandlers;