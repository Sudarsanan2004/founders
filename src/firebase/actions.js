import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

// Add new project
export const addProject = async (projectData) => {
    try {
        const { logDescription, ...dataToSave } = projectData;

        const docRef = await addDoc(collection(db, 'projects'), {
            ...dataToSave,
            createdAt: serverTimestamp()
        });

        // Log activity
        await addDoc(collection(db, 'activityLog'), {
            action: 'project_created',
            description: logDescription || `New project "${projectData.name}" created`,
            timestamp: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding project:', error);
        throw error;
    }
};

// Add new employee
export const addEmployee = async (employeeData) => {
    try {
        const { logDescription, ...dataToSave } = employeeData;

        const docRef = await addDoc(collection(db, 'employees'), {
            ...dataToSave,
            createdAt: serverTimestamp()
        });

        await addDoc(collection(db, 'activityLog'), {
            action: 'employee_added',
            description: logDescription || `New employee "${employeeData.name}" added`,
            timestamp: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding employee:', error);
        throw error;
    }
};

// Add new notice
export const addNotice = async (text) => {
    try {
        const docRef = await addDoc(collection(db, 'notices'), {
            text,
            isActive: true,
            createdAt: serverTimestamp()
        });

        await addDoc(collection(db, 'activityLog'), {
            action: 'notice_updated',
            description: 'New system notice posted',
            timestamp: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding notice:', error);
        throw error;
    }
};

// Update project status
export const updateProjectStatus = async (projectId, status) => {
    try {
        await updateDoc(doc(db, 'projects', projectId), {
            status
        });
    } catch (error) {
        console.error('Error updating project status:', error);
        throw error;
    }
};

// Update project progress
export const updateProjectProgress = async (projectId, progress) => {
    try {
        await updateDoc(doc(db, 'projects', projectId), {
            progress: Number(progress)
        });
    } catch (error) {
        console.error('Error updating project progress:', error);
        throw error;
    }
};

// Delete notice
export const deleteNotice = async (noticeId) => {
    try {
        await deleteDoc(doc(db, 'notices', noticeId));
    } catch (error) {
        console.error('Error deleting notice:', error);
        throw error;
    }
};

// Delete project
export const deleteProject = async (projectId) => {
    try {
        await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
};

// Delete employee
export const deleteEmployee = async (employeeId) => {
    try {
        await deleteDoc(doc(db, 'employees', employeeId));
    } catch (error) {
        console.error('Error deleting employee:', error);
        throw error;
    }
};

// Update full project details
export const updateProject = async (projectId, projectData) => {
    try {
        await updateDoc(doc(db, 'projects', projectId), projectData);

        await addDoc(collection(db, 'activityLog'), {
            action: 'project_updated',
            description: `Project "${projectData.name}" updated`,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
};

// Update employee details
export const updateEmployee = async (employeeId, employeeData) => {
    try {
        await updateDoc(doc(db, 'employees', employeeId), employeeData);
    } catch (error) {
        console.error('Error updating employee:', error);
        throw error;
    }
};

// Update notice
export const updateNotice = async (noticeId, text) => {
    try {
        await updateDoc(doc(db, 'notices', noticeId), { text });
    } catch (error) {
        console.error('Error updating notice:', error);
        throw error;
    }
};

// Add new payment with Custom Date support
export const addPayment = async (paymentData) => {
    try {
        // Use provided date or server timestamp
        const paymentDate = paymentData.date ? new Date(paymentData.date) : new Date();

        const docRef = await addDoc(collection(db, 'payments'), {
            ...paymentData,
            createdAt: paymentDate
        });

        await addDoc(collection(db, 'activityLog'), {
            action: 'payment_added',
            description: `New payment of ${paymentData.amount} recorded`,
            timestamp: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding payment:', error);
        throw error;
    }
};

// Update payment details
export const updatePayment = async (paymentId, paymentData) => {
    try {
        const updateData = { ...paymentData };
        if (paymentData.date) {
            updateData.createdAt = new Date(paymentData.date);
        }

        await updateDoc(doc(db, 'payments', paymentId), updateData);
    } catch (error) {
        console.error('Error updating payment:', error);
        throw error;
    }
};

// Delete payment
export const deletePayment = async (paymentId) => {
    try {
        await deleteDoc(doc(db, 'payments', paymentId));
    } catch (error) {
        console.error('Error deleting payment:', error);
        throw error;
    }
};

// Add new client
export const addClient = async (clientData) => {
    try {
        const { logDescription, ...dataToSave } = clientData;

        const docRef = await addDoc(collection(db, 'clients'), {
            ...dataToSave,
            createdAt: serverTimestamp()
        });

        // Log activity (Added for AI Command consistency)
        await addDoc(collection(db, 'activityLog'), {
            action: 'client_added',
            description: logDescription || `New client "${clientData.name}" added`,
            timestamp: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding client:', error);
        throw error;
    }
};

// Update client
export const updateClient = async (clientId, clientData) => {
    try {
        await updateDoc(doc(db, 'clients', clientId), clientData);
    } catch (error) {
        console.error('Error updating client:', error);
        throw error;
    }
};

// Delete client
export const deleteClient = async (clientId) => {
    try {
        await deleteDoc(doc(db, 'clients', clientId));
    } catch (error) {
        console.error('Error deleting client:', error);
        throw error;
    }
};

// Add new task
export const addTask = async (taskData) => {
    try {
        const docRef = await addDoc(collection(db, 'tasks'), {
            ...taskData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        await addDoc(collection(db, 'activityLog'), {
            action: 'task_created',
            description: `New task "${taskData.title}" created`,
            timestamp: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding task:', error);
        throw error;
    }
};

// Update task
export const updateTask = async (taskId, taskData) => {
    try {
        await updateDoc(doc(db, 'tasks', taskId), {
            ...taskData,
            updatedAt: serverTimestamp()
        });

        await addDoc(collection(db, 'activityLog'), {
            action: 'task_updated',
            description: `Task "${taskData.title || 'Untitled'}" updated`,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
};

// Delete task
export const deleteTask = async (taskId) => {
    try {
        await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
};

