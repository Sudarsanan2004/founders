import { useTasks } from '../firebase/hooks';
import { User, Clock } from 'lucide-react';
import './TaskMarquee.css';

const TaskMarquee = () => {
    const { tasks, loading } = useTasks();

    // Get pending tasks (not completed)
    const pendingTasks = tasks.filter(t => t.assignedTo !== 'Completed');

    if (loading || pendingTasks.length === 0) return null;

    const getAssigneeColor = (assignee) => {
        switch (assignee) {
            case 'Sudarsanan': return '#60a5fa';
            case 'Sherhan': return '#c084fc';
            default: return '#a0a0a0';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    };

    return (
        <div className="task-marquee-container">
            <div className="task-marquee-header">
                <Clock size={16} />
                <span>Pending Tasks</span>
            </div>
            <div className="task-marquee-track">
                <div className="task-marquee-content">
                    {/* Duplicate for seamless loop */}
                    {[...pendingTasks, ...pendingTasks].map((task, index) => (
                        <div key={`${task.id}-${index}`} className="task-marquee-item">
                            <span className="task-priority">{getPriorityIcon(task.priority)}</span>
                            <span className="task-title">{task.title}</span>
                            <span className="task-separator">→</span>
                            <div className="task-assignee" style={{ color: getAssigneeColor(task.assignedTo) }}>
                                <User size={12} />
                                <span>{task.assignedTo}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskMarquee;
