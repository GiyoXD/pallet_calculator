// Excel Export Module
class ExcelExporter {
    constructor(appState, calculations) {
        this.state = appState;
        this.calculations = calculations;
    }

    async exportToXLSX() {
        const poValue = this.state.chunks[0]?.config?.poNumber || 'Unknown';
        const companyName = this.state.chunks[0]?.config?.companyName || 'TONG HONG TANNERY (VIET NAM) JOINT STOCK COMPANY';
        const dateString = Utils.getCurrentDateString();
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Shipping List');
        
        this.setupWorksheet(worksheet);
        this.addCompanyHeader(worksheet, companyName, poValue, dateString);
        this.addHeaders(worksheet);
        this.addDataRows(worksheet);
        this.addSummaryRows(worksheet);
        
        await this.saveWorkbook(workbook, poValue, dateString);
    }

    setupWorksheet(worksheet) {
        const inputMode = this.state.chunks[0]?.config?.inputMode || 'gross-cbm';
        const config = Utils.getColumnConfig(inputMode);
        
        worksheet.columns = config.columns;
        this.headerLabels = config.headerLabels;
    }

    addCompanyHeader(worksheet, companyName, poValue, dateString) {
        // Add company name row
        worksheet.addRow([`客户：${companyName}`]);
        const companyRow = worksheet.getRow(1);
        worksheet.mergeCells('A1:' + String.fromCharCode(64 + this.headerLabels.length) + '1');
        companyRow.getCell(1).font = { name: 'Times New Roman', size: 12, bold: true };
        
        // Add PO and date row
        const row2 = worksheet.addRow([`形式发票号：${poValue}`, null, null, null, `装运日期: ${dateString}`]);
        worksheet.mergeCells('A2:D2');
        worksheet.mergeCells('E2:' + String.fromCharCode(64 + this.headerLabels.length) + '2');
        row2.eachCell(cell => {
            if (cell.value) {
                cell.font = { name: 'Times New Roman', size: 12 };
            }
        });
        
        // Add empty row
        worksheet.addRow([]);
    }

    addHeaders(worksheet) {
        const headerRow = worksheet.addRow(this.headerLabels);
        const tableCellStyle = Utils.createTableCellStyle();
        
        // Set header row height to 41
        headerRow.height = 41;
        
        headerRow.eachCell(cell => {
            Object.assign(cell, tableCellStyle);
            cell.font = { name: 'Times New Roman', size: 12, bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        });
    }

    addDataRows(worksheet) {
        const tableCellStyle = Utils.createTableCellStyle();
        let palletCounter = 1;
        const grandTotalPallet = this.state.chunks.reduce((acc, chunk) => acc + parseInt(chunk.config.palletCount, 10), 0);
        const chunkTotalRows = []; // Store chunk total row numbers for grand total calculation
        
        this.state.chunks.forEach((chunk, chunkIndex) => {
            const singlePalletWeight = Utils.parseNumber(chunk.config.palletWeight) || 0;
            const cbmPrefix = chunk.config.cbmPrefix || '';
            const chunkDataStartRow = worksheet.lastRow.number + 1;
            
            chunk.pallets.forEach(pallet => {
                const currentRowNumber = worksheet.lastRow.number + 1;
                const row = this.createDataRow(pallet, chunk.config, palletCounter, grandTotalPallet, singlePalletWeight, cbmPrefix, currentRowNumber);
                const addedRow = worksheet.addRow(row);
                
                // Set data row height to 27
                addedRow.height = 27;
                
                addedRow.eachCell(cell => {
                    Object.assign(cell, tableCellStyle);
                    cell.font = { name: 'Times New Roman', size: 12 };
                });
                palletCounter++;
            });
            
            // Add chunk totals and store the row number
            const chunkTotalRowNumber = this.addChunkTotals(worksheet, chunk, chunkDataStartRow, tableCellStyle);
            chunkTotalRows.push(chunkTotalRowNumber);
            
            // Add spacing between chunks if not the last chunk
            if (chunkIndex < this.state.chunks.length - 1) {
                worksheet.addRow([]);
                worksheet.addRow([]);
                const nextHeaderRow = worksheet.addRow(this.headerLabels);
                
                // Set header row height to 41
                nextHeaderRow.height = 41;
                
                nextHeaderRow.eachCell(cell => {
                    Object.assign(cell, tableCellStyle);
                    cell.font = { name: 'Times New Roman', size: 12, bold: true };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
                });
            }
        });
        
        // Add grand total if there are multiple chunks
        if (this.state.chunks.length > 1) {
            this.addGrandTotal(worksheet, chunkTotalRows, tableCellStyle);
        }
    }

    createDataRow(pallet, config, palletNumber, grandTotalPallet, singlePalletWeight, cbmPrefix, currentRowNumber) {
        const inputMode = config.inputMode || 'gross-cbm';
        const grossWt = Utils.parseNumber(pallet.grossWt);
        const netWt = grossWt > 0 ? grossWt - singlePalletWeight : 0;
        const cbmValue = Utils.parseNumber(pallet.cbm);
        const formattedCbm = cbmValue.toFixed(2);
        const finalCbm = cbmPrefix + formattedCbm;
        const unitPrice = Utils.parseNumber(config.unitPrice) || 2.50;
        
        if (inputMode === 'sqft-pcs-gross-cbm') {
            const pcs = Utils.parseNumber(pallet.pcs);
            const sqft = pallet.sqft || '';
            return [
                "wet blue split", "split hide", config.poNumber || '',
                sqft,
                pcs,
                `${palletNumber}-${grandTotalPallet}`,
                netWt, grossWt, pcs, finalCbm, unitPrice, 
                { formula: `G${currentRowNumber}*K${currentRowNumber}` } // Net Weight * Unit Price
            ];
        } else if (inputMode === 'pcs-gross-cbm') {
            const pcs = Utils.parseNumber(pallet.pcs);
            return [
                "wet blue split", "split hide", config.poNumber || '',
                pcs,
                `${palletNumber}-${grandTotalPallet}`,
                netWt, grossWt, pcs, finalCbm, unitPrice, 
                { formula: `F${currentRowNumber}*J${currentRowNumber}` } // Net Weight * Unit Price
            ];
        } else {
            return [
                "wet blue split", "split hide", config.poNumber || '',
                `${palletNumber}-${grandTotalPallet}`,
                netWt, grossWt, finalCbm, unitPrice, 
                { formula: `E${currentRowNumber}*H${currentRowNumber}` } // Net Weight * Unit Price
            ];
        }
    }

    addChunkTotals(worksheet, chunk, chunkDataStartRow, tableCellStyle) {
        const chunkDataEndRow = worksheet.lastRow.number;
        if (chunkDataEndRow >= chunkDataStartRow) {
            let totalRow;
            if (chunk.config.inputMode === 'sqft-pcs-gross-cbm') {
                totalRow = worksheet.addRow([
                    '', '', '', '', '', "TOTAL",
                    { formula: `SUM(G${chunkDataStartRow}:G${chunkDataEndRow})` },
                    { formula: `SUM(H${chunkDataStartRow}:H${chunkDataEndRow})` },
                    { formula: `SUM(I${chunkDataStartRow}:I${chunkDataEndRow})` },
                    { formula: `SUM(J${chunkDataStartRow}:J${chunkDataEndRow})` },
                    '', // Empty cell with border for Unit Price column
                    { formula: `SUM(L${chunkDataStartRow}:L${chunkDataEndRow})` }
                ]);
            } else if (chunk.config.inputMode === 'pcs-gross-cbm') {
                totalRow = worksheet.addRow([
                    '', '', '', '', "TOTAL",
                    { formula: `SUM(F${chunkDataStartRow}:F${chunkDataEndRow})` },
                    { formula: `SUM(G${chunkDataStartRow}:G${chunkDataEndRow})` },
                    { formula: `SUM(H${chunkDataStartRow}:H${chunkDataEndRow})` },
                    { formula: `SUM(I${chunkDataStartRow}:I${chunkDataEndRow})` },
                    '', // Empty cell with border for Unit Price column
                    { formula: `SUM(K${chunkDataStartRow}:K${chunkDataEndRow})` }
                ]);
            } else {
                totalRow = worksheet.addRow([
                    '', '', '', "TOTAL",
                    { formula: `SUM(E${chunkDataStartRow}:E${chunkDataEndRow})` },
                    { formula: `SUM(F${chunkDataStartRow}:F${chunkDataEndRow})` },
                    { formula: `SUM(G${chunkDataStartRow}:G${chunkDataEndRow})` },
                    '', // Empty cell with border for Unit Price column
                    { formula: `SUM(I${chunkDataStartRow}:I${chunkDataEndRow})` }
                ]);
            }
            totalRow.eachCell((cell, colNumber) => {
                // Apply borders only to numerical columns and TOTAL label
                let shouldHaveBorder = false;
                
                if (chunk.config.inputMode === 'sqft-pcs-gross-cbm') {
                    // Columns: 产品名称, ITEM NO., PO NO., Sqft, PCS, 托数, NW, GW, 张数, CBM, Unit Price, Total
                    shouldHaveBorder = colNumber >= 4; // Sqft onwards (columns 4-12)
                } else if (chunk.config.inputMode === 'pcs-gross-cbm') {
                    // Columns: 产品名称, ITEM NO., PO NO., PCS, 托数, NW, GW, 张数, CBM, Unit Price, Total
                    shouldHaveBorder = colNumber >= 4; // PCS onwards (columns 4-11)
                } else {
                    // Columns: 产品名称, ITEM NO., PO NO., 托数, NW, GW, CBM, Unit Price, Total
                    shouldHaveBorder = colNumber >= 4; // 托数 onwards (columns 4-9)
                }
                
                if (shouldHaveBorder) {
                    Object.assign(cell, tableCellStyle);
                }
                cell.font = { name: 'Times New Roman', size: 12, bold: true };
            });
            
            // Set total row height to 27
            totalRow.height = 27;
            
            return worksheet.lastRow.number; // Return the row number for grand total calculation
        }
        return null;
    }

    addGrandTotal(worksheet, chunkTotalRows, tableCellStyle) {
        if (chunkTotalRows.length === 0) return;
        
        // Add empty row before grand total
        worksheet.addRow([]);
        
        const inputMode = this.state.chunks[0]?.config?.inputMode || 'gross-cbm';
        let grandTotalRow;
        
        // Create formula references for each chunk total row
        const createSumFormula = (column) => {
            const references = chunkTotalRows.map(rowNum => `${column}${rowNum}`).join('+');
            return { formula: references };
        };
        
        if (inputMode === 'sqft-pcs-gross-cbm') {
            grandTotalRow = worksheet.addRow([
                '', '', '', '', '', "GRAND TOTAL",
                createSumFormula('G'), // Net Weight
                createSumFormula('H'), // Gross Weight  
                createSumFormula('I'), // Pieces
                createSumFormula('J'), // CBM
                '', // Empty cell with border for Unit Price column
                createSumFormula('L')  // Total Amount
            ]);
        } else if (inputMode === 'pcs-gross-cbm') {
            grandTotalRow = worksheet.addRow([
                '', '', '', '', "GRAND TOTAL",
                createSumFormula('F'), // Net Weight
                createSumFormula('G'), // Gross Weight
                createSumFormula('H'), // Pieces
                createSumFormula('I'), // CBM
                '', // Empty cell with border for Unit Price column
                createSumFormula('K')  // Total Amount
            ]);
        } else {
            grandTotalRow = worksheet.addRow([
                '', '', '', "GRAND TOTAL",
                createSumFormula('E'), // Net Weight
                createSumFormula('F'), // Gross Weight
                createSumFormula('G'), // CBM
                '', // Empty cell with border for Unit Price column
                createSumFormula('I')  // Total Amount
            ]);
        }
        
        grandTotalRow.eachCell((cell, colNumber) => {
            // Apply borders only to numerical columns and GRAND TOTAL label
            let shouldHaveBorder = false;
            
            if (inputMode === 'sqft-pcs-gross-cbm') {
                // Columns: 产品名称, ITEM NO., PO NO., Sqft, PCS, 托数, NW, GW, 张数, CBM, Unit Price, Total
                shouldHaveBorder = colNumber >= 4; // Sqft onwards (columns 4-12)
            } else if (inputMode === 'pcs-gross-cbm') {
                // Columns: 产品名称, ITEM NO., PO NO., PCS, 托数, NW, GW, 张数, CBM, Unit Price, Total
                shouldHaveBorder = colNumber >= 4; // PCS onwards (columns 4-11)
            } else {
                // Columns: 产品名称, ITEM NO., PO NO., 托数, NW, GW, CBM, Unit Price, Total
                shouldHaveBorder = colNumber >= 4; // 托数 onwards (columns 4-9)
            }
            
            if (shouldHaveBorder) {
                Object.assign(cell, tableCellStyle);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6600' } }; // Orange background for grand total
            }
            cell.font = { name: 'Times New Roman', size: 12, bold: true };
        });
        
        // Set grand total row height to 27
        grandTotalRow.height = 27;
    }

    addSummaryRows(worksheet) {
        // This method is now handled within addDataRows for each chunk
        // Keep it for compatibility but it's no longer used
    }

    async saveWorkbook(workbook, poValue, dateString) {
        try {
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            saveAs(blob, `${poValue}_shipping_list_${dateString}.xlsx`);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
    }
}

// Export for use in other modules
window.ExcelExporter = ExcelExporter;