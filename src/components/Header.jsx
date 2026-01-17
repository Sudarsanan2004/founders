import { ChevronRight, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { signOutUser } from '../firebase/auth';

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
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
        <header style={{
            display: 'flex',
            justifyContent: 'space-between', // Changed to space-between to accommodate left toggle and right controls
            alignItems: 'center',
            padding: '16px 32px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            background: 'var(--bg-primary)', // Match background to avoid transparency issues or use transparent if blur desired
            backdropFilter: 'blur(8px)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-button)',
                        transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <ChevronRight
                        size={24}
                        style={{
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isSidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                    />
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-button)',
                        transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444', // Red for logout
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-button)',
                        transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
