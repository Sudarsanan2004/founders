import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { usePayments } from '../../firebase/hooks';
import { ANALYTICS_THEME } from './Theme';

const ProjectSparkline = ({ projectId, color = '#2dd4bf' }) => {
    const { payments } = usePayments();

    const data = useMemo(() => {
        const projectPayments = payments
            .filter(p => p.projectId === projectId && p.type === 'developer-payout')
            .sort((a, b) => (a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) - (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)));

        // Create cumulative spend data
        let cumulative = 0;
        return projectPayments.map((p, i) => {
            cumulative += Number(p.amount) || 0;
            const date = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
            return {
                index: i,
                value: cumulative,
                date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            };
        });
    }, [payments, projectId]);

    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            // Fallback for no data: flat line at 0
            return [
                { index: 0, value: 0 },
                { index: 1, value: 0 },
                { index: 2, value: 0 },
                { index: 3, value: 0 },
                { index: 4, value: 0 }
            ];
        } else if (data.length === 1) {
            // Fallback for single point: flat line at that value
            return [
                { index: 0, value: data[0].value },
                { index: 1, value: data[0].value }
            ];
        }
        return data;
    }, [data]);

    const isPlaceholder = !data || data.length === 0;

    return (
        <div style={{ height: '60px', width: '100%', opacity: isPlaceholder ? 0.3 : 1 }} className="transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`gradient-${projectId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isPlaceholder ? '#666' : color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={isPlaceholder ? '#666' : color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    {!isPlaceholder && (
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-black/90 text-[10px] text-white px-2 py-1 rounded border border-white/10">
                                            <div className="text-white/50">{payload[0].payload.date}</div>
                                            <div>₹{payload[0].value.toLocaleString()}</div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    )}
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={isPlaceholder ? '#666' : color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#gradient-${projectId})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProjectSparkline;
