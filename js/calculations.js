// Calculations Module
class Calculations {
    constructor(domElements, appState) {
        this.dom = domElements;
        this.state = appState;
    }

    updateCalculations() {
        const chunk = this.state.getCurrentChunk();
        if (!chunk) return;

        const maxWeight = Utils.parseNumber(chunk.config.maxWeight) || 0;
        const palletCount = parseInt(chunk.config.palletCount) || 0;
        
        const { totalGrossWeight, palletsWithWeight } = this.calculateTotals(chunk.pallets);
        const remainingWeight = maxWeight - totalGrossWeight;
        const remainingPallets = palletCount - palletsWithWeight;
        const suggestedWeight = remainingPallets > 0 ? remainingWeight / remainingPallets : 0;
        
        this.state.setSuggestedWeight(Math.round(suggestedWeight));
        
        // Update display
        this.dom.updateSummaryDisplay(totalGrossWeight, remainingWeight, suggestedWeight);
        this.dom.updateStatusMessage(totalGrossWeight, maxWeight);
        
        // Update placeholders if pallet generator is available
        if (window.palletGenerator) {
            window.palletGenerator.updatePlaceholders();
        }
    }

    calculateTotals(pallets) {
        let totalGrossWeight = 0;
        let palletsWithWeight = 0;
        
        pallets.forEach(pallet => {
            const grossWt = Utils.parseNumber(pallet.grossWt);
            totalGrossWeight += grossWt;
            if (grossWt > 0) palletsWithWeight++;
        });
        
        return { totalGrossWeight, palletsWithWeight };
    }

    calculateGrandTotals() {
        let grandTotalGross = 0;
        let grandTotalCBM = 0;
        let grandTotalSqft = 0;
        let grandTotalPcs = 0;
        
        this.state.chunks.forEach(chunk => {
            chunk.pallets.forEach(pallet => {
                grandTotalGross += Utils.parseNumber(pallet.grossWt);
                grandTotalCBM += Utils.parseNumber(pallet.cbm);
                if (pallet.sqft) grandTotalSqft += Utils.parseNumber(pallet.sqft);
                if (pallet.pcs) grandTotalPcs += Utils.parseNumber(pallet.pcs);
            });
        });
        
        return {
            totalGross: grandTotalGross,
            totalCBM: grandTotalCBM,
            totalSqft: grandTotalSqft,
            totalPcs: grandTotalPcs
        };
    }
}

// Export for use in other modules
window.Calculations = Calculations;