// DOM Elements Module
class DOMElements {
    constructor() {
        this.initializeElements();
    }

    initializeElements() {
        // Configuration inputs
        this.companyNameSelect = document.getElementById('company-name');
        this.poNumberInput = document.getElementById('po-number');
        this.cbmPrefixInput = document.getElementById('cbm-prefix');
        this.maxWeightInput = document.getElementById('max-weight');
        this.palletCountInput = document.getElementById('pallet-count');
        this.palletWeightInput = document.getElementById('pallet-weight');
        this.unitPriceInput = document.getElementById('unit-price');
        this.inputModeSelect = document.getElementById('input-mode');

        // Pallet inputs container
        this.palletInputsContainer = document.getElementById('pallet-inputs-grid');
        
        // Summary elements
        this.totalGrossWeightEl = document.getElementById('total-gross-weight');
        this.remainingWeightEl = document.getElementById('remaining-weight');
        this.suggestedWeightEl = document.getElementById('suggested-weight');
        this.statusMessageEl = document.getElementById('status-message');
        this.summaryCard = document.getElementById('summary-card');
        this.toggleSummaryBtn = document.getElementById('toggle-summary-btn');

        // Navigation elements
        this.archiveButton = document.getElementById('archive-button');
        this.prevChunkBtn = document.getElementById('prev-chunk-btn');
        this.nextChunkBtn = document.getElementById('next-chunk-btn');
        this.chunkStatusEl = document.getElementById('chunk-status');

        // Action buttons
        this.resetButton = document.getElementById('reset-button');
        this.exportButton = document.getElementById('export-button');
        this.incPalletBtn = document.getElementById('inc-pallet-btn');
        this.decPalletBtn = document.getElementById('dec-pallet-btn');

        // Modal elements
        this.resetModal = document.getElementById('reset-modal');
        this.confirmResetBtn = document.getElementById('confirm-reset-btn');
        this.cancelResetBtn = document.getElementById('cancel-reset-btn');
        
        // Cache management elements
        this.clearCacheButton = document.getElementById('clear-cache-button');
        this.cacheInfoButton = document.getElementById('cache-info-button');
        this.clearCacheModal = document.getElementById('clear-cache-modal');
        this.confirmClearCacheBtn = document.getElementById('confirm-clear-cache-btn');
        this.cancelClearCacheBtn = document.getElementById('cancel-clear-cache-btn');
        this.cacheInfoModal = document.getElementById('cache-info-modal');
        this.cacheInfoContent = document.getElementById('cache-info-content');
        this.closeCacheInfoBtn = document.getElementById('close-cache-info-btn');
    }

    getConfigValues() {
        return {
            companyName: this.companyNameSelect.value,
            poNumber: this.poNumberInput.value,
            cbmPrefix: this.cbmPrefixInput.value,
            maxWeight: this.maxWeightInput.value,
            palletCount: this.palletCountInput.value,
            palletWeight: this.palletWeightInput.value,
            unitPrice: this.unitPriceInput.value
        };
    }

    setConfigValues(config) {
        this.companyNameSelect.value = config.companyName || 'TONG HONG TANNERY (VIET NAM) JOINT STOCK COMPANY';
        this.poNumberInput.value = config.poNumber || '';
        this.cbmPrefixInput.value = config.cbmPrefix || '';
        this.maxWeightInput.value = config.maxWeight || '';
        this.palletCountInput.value = config.palletCount || '';
        this.palletWeightInput.value = config.palletWeight || '';
        this.unitPriceInput.value = config.unitPrice || '2.50';
        if (config.inputMode) {
            this.inputModeSelect.value = config.inputMode;
        }
    }

    updateSummaryDisplay(totalGross, remaining, suggested) {
        this.totalGrossWeightEl.textContent = Utils.formatNumber(totalGross);
        this.remainingWeightEl.textContent = Utils.formatNumber(remaining);
        this.suggestedWeightEl.textContent = Utils.formatNumber(suggested);
    }

    updateStatusMessage(totalGross, maxWeight) {
        this.statusMessageEl.classList.remove('status-success', 'status-warning', 'status-error');
        
        if (totalGross > maxWeight) {
            this.statusMessageEl.classList.add('status-error');
            this.statusMessageEl.textContent = `🚨 OVER LIMIT: ${Utils.formatNumber(totalGross - maxWeight)} KG`;
        } else if (totalGross > maxWeight * 0.95) {
            this.statusMessageEl.classList.add('status-warning');
            this.statusMessageEl.textContent = `⚠️ Approaching max weight...`;
        } else {
            this.statusMessageEl.classList.add('status-success');
            this.statusMessageEl.textContent = `✅ Looking Good`;
        }
    }

    updateNavigationButtons(currentIndex, totalChunks) {
        this.chunkStatusEl.textContent = `Chunk ${currentIndex + 1} of ${totalChunks}`;
        this.prevChunkBtn.disabled = currentIndex === 0;
        this.nextChunkBtn.disabled = currentIndex === totalChunks - 1;
        this.archiveButton.disabled = currentIndex !== totalChunks - 1;
    }

    toggleSummaryVisibility(visible) {
        this.summaryCard.style.display = visible ? '' : 'none';
        this.toggleSummaryBtn.textContent = visible ? '🔽' : '🔼';
        this.toggleSummaryBtn.title = visible ? 'Hide Calculation Overlay' : 'Show Calculation Overlay';
    }

    showModal() {
        this.resetModal.classList.add('visible');
    }

    hideModal() {
        this.resetModal.classList.remove('visible');
    }

    showClearCacheModal() {
        this.clearCacheModal.classList.add('visible');
    }

    hideClearCacheModal() {
        this.clearCacheModal.classList.remove('visible');
    }

    showCacheInfoModal(cacheInfo) {
        if (cacheInfo) {
            this.cacheInfoContent.innerHTML = `
                <div style="text-align: left; margin: 1rem 0;">
                    <p><strong>Version:</strong> ${cacheInfo.version}</p>
                    <p><strong>Last Saved:</strong> ${cacheInfo.timestamp}</p>
                    <p><strong>Chunks Saved:</strong> ${cacheInfo.chunksCount}</p>
                    <p><strong>Storage Size:</strong> ${cacheInfo.sizeKB} KB</p>
                </div>
            `;
        } else {
            this.cacheInfoContent.innerHTML = '<p>No cached data found.</p>';
        }
        this.cacheInfoModal.classList.add('visible');
    }

    hideCacheInfoModal() {
        this.cacheInfoModal.classList.remove('visible');
    }
}

// Export for use in other modules
window.DOMElements = DOMElements;