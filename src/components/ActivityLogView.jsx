import { useActivityLog } from '../firebase/hooks';
import BentoCard from './BentoCard';
import { Activity, DollarSign, FolderPlus, UserPlus, FileText, Calendar } from 'lucide-react';

const ActivityLogView = () => {
    // We use the same hook but maybe we'd want to fetch MORE than 5 here if we had a better hook.
    // For now we'll stick to the existing hook but list them in a full page view.
    const { activities, loading } = useActivityLog();

    const getIcon = (action) => {
        switch (action) {
            case 'payment_added': return <DollarSign size={20} />;
            case 'project_created': return <FolderPlus size={20} />;
            case 'project_updated': return <FolderPlus size={20} />;
            case 'employee_added': return <UserPlus size={20} />;
            case 'notice_updated': return <FileText size={20} />;
            default: return <Activity size={20} />;
        }
    };

    if (loading) return <div className="text-muted">Loading activity log...</div>;

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2 className="view-title">Activity Log</h2>
                    <p className="view-subtitle">System-wide audit trail</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activities.map(activity => (
                    <BentoCard key={activity.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
                        <div style={{
                            width: '48px', height: '48px',
                            borderRadius: '50%', background: 'var(--bg-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, color: 'var(--text-secondary)'
                        }}>
                            {getIcon(activity.action)}
                        </div>

                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                {activity.description}
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span className="status-badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                                    {activity.action.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <div className="text-muted" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} />
                            {activity.timestamp ? new Date(activity.timestamp.toDate ? activity.timestamp.toDate() : activity.timestamp).toLocaleString() : 'Date N/A'}
                        </div>
                    </BentoCard>
                ))}
            </div>
        </div>
    );
};

export default ActivityLogView;
