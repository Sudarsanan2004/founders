import { useState } from 'react';
import { addProject } from '../firebase/actions';
import { useNotification } from '../context/NotificationContext';
import './QuickDone.css';

const QuickDone = () => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const { notify } = useNotification();

    // Reset state
    const reset = () => {
        setInputValue('');
        setError(null);
        setParsedData(null);
        setShowConfirm(false);
    };

    // Strict parsing logic
    const parseCommand = (input) => {
        const trimmedInput = input.trim();

        // Regex to check if it starts with "add project" (case insensitive, multiple spaces allowed)
        const commandRegex = /^add\s+project\s+/i;

        // Basic syntax check
        if (!commandRegex.test(trimmedInput)) {
            return { error: 'Unknown command. Try "add project ..."' };
        }

        // Remove "add project" prefix
        let currentString = trimmedInput.replace(commandRegex, '').trim();

        // Keywords to look for
        const keywords = ['name', 'total', 'dev'];
        const values = {};

        // Helper regex to extract value for a keyword
        // logic: keyword <space> <value> (<next_keyword>|$)
        // We iterate through keywords and extract values

        // But since order varies, we can find indices of keywords.
        const indices = []; // ... (rest of logic is fine, maybe?)
        // Wait, if currentString is "name dkju total 5000"

        keywords.forEach(kw => {
            const regex = new RegExp(`\\b${kw}\\b`, 'i'); // Word boundary, case insensitive
            const match = regex.exec(currentString);
            if (match) {
                indices.push({ keyword: kw, index: match.index, length: kw.length });
            }
        });

        // Sort indices by position
        indices.sort((a, b) => a.index - b.index);

        if (indices.length < 3) {
            // Find missing field
            const foundKws = indices.map(i => i.keyword);
            const missing = keywords.filter(k => !foundKws.includes(k));
            return { error: `Missing keywords: ${missing.join(', ')}` };
        }

        // Extract values
        for (let i = 0; i < indices.length; i++) {
            const current = indices[i];
            const next = indices[i + 1];

            const start = current.index + current.length;
            const end = next ? next.index : currentString.length;

            const rawValue = currentString.substring(start, end).trim();
            values[current.keyword] = rawValue;
        }

        // Validation
        if (!values.name) return { error: 'Missing field: name' };
        if (!values.total) return { error: 'Missing field: total' };
        if (!values.dev) return { error: 'Missing field: dev' };

        const totalCost = Number(values.total);
        const devCost = Number(values.dev);
        const name = values.name;

        if (isNaN(totalCost)) return { error: 'Total cost must be a number' };
        if (isNaN(devCost)) return { error: 'Dev cost must be a number' };
        if (devCost > totalCost) return { error: 'Dev cost cannot exceed total cost' };

        return {
            success: true,
            data: {
                name,
                totalCost: totalCost,
                developerCost: devCost,
                status: 'active',
                logDescription: `Project "${name}" added via Quick Done`
                // other fields handled by backend/actions
            }
        };
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setError(null);

            if (!inputValue.trim()) return;

            const result = parseCommand(inputValue);

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.success) {
                setParsedData(result.data);
                setShowConfirm(true);
            }
        }
    };

    const handleConfirm = async () => {
        if (!parsedData) return;

        try {
            await addProject(parsedData);
            notify('Project added successfully via Quick Done', 'success');
            reset();
        } catch (err) {
            console.error(err);
            notify('Failed to add project', 'error');
            setError('System error. Check console.');
        }
    };

    return (
        <div className="quick-done-container">
            <div className="quick-done-input-wrapper">
                <input
                    type="text"
                    className="quick-done-input"
                    placeholder="Quick done... e.g. add project name dkju total 5000 dev 1500"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setError(null); // Clear error on type
                    }}
                    onKeyDown={handleKeyDown}
                />

                {error ? (
                    <div className="quick-done-error">
                        <span>⚠️</span> {error}
                    </div>
                ) : (
                    <div className="quick-done-helper">
                        Tip: type “add project name &lt;name&gt; total &lt;amount&gt; dev &lt;amount&gt;” and press Enter
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirm && parsedData && (
                <div className="quick-done-modal-overlay">
                    <div className="quick-done-modal">
                        <div className="modal-header">Confirm Quick Add</div>
                        <div className="modal-details">
                            <div className="detail-row">
                                <span className="detail-label">Project Name</span>
                                <span className="detail-value">{parsedData.name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Total Cost</span>
                                <span className="detail-value highlight">₹{parsedData.totalCost}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Dev Cost</span>
                                <span className="detail-value highlight">₹{parsedData.developerCost}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Status</span>
                                <span className="detail-value">Active</span>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
                            <button className="btn-confirm" onClick={handleConfirm}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickDone;
