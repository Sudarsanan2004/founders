import {
    LayoutDashboard,
    FolderKanban,
    Users,
    CreditCard,
    Bell,
    Activity,
    Contact,
    CheckSquare
} from 'lucide-react';
import mwuLogo from '../assets/mwu-nav-logo.png';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, isOpen }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'clients', label: 'Clients', icon: Contact },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'notices', label: 'Notices', icon: Bell },
        { id: 'activity', label: 'Activity Log', icon: Activity },
    ];

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <img
                    src={mwuLogo}
                    alt="MakeWithUs"
                    className="sidebar-logo-img"
                />
                <p className="sidebar-tagline">Founders Dashboard</p>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;
