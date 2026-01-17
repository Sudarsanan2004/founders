import { motion } from 'framer-motion';

const BentoCard = ({ children, className = '', span = 1 }) => {
    return (
        <motion.div
            className={`bento-card ${className}`}
            style={{ gridColumn: span === 'full' ? '1 / -1' : `span ${span}` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4 }}
        >
            {children}
        </motion.div>
    );
};

export default BentoCard;
