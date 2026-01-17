import { useState } from 'react';
import BentoCard from './BentoCard';
import { calculatePaymentProgress, formatCurrency } from '../utils/calculations';

const ProjectFinanceCard = ({ projects, payments, loading = false }) => {
    const [selectedProjectId, setSelectedProjectId] = useState('');

    const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

    const projectPayments = selectedProject
        ? payments.filter(p => p.projectId === selectedProject.id)
        : [];

    const paidAmount = projectPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCost = selectedProject?.totalCost || 0;
    const developerCost = selectedProject?.developerCost || 0;
    const remaining = developerCost - paidAmount;
    const adminProfit = totalCost - paidAmount;
    // Calculate progress based on Developer Cost (Budget), handling division by zero
    const paymentProgress = developerCost > 0 ? (paidAmount / developerCost) * 100 : (paidAmount > 0 ? 100 : 0);

    if (loading) {
        return (
            <BentoCard>
                <div className="skeleton" style={{ height: '250px', width: '100%' }}></div>
            </BentoCard>
        );
    }

    return (
        <BentoCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>
                        Project Finance
                    </h3>
                    <select
                        value={selectedProjectId || (projects[0]?.id || '')}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        {projects.length === 0 ? (
                            <option>No projects available</option>
                        ) : (
                            projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {selectedProject && (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="finance-row">
                                <span className="text-muted">Project Revenue</span>
                                <span style={{ fontWeight: '600' }}>{formatCurrency(totalCost)}</span>
                            </div>
                            <div className="finance-row">
                                <span className="text-muted">Dev Pay (Allocated)</span>
                                <span style={{ fontWeight: '600' }}>{formatCurrency(developerCost)}</span>
                            </div>
                            <div className="finance-row">
                                <span className="text-muted">Dev Payout (Actual)</span>
                                <span style={{ fontWeight: '600', color: 'var(--accent-orange)' }}>
                                    {formatCurrency(paidAmount)}
                                </span>
                            </div>
                            <div className="finance-row">
                                <span className="text-muted">Remaining</span>
                                <span style={{ fontWeight: '600' }}>{formatCurrency(remaining)}</span>
                            </div>
                            <div className="finance-row" style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <span className="text-muted">Admin Profit</span>
                                <span style={{ fontWeight: '700', color: '#4ade80', fontSize: '1.125rem' }}>
                                    {formatCurrency(adminProfit)}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Payment Progress</span>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{paymentProgress.toFixed(0)}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${paymentProgress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Project Status</span>
                                <span
                                    className="text-muted"
                                    style={{
                                        fontSize: '0.75rem',
                                        color: selectedProject.status === 'active' ? '#4ade80' : 'var(--text-muted)'
                                    }}
                                >
                                    {selectedProject.status ? selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1) : 'Unknown'}
                                </span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${selectedProject.progress || 0}%`,
                                        background: selectedProject.status === 'completed' ? '#4ade80' : 'linear-gradient(90deg, var(--accent-orange), #f59e6c)'
                                    }}
                                ></div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </BentoCard>
    );
};

export default ProjectFinanceCard;
