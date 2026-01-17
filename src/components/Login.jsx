import { useState, useEffect } from 'react';
import { signInUser } from '../firebase/auth';
import { useNotification } from '../context/NotificationContext';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';

const ERROR_MESSAGES = [
    "Hmm… are you sure you're a founder? 😄",
    "Founder access denied 😅 Try again.",
    "That doesn't look right, founder 😉",
    "Even founders mistype sometimes 😄"
];

const Login = () => {
    const { notify } = useNotification();
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Auto-dismiss error message after 4 seconds
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage('');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(''); // Clear previous error

        const { user, error } = await signInUser(formData.email, formData.password);

        setIsLoading(false);

        if (error) {
            // Pick a random error message
            const randomMessage = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
            setErrorMessage(randomMessage);
            notify(error, 'error');
        } else if (user) {
            notify('Welcome back!', 'success');
        }
    };

    return (
        <AnimatePresence mode="wait">
            {pageLoading ? (
                <motion.div
                    key="loader"
                    className="login-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100vh',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <img
                            src="/assets/logo.png"
                            alt="Loading"
                            style={{
                                width: '120px',
                                height: 'auto',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 0 20px rgba(255,107,0,0.3))'
                            }}
                        />
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    className="login-page"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="login-container">
                        {/* Left Side: Creative Section */}
                        <div className="login-left">
                            <div className="creative-content">
                                <h1>Built for Founders </h1>

                                <div className="abstract-patterns">
                                    <div className="pattern-glow glow-1"></div>
                                    <div className="pattern-glow glow-2"></div>
                                    <div className="pattern-glow glow-3"></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Form Section */}
                        <div className="login-right">
                            <div className="form-box">
                                <div className="logo-header">
                                    <div className="brand-icon">
                                        <img src="/assets/logo.png" alt="Company Logo" />
                                    </div>
                                    <h2>MWU MANAGEMENT</h2>
                                    <p className="text-muted">
                                        An exclusive founder dashboard
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="auth-form">
                                    <div className="form-field">
                                        <label>Username</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="Access ID"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="Private login key"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>

                                    <button type="submit" className="login-btn" disabled={isLoading}>
                                        {isLoading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    {/* Error Message */}
                                    <AnimatePresence>
                                        {errorMessage && (
                                            <motion.div
                                                className="login-error-popup"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                            >
                                                {errorMessage}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Login;
