import BentoCard from './BentoCard';
import { Activity, DollarSign, FolderPlus, UserPlus, FileText } from 'lucide-react';
import './ActivityLog.css';

const ActivityLog = ({ activities, loading = false }) => {
    const getIcon = (action) => {
        switch (action) {
            case 'payment_added':
                return <DollarSign size={16} />;
            case 'project_created':
                return <FolderPlus size={16} />;
            case 'employee_added':
                return <UserPlus size={16} />;
            case 'notice_updated':
                return <FileText size={16} />;
            default:
                return <Activity size={16} />;
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Just now';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <BentoCard>
                <div className="skeleton" style={{ height: '250px', width: '100%' }}></div>
            </BentoCard>
        );
    }

    return (
        <BentoCard>
            <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>
                    Recent Activity
                </h3>

                <div className="activity-list">
                    {activities.length === 0 ? (
                        <div className="empty-state">
                            <Activity size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                            <p className="text-muted">No recent activity</p>
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-icon">
                                    {getIcon(activity.action)}
                                </div>
                                <div className="activity-content">
                                    <p className="activity-description">{activity.description}</p>
                                    <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </BentoCard>
    );
};

export default ActivityLog;
