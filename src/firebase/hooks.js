import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// Hook to get real-time projects
export const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProjects(projectsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching projects:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { projects, loading };
};

// Hook to get real-time employees
export const useEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'employees'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const employeesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEmployees(employeesData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching employees:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { employees, loading };
};

// Hook to get real-time payments
export const usePayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const paymentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPayments(paymentsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching payments:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { payments, loading };
};

// Hook to get real-time activity log (top 5)
export const useActivityLog = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'activityLog'),
            orderBy('timestamp', 'desc'),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activitiesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActivities(activitiesData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching activity log:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { activities, loading };
};

// Hook to get real-time notices
export const useNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'notices'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const noticesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotices(noticesData.filter(notice => notice.isActive));
            setLoading(false);
        }, (error) => {
            console.error('Error fetching notices:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { notices, loading };
};

// Helper function to add activity log
export const addActivityLog = async (action, description) => {
    try {
        await addDoc(collection(db, 'activityLog'), {
            action,
            description,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding activity log:', error);
    }
};

// Hook to get real-time clients
export const useClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const clientsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setClients(clientsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching clients:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { clients, loading };
};

// Hook to get real-time tasks
export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(tasksData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching tasks:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { tasks, loading };
};

