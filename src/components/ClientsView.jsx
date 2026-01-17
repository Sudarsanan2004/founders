import { useState } from 'react';
import { useClients, useProjects } from '../firebase/hooks';
import { addClient, updateClient, deleteClient } from '../firebase/actions';
import { useNotification } from '../context/NotificationContext';
import Modal from './Modal';
import ClientMap from './ClientMap';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Phone,
    Briefcase,
    X,
    Save,
    MapPin,
    Loader2
} from 'lucide-react';

// Extracted ClientCard Component
import BentoCard from './BentoCard';

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
                {client.city && (
                    <div className="info-row">
                        <MapPin size={14} className="info-icon" />
                        <span>{client.city}, {client.country}</span>
                    </div>
                )}
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
    const [isGeocoding, setIsGeocoding] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        projectId: '',
        phone: '',
        city: '',
        country: '',
        lat: '',
        lng: ''
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
        (client.phone || '').includes(searchTerm) ||
        (client.city || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openAddModal = () => {
        setEditingClient(null);
        setFormData({ name: '', projectId: '', phone: '', city: '', country: '', lat: '', lng: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (client) => {
        setEditingClient(client);
        setFormData({
            name: client.name || '',
            projectId: client.projectId || '',
            phone: client.phone || '',
            city: client.city || '',
            country: client.country || '',
            lat: client.lat || '',
            lng: client.lng || ''
        });
        setIsModalOpen(true);
    };

    const fetchCoordinates = async (city, state, country) => {
        if (!city && !state) return null;
        setIsGeocoding(true);
        try {
            // Construct query with available parts
            const parts = [city, state, country].filter(Boolean);
            const query = parts.join(',');

            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                return { lat: data[0].lat, lng: data[0].lon };
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        } finally {
            setIsGeocoding(false);
        }
        return null;
    };

    const handleCityBlur = async () => {
        // Trigger if city OR state is present and coords are missing
        if ((formData.city || formData.state) && !formData.lat) {
            const coords = await fetchCoordinates(formData.city, formData.state, formData.country);
            if (coords) {
                setFormData(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }));
                notify(`Found location: ${[formData.city, formData.state].filter(Boolean).join(', ')}`, 'success');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure coords if missing
            let dataToSave = { ...formData };
            if ((!dataToSave.lat || !dataToSave.lng) && dataToSave.city) {
                const coords = await fetchCoordinates(dataToSave.city, dataToSave.country);
                if (coords) {
                    dataToSave.lat = coords.lat;
                    dataToSave.lng = coords.lng;
                }
            }

            if (editingClient) {
                await updateClient(editingClient.id, dataToSave);
                notify('Client updated successfully', 'success');
            } else {
                await addClient(dataToSave);
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
        return <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Loading clients...</div>;
    }

    return (
        <div className="view-container h-full flex flex-col">
            <div className="view-header mb-6 flex justify-between items-center">
                <div>
                    <h2 className="view-title">Clients</h2>
                    <p className="view-subtitle">Manage client details and global presence</p>
                </div>
                <button onClick={openAddModal} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    <span>Add Client</span>
                </button>
            </div>

            {/* Client Map Section - Neat & Small */}
            <div className="mb-6 w-full h-[300px] flex justify-center overflow-hidden relative">
                <div className="absolute top-3 left-4 z-10">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-[var(--text-secondary)]">
                        <MapPin size={14} className="text-accent-orange" /> Client Spotting
                    </h3>
                </div>
                <ClientMap clients={filteredClients} width={null} height={null} />
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
                        <div className="col-span-full text-center py-20 text-[var(--text-muted)]">
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

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-label block mb-2">City</label>
                            <input
                                type="text"
                                className="w-full"
                                placeholder="e.g. Cochin"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                onBlur={handleCityBlur}
                            />
                        </div>
                        <div>
                            <label className="text-label block mb-2">State</label>
                            <input
                                type="text"
                                className="w-full"
                                placeholder="e.g. Kerala"
                                value={formData.state}
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                                onBlur={handleCityBlur}
                            />
                        </div>
                        <div>
                            <label className="text-label block mb-2">Country</label>
                            <input
                                type="text"
                                className="w-full"
                                placeholder="e.g. India"
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                                onBlur={handleCityBlur}
                            />
                        </div>
                    </div>
                    {isGeocoding && <p className="text-xs text-accent-orange flex items-center gap-2"><Loader2 className="animate-spin" size={12} /> Fetching location coordinates...</p>}

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
                            disabled={isGeocoding}
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
