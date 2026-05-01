window.Utils = {
    monthsMap: {
        'gen': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'mag': 4, 'giu': 5,
        'lug': 6, 'ago': 7, 'set': 8, 'ott': 9, 'nov': 10, 'dic': 11
    },
    monthsReverse: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],

    // --- B2B LOAD PROFILES ---
    PROFILES: {
        'flat': {
            name: '24/7 Industry / Data Center (Constant)',
            curve: [0.083, 0.083, 0.083, 0.083, 0.083, 0.083, 0.083, 0.083, 0.083, 0.083, 0.083, 0.083]
        },
        'office': {
            name: 'Office / Commercial (Summer + Winter Peak)',
            curve: [0.09, 0.085, 0.08, 0.075, 0.08, 0.10, 0.12, 0.06, 0.09, 0.08, 0.085, 0.055]
        },
        'summer_seasonal': {
            name: 'Summer Tourism / Seaside Hotel',
            curve: [0.02, 0.02, 0.04, 0.08, 0.15, 0.20, 0.22, 0.18, 0.06, 0.02, 0.01, 0.01]
        },
        'winter_seasonal': {
            name: 'Winter Tourism / Process Gas',
            curve: [0.18, 0.16, 0.12, 0.08, 0.04, 0.02, 0.01, 0.01, 0.03, 0.08, 0.12, 0.15]
        }
    },

    isFiniteNonNegative: function(value) {
        return Number.isFinite(value) && value >= 0;
    },

    parseNumberValue: function(value, { required = true } = {}) {
        if (value === undefined || value === null || value === '') return required ? null : 0;
        const number = Number(value);
        return this.isFiniteNonNegative(number) ? number : null;
    },

    normalizeBill: function(record) {
        if (!record || typeof record !== 'object') return null;

        const readField = (englishKey, legacyKey) => record[englishKey] !== undefined ? record[englishKey] : record[legacyKey];
        const month = String(readField('month', 'mese') || '').trim();
        if (!this.isValidMonth(month)) return null;

        const consumption = this.parseNumberValue(readField('consumption', 'consumo'));
        const taxableAmount = this.parseNumberValue(readField('taxableAmount', 'imponibile'));
        const fixedCosts = this.parseNumberValue(readField('fixedCosts', 'costiFissi'), { required: false });
        if (consumption === null || taxableAmount === null || fixedCosts === null) return null;

        const rawType = readField('type', 'tipo');
        const type = rawType === 'reale' ? 'actual' : (rawType === 'stimato' ? 'estimated' : rawType);
        const normalized = {
            id: record.id !== undefined ? record.id : Date.now() + Math.random(),
            month,
            consumption,
            taxableAmount,
            fixedCosts
        };

        if (type === 'actual' || type === 'estimated') normalized.type = type;
        return normalized;
    },

    normalizeRecord: function(record) {
        return this.normalizeBill(record);
    },

    normalizeRecords: function(records) {
        if (!Array.isArray(records)) return [];
        return records.map(record => this.normalizeBill(record)).filter(Boolean);
    },

    parseDateStr: function(monthStr) {
        if (!monthStr) return new Date(NaN);
        try {
            const clean = String(monthStr).trim();
            const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})$/);
            if (isoMatch) {
                const year = Number(isoMatch[1]);
                const month = Number(isoMatch[2]);
                return month >= 1 && month <= 12 ? new Date(year, month - 1, 1) : new Date(NaN);
            }

            const parts = clean.split(/[- ]/);
            if (parts.length < 2) return new Date(NaN);
            const monthName = parts[0].toLowerCase().trim().substring(0,3);
            const yearShort = parseInt(parts[1], 10);
            const yearFull = yearShort < 100 ? 2000 + yearShort : yearShort;
            if (!Number.isFinite(yearFull) || this.monthsMap[monthName] === undefined) return new Date(NaN);
            const monthIdx = this.monthsMap[monthName];
            return new Date(yearFull, monthIdx, 1);
        } catch (e) { return new Date(NaN); }
    },

    isValidMonth: function(monthStr) {
        return !Number.isNaN(this.parseDateStr(monthStr).getTime());
    },

    sortData: function(data) {
        if (!Array.isArray(data)) return [];
        return [...data].sort((a, b) => {
            const timeA = this.parseDateStr(a && a.month).getTime();
            const timeB = this.parseDateStr(b && b.month).getTime();
            const invalidA = Number.isNaN(timeA);
            const invalidB = Number.isNaN(timeB);
            if (invalidA && invalidB) return 0;
            if (invalidA) return 1;
            if (invalidB) return -1;
            return timeA - timeB;
        });
    },

    calculateForecast: function(actualData, profileKey = 'flat', referenceYear = 2025) {
        const records = this.normalizeRecords(actualData);
        const profile = this.PROFILES[profileKey] || this.PROFILES['flat'];
        const curve = profile.curve;

        const actualMap = new Array(12).fill(null);
        let actualSum = 0;
        let coveredActualWeight = 0;

        let unitCostSum = 0;
        let unitCostCount = 0;

        records.forEach(record => {
            const date = this.parseDateStr(record.month);
            if (date.getFullYear() === referenceYear) {
                const mIdx = date.getMonth();
                actualMap[mIdx] = record;
                actualSum += record.consumption;
                coveredActualWeight += curve[mIdx];

                const variableAmount = record.taxableAmount - record.fixedCosts;
                if(record.consumption > 0) {
                    unitCostSum += (variableAmount / record.consumption);
                    unitCostCount++;
                }
            }
        });

        const averageUnitCost = unitCostCount > 0 ? (unitCostSum / unitCostCount) : 0.30;
        let annualTotalEstimate = 0;
        if (coveredActualWeight > 0) {
            annualTotalEstimate = actualSum / coveredActualWeight;
        }

        const completeData = [];
        let yearTotalConsumption = 0;
        let yearTotalExpense = 0;

        for (let i = 0; i < 12; i++) {
            const monthLabel = `${this.monthsReverse[i]}-${referenceYear.toString().substring(2)}`;

            if (actualMap[i]) {
                completeData.push({ ...actualMap[i], type: 'actual' });
                yearTotalConsumption += actualMap[i].consumption;
                yearTotalExpense += actualMap[i].taxableAmount;
            } else {
                const estimatedConsumption = annualTotalEstimate > 0 ? (annualTotalEstimate * curve[i]) : 0;
                const estimatedTaxableAmount = (estimatedConsumption * averageUnitCost) + 20;

                completeData.push({
                    id: `f-${i}`,
                    month: monthLabel,
                    consumption: estimatedConsumption,
                    taxableAmount: estimatedTaxableAmount,
                    fixedCosts: 20,
                    type: 'estimated'
                });
                yearTotalConsumption += estimatedConsumption;
                yearTotalExpense += estimatedTaxableAmount;
            }
        }

        return { completeData, yearTotalConsumption, yearTotalExpense };
    },

    calculateTotals: function(bills) {
        const normalizedBills = this.normalizeRecords(bills);
        let totalConsumption = 0, totalTaxableAmount = 0, totalFixedCosts = 0;
        const sorted = this.sortData(normalizedBills);
        sorted.forEach(bill => { totalConsumption += bill.consumption; totalTaxableAmount += bill.taxableAmount; totalFixedCosts += bill.fixedCosts; });
        const totalVariableCosts = totalTaxableAmount - totalFixedCosts;
        const averageCost = totalConsumption > 0 ? (totalVariableCosts/totalConsumption) : 0;
        return { totalConsumption, totalFixedCosts, totalVariableCosts, averageCost };
    },

    // --- EXCEL PARSING (CORRECT FOR ITALY) ---
    parseExcel: function(pasteData) {
        if (!pasteData || !pasteData.trim()) return { rows: [], rejected: 0 };

        const rows = pasteData.split(/\r?\n/);
        const parsedData = [];
        let rejected = 0;

        // All-or-nothing helper for Italian number formats
        const parseNum = (val) => {
            if (val === undefined || val === null || val === '') return null;
            let clean = val.toString().trim();
            if (!clean) return null;

            // 1. Remove currency symbols and spaces
            clean = clean.replace(/[€\s]/g, '');

            // 2. ITALIAN FORMAT LOGIC:
            // Remove ALL dots (thousands separators: 5.220 -> 5220)
            clean = clean.replace(/\./g, '');

            // Replace the comma with a dot (decimal separator: 50,00 -> 50.00)
            clean = clean.replace(',', '.');

            const num = parseFloat(clean);
            return this.isFiniteNonNegative(num) ? num : null;
        };

        rows.forEach(row => {
            if (!row.trim()) return;
            const columns = row.split('\t').map(column => column.trim());
            // Skip empty rows or headers
            if (columns.length < 3) { rejected++; return; }

            // Check whether the first column looks like a header
            const firstColumn = columns[0].toLowerCase();
            if(firstColumn.includes('mese') || firstColumn.includes('month')) return;

            const consumption = parseNum(columns[1]);
            const taxableAmount = parseNum(columns[2]);
            const fixedCosts = columns[3] ? parseNum(columns[3]) : 0;
            if (consumption === null || taxableAmount === null || fixedCosts === null) { rejected++; return; }

            const normalized = this.normalizeBill({
                month: columns[0].trim(),
                consumption,
                taxableAmount,
                fixedCosts
            });
            if (normalized) parsedData.push(normalized);
            else rejected++;
        });

        return { rows: parsedData, rejected };
    }
};
