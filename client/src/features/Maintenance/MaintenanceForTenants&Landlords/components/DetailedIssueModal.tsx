import React, { useState, useEffect } from 'react';
import { 
    FaTimes, FaTag, FaAlignLeft, FaDollarSign, FaImage, 
    FaExclamationCircle, FaUpload, FaCheckCircle, FaTrash 
} from 'react-icons/fa';
import './DetailedIssueModal.css';

interface DetailedIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostSuccess: () => void;
}

const CATEGORIES = ['Plumbing', 'Electrical', 'Painting', 'AC Service', 'Gardening', 'Flooring', 'Other'];
const URGENCY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

const DetailedIssueModal: React.FC<DetailedIssueModalProps> = ({ isOpen, onClose, onPostSuccess }) => {
    const [issueType, setIssueType] = useState('Plumbing');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [urgency, setUrgency] = useState('Medium');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setShowSuccess(false);
            setIssueType('Plumbing');
            setDescription('');
            setBudget('');
            setUrgency('Medium');
            setImages([]);
            setPreviews([]);
        }
    }, [isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);
            
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccess(true);
            onPostSuccess();
        }, 1500);
    };

    if (!isOpen) return null;

    if (showSuccess) {
        return (
            <div className="issue-modal-overlay" onClick={onClose}>
                <div className="issue-modal-container success-state" onClick={e => e.stopPropagation()}>
                    <div className="success-content">
                        <div className="success-icon-wrapper">
                            <FaCheckCircle />
                        </div>
                        <h2>Issue posted successfuly</h2>
                        <p>Your maintenance request is now live in the community marketplace. Providers will contact you soon.</p>
                        <button className="done-btn" onClick={onClose}>Great, thanks!</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="issue-modal-overlay" onClick={onClose}>
            <div className="issue-modal-container" onClick={e => e.stopPropagation()}>
                <header className="issue-modal-header">
                    <div className="header-title">
                        <div className="header-icon-box">
                            <FaExclamationCircle />
                        </div>
                        <div>
                            <h2>Report a New Issue</h2>
                            <p>Describe the problem to get help from our expert community.</p>
                        </div>
                    </div>
                    <button className="close-modal-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </header>

                <form className="issue-modal-form" onSubmit={handleSubmit}>
                    <div className="modal-scrollable-content">
                        <div className="form-grid">
                            <div className="form-group">
                                <label><FaTag /> Category</label>
                                <select 
                                    value={issueType} 
                                    onChange={(e) => setIssueType(e.target.value)}
                                    required
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label><FaExclamationCircle /> Urgency Level</label>
                                <div className="urgency-pills">
                                    {URGENCY_LEVELS.map(level => (
                                        <button
                                            key={level}
                                            type="button"
                                            className={`urgency-pill ${urgency === level ? 'active' : ''} ${level.toLowerCase()}`}
                                            onClick={() => setUrgency(level)}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FaAlignLeft /> Description</label>
                            <textarea 
                                placeholder="E.g. The kitchen sink is leaking from the main pipe. It started this morning..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><FaDollarSign /> Estimated Budget (Optional)</label>
                            <div className="budget-input-wrapper">
                                <span className="currency-label">EGP</span>
                                <input 
                                    type="number" 
                                    placeholder="0.00"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                />
                            </div>
                            <small>This helps providers give more accurate bids.</small>
                        </div>

                        <div className="form-group">
                            <label><FaImage /> Evidence Photos</label>
                            <div className="upload-area" onClick={() => document.getElementById('image-upload')?.click()}>
                                <input 
                                    type="file" 
                                    id="image-upload" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleImageChange}
                                    hidden
                                />
                                <div className="upload-placeholder">
                                    <FaUpload className="upload-icon" />
                                    <p>Click or drag to upload evidence</p>
                                    <span>PNG, JPG up to 10MB</span>
                                </div>
                            </div>

                            {previews.length > 0 && (
                                <div className="previews-grid">
                                    {previews.map((url, index) => (
                                        <div key={index} className="preview-item">
                                            <img src={url} alt={`Preview ${index}`} />
                                            <button 
                                                type="button" 
                                                className="remove-img-btn"
                                                onClick={() => removeImage(index)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className="issue-modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Posting...' : 'Post Issue'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default DetailedIssueModal;
