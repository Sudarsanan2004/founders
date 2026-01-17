import { useState, useEffect } from 'react';
import BentoCard from './BentoCard';
import Modal from './Modal';
import { useProjects, useEmployees } from '../firebase/hooks';
import { addProject, updateProject, deleteProject, updateProjectStatus, updateProjectProgress } from '../firebase/actions';
import { useNotification } from '../context/NotificationContext';
import { Plus, Trash2, Edit2, Users, AlertCircle } from 'lucide-react';
import { formatCurrency, getProfitHealth, calculateMargin } from '../utils/calculations';
import ProjectSparkline from './Analytics/ProjectSparkline';

const ProjectsView = () => {
    const { notify } = useNotification();
    const { projects, loading: projectsLoading } = useProjects();
    const { employees, loading: employeesLoading } = useEmployees();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        totalCost: '',
        developerCost: '',
        status: 'active',
        assignedEmployees: [],
        isDirectProject: false // New field for projects handled only by founders
    });

    useEffect(() => {
        if (editingProject) {
            setFormData({
                name: editingProject.name,
                totalCost: editingProject.totalCost,
                developerCost: editingProject.developerCost,
                status: editingProject.status,
                assignedEmployees: editingProject.assignedEmployees || [],
                isDirectProject: editingProject.developerCost === 0 // Auto-detect based on cost
            });
        } else {
            setFormData({
                name: '',
                totalCost: '',
                developerCost: '',
                status: 'active',
                assignedEmployees: []
            });
        }
    }, [editingProject]);

    const toggleEmployeeAssignment = (employeeId) => {
        setFormData(prev => {
            const current = prev.assignedEmployees || [];
            if (current.includes(employeeId)) {
                return { ...prev, assignedEmployees: current.filter(id => id !== employeeId) };
            } else {
                return { ...prev, assignedEmployees: [...current, employeeId] };
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4ade80';
            case 'completed': return '#60a5fa';
            case 'on-hold': return '#f87171';
            default: return 'var(--text-muted)';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const projectData = {
                name: formData.name,
                totalCost: Number(formData.totalCost),
                developerCost: Number(formData.developerCost),
                status: formData.status,
                assignedEmployees: formData.assignedEmployees
            };

            if (editingProject) {
                await updateProject(editingProject.id, projectData);
                notify('Project updated successfully', 'success');
            } else {
                await addProject({
                    ...projectData,
                    paidAmount: 0 // Initialize paid amount for new projects
                });
                notify('Project created successfully', 'success');
            }
            handleClose();
        } catch (error) {
            notify('Error saving project', 'error');
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingProject(null);
    };

    const openEditModal = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    if (projectsLoading || employeesLoading) return <div className="text-muted">Loading...</div>;

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2 className="view-title">Projects</h2>
                    <p className="view-subtitle">Manage client projects and costs</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-3">
                {projects.map(project => {
                    const health = getProfitHealth(Number(project.totalCost), Number(project.developerCost));
                    const margin = calculateMargin(Number(project.totalCost), Number(project.developerCost));

                    return (
                        <BentoCard key={project.id}>
                            <div className="project-card-header">
                                <h3 className="project-title">{project.name}</h3>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={project.status}
                                        onChange={(e) => {
                                            updateProjectStatus(project.id, e.target.value)
                                                .then(() => notify('Status updated', 'success'))
                                                .catch(() => notify('Error updating status', 'error'));
                                        }}
                                        className="status-badge"
                                        style={{
                                            backgroundColor: `${getStatusColor(project.status)}20`,
                                            color: getStatusColor(project.status),
                                            border: 'none',
                                            cursor: 'pointer',
                                            appearance: 'none',
                                            paddingRight: '12px',
                                            textAlign: 'center',
                                            outline: 'none',
                                            fontWeight: '500',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        <option value="active">Active</option>
                                        <option value="on-hold">On Hold</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Manual Progress Slider */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Project Progress</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{project.progress || 0}%</span>
                                </div>
                                <input
                                    type="range"
                                    className="custom-range"
                                    min="0"
                                    max="100"
                                    value={project.progress || 0}
                                    onChange={(e) => {
                                        // Ideally debounce this, but for simplicity relying on direct update. 
                                        // Note: React state needs to handle this. Since 'projects' comes from Firestore hook, 
                                        // direct local mutation is laggy. We'll fire update onMouseUp to avoid write spam.
                                        // But for visual feedback we need local state or just use onMouseUp/onTouchEnd.
                                        // Let's use onMouseUp for the commit. onChange just to show (but wait, props are read-only-ish).
                                        // Actually, standard pattern without local state is to just fire update.
                                        // Let's implement a small inline debounced handler or just fire it. 
                                        updateProjectProgress(project.id, e.target.value);
                                    }}
                                    style={{
                                        background: `linear-gradient(to right, var(--accent-orange) 0%, var(--accent-orange) ${project.progress || 0}%, rgba(255,255,255,0.1) ${project.progress || 0}%, rgba(255,255,255,0.1) 100%)`
                                    }}
                                />
                            </div>

                            {/* Profit Health Badge */}
                            <div style={{ marginBottom: '16px' }}>
                                <span
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px',
                                        background: `${health.color}15`, color: health.color, border: `1px solid ${health.color}30`
                                    }}
                                >
                                    <AlertCircle size={10} />
                                    {health.status} ({margin.toFixed(0)}%)
                                </span>
                            </div>

                            <div className="project-stats" style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="stat-row">
                                    <span className="text-muted">Project Revenue</span>
                                    <span className="font-mono">{formatCurrency(project.totalCost)}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="text-muted">Dev Pay (Allocated)</span>
                                    <span className="font-mono" style={{ color: Number(project.developerCost) === 0 ? 'var(--text-muted)' : 'inherit' }}>
                                        {Number(project.developerCost) === 0 ? '₹0 (Direct)' : formatCurrency(project.developerCost)}
                                    </span>
                                </div>
                                <div className="stat-row" style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dotted rgba(255,255,255,0.05)' }}>
                                    <span className="text-muted">Admin Profit</span>
                                    <span className="font-mono" style={{ color: '#4ade80', fontWeight: '600' }}>
                                        {formatCurrency(Number(project.totalCost) - Number(project.developerCost))}
                                    </span>
                                </div>
                            </div>

                            {/* Finance Sparkline */}
                            <div className="mb-4">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Spending Trend</span>
                                </div>
                                <ProjectSparkline projectId={project.id} color={String(health.color)} />
                            </div>

                            {/* Assigned Employees Mini List */}
                            <div style={{ marginBottom: '20px' }}>
                                <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Users size={12} /> Assigned Team
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {project.assignedEmployees && project.assignedEmployees.length > 0 ? (
                                        project.assignedEmployees.map(empId => {
                                            const emp = employees.find(e => e.id === empId);
                                            if (!emp) return null;
                                            return (
                                                <span key={empId} style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                                                    {emp.name}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-muted" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>No team assigned</span>
                                    )}
                                </div>
                            </div>

                            <div className="project-actions">
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                    <button
                                        className="icon-btn"
                                        onClick={() => openEditModal(project)}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="icon-btn delete-btn"
                                        onClick={() => {
                                            if (confirm('Delete this project?')) {
                                                deleteProject(project.id)
                                                    .then(() => notify('Project deleted successfully', 'success'))
                                                    .catch(() => notify('Error deleting project', 'error'));
                                            }
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </BentoCard>
                    );
                })}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingProject ? "Edit Project" : "Create New Project"}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Project Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="form-group grid grid-cols-2" style={{ gap: '16px' }}>
                        <div>
                            <label className="form-label">Total Revenue (₹)</label>
                            <input
                                type="number"
                                required
                                value={formData.totalCost}
                                onChange={e => setFormData({ ...formData, totalCost: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label className="form-label">Dev Cost (₹)</label>
                            <input
                                type="number"
                                required={!formData.isDirectProject}
                                disabled={formData.isDirectProject}
                                value={formData.isDirectProject ? 0 : formData.developerCost}
                                onChange={e => setFormData({ ...formData, developerCost: e.target.value })}
                                style={{ width: '100%', opacity: formData.isDirectProject ? 0.5 : 1 }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <input
                                type="checkbox"
                                checked={formData.isDirectProject}
                                onChange={e => setFormData({
                                    ...formData,
                                    isDirectProject: e.target.checked,
                                    developerCost: e.target.checked ? 0 : (editingProject?.developerCost || '')
                                })}
                            />
                            <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Direct Project (No Developer Cost)</p>
                                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Full project value will be added to Admin Profit</p>
                            </div>
                        </label>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            <option value="active">Active</option>
                            <option value="on-hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Assigned Employees</label>
                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--bg-card-hover)', borderRadius: '8px', padding: '8px' }}>
                            {employees.length === 0 ? (
                                <p className="text-muted" style={{ fontSize: '0.8rem' }}>No employees found. Add employees first.</p>
                            ) : (
                                employees.map(emp => (
                                    <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.assignedEmployees.includes(emp.id)}
                                            onChange={() => toggleEmployeeAssignment(emp.id)}
                                        />
                                        <span style={{ fontSize: '0.9rem' }}>{emp.name} <span className="text-muted">({emp.role})</span></span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingProject ? "Update" : "Create"} Project
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProjectsView;
