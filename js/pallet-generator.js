// Pallet Input Generator Module
class PalletGenerator {
    constructor(domElements, appState) {
        this.dom = domElements;
        this.state = appState;
    }

    generatePalletInputs(palletData = []) {
        this.dom.palletInputsContainer.innerHTML = '';
        const palletNumberOffset = this.calculatePalletOffset();
        const newCount = parseInt(this.dom.palletCountInput.value) || 0;
        
        for (let i = 0; i < newCount; i++) {
            const data = palletData[i] || {};
            const palletCard = this.createPalletCard(i, palletNumberOffset, data);
            this.dom.palletInputsContainer.appendChild(palletCard);
        }
    }

    calculatePalletOffset() {
        return this.state.chunks
            .slice(0, this.state.currentChunkIndex)
            .reduce((acc, chunk) => acc + parseInt(chunk.config.palletCount, 10), 0);
    }

    createPalletCard(index, offset, data) {
        const palletCard = document.createElement('div');
        palletCard.className = 'pallet-card';
        
        const fields = this.generateFieldsHTML(data);
        palletCard.innerHTML = `
            <h3>Pallet ${index + 1 + offset}</h3>
            <div class="pallet-input-fields">
                ${fields}
            </div>
        `;
        
        this.attachEventListeners(palletCard);
        return palletCard;
    }

    generateFieldsHTML(data) {
        const suggestedPlaceholder = data.grossWt ? '' : this.state.latestSuggestedWeight;
        
        if (this.state.inputMode === 'gross-cbm') {
            return `
                <div class="input-group">
                    <label>Gross Wt.</label>
                    <input type="text" inputmode="decimal" class="pallet-gross-weight-input" 
                           placeholder="${suggestedPlaceholder}" value="${data.grossWt || ''}">
                </div>
                <div class="input-group">
                    <label>CBM</label>
                    <input type="text" inputmode="decimal" class="pallet-cbm-input" 
                           placeholder="e.g. 1.20" value="${data.cbm || ''}">
                </div>
            `;
        } else if (this.state.inputMode === 'sqft-pcs-gross-cbm') {
            return `
                <div class="input-group">
                    <label>Sqft</label>
                    <input type="text" inputmode="decimal" class="pallet-sqft-input" 
                           placeholder="0" value="${data.sqft || ''}">
                </div>
                <div class="input-group">
                    <label>Pcs</label>
                    <input type="text" inputmode="numeric" class="pallet-pcs-input" 
                           placeholder="0" value="${data.pcs || ''}">
                </div>
                <div class="input-group">
                    <label>Gross Wt.</label>
                    <input type="text" inputmode="decimal" class="pallet-gross-weight-input" 
                           placeholder="${suggestedPlaceholder}" value="${data.grossWt || ''}">
                </div>
                <div class="input-group">
                    <label>CBM</label>
                    <input type="text" inputmode="decimal" class="pallet-cbm-input" 
                           placeholder="e.g. 1.20" value="${data.cbm || ''}">
                </div>
            `;
        } else {
            return `
                <div class="input-group">
                    <label>Pcs</label>
                    <input type="text" inputmode="numeric" class="pallet-pcs-input" 
                           placeholder="0" value="${data.pcs || ''}">
                </div>
                <div class="input-group">
                    <label>Gross Wt.</label>
                    <input type="text" inputmode="decimal" class="pallet-gross-weight-input" 
                           placeholder="${suggestedPlaceholder}" value="${data.grossWt || ''}">
                </div>
                <div class="input-group">
                    <label>CBM</label>
                    <input type="text" inputmode="decimal" class="pallet-cbm-input" 
                           placeholder="e.g. 1.20" value="${data.cbm || ''}">
                </div>
            `;
        }
    }

    attachEventListeners(palletCard) {
        palletCard.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                // Trigger save and update calculations
                if (window.app) {
                    window.app.saveCurrentChunk();
                    window.app.updateCalculations();
                }
            });
            
            input.addEventListener('focus', () => {
                this.dom.summaryCard.style.position = 'static';
            });
            
            input.addEventListener('blur', () => {
                this.dom.summaryCard.style.position = 'sticky';
            });
        });
    }

    updatePlaceholders() {
        document.querySelectorAll('.pallet-gross-weight-input').forEach(input => {
            if (!input.value) {
                input.placeholder = this.state.latestSuggestedWeight;
            } else {
                input.placeholder = '';
            }
        });
    }
}

// Export for use in other modules
window.PalletGenerator = PalletGenerator;