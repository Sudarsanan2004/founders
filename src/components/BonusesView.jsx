import { useState } from 'react';
import BentoCard from './BentoCard';
import Modal from './Modal';
import { useBonuses, useEmployees } from '../firebase/hooks';
import { addBonus, deleteBonus } from '../firebase/actions';
import { useNotification } from '../context/NotificationContext';
import { Plus, Trash2, Gift } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

const BonusesView = () => {
    const { notify } = useNotification();
    const { bonuses, loading: bonusesLoading } = useBonuses();
    const { employees, loading: employeesLoading } = useEmployees();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        employeeId: '',
        employeeName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    const handleClose = () => {
        setIsModalOpen(false);
        setFormData({
            employeeId: '',
            employeeName: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            note: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Find employee name if not set (though we set it on change)
            const emp = employees.find(e => e.id === formData.employeeId);
            const dataToSave = {
                ...formData,
                employeeName: emp ? emp.name : 'Unknown',
                amount: Number(formData.amount)
            };

            await addBonus(dataToSave);
            notify('Bonus added successfully', 'success');
            handleClose();
        } catch (error) {
            notify('Error adding bonus', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this bonus record?')) {
            try {
                await deleteBonus(id);
                notify('Bonus deleted successfully', 'success');
            } catch (error) {
                notify('Error deleting bonus', 'error');
            }
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        try {
            const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            if (isNaN(d.getTime())) return '-';
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return '-';
        }
    };

    if (bonusesLoading || employeesLoading) return <div className="text-muted">Loading...</div>;

    const totalBonuses = bonuses.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2 className="view-title">Employee Bonuses</h2>
                    <p className="view-subtitle">Track bonuses and extra payouts</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right', marginRight: '16px' }}>
                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>Total Bonuses Paid</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-orange)' }}>
                            {formatCurrency(totalBonuses)}
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} />
                        Record Bonus
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {bonuses.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                            width: '80px', height: '80px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <Gift size={40} className="text-muted" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>No Bonuses Recorded</h3>
                        <p style={{ fontSize: '0.9rem', marginBottom: '24px' }}>Start recognizing your team's hard work.</p>
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                            Record First Bonus
                        </button>
                    </div>
                ) : (
                    bonuses.map(bonus => (
                        <div key={bonus.id} style={{
                            position: 'relative',
                            background: '#161616', // Slightly lighter than standard background
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            minHeight: '220px', // Ensure consistent height
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            overflow: 'hidden'
                        }}>
                            {/* Gradient Background Decoration */}
                            <div style={{
                                position: 'absolute',
                                top: 0, right: 0,
                                width: '120px', height: '120px',
                                background: 'radial-gradient(circle, rgba(251, 146, 60, 0.08) 0%, transparent 70%)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)',
                                pointerEvents: 'none'
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(251, 146, 60, 0.02))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid rgba(251, 146, 60, 0.2)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                    }}>
                                        <Gift size={20} color="var(--accent-orange)" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Paid To</p>
                                        <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{bonus.employeeName}</p>
                                    </div>
                                </div>
                                <button
                                    className="icon-btn delete-btn"
                                    onClick={() => handleDelete(bonus.id)}
                                    title="Delete Bonus"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        width: '28px', height: '28px'
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Main Amount Area */}
                            <div style={{ marginBottom: 'auto', padding: '10px 0' }}>
                                <p style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: '1', display: 'flex', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '1.2rem', marginTop: '6px', color: 'var(--text-muted)', marginRight: '4px', fontWeight: '500' }}>₹</span>
                                    {Number(bonus.amount).toLocaleString('en-IN')}
                                </p>
                            </div>

                            {/* Footer / Meta */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px dashed rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-orange)' }}></div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{formatDate(bonus.createdAt)}</span>
                                </div>

                                <p style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)',
                                    fontStyle: bonus.note ? 'normal' : 'italic',
                                    maxWidth: '120px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textAlign: 'right'
                                }}>
                                    {bonus.note || "No note"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title="Record Employee Bonus"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Employee</label>
                        <select
                            required
                            value={formData.employeeId}
                            onChange={e => {
                                const emp = employees.find(emp => emp.id === e.target.value);
                                setFormData({
                                    ...formData,
                                    employeeId: e.target.value,
                                    employeeName: emp ? emp.name : ''
                                });
                            }}
                            style={{ width: '100%' }}
                        >
                            <option value="">Select Employee</option>
                            {employees.filter(e => e.role !== 'Co-Founder').map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bonus Amount (₹)</label>
                        <input
                            type="number"
                            required
                            min="1"
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
                        <label className="form-label">Note / Reason</label>
                        <input
                            type="text"
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                            style={{ width: '100%' }}
                            placeholder="e.g. Diwali Bonus, Performance Bonus"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Record Bonus
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default BonusesView;
