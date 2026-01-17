import { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import BentoCard from './BentoCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, trend, prefix = '₹', loading = false }) => {
    const ref = useRef(null);
    const springValue = useSpring(0, { duration: 1000 });
    const display = useTransform(springValue, (latest) => {
        return prefix + Math.floor(latest).toLocaleString('en-IN');
    });

    useEffect(() => {
        if (!loading && value) {
            springValue.set(value);
        }
    }, [value, loading, springValue]);

    if (loading) {
        return (
            <BentoCard>
                <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ height: '40px', width: '80%' }}></div>
            </BentoCard>
        );
    }

    return (
        <BentoCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', height: '100%' }}>
                <p className="text-label" style={{ marginBottom: '4px' }}>{title}</p>
                <motion.p
                    ref={ref}
                    className="text-big accent-text"
                    style={{ fontSize: '2rem', lineHeight: '1', marginBottom: '0' }}
                >
                    {display}
                </motion.p>
                {trend !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                        {trend >= 0 ? (
                            <TrendingUp size={16} style={{ color: '#4ade80' }} />
                        ) : (
                            <TrendingDown size={16} style={{ color: '#f87171' }} />
                        )}
                        <span
                            className="text-muted"
                            style={{
                                fontSize: '0.75rem',
                                color: trend >= 0 ? '#4ade80' : '#f87171'
                            }}
                        >
                            {Math.abs(trend).toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>
        </BentoCard>
    );
};

export default StatCard;
