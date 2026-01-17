import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// Sample data for demo purposes
export const seedDemoData = async () => {
    try {
        console.log('Seeding demo data...');

        // Add sample projects
        const projectsData = [
            {
                name: 'E-Commerce Platform',
                totalCost: 250000,
                developerCost: 150000,
                paidAmount: 150000,
                status: 'active',
                createdAt: serverTimestamp()
            },
            {
                name: 'Mobile App Development',
                totalCost: 180000,
                developerCost: 120000,
                paidAmount: 180000,
                status: 'completed',
                createdAt: serverTimestamp()
            },
            {
                name: 'CRM System',
                totalCost: 300000,
                developerCost: 200000,
                paidAmount: 100000,
                status: 'active',
                createdAt: serverTimestamp()
            }
        ];

        const projectIds = [];
        for (const project of projectsData) {
            const docRef = await addDoc(collection(db, 'projects'), project);
            projectIds.push(docRef.id);
            console.log('Added project:', project.name);
        }

        // Add sample employees
        const employeesData = [
            {
                name: 'Rajesh Kumar',
                role: 'Senior Developer',
                salary: 80000,
                createdAt: serverTimestamp()
            },
            {
                name: 'Priya Sharma',
                role: 'UI/UX Designer',
                salary: 60000,
                createdAt: serverTimestamp()
            },
            {
                name: 'Amit Patel',
                role: 'Full Stack Developer',
                salary: 75000,
                createdAt: serverTimestamp()
            }
        ];

        for (const employee of employeesData) {
            await addDoc(collection(db, 'employees'), employee);
            console.log('Added employee:', employee.name);
        }

        // Add sample payments
        const paymentsData = [
            {
                projectId: projectIds[0],
                amount: 75000,
                type: 'developer-payout',
                description: 'First milestone payment',
                createdAt: serverTimestamp()
            },
            {
                projectId: projectIds[0],
                amount: 75000,
                type: 'developer-payout',
                description: 'Second milestone payment',
                createdAt: serverTimestamp()
            },
            {
                projectId: projectIds[1],
                amount: 120000,
                type: 'developer-payout',
                description: 'Full project payment',
                createdAt: serverTimestamp()
            },
            {
                projectId: projectIds[2],
                amount: 50000,
                type: 'developer-payout',
                description: 'Initial payment',
                createdAt: serverTimestamp()
            }
        ];

        for (const payment of paymentsData) {
            await addDoc(collection(db, 'payments'), payment);
            console.log('Added payment:', payment.description);
        }

        // Add sample activity logs
        const activitiesData = [
            {
                action: 'payment_added',
                description: 'Admin added payment ₹75,000 for E-Commerce Platform',
                timestamp: serverTimestamp()
            },
            {
                action: 'project_created',
                description: 'New project "CRM System" created',
                timestamp: serverTimestamp()
            },
            {
                action: 'employee_added',
                description: 'Amit Patel joined as Full Stack Developer',
                timestamp: serverTimestamp()
            },
            {
                action: 'payment_added',
                description: 'Admin added payment ₹50,000 for CRM System',
                timestamp: serverTimestamp()
            },
            {
                action: 'notice_updated',
                description: 'System notice updated',
                timestamp: serverTimestamp()
            }
        ];

        for (const activity of activitiesData) {
            await addDoc(collection(db, 'activityLog'), activity);
            console.log('Added activity:', activity.description);
        }

        // Add sample notice
        const noticesData = [
            {
                text: '🎉 Welcome to MAKEWITHUS Admin Dashboard! All systems operational. Team meeting scheduled for Friday 3 PM.',
                isActive: true,
                createdAt: serverTimestamp()
            }
        ];

        for (const notice of noticesData) {
            await addDoc(collection(db, 'notices'), notice);
            console.log('Added notice');
        }

        console.log('✅ Demo data seeded successfully!');
        return true;
    } catch (error) {
        console.error('Error seeding demo data:', error);
        return false;
    }
};
