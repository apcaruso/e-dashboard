(function() {
    const { useState, useEffect } = React;
    const { EnergyChart, CostBreakdownChart, SummaryStats, DataTable, Utils } = window;

    const emptyInput = { month: '', consumption: '', taxableAmount: '', fixedCosts: '' };
    const invalidBillMessage = "Please enter a valid month, consumption, and taxable amount.";
    const noValidImportMessage = "No valid data.";

    const loadStoredBills = (storageKey, initialData) => {
        const initialBills = Utils.normalizeRecords(initialData || []);
        let saved = null;

        try {
            saved = localStorage.getItem(storageKey);
        } catch (e) {
            return initialBills;
        }

        if (!saved) return initialBills;

        try {
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed)) return initialBills;
            if (parsed.length === 0) return [];

            const normalized = Utils.normalizeRecords(parsed);
            return normalized.length ? normalized : initialBills;
        } catch (e) {
            return initialBills;
        }
    };

    window.EnergyDashboard = function({
        title,
        unit,
        costUnit,
        storageKey,
        initialData,
        marketType,
        getDashboardData,
        renderExtraPanel,
        importPlaceholder = "Paste from Excel...",
        monthPlaceholder = "",
        taxableAmountLabel = "Taxable Amount",
        fixedCostsLabel = "Fixed Costs",
        invalidImportMessage = null,
        headerStyle = {display:'flex', justifyContent:'space-between', marginBottom:'20px'},
        titleStyle = {margin:0}
    }) {
        const [bills, setBills] = useState(() => loadStoredBills(storageKey, initialData));

        useEffect(() => {
            try {
                localStorage.setItem(storageKey, JSON.stringify(Utils.normalizeRecords(bills)));
            } catch (e) {
                // Keep the UI usable if storage is unavailable or full.
            }
        }, [bills]);

        const [input, setInput] = useState(emptyInput);
        const [showImport, setShowImport] = useState(false);
        const [pasteData, setPasteData] = useState('');

        const dashboardData = (getDashboardData ? getDashboardData(bills) : {}) || {};
        const chartData = dashboardData.chartData || bills;
        const statsData = dashboardData.statsData || bills;
        const tableData = dashboardData.tableData || bills;
        const stats = Utils.calculateTotals(statsData);

        const handleAdd = () => {
            const normalized = Utils.normalizeBill({
                id: Date.now(),
                month: input.month,
                consumption: input.consumption,
                taxableAmount: input.taxableAmount,
                fixedCosts: input.fixedCosts
            });

            if (!normalized) return alert(invalidBillMessage);
            setBills([...bills, normalized]);
            setInput(emptyInput);
        };

        const handleImport = () => {
            const result = Utils.parseExcel(pasteData);
            const newRows = result.rows || [];
            const rejected = result.rejected || 0;

            if (!newRows.length) return alert(invalidImportMessage || noValidImportMessage);
            if (newRows.length) setBills(prev => [...prev, ...newRows.map(row => ({...row, id: Date.now()+Math.random()}))]);
            if (rejected > 0) alert(`Imported ${newRows.length} rows. Rejected ${rejected} rows.`);
            setShowImport(false); setPasteData('');
        };

        return (
            <div className="container">
                <div style={headerStyle}>
                    <h1 style={titleStyle}>{title}</h1>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn-sec" onClick={() => { if(confirm('Reset?')) setBills([]); }} style={{color:'#d44'}}>Reset</button>
                        <button className="btn-sec" onClick={() => setShowImport(!showImport)}>{showImport ? 'Close' : 'Import'}</button>
                    </div>
                </div>

                {renderExtraPanel && renderExtraPanel({ bills, dashboardData, stats })}

                {showImport ? (
                    <div className="import-box">
                        <textarea className="paste-area" value={pasteData} onChange={e => setPasteData(e.target.value)} placeholder={importPlaceholder} />
                        <button className="btn-add" onClick={handleImport} style={{float:'right'}}>Process</button>
                        <div style={{clear:'both'}}></div>
                    </div>
                ) : (
                    <div className="input-group">
                        <div className="field"><label>Month</label><input value={input.month} onChange={e => setInput({...input, month: e.target.value})} placeholder={monthPlaceholder} /></div>
                        <div className="field"><label>{unit}</label><input type="number" value={input.consumption} onChange={e => setInput({...input, consumption: e.target.value})} /></div>
                        <div className="field"><label>{taxableAmountLabel}</label><input type="number" value={input.taxableAmount} onChange={e => setInput({...input, taxableAmount: e.target.value})} /></div>
                        <div className="field"><label>{fixedCostsLabel}</label><input type="number" value={input.fixedCosts} onChange={e => setInput({...input, fixedCosts: e.target.value})} /></div>
                        <button className="btn-add" onClick={handleAdd}>+</button>
                    </div>
                )}

                <div className="grid">
                    <div style={{display:'flex', flexDirection:'column', gap:'30px'}}>
                        <EnergyChart
                            data={chartData}
                            unit={unit}
                            costUnit={costUnit}
                            marketType={marketType}
                        />

                        <SummaryStats
                            consumption={stats.totalConsumption}
                            unitCost={stats.averageCost}
                            consumptionLabel={dashboardData.consumptionLabel}
                            consumptionUnit={unit}
                            costUnit={costUnit}
                        />

                        <CostBreakdownChart fixedCosts={stats.totalFixedCosts} variableCosts={stats.totalVariableCosts} />
                    </div>

                    <DataTable data={tableData} onDelete={id => setBills(prev => prev.filter(bill => bill.id !== id))} unit={unit} costUnit={costUnit} />
                </div>
            </div>
        );
    };
})();
