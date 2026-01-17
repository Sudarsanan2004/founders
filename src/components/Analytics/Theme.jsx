
export const ANALYTICS_THEME = {
    colors: {
        primary: '#e67e50', // Accent Orange
        secondary: '#f59e6c', // Light Orange
        tertiary: '#ffffff', // White (for contrast)
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
        text: 'var(--text-secondary)',
        grid: 'var(--border-color)',
        tooltipBg: '#1a1a1a',
        tooltipBorder: 'rgba(230, 126, 80, 0.3)' // Orange glow border
    },
    chartDefaults: {
        strokeWidth: 3,
        dotRadius: 4,
        activeDotRadius: 6,
        fillOpacity: 0.1,
        animationDuration: 1500
    }
};

export const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: ANALYTICS_THEME.colors.tooltipBg,
                border: `1px solid ${ANALYTICS_THEME.colors.tooltipBorder}`,
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
            }}>
                <p style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '500' }}>{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
                        <span style={{ color: ANALYTICS_THEME.colors.text, fontSize: '0.75rem' }}>
                            {entry.name}:
                        </span>
                        <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>
                            {entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};
