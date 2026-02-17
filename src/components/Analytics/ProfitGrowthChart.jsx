import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import BentoCard from '../BentoCard';
import { TrendingUp } from 'lucide-react';

const ProfitGrowthChart = ({ projects, loading = false }) => {
    const data = useMemo(() => {
        if (!projects || projects.length === 0) return [];

        // Sort projects by date
        const sortedProjects = [...projects].sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateA - dateB;
        });

        let cumulativeProfit = 0;
        return sortedProjects.map((p) => {
            const profit = (Number(p.totalCost) || 0) - (Number(p.developerCost) || 0);
            cumulativeProfit += profit;
            const date = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt || Date.now());

            return {
                name: p.name,
                value: cumulativeProfit,
                date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
            };
        });
    }, [projects]);

    const { growth, isPositive } = useMemo(() => {
        if (!projects || projects.length === 0) return { growth: 0, isPositive: true };

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const prevDate = new Date();
        prevDate.setMonth(currentMonth - 1);
        const prevMonth = prevDate.getMonth();
        const prevYear = prevDate.getFullYear();

        let currentProfit = 0;
        let prevProfit = 0;

        projects.forEach(p => {
            const date = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
            const profit = (Number(p.totalCost) || 0) - (Number(p.developerCost) || 0);

            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                currentProfit += profit;
            } else if (date.getMonth() === prevMonth && date.getFullYear() === prevYear) {
                prevProfit += profit;
            }
        });

        if (prevProfit === 0) {
            return { growth: currentProfit > 0 ? 100 : 0, isPositive: true };
        }

        const percentChange = ((currentProfit - prevProfit) / prevProfit) * 100;
        return {
            growth: Math.abs(percentChange).toFixed(1),
            isPositive: percentChange >= 0
        };
    }, [projects]);

    if (loading) {
        return (
            <BentoCard>
                <div className="skeleton" style={{ height: '100%', width: '100%' }}></div>
            </BentoCard>
        );
    }

    return (
        <BentoCard>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <h3 className="text-label" style={{ marginBottom: '4px' }}>Profit Trend</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: isPositive ? '#4ade80' : '#f87171' }}>
                            {isPositive ? '+' : '-'} {growth}%
                        </span>
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            color: isPositive ? '#4ade80' : '#f87171',
                            fontSize: '0.75rem',
                            background: isPositive ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                            padding: '2px 6px', borderRadius: '4px'
                        }}>
                            <TrendingUp size={12} style={{ marginRight: '4px', transform: isPositive ? 'none' : 'scaleY(-1)' }} />
                            <span>vs Last Month</span>
                        </div>
                    </div>
                </div>

                <div style={{ height: '60px', width: '100%', marginTop: '16px', minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#4ade80' }}
                                labelStyle={{ display: 'none' }}
                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Profit']}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#4ade80"
                                strokeWidth={2}
                                fill="url(#profitGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </BentoCard>
    );
};

export default ProfitGrowthChart;
