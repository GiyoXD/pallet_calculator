// Utility Functions Module
class Utils {
    static parseNumber(val) {
        if (typeof val !== 'string') return 0;
        return parseFloat(val.replace(/,/g, '.')) || 0;
    }

    static formatNumber(num) {
        return Math.round(num).toLocaleString('en-US');
    }

    static getCurrentDateString() {
        const today = new Date();
        return `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    }

    static createBorderStyle() {
        return { style: 'thin' };
    }

    static createTableCellStyle() {
        const borderStyle = this.createBorderStyle();
        return {
            border: { 
                top: borderStyle, 
                bottom: borderStyle, 
                left: borderStyle, 
                right: borderStyle 
            },
            alignment: { horizontal: 'center', vertical: 'middle' }
        };
    }

    static getColumnConfig(inputMode) {
        if (inputMode === 'sqft-pcs-gross-cbm') {
            return {
                columns: [
                    { width: 15 }, { width: 15 }, { width: 15 }, { width: 10 }, 
                    { width: 10 }, { width: 15 }, { width: 10 }, { width: 10 }, 
                    { width: 10 }, { width: 15 }, { width: 12 }, { width: 15 }
                ],
                headerLabels: ["产品名称", "ITEM NO.", "PO NO.", "Sqft", "PCS", "托数", "NW", "GW", "张数", "CBM", "Unit Price", "Total"]
            };
        } else if (inputMode === 'pcs-gross-cbm') {
            return {
                columns: [
                    { width: 15 }, { width: 15 }, { width: 15 }, { width: 10 }, 
                    { width: 15 }, { width: 10 }, { width: 10 }, { width: 10 }, 
                    { width: 15 }, { width: 12 }, { width: 15 }
                ],
                headerLabels: ["产品名称", "ITEM NO.", "PO NO.", "PCS", "托数", "NW", "GW", "张数", "CBM", "Unit Price", "Total"]
            };
        } else {
            return {
                columns: [
                    { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, 
                    { width: 10 }, { width: 10 }, { width: 15 }, { width: 12 }, { width: 15 }
                ],
                headerLabels: ["产品名称", "ITEM NO.", "PO NO.", "托数", "NW", "GW", "CBM", "Unit Price", "Total"]
            };
        }
    }
}

// Export for use in other modules
window.Utils = Utils;