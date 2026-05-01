const { useState } = React;
const { EnergyDashboard, Utils } = window;

window.ElectricityApp = function() {
    // Company profile
    const [activeProfile, setActiveProfile] = useState('flat');

    const getDashboardData = (bills) => {
        const sorted = Utils.sortData(bills);
        const forecast = Utils.calculateForecast(sorted, activeProfile, 2025);
        return {
            chartData: forecast.completeData,
            statsData: bills,
            tableData: bills,
            consumptionLabel: `Actual Consumption (${bills.length} months)`,
            forecast
        };
    };

    const fmtEur = (v) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

    const renderProfilePanel = ({ dashboardData }) => (
        <div className="card" style={{ marginBottom: '30px', padding: '20px', borderLeft: '4px solid #fff' }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'15px'}}>
                <div>
                    <div style={{fontWeight:'bold', color:'#fff', fontSize:'16px'}}>2025 PROJECTION</div>
                    <div style={{fontSize:'12px', color:'#888'}}>
                        <span style={{color:'#fff', fontWeight:'bold'}}>{fmtEur(dashboardData.forecast.yearTotalExpense)}</span> year-end estimate
                    </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <label style={{fontSize:'12px', color:'#aaa', textTransform:'uppercase'}}>Company Profile:</label>
                    <select
                        value={activeProfile}
                        onChange={(e) => setActiveProfile(e.target.value)}
                        style={{background: '#222', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px', outline:'none'}}
                    >
                        {Object.keys(Utils.PROFILES).map(key => (
                            <option key={key} value={key}>{Utils.PROFILES[key].name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    return (
        <EnergyDashboard
            title="EE Data (Electricity)"
            unit="kWh"
            costUnit="€/kWh"
            storageKey="datiEE"
            initialData={window.initialElectricityData}
            marketType="EE"
            getDashboardData={getDashboardData}
            renderExtraPanel={renderProfilePanel}
            importPlaceholder="Paste Excel cells..."
            monthPlaceholder="e.g. gen-25"
            taxableAmountLabel="Taxable Amount €"
            fixedCostsLabel="Fixed Costs €"
            headerStyle={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}
            titleStyle={{marginBottom:0}}
        />
    );
};
