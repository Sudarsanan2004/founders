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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      }, 800);
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
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                background: '#0a0a0a',
                zIndex: -1,
                willChange: 'opacity'
              }}
            />

            {/* Logo Layer - Morphs to Dashboard */}
            {/* Only exit if NOT going to dashboard (e.g. login) */}
            <motion.img
              layoutId="brand-logo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={isDashboard ? undefined : { opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
              transition={{ type: "spring", stiffness: 70, damping: 18 }}
              src="/assets/logo.png"
              alt="Loading..."
              style={{ width: '100px', height: 'auto', zIndex: 10, willChange: 'transform' }}
            />
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
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} />
            <div className="main-content" style={{
              marginLeft: isSidebarOpen ? '260px' : '0',
              transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              width: isSidebarOpen ? 'calc(100% - 260px)' : '100%'
            }}>
              <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
              <div style={{ padding: '10px 32px 32px 32px' }}>
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
