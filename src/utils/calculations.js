// Calculate total revenue from all projects (Total Contract Value)
export const calculateTotalRevenue = (projects) => {
    if (!projects || projects.length === 0) return 0;
    return projects.reduce((total, project) => total + (Number(project.totalCost) || 0), 0);
};

// Calculate total developer budget from all projects (Allocated Pay)
export const calculateTotalDevBudget = (projects) => {
    if (!projects || projects.length === 0) return 0;
    return projects.reduce((total, project) => total + (Number(project.developerCost) || 0), 0);
};

// Calculate admin profit (Projected Margin)
// Formula: Total Project Cost - Total Dev Budget
export const calculateAdminProfit = (projects) => {
    const totalRevenue = calculateTotalRevenue(projects);
    const totalDevBudget = calculateTotalDevBudget(projects);
    return totalRevenue - totalDevBudget;
};

// Calculate remaining balance for a project (how much is LEFT to pay the dev)
export const calculateRemainingBalance = (developerCost, paidAmount) => {
    return developerCost - paidAmount;
};

// Get count of active projects
export const getActiveProjectsCount = (projects) => {
    if (!projects || projects.length === 0) return 0;
    return projects.filter(project => project.status === 'active').length;
};

// Calculate payment completion percentage
export const calculatePaymentProgress = (paidAmount, totalCost) => {
    if (totalCost === 0) return 0;
    return Math.min((paidAmount / totalCost) * 100, 100);
};

// Format currency in Indian Rupees
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// Calculate profit margin percentage
export const calculateMargin = (totalCost, developerCost) => {
    if (totalCost === 0) return 0;
    return ((totalCost - developerCost) / totalCost) * 100;
};

// Get Profit Health Status
// > 40% margin = Healthy (Green)
// 20-40% margin = Tight (Yellow)
// < 20% margin = Risky (Red)
export const getProfitHealth = (totalCost, developerCost) => {
    const margin = calculateMargin(totalCost, developerCost);
    if (margin >= 40) return { status: 'Healthy', color: '#4ade80' }; // Green
    if (margin >= 20) return { status: 'Tight Margin', color: '#fbbf24' }; // Yellow
    return { status: 'Low Profit', color: '#f87171' }; // Red
};
