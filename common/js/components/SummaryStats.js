const { React } = window;

window.SummaryStats = function({
    consumption,
    unitCost,
    consumptionLabel = "Total Consumption",
    costLabel = "Average Unit Cost",
    consumptionUnit = "kWh",
    costUnit = "€/kWh"
}) {
    const safeNonNegativeNumber = (value) => {
        const number = Number(value);
        return Number.isFinite(number) && number >= 0 ? number : 0;
    };
    const safeFiniteNumber = (value) => {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    };
    const safeConsumption = safeNonNegativeNumber(consumption);
    const safeUnitCost = safeFiniteNumber(unitCost);
    const kpiStyle = { display: 'flex', justifyContent: 'space-between', gap: '20px' };
    const itemStyle = {
        flex: 1, backgroundColor: '#111', border: '1px solid #333',
        borderRadius: '8px', padding: '20px', textAlign: 'center'
    };
    const labelStyle = {
        color: '#888', fontSize: '11px', textTransform: 'uppercase',
        letterSpacing: '1px', marginBottom: '8px', fontWeight: 700
    };
    const valueStyle = { color: '#FFF', fontSize: '24px', fontWeight: 700 };
    const unitStyle = { fontSize: '14px', color: '#555' };

    return (
        <div style={kpiStyle}>
            <div style={itemStyle}>
                <div style={labelStyle}>{consumptionLabel}</div>
                <div style={valueStyle}>
                    {new Intl.NumberFormat('it-IT').format(safeConsumption)} <span style={unitStyle}>{consumptionUnit}</span>
                </div>
            </div>
            <div style={itemStyle}>
                <div style={labelStyle}>{costLabel}</div>
                <div style={valueStyle}>
                    {safeUnitCost.toFixed(3)} <span style={unitStyle}>{costUnit}</span>
                </div>
            </div>
        </div>
    );
};
