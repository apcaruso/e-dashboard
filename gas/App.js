const { useState } = React;
const { EnergyDashboard } = window;

window.GasApp = function() {
    // --- 2. WHAT-IF ---
    const [simulationPercent, setSimulationPercent] = useState(0);

    const getDashboardData = (bills) => {
        const displayedData = simulationPercent === 0 ? bills : bills.map(bill => {
            const originalVariableCost = bill.taxableAmount - bill.fixedCosts;
            const newVariableCost = originalVariableCost * (1 + (simulationPercent / 100));
            return { ...bill, taxableAmount: bill.fixedCosts + newVariableCost };
        });

        return {
            chartData: displayedData,
            statsData: displayedData,
            tableData: displayedData
        };
    };

    const renderSimulationPanel = () => (
        <div className="card" style={{ marginBottom: '30px', padding: '15px', border: simulationPercent !== 0 ? '1px solid #fff' : '1px solid #333' }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <span style={{fontSize:'20px'}}>🔥</span>
                    <div>
                        <div style={{fontWeight:'bold', color:'#fff', fontSize:'14px'}}>GAS PRICE SIMULATOR</div>
                        <div style={{fontSize:'11px', color:'#888'}}>Commodity cost variation</div>
                    </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <input
                        type="range" min="-50" max="100" step="5"
                        value={simulationPercent}
                        onChange={e => setSimulationPercent(Number(e.target.value))}
                        style={{width:'150px', cursor:'pointer'}}
                    />
                    <div style={{
                        width:'60px', textAlign:'right', fontWeight:'bold',
                        color: simulationPercent > 0 ? '#ff4d4d' : (simulationPercent < 0 ? '#4dff88' : '#fff')
                    }}>
                        {simulationPercent > 0 ? '+' : ''}{simulationPercent}%
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <EnergyDashboard
            title="Gas Analysis"
            unit="Smc"
            costUnit="€/Smc"
            storageKey="datiGas"
            initialData={window.initialGasData}
            marketType="GAS"
            getDashboardData={getDashboardData}
            renderExtraPanel={renderSimulationPanel}
            invalidImportMessage="No valid data."
        />
    );
};
