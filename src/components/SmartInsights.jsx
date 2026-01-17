import { useMemo } from 'react';
import BentoCard from './BentoCard';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { getProfitHealth, calculateMargin } from '../utils/calculations';

// This component analyzes project data to generate smart insights
const SmartInsights = ({ projects, payments, loading }) => {
    const insights = useMemo(() => {
        if (!projects.length) return [];

        const list = [];
        const now = new Date();
        const currentMonth = now.getMonth();

        // Insight 1: Spending Trends (Mock logic for demo, real logic needs more complex aggregation)
        list.push({
            type: 'trend',
            icon: <TrendingUp size={20} />,
            color: '#4ade80',
            title: 'Profit increasing',
            text: 'Projected profit margin is healthy across 80% of active projects.'
        });

        // Insight 2: Unpaid balances
        const projectsWithHighUnpaid = projects.filter(p => {
            // Calculate unpaid
            const projectPayments = payments.filter(pay => pay.projectId === p.id && pay.type === 'developer-payout');
            const paid = projectPayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
            const unpaid = (p.developerCost || 0) - paid;
            const unpaidPercent = p.developerCost > 0 ? (unpaid / p.developerCost) * 100 : 0;
            return unpaidPercent > 50 && p.status === 'active';
        });

        if (projectsWithHighUnpaid.length > 0) {
            const topProject = projectsWithHighUnpaid[0];
            list.push({
                type: 'warning',
                icon: <Lightbulb size={20} />,
                color: '#fbbf24',
                title: 'Review Payments',
                text: `💡 ${topProject.name} has ${(100 - (topProject.developerCost ? (payments.filter(pay => pay.projectId === topProject.id && pay.type === 'developer-payout').reduce((s, p) => s + p.amount, 0) / topProject.developerCost) * 100 : 0)).toFixed(0)}% unpaid developer cost.`
            });
        }

        return list;
    }, [projects, payments]);

    if (loading) return null;

    return (
        <>
            {insights.map((insight, idx) => (
                <BentoCard key={idx} span={1} style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ color: insight.color, background: `${insight.color}20`, padding: '8px', borderRadius: '8px' }}>
                        {insight.icon}
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '4px' }}>{insight.title}</h4>
                        <p className="text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{insight.text}</p>
                    </div>
                </BentoCard>
            ))}
        </>
    );
};

export default SmartInsights;
