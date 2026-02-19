// client\src\features\BrowseProperties\components\ApplicationModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaCheckCircle, FaCalendarAlt, FaHourglassHalf, FaCommentDots, FaPaperPlane, FaUsers, FaPaw, FaUserTie, FaArrowLeft, FaPlus, FaChevronRight } from 'react-icons/fa';
import './ApplicationModal.css';

const PRESET_HABITS = [
    "Early Riser", "Night Owl", "Non-smoker", "Very Clean", "Quiet Lifestyle", 
    "Social", "Fitness Enthusiast", "Work from Home", "Student", "Pet Owner", 
    "Vegan", "Musician", "Minimalist", "Plant Parent", "Frequent Traveler",
    "Gamer", "Chef at Home", "Organized", "Eco-friendly", "Introverted"
];

const ApplicationModal = ({ property, onClose, onBack }: any) => {
    const [step, setStep] = useState(1); // Step 1: Form, Step 2: Habits
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Habits State
    const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
    const [customHabit, setCustomHabit] = useState("");

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const toggleHabit = (habit: string) => {
        setSelectedHabits(prev => 
            prev.includes(habit) ? prev.filter(h => h !== habit) : [...prev, habit]
        );
    };

    const addCustomHabit = () => {
        if (customHabit.trim() && !selectedHabits.includes(customHabit.trim())) {
            setSelectedHabits([...selectedHabits, customHabit.trim()]);
            setCustomHabit("");
        }
    };

    const handleSubmit = () => {
        setLoading(true);
        // Simulate API call including selectedHabits
        setTimeout(() => {
            setLoading(false);
            setIsSubmitted(true);
        }, 2000);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container app-modal-view">
                <button className="close-modal" onClick={onClose} aria-label="Close modal">
                    <FaTimes size={20} />
                </button>

                {!isSubmitted ? (
                    <div className="app-layout">
                        <div className="app-sidebar">
                            <button className="back-to-property" onClick={step === 1 ? onBack : () => setStep(1)}>
                                <FaArrowLeft /> {step === 1 ? "Back to Details" : "Back to Preferences"}
                            </button>

                            <div className="property-mini-card">
                                <img src={property.image} alt={property.title} />
                                <div className="mini-info">
                                    <span className="badge">Application Step {step}/2</span>
                                    <h4>{property.title}</h4>
                                    <p className="mini-price">${property.price.toLocaleString()}<span>/mo</span></p>
                                </div>
                            </div>

                            <div className="app-steps-indicator">
                                <div className={`step-dot ${step >= 1 ? 'active' : ''}`}><span>1</span> Form</div>
                                <div className={`step-line ${step === 2 ? 'active' : ''}`}></div>
                                <div className={`step-dot ${step === 2 ? 'active' : ''}`}><span>2</span> Habits</div>
                            </div>

                            <div className="landlord-card">
                                <div className="landlord-header">
                                    <FaUserTie className="landlord-icon" />
                                    <div>
                                        <h5>Landlord Info</h5>
                                        <p>{property.landlordName || "Sarah Jenkins"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="app-form-section">
                            {step === 1 ? (
                                <>
                                    <div className="form-header">
                                        <h1>Rental Application</h1>
                                        <p>Provide your rental preferences to start the process.</p>
                                    </div>

                                    <form onSubmit={handleNext} className="premium-form">
                                        <div className="form-row">
                                            <div className="field-group">
                                                <label><FaCalendarAlt /> Move-in Date</label>
                                                <input type="date" required />
                                            </div>
                                            <div className="field-group">
                                                <label><FaHourglassHalf /> Duration</label>
                                                <select required className="premium-select">
                                                    <option value="">Select duration</option>
                                                    <option value="6">6 Months</option>
                                                    <option value="12">12 Months</option>
                                                    <option value="24">24 Months</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="field-group">
                                                <label><FaUsers /> Occupants</label>
                                                <input type="number" min="1" placeholder="People" required />
                                            </div>
                                            <div className="field-group">
                                                <label><FaPaw /> Pets</label>
                                                <select required className="premium-select">
                                                    <option value="no">No Pets</option>
                                                    <option value="yes">Yes, I have pets</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="field-group">
                                            <label><FaCommentDots /> Message to Landlord</label>
                                            <textarea placeholder="Introduce yourself..." rows={3} className="premium-textarea"></textarea>
                                        </div>

                                        <button type="submit" className="submit-btn">
                                            Next: Your Habits <FaChevronRight />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="habits-selection-view">
                                    <div className="form-header">
                                        <h1>Your Habits</h1>
                                        <p>Let the landlord know a bit more about your lifestyle.</p>
                                    </div>

                                    <div className="habits-grid">
                                        {PRESET_HABITS.map(habit => (
                                            <div 
                                                key={habit} 
                                                className={`habit-chip ${selectedHabits.includes(habit) ? 'selected' : ''}`}
                                                onClick={() => toggleHabit(habit)}
                                            >
                                                {habit}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="custom-habit-input">
                                        <input 
                                            type="text" 
                                            value={customHabit}
                                            onChange={(e) => setCustomHabit(e.target.value)}
                                            placeholder="Add a custom habit..." 
                                        />
                                        <button type="button" onClick={addCustomHabit}><FaPlus /></button>
                                    </div>

                                    <button 
                                        onClick={handleSubmit} 
                                        className={`submit-btn ${loading ? 'loading' : ''}`} 
                                        disabled={loading || selectedHabits.length === 0}
                                    >
                                        {loading ? <div className="spinner"></div> : <><FaPaperPlane /> Submit Application</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="success-screen">
                        <FaCheckCircle className="check-icon-anim" />
                        <h2>Application Sent!</h2>
                        <p>Your request and lifestyle profile have been forwarded to the landlord.</p>
                        <button className="final-btn" onClick={onClose}>Return to Dashboard</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationModal;