const { useEffect, useRef } = React;
// Get the Market object from the window (defined in market.js)
const { Market } = window;

window.EnergyChart = function({ data, unit = 'kWh', costUnit = '€/kWh', marketType = null }) {
    const canvasRef = useRef(null);
    const chartInstance = useRef(null);
    const safeNumber = (value) => {
        const number = Number(value);
        return Number.isFinite(number) && number >= 0 ? number : 0;
    };

    const THEME = {
        text: '#888888',
        actualBar: '#FFFFFF',      // White for consolidated data
        forecastBar: '#333333',    // Dark gray for estimates
        userLine: '#FFD700',       // GOLD: Your price
        marketLine: '#00FFFF',     // CYAN: The market benchmark
        tooltipBg: '#111111'
    };

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        const chartData = Array.isArray(data) ? data.filter(item => item && typeof item.month === 'string') : [];
        const labels = chartData.map(item => item.month);

        // --- DATA PREPARATION ---

        // 1. Volumes: actual vs forecast separation
        const actualConsumption = chartData.map(item => (item.type === 'actual' || !item.type) ? safeNumber(item.consumption) : null);
        const estimatedConsumption = chartData.map(item => item.type === 'estimated' ? safeNumber(item.consumption) : null);

        // 2. Prices: your unit cost
        const unitPrices = chartData.map(item => {
            const consumption = safeNumber(item.consumption);
            const variableAmount = safeNumber(item.taxableAmount) - safeNumber(item.fixedCosts);
            return consumption > 0 ? (variableAmount / consumption) : null;
        });

        // 3. Prices: the market benchmark (only if marketType is defined and market.js is loaded)
        let marketPrices = [];
        if (marketType && Market) {
            marketPrices = chartData.map(item => Market.getBenchmark(marketType, item.month));
        }

        // Reset previous chart
        if (chartInstance.current) chartInstance.current.destroy();

        // --- DATASET CONFIGURATION ---
        const datasets = [
            {
                // ACTUAL DATA BARS (white)
                label: `Actual (${unit})`,
                data: actualConsumption,
                backgroundColor: THEME.actualBar,
                stack: 'volumes',
                order: 3,
                yAxisID: 'y'
            },
            {
                // FORECAST BARS (transparent with dashed border)
                label: `Forecast (${unit})`,
                data: estimatedConsumption,
                backgroundColor: 'transparent',
                borderColor: THEME.actualBar,
                borderWidth: 1,
                borderDash: [5, 5], // Dashed effect
                hoverBackgroundColor: THEME.forecastBar,
                stack: 'volumes',
                order: 4,
                yAxisID: 'y'
            },
            {
                // YOUR PRICE LINE (gold)
                label: `Your Price (${costUnit})`,
                data: unitPrices,
                borderColor: THEME.userLine,
                backgroundColor: THEME.userLine,
                type: 'line',
                yAxisID: 'y1',
                order: 1, // Foreground
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 3,
                spanGaps: true
            }
        ];

        // Add the market line ONLY if requested and available
        if (marketType && Market) {
            datasets.push({
                label: `Market Benchmark (${marketType === 'EE' ? 'PUN' : 'PSV'})`,
                data: marketPrices,
                borderColor: THEME.marketLine,
                backgroundColor: THEME.marketLine,
                type: 'line',
                yAxisID: 'y1',
                order: 2,
                tension: 0.3,
                borderWidth: 2,
                borderDash: [5, 5], // Dashed to distinguish it from your price
                pointStyle: 'crossRot',
                pointRadius: 4,
                spanGaps: true
            });
        }

        // --- CHART CREATION ---
        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: {
                        ticks: { color: THEME.text },
                        grid: { display: false } // NO VERTICAL LINES
                    },
                    y: {
                        position: 'left',
                        ticks: { color: THEME.text },
                        grid: { display: false }, // NO HORIZONTAL LINES (total cleanup)
                        title: { display: true, text: 'Volumes', color: '#444' }
                    },
                    y1: {
                        position: 'right',
                        ticks: { color: THEME.text },
                        grid: { display: false }, // NO HORIZONTAL LINES
                        title: { display: true, text: 'Price €', color: '#444' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#ccc', usePointStyle: true } },
                    tooltip: {
                        backgroundColor: THEME.tooltipBg,
                        borderColor: '#333',
                        borderWidth: 1,
                        callbacks: {
                            afterBody: function(tooltipItems) {
                                // GAP calculation in the tooltip (Truth Index)
                                const userItem = tooltipItems.find(item => item.dataset.label.includes('Your Price'));
                                const marketItem = tooltipItems.find(item => item.dataset.label.includes('Benchmark'));

                                const userRaw = userItem ? Number(userItem.raw) : NaN;
                                const marketRaw = marketItem ? Number(marketItem.raw) : NaN;

                                if (Number.isFinite(userRaw) && Number.isFinite(marketRaw) && marketRaw !== 0) {
                                    const diff = userRaw - marketRaw;
                                    const perc = (diff / marketRaw) * 100;
                                    const sign = diff > 0 ? '+' : '';
                                    return `\nGAP: ${sign}${perc.toFixed(1)}% vs Market`;
                                }
                                return '';
                            }
                        }
                    }
                }
            }
        });

        return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [data, unit, costUnit, marketType]);

    return (
        <div className="card" style={{ height: '400px', padding: '20px', border: 'none' }}>
            <h3 style={{marginTop:0, fontSize:'14px', color:'#666', textTransform:'uppercase'}}>
                Truth Index (You vs Market)
            </h3>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};
