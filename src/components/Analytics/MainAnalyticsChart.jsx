import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePayments } from '../../firebase/hooks';
import { ANALYTICS_THEME, CustomTooltip } from './Theme';
import BentoCard from '../BentoCard';

const MainAnalyticsChart = () => {
    const { payments, loading } = usePayments();
    const [timeRange, setTimeRange] = useState('monthly'); // 'weekly' | 'monthly'

    const data = useMemo(() => {
        if (!payments.length) return [];

        const groupedData = {};

        payments.forEach(payment => {
            const date = payment.createdAt?.toDate ? payment.createdAt.toDate() : new Date(payment.createdAt);
            if (isNaN(date)) return;

            let key;
            if (timeRange === 'monthly') {
                key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            } else {
                // Weekly - simplified to "Day Month" for now for visual clarity
                key = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            }

            if (!groupedData[key]) {
                groupedData[key] = { name: key, revenue: 0, payout: 0, profit: 0, dateObj: date };
            }

            const amount = Number(payment.amount) || 0;
            if (payment.type === 'client-payment') {
                groupedData[key].revenue += amount;
                groupedData[key].profit += amount;
            } else if (payment.type === 'developer-payout') {
                groupedData[key].payout += amount;
                groupedData[key].profit -= amount;
            }
        });

        // Convert to array and sort
        return Object.values(groupedData).sort((a, b) => a.dateObj - b.dateObj);
    }, [payments, timeRange]);

    if (loading) return <div className="h-[300px] bg-white/5 rounded-xl animate-pulse" />;

    return (
        <BentoCard className="col-span-2 overflow-hidden relative group">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Financial Performance</h3>
                    <p className="text-sm text-white/40">Revenue vs Payouts vs Net Profit</p>
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                    {['weekly', 'monthly'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-xs rounded-md transition-all ${timeRange === range
                                ? 'bg-[#e67e50]/20 text-[#e67e50] font-medium'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full relative">
                {data.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
                        <p className="text-sm font-medium">No financial data yet</p>
                        <p className="text-xs">Add payments to see trends</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={ANALYTICS_THEME.colors.primary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={ANALYTICS_THEME.colors.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={ANALYTICS_THEME.colors.secondary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={ANALYTICS_THEME.colors.secondary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={ANALYTICS_THEME.colors.tertiary} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={ANALYTICS_THEME.colors.tertiary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke={ANALYTICS_THEME.colors.grid} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: ANALYTICS_THEME.colors.text, fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: ANALYTICS_THEME.colors.text, fontSize: 12 }}
                                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(230, 126, 80, 0.2)', strokeWidth: 2 }} />

                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue"
                                stroke={ANALYTICS_THEME.colors.primary}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                strokeWidth={3}
                            />
                            <Area
                                type="monotone"
                                dataKey="payout"
                                name="Dev Payouts"
                                stroke={ANALYTICS_THEME.colors.secondary}
                                fillOpacity={1}
                                fill="url(#colorPayout)"
                                strokeWidth={3}
                            />
                            <Area
                                type="monotone"
                                dataKey="profit"
                                name="Net Profit"
                                stroke={ANALYTICS_THEME.colors.tertiary}
                                fillOpacity={1}
                                fill="url(#colorProfit)"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </BentoCard>
    );
};

export default MainAnalyticsChart;
