import { useState, useEffect } from 'react';
import BentoCard from './BentoCard';
import Modal from './Modal';
import { useEmployees } from '../firebase/hooks';
import { addEmployee, deleteEmployee, updateEmployee } from '../firebase/actions';
import { useNotification } from '../context/NotificationContext';
import { Plus, Trash2, User, Briefcase, Edit2 } from 'lucide-react';

const EmployeesView = () => {
    const { notify } = useNotification();
    const { employees, loading } = useEmployees();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: 'Co-Founder'
    });

    const roles = [
        "Co-Founder",
        "Backend Developer",
        "Security Engineer"
    ];

    useEffect(() => {
        if (editingEmployee) {
            setFormData({
                name: editingEmployee.name,
                role: editingEmployee.role
            });
        } else {
            setFormData({ name: '', role: 'Co-Founder' });
        }
    }, [editingEmployee]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEmployee) {
                await updateEmployee(editingEmployee.id, formData);
                notify('Employee updated successfully', 'success');
            } else {
                await addEmployee(formData);
                notify('Employee added successfully', 'success');
            }
            setIsModalOpen(false);
            setEditingEmployee(null);
            setFormData({ name: '', role: 'Co-Founder' });
        } catch (error) {
            notify('Error saving employee', 'error');
        }
    };

    const openEditModal = (employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
    };

    if (loading) return <div className="text-muted">Loading employees...</div>;

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2 className="view-title">Employees</h2>
                    <p className="view-subtitle">Manage team members</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    Add Employee
                </button>
            </div>

            <div className="grid grid-cols-4">
                {employees.map(employee => (
                    <BentoCard key={employee.id}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '48px', height: '48px',
                                    borderRadius: '50%', background: 'var(--bg-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '16px', color: 'var(--accent-orange)'
                                }}>
                                    <User size={24} />
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        className="icon-btn"
                                        onClick={() => openEditModal(employee)}
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        className="icon-btn delete-btn"
                                        onClick={() => {
                                            if (confirm('Remove this employee?')) {
                                                deleteEmployee(employee.id)
                                                    .then(() => notify('Employee removed successfully', 'success'))
                                                    .catch(() => notify('Error removing employee', 'error'));
                                            }
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '4px' }}>
                                {employee.name}
                            </h3>
                            <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                                <Briefcase size={14} />
                                {employee.role}
                            </p>
                        </div>
                    </BentoCard>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingEmployee ? "Edit Employee" : "Add New Employee"}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%' }}
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select
                            required
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingEmployee ? "Update" : "Add"} Employee
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default EmployeesView;
