window.Market = {
    // --- INTERNAL DATABASE (embedded) ---
    // Indicative prices for the demo.
    // In production you could update them via API or by loading an external JSON file.
    _DB: {
        EE: {
            // 2024 history (average PUN)
            'gen-24': 0.099, 'feb-24': 0.087, 'mar-24': 0.088, 'apr-24': 0.086,
            'mag-24': 0.095, 'giu-24': 0.103, 'lug-24': 0.112, 'ago-24': 0.128,
            'set-24': 0.115, 'ott-24': 0.118, 'nov-24': 0.125, 'dic-24': 0.110,
            // 2025 futures/forecasts
            'gen-25': 0.115, 'feb-25': 0.110, 'mar-25': 0.105, 'apr-25': 0.095,
            'mag-25': 0.100, 'giu-25': 0.110, 'lug-25': 0.125, 'ago-25': 0.135,
            'set-25': 0.120, 'ott-25': 0.125, 'nov-25': 0.130, 'dic-25': 0.120
        },
        GAS: {
            // 2024 history (average PSV)
            'gen-24': 0.38, 'feb-24': 0.35, 'mar-24': 0.33, 'apr-24': 0.34,
            'mag-24': 0.35, 'giu-24': 0.36, 'lug-24': 0.38, 'ago-24': 0.42,
            'set-24': 0.41, 'ott-24': 0.43, 'nov-24': 0.45, 'dic-24': 0.40,
            // 2025 futures/forecasts
            'gen-25': 0.45, 'feb-25': 0.42, 'mar-25': 0.38, 'apr-25': 0.36,
            'mag-25': 0.35, 'giu-25': 0.36, 'lug-25': 0.38, 'ago-25': 0.45,
            'set-25': 0.48, 'ott-25': 0.50, 'nov-25': 0.55, 'dic-25': 0.52
        }
    },

    /**
     * Gets the benchmark price (PUN or PSV) for a given month.
     * @param {string} type - 'EE' or 'GAS'
     * @param {string} monthLabel - E.g. "Gen-25", "gen 25", "2025-01"
     * @returns {number|null} The price, or null if not found
     */
    getBenchmark: function(type, monthLabel) {
        if (!this._DB[type] || typeof monthLabel !== 'string') return null;

        // Month string normalization (e.g. "Gen-25" -> "gen-25")
        // It must match the DB keys.
        // If you use utils.js for date parsing, here we keep simple key-matching logic
        // or standardize everything to lowercase without spaces.

        let key = monthLabel.toLowerCase().trim().replace(' ', '-');

        // Quick handling for different formats if needed,
        // for now we assume the input is consistent with the keys (e.g. "gen-25")

        return this._DB[type][key] || null;
    }
};
