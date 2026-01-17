import { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import BentoCard from './BentoCard';
import './AnalyticsChart.css';

const AnalyticsChart = ({ projects = [], payments = [], loading = false }) => {
    const [timeframe, setTimeframe] = useState('monthly');
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const chartData = useMemo(() => {
        if (loading) return [];

        const processedData = {};
        const now = new Date();
        const currentYear = now.getFullYear();

        // 1. Process Projects for "Cashflow" (Total value of project contracts)
        projects.forEach(prj => {
            const date = prj.createdAt?.toDate ? prj.createdAt.toDate() : new Date(prj.createdAt);
            if (isNaN(date.getTime())) return;

            // Only show data for current year for monthly view
            if (timeframe === 'monthly' && date.getFullYear() !== currentYear) return;

            let key;
            if (timeframe === 'monthly') {
                key = date.toLocaleDateString('en-IN', { month: 'short' });
            } else {
                key = date.getFullYear().toString();
            }

            if (!processedData[key]) {
                processedData[key] = { name: key, value: 0, inflow: 0, date: date };
            }
            processedData[key].value += Number(prj.totalCost) || 0;
            // Inflow here represents the "Net Admin Profit" part (Cost - DevBudget)
            processedData[key].inflow += (Number(prj.totalCost) - Number(prj.developerCost)) || 0;
        });

        let sorted = Object.values(processedData).sort((a, b) => a.date - b.date);

        // Fill in missing months for monthly view
        if (timeframe === 'monthly') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const fullData = months.map(m => {
                const existing = sorted.find(d => d.name === m);
                return existing || { name: m, value: 0, inflow: 0 };
            });
            sorted = fullData;
        }

        return sorted;
    }, [projects, timeframe, loading]);

    const totalVolume = useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.value, 0);
    }, [chartData]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bar-tooltip">
                    <p className="tooltip-date">
                        {timeframe === 'monthly' ? `${data.name} 2026` : data.name}
                    </p>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Cashflow</span>
                        <span className="tooltip-value">₹{data.value.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Inflow</span>
                        <span className="tooltip-value">₹{data.inflow.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <BentoCard span={2}>
                <div className="skeleton" style={{ height: '400px', width: '100%' }}></div>
            </BentoCard>
        );
    }

    return (
        <BentoCard span={2}>
            <div className="analytics-container">
                <div className="cash-flow-header">
                    <div>
                        <p className="cash-flow-title">Cash Flow</p>
                        <h2 className="cash-flow-amount" style={{ fontSize: '2.5rem', fontWeight: '800' }}>₹{totalVolume >= 100000 ? `${(totalVolume / 100000).toFixed(1)} Lacs` : totalVolume.toLocaleString('en-IN')}</h2>
                    </div>
                    <div className="custom-toggle">
                        <button
                            className={`toggle-item ${timeframe === 'monthly' ? 'active' : ''}`}
                            onClick={() => setTimeframe('monthly')}
                        >
                            Monthly
                        </button>
                        <button
                            className={`toggle-item ${timeframe === 'yearly' ? 'yearly-active' : ''}`}
                            onClick={() => setTimeframe('yearly')}
                        >
                            • Yearly
                        </button>
                    </div>
                </div>

                <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                            onMouseMove={(state) => {
                                if (state.activeTooltipIndex !== undefined) {
                                    setHoveredIndex(state.activeTooltipIndex);
                                }
                            }}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <defs>
                                <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff6b00" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#b34b00" stopOpacity={1} />
                                </linearGradient>
                                <linearGradient id="regularBarGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2a2a2a" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#1a1a1a" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                tickFormatter={(val) => val > 0 ? `${val / 1000}k` : '0k'}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={false}
                            />
                            <Bar
                                dataKey="value"
                                radius={[20, 20, 20, 20]}
                                barSize={36}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={hoveredIndex === index ? "url(#activeBarGradient)" : "url(#regularBarGradient)"}
                                        stroke="none"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </BentoCard>
    );
};

export default AnalyticsChart;
