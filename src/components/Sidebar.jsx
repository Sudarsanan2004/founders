import { useState } from 'react';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    CreditCard,
    Bell,
    Activity,
    Contact,
    CheckSquare,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { signOutUser } from '../firebase/auth';
import mwuLogo from '../assets/mwu-nav-logo.png';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
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

    const { theme, toggleTheme } = useTheme();

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            const { error } = await signOutUser();
            if (error) {
                console.error("Logout failed:", error);
                alert("Logout failed: " + error);
            }
        }
    };

    return (
        <div className="sidebar">
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

            <div className="sidebar-footer">
                <button
                    className="nav-item"
                    onClick={toggleTheme}
                    style={{ marginBottom: '8px' }}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                    className="nav-item logout-item"
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
