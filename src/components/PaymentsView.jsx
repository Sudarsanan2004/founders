import { useState, useMemo } from 'react';
import BentoCard from './BentoCard';
import Modal from './Modal';
import { usePayments, useProjects, useEmployees } from '../firebase/hooks';
import { addPayment, updatePayment, deletePayment } from '../firebase/actions';
import { useNotification } from '../context/NotificationContext';
import { Plus, Edit2, TrendingUp, TrendingDown, AlertTriangle, User, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

const PaymentsView = () => {
    const { notify } = useNotification();
    const { payments, loading: paymentsLoading } = usePayments();
    const { projects, loading: projectsLoading } = useProjects();
    const { employees, loading: employeesLoading } = useEmployees();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);

    // Re-added missing state
    const [preselectedProjectId, setPreselectedProjectId] = useState('');

    // Filters
    const [filterPeriod, setFilterPeriod] = useState('all');
    const [authorFilter, setAuthorFilter] = useState('all');

    // Over-budget state
    const [showBudgetWarning, setShowBudgetWarning] = useState(false);
    const [budgetExceededDetails, setBudgetExceededDetails] = useState(null);

    const [formData, setFormData] = useState({
        projectId: '',
        amount: '',
        type: 'developer-payout',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paidBy: 'Sudarsanan',
        reason: '',
        recipientId: ''
    });

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingPayment(null);
        setShowBudgetWarning(false);
        setBudgetExceededDetails(null);
        setPreselectedProjectId('');
        setFormData({
            projectId: '',
            amount: '',
            type: 'developer-payout',
            description: '',
            date: new Date().toISOString().split('T')[0],
            paidBy: 'Sudarsanan',
            reason: '',
            recipientId: ''
        });
    };

    const openAddModal = (projectId = '') => {
        // Reset state first
        setEditingPayment(null);
        setPreselectedProjectId(projectId);
        setShowBudgetWarning(false);

        setFormData(prev => ({
            projectId: projectId,
            amount: '',
            type: 'developer-payout',
            description: '',
            date: new Date().toISOString().split('T')[0],
            paidBy: 'Sudarsanan',
            reason: '',
            recipientId: ''
        }));

        setIsModalOpen(true);
    };

    const openEditModal = (payment) => {
        try {
            setEditingPayment(payment);
            setPreselectedProjectId(''); // Clear this so project selection might be disabled/enabled correctly logic

            let dateStr = new Date().toISOString().split('T')[0];
            if (payment.createdAt) {
                try {
                    const d = payment.createdAt.toDate ? payment.createdAt.toDate() : new Date(payment.createdAt);
                    if (d instanceof Date && !isNaN(d)) {
                        dateStr = d.toISOString().split('T')[0];
                    }
                } catch (e) {
                    console.error("Date parse error", e);
                }
            }

            setFormData({
                projectId: payment.projectId || '',
                amount: payment.amount || '',
                type: payment.type || 'developer-payout',
                description: payment.description || '',
                date: dateStr,
                paidBy: payment.paidBy || 'Sudarsanan',
                reason: payment.reason || '',
                recipientId: payment.recipientId || ''
            });
            setIsModalOpen(true);
        } catch (err) {
            console.error("Critical error opening edit modal", err);
            notify("Error opening edit form. Check console.", "error");
        }
    };

    const handleDelete = async (paymentId) => {
        if (confirm("Are you sure you want to delete this payment record?")) {
            if (confirm("Double Confirmation: This cannot be undone. Delete definitively?")) {
                try {
                    await deletePayment(paymentId);
                    notify('Payment deleted successfully', 'success');
                } catch (error) {
                    notify('Error deleting payment', 'error');
                }
            }
        }
    };

    const checkBudget = (payload) => {
        if (payload.type !== 'developer-payout') return { isOver: false };

        const project = projects.find(p => p.id === payload.projectId);
        if (!project) return { isOver: false };

        const existingPayments = payments.filter(p =>
            p.projectId === payload.projectId &&
            p.type === 'developer-payout' &&
            p.id !== (editingPayment ? editingPayment.id : 'new')
        );

        const totalPaidSoFar = existingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const newTotal = totalPaidSoFar + Number(payload.amount);
        const budget = Number(project.developerCost) || 0;

        if (newTotal > budget) {
            return {
                isOver: true,
                budget,
                totalPaidSoFar,
                newTotal,
                excess: newTotal - budget
            };
        }
        return { isOver: false };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            projectId: formData.projectId,
            amount: Number(formData.amount),
            type: formData.type,
            description: formData.description,
            date: formData.date,
            paidBy: formData.paidBy,
            reason: formData.reason,
            recipientId: formData.recipientId
        };

        if (!showBudgetWarning) {
            const check = checkBudget(payload);
            if (check.isOver) {
                setBudgetExceededDetails(check);
                setShowBudgetWarning(true);
                return;
            }
        }

        if (showBudgetWarning && !formData.reason.trim()) {
            alert("Please provide a reason for the extra payment.");
            return;
        }

        try {
            if (editingPayment) {
                await updatePayment(editingPayment.id, payload);
                notify('Payment updated successfully', 'success');
            } else {
                await addPayment(payload);
                notify('Payment recorded successfully', 'success');
            }
            handleClose();
        } catch (error) {
            notify('Error saving payment', 'error');
            console.error(error);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        try {
            const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            if (isNaN(d.getTime())) return '-';
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        } catch (e) {
            return '-';
        }
    };

    const availableDevelopers = useMemo(() => {
        return employees.filter(e => e.role !== 'Co-Founder');
    }, [employees]);

    const filteredPayments = useMemo(() => {
        let result = [...payments];
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        if (filterPeriod === 'this-week') {
            result = result.filter(p => {
                try {
                    const d = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
                    return d >= oneWeekAgo;
                } catch (e) { return false; }
            });
        }

        if (authorFilter !== 'all') {
            result = result.filter(p => p.paidBy === authorFilter);
        }

        return result;
    }, [payments, filterPeriod, authorFilter]);


    if (paymentsLoading || projectsLoading || employeesLoading) return <div className="text-muted">Loading...</div>;

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2 className="view-title">Project Payments</h2>
                    <p className="view-subtitle">Track payouts and balances</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={filterPeriod}
                            onChange={e => setFilterPeriod(e.target.value)}
                        >
                            <option value="all">All Time</option>
                            <option value="this-week">Past 7 Days</option>
                        </select>
                        <div className="filter-divider"></div>
                        <select
                            className="filter-select"
                            value={authorFilter}
                            onChange={e => setAuthorFilter(e.target.value)}
                        >
                            <option value="all">All Admins</option>
                            <option value="Sudarsanan">Sudarsanan</option>
                            <option value="Sherhan">Sherhan</option>
                        </select>
                    </div>

                    <button className="btn btn-primary" onClick={() => openAddModal()}>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        Record Payment
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2">
                {projects.map(project => {
                    const projectPayments = filteredPayments.filter(p => p.projectId === project.id);
                    const allProjectPayments = payments.filter(p => p.projectId === project.id);
                    const developerCost = project.developerCost || 0;
                    const totalPaidToDev = allProjectPayments
                        .filter(p => p.type === 'developer-payout')
                        .reduce((sum, p) => sum + (p.amount || 0), 0);

                    const balance = developerCost - totalPaidToDev;
                    const percentage = developerCost > 0 ? (totalPaidToDev / developerCost) * 100 : 0;

                    const sortedPayments = [...projectPayments].sort((a, b) => {
                        const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                        const db = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                        return db - da;
                    });

                    return (
                        <BentoCard key={project.id} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '4px' }}>
                                    {project.name}
                                </h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                                    <div>
                                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>Dev Cost</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{formatCurrency(developerCost)}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>Total Paid</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-orange)' }}>
                                            {formatCurrency(totalPaidToDev)}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>Balance</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: balance > 0 ? '#f87171' : '#4ade80' }}>
                                            {formatCurrency(balance)}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginTop: '12px' }}>
                                    <div className="progress-bar" style={{ height: '6px' }}>
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${Math.min(percentage, 100)}%`,
                                                background: percentage >= 100 ? '#4ade80' : undefined
                                            }}
                                        ></div>
                                    </div>
                                    {balance < 0 && (
                                        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                            <AlertTriangle size={12} />
                                            Budget Exceeded by {formatCurrency(Math.abs(balance))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                        History {filterPeriod === 'this-week' ? '(This Week)' : ''}
                                    </h4>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                        onClick={() => openAddModal(project.id)}
                                    >
                                        + Pay
                                    </button>
                                </div>

                                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {sortedPayments.length === 0 ? (
                                        <p className="text-muted" style={{ fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>No payments found</p>
                                    ) : (
                                        sortedPayments.map(p => (
                                            <div key={p.id} style={{
                                                background: 'var(--bg-secondary)',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                justifyContent: 'space-between',
                                                borderLeft: p.reason ? '2px solid #f87171' : 'none'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{
                                                            color: p.type === 'client-payment' ? '#4ade80' : 'var(--accent-orange)',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            {p.type === 'client-payment' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                        </span>
                                                        <div>
                                                            {p.type === 'developer-payout' && p.recipientId && (
                                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-primary)', marginBottom: '0px' }}>
                                                                    To: {employees.find(e => e.id === p.recipientId)?.name || 'Unknown'}
                                                                </p>
                                                            )}
                                                            <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>{p.description}</p>
                                                            <p className="text-muted" style={{ fontSize: '0.7rem', display: 'flex', gap: '6px' }}>
                                                                <span>{formatDate(p.createdAt)}</span>
                                                                <span>•</span>
                                                                <span style={{ color: p.paidBy === 'Sudarsanan' ? '#60a5fa' : '#c084fc' }}>{p.paidBy}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {p.reason && (
                                                        <div style={{
                                                            fontSize: '0.75rem', color: '#f87171',
                                                            background: 'rgba(248,113,113,0.1)', padding: '4px 8px', borderRadius: '4px',
                                                            marginLeft: '24px', fontStyle: 'italic'
                                                        }}>
                                                            Reason: {p.reason}
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                                        {formatCurrency(p.amount)}
                                                    </span>
                                                    <button className="icon-btn" onClick={() => openEditModal(p)}>
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button className="icon-btn delete-btn" onClick={() => handleDelete(p.id)}>
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </BentoCard>
                    );
                })}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingPayment ? "Edit Payment" : "Record Payment"}
            >
                <form onSubmit={handleSubmit}>
                    {showBudgetWarning && budgetExceededDetails && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '16px',
                            marginBottom: '20px', color: '#991b1b'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '8px' }}>
                                <AlertTriangle size={20} color="#dc2626" />
                                Budget Exceeded Warning
                            </div>
                            <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                                You are paying extra for this developer than the allocated cost.
                            </p>
                            <ul style={{ fontSize: '0.85rem', marginBottom: '12px', paddingLeft: '20px' }}>
                                <li>Allocated Budget: <b>{formatCurrency(budgetExceededDetails.budget)}</b></li>
                                <li>Paid So Far: <b>{formatCurrency(budgetExceededDetails.totalPaidSoFar)}</b></li>
                                <li>New Total: <b style={{ color: '#dc2626' }}>{formatCurrency(budgetExceededDetails.newTotal)}</b></li>
                                <li>Excess Amount: <b>{formatCurrency(budgetExceededDetails.excess)}</b></li>
                            </ul>

                            <div className="form-group">
                                <label className="form-label" style={{ color: '#991b1b' }}>Reason for Over-payment (Required)</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    style={{ width: '100%', border: '1px solid #f87171' }}
                                    placeholder="e.g. Client requested revisions"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowBudgetWarning(false)}
                                >
                                    Back to Edit
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ background: '#dc2626', borderColor: '#dc2626' }}
                                >
                                    Proceed Anyway
                                </button>
                            </div>
                        </div>
                    )}

                    {!showBudgetWarning && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Payment Type</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input
                                            type="radio"
                                            name="ptype"
                                            value="developer-payout"
                                            checked={formData.type === 'developer-payout'}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        />
                                        Developer Payout
                                    </label>
                                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input
                                            type="radio"
                                            name="ptype"
                                            value="client-payment"
                                            checked={formData.type === 'client-payment'}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        />
                                        Client Payment
                                    </label>
                                </div>
                            </div>

                            {formData.type === 'developer-payout' && (
                                <div className="form-group">
                                    <label className="form-label">Pay To (Developer)</label>
                                    <select
                                        value={formData.recipientId}
                                        onChange={e => setFormData({ ...formData, recipientId: e.target.value })}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="">Select Developer...</option>
                                        {availableDevelopers.map(dev => (
                                            <option key={dev.id} value={dev.id}>{dev.name} ({dev.role})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Payment Added By</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {['Sudarsanan', 'Sherhan'].map(name => (
                                        <label key={name}
                                            style={{
                                                flex: 1, padding: '8px', borderRadius: '6px',
                                                background: formData.paidBy === name ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                                                border: formData.paidBy === name ? '1px solid var(--accent-orange)' : '1px solid transparent',
                                                cursor: 'pointer', textAlign: 'center', fontSize: '0.875rem'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="paidBy"
                                                value={name}
                                                checked={formData.paidBy === name}
                                                onChange={e => setFormData({ ...formData, paidBy: e.target.value })}
                                                style={{ display: 'none' }}
                                            />
                                            {name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Project</label>
                                <select
                                    required
                                    value={formData.projectId}
                                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                    style={{ width: '100%' }}
                                    disabled={!!editingPayment && !preselectedProjectId}
                                >
                                    <option value="">Select Project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%' }}
                                    placeholder="e.g. Advance Payment"
                                />
                            </div>

                            {formData.reason && (
                                <div className="form-group">
                                    <label className="form-label" style={{ color: '#f87171' }}>Exceeded Budget Note</label>
                                    <input
                                        type="text"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingPayment ? "Update" : "Record"} Payment
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </Modal>
        </div>
    );
};

export default PaymentsView;
