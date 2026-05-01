const { React } = window;

window.DataTable = function({ data, onDelete, unit = "kWh", costUnit = "€/kWh" }) {
    const rows = Array.isArray(data) ? data : [];
    const safeNumber = (value) => {
        const number = Number(value);
        return Number.isFinite(number) && number >= 0 ? number : 0;
    };

    return (
        <div className="card">
            <h3 style={{marginTop: 0, color: '#FFFFFF', fontSize: '18px'}}>Data History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>{unit}</th>
                        <th>{costUnit}</th>
                        <th style={{textAlign:'right'}}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => {
                        const item = row || {};
                        const consumption = safeNumber(item.consumption);
                        const variableAmount = safeNumber(item.taxableAmount) - safeNumber(item.fixedCosts);
                        const unitPrice = consumption > 0 ? (variableAmount / consumption) : 0;

                        return (
                            <tr key={item.id || item.month || index}>
                                <td>{item.month || ''}</td>
                                <td className="val-consumption">{consumption}</td>
                                <td className="val-kpi">
                                    {unitPrice.toFixed(3)}
                                </td>
                                <td style={{textAlign:'right'}}>
                                    <button className="btn-del" onClick={() => { if (typeof onDelete === 'function') onDelete(item.id); }}>
                                        &times;
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {rows.length === 0 && (
                        <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color: '#555'}}>No data entered</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
