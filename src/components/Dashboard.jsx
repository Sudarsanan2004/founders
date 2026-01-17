import { motion } from 'framer-motion';
import StatCard from './StatCard';
import AnalyticsChart from './AnalyticsChart';
import ProfitGrowthChart from './Analytics/ProfitGrowthChart';

import ProjectFinanceCard from './ProjectFinanceCard';
import ActivityLog from './ActivityLog';
import NoticeMarquee from './NoticeMarquee';
import TaskMarquee from './TaskMarquee';
import SmartInsights from './SmartInsights';
import QuickDone from './QuickDone';
import { useProjects, usePayments, useActivityLog, useNotices } from '../firebase/hooks';
import {
    calculateTotalRevenue,
    calculateTotalDevBudget,
    calculateAdminProfit,
    getActiveProjectsCount
} from '../utils/calculations';
import './Dashboard.css';

const Dashboard = () => {
    const { projects, loading: projectsLoading } = useProjects();
    const { payments, loading: paymentsLoading } = usePayments();
    const { activities, loading: activitiesLoading } = useActivityLog();
    const { notices, loading: noticesLoading } = useNotices();

    const loading = projectsLoading || paymentsLoading;

    // New definitions:
    // Total Project Value = Sum of all project contracts
    const totalRevenue = calculateTotalRevenue(projects);
    // Total Dev Pay = Sum of all allocated developer costs
    const totalPayout = calculateTotalDevBudget(projects);
    // Admin Profit = Total Cost - Total Allocated Dev Cost
    const adminProfit = calculateAdminProfit(projects);

    const activeProjects = getActiveProjectsCount(projects);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '10px'
                }}>
                    <motion.img
                        layoutId="brand-logo"
                        transition={{ type: "spring", stiffness: 70, damping: 18 }}
                        src="/assets/logo.png"
                        alt="Company Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </div>
                <div>
                    <h2 className="dashboard-title">Founders Dashboard</h2>
                    <p className="dashboard-subtitle">MakeWithUs Founder's System created to manage operations within MWU. System handled by Sudarsanan & Sherhan.</p>
                </div>
            </div>

            {/* Smart Insights Section */}
            <QuickDone />
            <div className="insights-task-container">
                <div className="insights-wrapper">
                    <SmartInsights projects={projects} payments={payments} loading={loading} />
                </div>
                <div className="task-marquee-wrapper">
                    <TaskMarquee />
                </div>
            </div>

            <div className="bento-grid">
                {/* Notice Marquee - Top Section */}
                <NoticeMarquee
                    notices={notices}
                    loading={noticesLoading}
                    span="full"
                />

                {/* Second Row - Summary Stats */}
                <StatCard title="Total Revenue" value={totalRevenue} loading={loading} />
                <StatCard title="Total Dev Pay" value={totalPayout} loading={loading} />
                <StatCard title="Admin Profit" value={adminProfit} loading={loading} />



                <ProfitGrowthChart projects={projects} loading={loading} />

                {/* Main Analytics Chart (Old Version Restored with Real Data) */}
                <AnalyticsChart
                    projects={projects}
                    payments={payments}
                    loading={loading}
                />

                {/* Project Finance */}
                <ProjectFinanceCard
                    projects={projects}
                    payments={payments}
                    loading={loading}
                />

                {/* Activity Log */}
                <ActivityLog
                    activities={activities}
                    loading={activitiesLoading}
                />
            </div>
        </div>
    );
};

export default Dashboard;
