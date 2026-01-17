import { useState } from 'react';
import { useClients, useProjects } from '../firebase/hooks';
import { addClient, updateClient, deleteClient } from '../firebase/actions';
import { useNotification } from '../context/NotificationContext';
import Modal from './Modal';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Phone,
    Briefcase,
    X,
    Save
} from 'lucide-react';

// Extracted ClientCard Component
import BentoCard from './BentoCard';

// Extracted ClientCard Component
const ClientCard = ({ client, projectName, onEdit, onDelete }) => (
    <BentoCard>
        <div className="client-card">
            <div className="client-card-header">
                <div className="client-icon-wrapper">
                    <Users size={20} />
                </div>
                <div className="client-actions">
                    <button className="icon-btn" onClick={() => onEdit(client)}>
                        <Edit2 size={16} />
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => onDelete(client.id)}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <h3 className="client-name">{client.name}</h3>

            <div className="client-info">
                <div className="info-row">
                    <Briefcase size={14} className="info-icon" />
                    <span>{projectName}</span>
                </div>
                <div className="info-row">
                    <Phone size={14} className="info-icon" />
                    <span>{client.phone}</span>
                </div>
            </div>
        </div>
    </BentoCard>
);

const ClientsView = () => {
    const { notify } = useNotification();
    const { clients, loading: clientsLoading } = useClients();
    const { projects, loading: projectsLoading } = useProjects();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        projectId: '',
        phone: ''
    });

    // Helper to safe get project name
    const getProjectName = (pid) => {
        if (!projects) return 'Unknown Project';
        const p = projects.find(prj => prj.id === pid);
        return p ? p.name : 'Unknown Project';
    };

    // Filter clients based on search
    const filteredClients = (clients || []).filter(client =>
        (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone || '').includes(searchTerm)
    );

    const openAddModal = () => {
        setEditingClient(null);
        setFormData({ name: '', projectId: '', phone: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (client) => {
        setEditingClient(client);
        setFormData({
            name: client.name || '',
            projectId: client.projectId || '',
            phone: client.phone || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClient) {
                await updateClient(editingClient.id, formData);
                notify('Client updated successfully', 'success');
            } else {
                await addClient(formData);
                notify('New client added successfully', 'success');
            }
            setIsModalOpen(false);
        } catch (error) {
            notify('Error saving client', 'error');
            console.error(error);
        }
    };

    const handleDelete = async (clientId) => {
        if (confirm("Are you sure you want to delete this client?")) {
            if (confirm("This cannot be undone. Delete definitively?")) {
                try {
                    await deleteClient(clientId);
                    notify('Client deleted successfully', 'success');
                } catch (error) {
                    notify('Error deleting client', 'error');
                }
            }
        }
    };

    if (clientsLoading || projectsLoading) {
        return <div className="p-8 text-center text-white/50 animate-pulse">Loading clients...</div>;
    }

    return (
        <div className="view-container h-full flex flex-col">
            <div className="view-header mb-6 flex justify-between items-center">
                <div>
                    <h2 className="view-title text-white">Clients</h2>
                    <p className="view-subtitle text-white/60">Manage client details and contacts</p>
                </div>
                <button onClick={openAddModal} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    <span>Add Client</span>
                </button>
            </div>

            <div className="search-container">
                <Search className="search-icon" size={20} />
                <input
                    type="text"
                    placeholder="Search clients..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="bento-grid">
                    {filteredClients.map(client => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            projectName={getProjectName(client.projectId)}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        />
                    ))}
                    {filteredClients.length === 0 && (
                        <div className="col-span-full text-center py-20 opacity-50 text-white">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No clients found</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingClient ? 'Edit Client' : 'Add New Client'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-label block mb-2">Client Name / Brand</label>
                        <input
                            required
                            type="text"
                            className="w-full"
                            placeholder="e.g. Acme Innovations"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-label block mb-2">Primary Project</label>
                        <select
                            required
                            className="w-full"
                            value={formData.projectId}
                            onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                        >
                            <option value="">Select Associated Project</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-label block mb-2">Phone Number</label>
                        <input
                            required
                            type="tel"
                            className="w-full"
                            placeholder="e.g. +91 98765 43210"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            {editingClient ? 'Update Client' : 'Add Client'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ClientsView;
