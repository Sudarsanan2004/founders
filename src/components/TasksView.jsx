import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Modal from './Modal';
import { useTasks } from '../firebase/hooks';
import { addTask, updateTask, deleteTask } from '../firebase/actions';
import { useNotification } from '../context/NotificationContext';
import { Plus, Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#f87171';
            case 'medium': return '#fbbf24';
            case 'low': return '#4ade80';
            default: return '#a0a0a0';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const isOverdue = (dueDate, status) => {
        if (!dueDate || status === 'Completed') return false;
        return new Date(dueDate) < new Date();
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="kanban-task-card"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', flex: 1, margin: 0 }}>
                    {task.title}
                </h4>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        className="icon-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                        }}
                        style={{ padding: '4px' }}
                    >
                        <Edit2 size={12} />
                    </button>
                    <button
                        className="icon-btn delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        style={{ padding: '4px' }}
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {task.description && (
                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '8px', lineHeight: '1.3' }}>
                    {task.description}
                </p>
            )}

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {task.priority && (
                    <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        background: `${getPriorityColor(task.priority)}20`,
                        color: getPriorityColor(task.priority),
                        textTransform: 'capitalize'
                    }}>
                        {task.priority}
                    </span>
                )}
            </div>

            {task.dueDate && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: isOverdue(task.dueDate, task.assignedTo) ? '#f87171' : 'var(--text-secondary)',
                    marginTop: '8px'
                }}>
                    <Calendar size={12} />
                    <span>{formatDate(task.dueDate)}</span>
                    {isOverdue(task.dueDate, task.assignedTo) && (
                        <AlertCircle size={12} style={{ color: '#f87171' }} />
                    )}
                </div>
            )}
        </div>
    );
};

const KanbanColumn = ({ title, tasks, onAddTask, onEditTask, onDeleteTask }) => {
    const taskIds = tasks.map(t => t.id);

    // Make the column droppable
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${title}`,
        data: {
            type: 'column',
            title: title
        }
    });

    const getColumnColor = (title) => {
        switch (title) {
            case 'Sudarsanan': return '#60a5fa';
            case 'Sherhan': return '#c084fc';
            case 'Completed': return '#4ade80';
            default: return '#a0a0a0';
        }
    };

    return (
        <div className="kanban-column">
            <div className="kanban-column-header" style={{ borderColor: getColumnColor(title) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{title}</h3>
                    <span style={{
                        background: 'var(--bg-secondary)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                    }}>
                        {tasks.length}
                    </span>
                </div>
                <button
                    className="icon-btn"
                    onClick={() => onAddTask(title)}
                    style={{ padding: '6px' }}
                >
                    <Plus size={16} />
                </button>
            </div>

            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className="kanban-column-content"
                    style={{
                        background: isOver ? 'rgba(230, 126, 80, 0.1)' : 'transparent',
                        transition: 'background 0.2s ease'
                    }}
                >
                    {tasks.length === 0 ? (
                        <p className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>
                            Drop tasks here
                        </p>
                    ) : (
                        tasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                            />
                        ))
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

const TasksView = () => {
    const { notify } = useNotification();
    const { tasks, loading } = useTasks();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [activeId, setActiveId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: 'Sudarsanan',
        priority: 'medium',
        dueDate: '',
        createdBy: 'Sudarsanan'
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            assignedTo: 'Sudarsanan',
            priority: 'medium',
            dueDate: '',
            createdBy: 'Sudarsanan'
        });
    };

    const openAddModal = (column) => {
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            assignedTo: column,
            priority: 'medium',
            dueDate: '',
            createdBy: 'Sudarsanan'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title || '',
            description: task.description || '',
            assignedTo: task.assignedTo || 'Sudarsanan',
            priority: task.priority || 'medium',
            dueDate: task.dueDate || '',
            createdBy: task.createdBy || 'Sudarsanan'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (taskId) => {
        if (confirm("Are you sure you want to delete this task?")) {
            try {
                await deleteTask(taskId);
                notify('Task deleted successfully', 'success');
            } catch (error) {
                notify('Error deleting task', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingTask) {
                await updateTask(editingTask.id, formData);
                notify('Task updated successfully', 'success');
            } else {
                await addTask(formData);
                notify('Task created successfully', 'success');
            }
            handleClose();
        } catch (error) {
            notify('Error saving task', 'error');
            console.error(error);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeTask = tasks.find(t => t.id === active.id);
        if (!activeTask) return;

        let newColumn = activeTask.assignedTo;

        // Check if dropped over a column (droppable zone)
        if (over.data?.current?.type === 'column') {
            newColumn = over.data.current.title;
        } else {
            // Check if dropped over a task
            const overTask = tasks.find(t => t.id === over.id);
            if (overTask) {
                newColumn = overTask.assignedTo;
            }
        }

        // Update if column changed
        if (newColumn !== activeTask.assignedTo) {
            try {
                await updateTask(activeTask.id, {
                    ...activeTask,
                    assignedTo: newColumn
                });
                notify(`Task moved to ${newColumn}`, 'success');
            } catch (error) {
                notify('Error moving task', 'error');
            }
        }
    };

    const getTasksByColumn = (column) => {
        return tasks.filter(t => t.assignedTo === column);
    };

    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

    if (loading) return <div className="text-muted">Loading...</div>;

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2 className="view-title">Tasks Board</h2>
                    <p className="view-subtitle">Drag and drop tasks between columns</p>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-board">
                    <KanbanColumn
                        title="Sudarsanan"
                        tasks={getTasksByColumn('Sudarsanan')}
                        onAddTask={openAddModal}
                        onEditTask={openEditModal}
                        onDeleteTask={handleDelete}
                    />
                    <KanbanColumn
                        title="Sherhan"
                        tasks={getTasksByColumn('Sherhan')}
                        onAddTask={openAddModal}
                        onEditTask={openEditModal}
                        onDeleteTask={handleDelete}
                    />
                    <KanbanColumn
                        title="Completed"
                        tasks={getTasksByColumn('Completed')}
                        onAddTask={openAddModal}
                        onEditTask={openEditModal}
                        onDeleteTask={handleDelete}
                    />
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="kanban-task-card" style={{ opacity: 0.9, cursor: 'grabbing' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
                                {activeTask.title}
                            </h4>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingTask ? "Edit Task" : "Add New Task"}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Task Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            style={{ width: '100%' }}
                            placeholder="Enter task title"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', minHeight: '80px' }}
                            placeholder="Add task details..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Assigned To</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['Sudarsanan', 'Sherhan', 'Completed'].map(column => (
                                <label key={column}
                                    style={{
                                        flex: 1, padding: '8px', borderRadius: '6px',
                                        background: formData.assignedTo === column ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                                        border: formData.assignedTo === column ? '1px solid var(--accent-orange)' : '1px solid transparent',
                                        cursor: 'pointer', textAlign: 'center', fontSize: '0.875rem'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="assignedTo"
                                        value={column}
                                        checked={formData.assignedTo === column}
                                        onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                                        style={{ display: 'none' }}
                                    />
                                    {column}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['low', 'medium', 'high'].map(priority => (
                                <label key={priority}
                                    style={{
                                        flex: 1, padding: '8px', borderRadius: '6px',
                                        background: formData.priority === priority ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                                        border: formData.priority === priority ? '1px solid var(--accent-orange)' : '1px solid transparent',
                                        cursor: 'pointer', textAlign: 'center', fontSize: '0.875rem',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={priority}
                                        checked={formData.priority === priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        style={{ display: 'none' }}
                                    />
                                    {priority}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Due Date</label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingTask ? "Update" : "Create"} Task
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TasksView;
