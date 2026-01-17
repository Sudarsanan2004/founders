import { useState } from 'react';
import BentoCard from './BentoCard';
import { Bell } from 'lucide-react';
import './NoticeMarquee.css';

const NoticeMarquee = ({ notices, loading = false, span = 4 }) => {

    if (loading) {
        return (
            <BentoCard span={span}>
                <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
            </BentoCard>
        );
    }

    return (
        <BentoCard span={span}>
            <div className="notice-container">
                <div className="notice-icon">
                    <Bell size={20} />
                </div>
                <div className="marquee-wrapper">
                    {notices && notices.length > 0 ? (
                        <div className="marquee">
                            <span className="marquee-text">
                                {notices.map(n => n.text).join(" • ")} •{" "}
                                {notices.map(n => n.text).join(" • ")}
                            </span>
                        </div>
                    ) : (
                        <p className="text-muted">No active notices</p>
                    )}
                </div>
            </div>
        </BentoCard>
    );
};

export default NoticeMarquee;
