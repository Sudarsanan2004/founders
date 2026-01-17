import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const notify = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, [removeNotification]);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 p-4 pointer-events-none">
                <AnimatePresence>
                    {notifications.map(n => (
                        <Toast key={n.id} notification={n} onDismiss={() => removeNotification(n.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

const Toast = ({ notification, onDismiss }) => {
    const icons = {
        success: <CheckCircle className="text-green-400" size={20} />,
        error: <XCircle className="text-red-400" size={20} />,
        info: <Info className="text-blue-400" size={20} />,
        warning: <AlertTriangle className="text-yellow-400" size={20} />
    };

    const bgColors = {
        success: 'bg-[#1a1a1a] border-green-500/30',
        error: 'bg-[#1a1a1a] border-red-500/30',
        info: 'bg-[#1a1a1a] border-blue-500/30',
        warning: 'bg-[#1a1a1a] border-yellow-500/30'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            layout
            className={`pointer-events-auto min-w-[300px] p-4 rounded-xl border shadow-2xl flex items-start gap-3 backdrop-blur-md ${bgColors[notification.type]}`}
        >
            <div className="mt-0.5 shrink-0">{icons[notification.type]}</div>
            <div className="flex-1">
                <p className="text-sm font-medium text-white">{notification.message}</p>
            </div>
            <button onClick={onDismiss} className="text-white/40 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </motion.div>
    );
};
