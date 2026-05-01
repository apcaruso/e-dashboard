const { useEffect, useRef } = React;

window.CostBreakdownChart = function({ fixedCosts, variableCosts }) {
    const canvasRef = useRef(null);
    const chartInstance = useRef(null);
    const safeNumber = (value) => {
        const number = Number(value);
        return Number.isFinite(number) && number >= 0 ? number : 0;
    };

    const safeFixedCosts = safeNumber(fixedCosts);
    const safeVariableCosts = safeNumber(variableCosts);
    const total = safeFixedCosts + safeVariableCosts;

    // Currency formatter (Euro)
    const formatEuro = (val) => new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(val);

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Fixed Costs', 'Variable Costs'],
                datasets: [{
                    data: [safeFixedCosts, safeVariableCosts],
                    backgroundColor: ['#333333', '#dddddd'],
                    borderColor: '#000000',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cccccc',
                            padding: 20,
                            font: { size: 12 },
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: '#111',
                        borderColor: '#333',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) { label += ': '; }
                                const value = context.raw;
                                const perc = total > 0 ? (value / total * 100).toFixed(1) + '%' : '0%';
                                return `${label}${formatEuro(value)} (${perc})`;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [safeFixedCosts, safeVariableCosts]);

    return (
        <div className="card" style={{ height: '300px', padding: '20px', position: 'relative', border: 'none' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', textAlign: 'center', color: '#ccc' }}>
                Cost Breakdown
            </h3>

            <div style={{ height: 'calc(100% - 40px)', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <canvas ref={canvasRef}></canvas>

                <div style={{
                    position: 'absolute',
                    top: '42%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    width: '80%'
                }}>
                   <div style={{fontSize:'11px', color:'#888', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'4px'}}>
                       Total
                   </div>
                   <div style={{fontSize:'20px', fontWeight:'bold', color:'#fff'}}>
                       {formatEuro(total)}
                   </div>
                </div>
            </div>
        </div>
    );
};
