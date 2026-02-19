// client\src\features\BrowseProperties\components\ApplicationModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaCheckCircle, FaUser, FaBriefcase, FaWallet, FaCloudUploadAlt, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import './ApplicationModal.css';

const ApplicationModal = ({ property, onClose }: any) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleFileChange = (e: any) => {
        if (e.target.files[0]) setFileName(e.target.files[0].name);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setIsSubmitted(true);
        }, 2000);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container app-modal-view">
                <button className="close-modal" onClick={onClose}><FaTimes size={20} /></button>

                {!isSubmitted ? (
                    <div className="app-layout">
                        {/* LEFT SIDEBAR PREVIEW */}
                        <div className="app-sidebar">
                            <div className="property-mini-card">
                                <img src={property.image} alt="" />
                                <div className="mini-info">
                                    <span className="badge">New Application</span>
                                    <h4>{property.title}</h4>
                                    <p className="mini-price">${property.price.toLocaleString()}<span>/mo</span></p>
                                </div>
                            </div>
                            <div className="app-steps">
                                <div className="step active"><div className="step-num">1</div> Details</div>
                                <div className="step"><div className="step-num">2</div> Documents</div>
                                <div className="step"><div className="step-num">3</div> Review</div>
                            </div>
                        </div>

                        {/* RIGHT MAIN FORM */}
                        <div className="app-form-section">
                            <div className="form-header">
                                <h1>Rental Application</h1>
                                <p>Provide your details to initiate the lease process.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="premium-form">
                                <div className="form-row">
                                    <div className="field-group">
                                        <label><FaUser /> Full Name</label>
                                        <input type="text" placeholder="Johnathan Doe" required />
                                    </div>
                                    <div className="field-group">
                                        <label><FaBriefcase /> Occupation</label>
                                        <input type="text" placeholder="Software Architect" required />
                                    </div>
                                </div>

                                <div className="field-group">
                                    <label><FaWallet /> Monthly Net Income</label>
                                    <input type="number" placeholder="e.g. 5000" required />
                                </div>

                                {/* UPLOAD ZONE */}
                                <div className="field-group">
                                    <label>Proof of Identity / Income</label>
                                    <div className="upload-dropzone">
                                        <input type="file" onChange={handleFileChange} id="file-upload" />
                                        <label htmlFor="file-upload">
                                            <FaCloudUploadAlt size={32} />
                                            <span>{fileName ? fileName : "Click to upload or drag & drop"}</span>
                                            <small>PDF, PNG, or JPG (max 10MB)</small>
                                        </label>
                                    </div>
                                </div>

                                <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                                    {loading ? <div className="spinner"></div> : <><FaPaperPlane /> Submit Application</>}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* SUCCESS STATE */
                    <div className="success-screen">
                        <div className="success-lottie">
                            <FaCheckCircle className="check-icon-anim" />
                            <div className="confetti-burst"></div>
                        </div>
                        <h2>Request Sent Successfully</h2>
                        <p>We'll notify you when your request is updated.</p>
                        <button className="final-btn" onClick={onClose}>Return to Dashboard</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationModal;