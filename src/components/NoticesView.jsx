import { useState, useEffect } from 'react';
import BentoCard from './BentoCard';
import Modal from './Modal';
import { useNotices } from '../firebase/hooks';
import { addNotice, deleteNotice, updateNotice } from '../firebase/actions';
import { useNotification } from '../context/NotificationContext';
import { Plus, Trash2, Edit2, Megaphone } from 'lucide-react';

const NoticesView = () => {
    const { notify } = useNotification();
    const { notices, loading } = useNotices();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [noticeText, setNoticeText] = useState('');

    useEffect(() => {
        if (editingNotice) {
            setNoticeText(editingNotice.text);
        } else {
            setNoticeText('');
        }
    }, [editingNotice]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNotice) {
                await updateNotice(editingNotice.id, noticeText);
                notify('Notice updated successfully', 'success');
            } else {
                await addNotice(noticeText);
                notify('Notice posted successfully', 'success');
            }
            handleClose();
        } catch (error) {
            notify('Error saving notice', 'error');
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingNotice(null);
        setNoticeText('');
    };

    const openEditModal = (notice) => {
        setEditingNotice(notice);
        setIsModalOpen(true);
    };

    if (loading) return <div className="text-muted">Loading notices...</div>;

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2 className="view-title">Notices & Announcements</h2>
                    <p className="view-subtitle">Broadcast messages to the team</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    Post Notice
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {notices.map(notice => (
                    <BentoCard key={notice.id} className="notice-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '48px', height: '48px',
                            borderRadius: '12px', background: 'var(--accent-orange-soft)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, color: 'var(--accent-orange)'
                        }}>
                            <Megaphone size={24} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                {notice.text}
                            </p>
                            <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Posted on {notice.createdAt ? new Date(notice.createdAt.toDate ? notice.createdAt.toDate() : notice.createdAt).toLocaleDateString() : 'Just now'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="icon-btn"
                                onClick={() => openEditModal(notice)}
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                className="icon-btn delete-btn"
                                onClick={() => {
                                    if (confirm('Delete this notice?')) {
                                        deleteNotice(notice.id)
                                            .then(() => notify('Notice deleted successfully', 'success'))
                                            .catch(() => notify('Error deleting notice', 'error'));
                                    }
                                }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </BentoCard>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingNotice ? "Edit Notice" : "Post New Notice"}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Notice Message</label>
                        <textarea
                            required
                            rows={4}
                            value={noticeText}
                            onChange={e => setNoticeText(e.target.value)}
                            style={{ width: '100%', resize: 'none' }}
                            placeholder="e.g. Server maintenance scheduled for tonight..."
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingNotice ? "Update" : "Post"} Notice
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default NoticesView;
