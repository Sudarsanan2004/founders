import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { NotificationProvider } from './context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectsView from './components/ProjectsView';
import EmployeesView from './components/EmployeesView';
import NoticesView from './components/NoticesView';
import PaymentsView from './components/PaymentsView';
import ClientsView from './components/ClientsView';
import ActivityLogView from './components/ActivityLogView';
import TasksView from './components/TasksView';
import BonusesView from './components/BonusesView';
import Login from './components/Login';
import './App.css';
import './components/Views.css';

import Header from './components/Header';

function App() {
  // Initialize activeTab from localStorage or default to 'dashboard'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'dashboard';
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  // Determine if we are on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024; // Increased breakpoint for "zoomed out" mobile views
      setIsMobile(mobile);
      // Auto-close sidebar when switching to mobile, or auto-open on desktop if desired
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Add a small delay for smooth transition even if auth is fast
      setTimeout(() => {
        setUser(currentUser);
        setLoading(false);
      }, 300);
    });
    return () => unsubscribe();
  }, []);

  // Helper to determine if we should run the "Hero" transition
  const isDashboard = activeTab === 'dashboard';

  return (
    <NotificationProvider>
      {/* Remove mode="wait" to allow overlap for shared layout animations */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="app-loader-container"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none', // Allow clicks to pass through once background fades
            }}
          >
            {/* Background Layer - Fades out independently */}
            <motion.div
              key="loader-bg"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                background: '#0a0a0a',
                zIndex: -1,
                willChange: 'opacity'
              }}
            />

            {/* Logo Layer - Morphs to Dashboard */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20, /* Increased Z to be above */
                pointerEvents: 'none'
              }}
              // Remove exit fade if morphing. Only fade out if NOT dashboard (unlikely in this flow, but safe)
              exit={isDashboard ? undefined : { opacity: 0 }}
            >
              <motion.img
                layoutId="brand-logo"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                // Crucial: No exit animation when isDashboard is true. 
                // Let Framer Motion handle the layoutId morph seamlessly.
                exit={isDashboard ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                  mass: 1
                }}
                src="/assets/logo.png"
                alt="Loading..."
                style={{ width: '100px', height: 'auto' }}
              />
            </motion.div>
          </motion.div>
        )}


        {/* Main Content Rendered Behind */}
        {!loading && !user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Login />
          </motion.div>
        ) : !loading && user ? (
          <motion.div
            key="main-app"
            className="app"
          >
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />

            {/* Mobile Backdrop */}
            {isMobile && isSidebarOpen && (
              <div
                className="sidebar-backdrop"
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  zIndex: 95,
                  backdropFilter: 'blur(4px)'
                }}
              />
            )}

            <div className="main-content" style={{
              /* Flexbox handles the layout now given the sticky sidebar */
              width: '100%',
              transition: 'background 0.3s',
            }}>
              <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isMobile={isMobile} />
              <div style={{ padding: isMobile ? '10px 16px 32px 16px' : '10px 32px 32px 32px' }}>
                <AnimatePresence mode="wait">
                  {activeTab === 'dashboard' && (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <Dashboard />
                    </motion.div>
                  )}
                  {activeTab === 'projects' && (
                    <motion.div
                      key="projects"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ProjectsView />
                    </motion.div>
                  )}
                  {activeTab === 'employees' && (
                    <motion.div
                      key="employees"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <EmployeesView />
                    </motion.div>
                  )}
                  {activeTab === 'clients' && (
                    <motion.div
                      key="clients"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ClientsView />
                    </motion.div>
                  )}
                  {activeTab === 'notices' && (
                    <motion.div
                      key="notices"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <NoticesView />
                    </motion.div>
                  )}
                  {activeTab === 'payments' && (
                    <motion.div
                      key="payments"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <PaymentsView />
                    </motion.div>
                  )}
                  {activeTab === 'tasks' && (
                    <motion.div
                      key="tasks"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <TasksView />
                    </motion.div>
                  )}
                  {activeTab === 'bonuses' && (
                    <motion.div
                      key="bonuses"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <BonusesView />
                    </motion.div>
                  )}
                  {activeTab === 'activity' && (
                    <motion.div
                      key="activity"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ActivityLogView />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </NotificationProvider >
  );
}

export default App;
