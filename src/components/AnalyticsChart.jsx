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
        const oneYearAgo = new Date();
        oneYearAgo.setMonth(now.getMonth() - 11); // Go back 11 months + current = 12 months
        oneYearAgo.setDate(1); // Start of that month

        projects.forEach(prj => {
            const date = prj.createdAt?.toDate ? prj.createdAt.toDate() : new Date(prj.createdAt);
            if (isNaN(date.getTime())) return;

            // Monthly View: Show last 12 months
            if (timeframe === 'monthly' && date < oneYearAgo) return;

            let key;
            let displayLabel;

            if (timeframe === 'monthly') {
                // Key needs to be unique for Month+Year to sort correctly, but we display Month
                // Ideally we want "Jan", "Feb". But if spanning years, "Jan" (25) and "Jan" (26) conflict.
                // Let's use "MMM YY" as key/name for clarity if spanning years. 
                // However, user might prefer just "Jan" if implied. 
                // Let's use specific formatting:
                key = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }); // "Jan 25"
                displayLabel = date.toLocaleDateString('en-IN', { month: 'short' });
            } else {
                key = date.getFullYear().toString();
                displayLabel = key;
            }

            if (!processedData[key]) {
                processedData[key] = {
                    name: key,
                    shortName: displayLabel,
                    value: 0,
                    inflow: 0,
                    date: date, // Keep one date instance for sorting
                    year: date.getFullYear()
                };
            }
            processedData[key].value += Number(prj.totalCost) || 0;
            processedData[key].inflow += (Number(prj.totalCost) - Number(prj.developerCost)) || 0;
        });

        // Convert to array and Sort
        let sorted = Object.values(processedData).sort((a, b) => {
            // Sort by actual date for monthly, year for yearly
            if (timeframe === 'monthly') {
                // Approximate sort by year-month
                return a.date - b.date;
            } else {
                return Number(a.name) - Number(b.name);
            }
        });

        // Fill gaps? 
        // For rolling 12 months, removing gaps is okay, or fill them.
        // Let's just return actual data for now to ensure 2025 entries appear.

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
                        {data.name}
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

                <div style={{ height: '300px', width: '100%', marginTop: '20px', minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
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
                                    <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.5} />
                                    <stop offset="100%" stopColor="#b34b00" stopOpacity={0.5} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="var(--border-color)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#ffffff', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#ffffff', fontSize: 10 }}
                                tickFormatter={(val) => val > 0 ? `${(val / 100000).toFixed(1)}L` : '0'}
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
