// client/src/features/BrowseProperties/components/ApplicationModal.tsx
import React, { useState, useEffect } from 'react';
import {
    FaTimes, FaCheckCircle, FaCalendarAlt, FaHourglassHalf, FaCommentDots,
    FaPaperPlane, FaUsers, FaUserFriends, FaUserTie, FaArrowLeft, FaPlus, FaChevronRight,
    FaExclamationTriangle
} from 'react-icons/fa';
import {
    rentalRequestService,
    type RentalDuration,
    type LivingSituation,
} from '../../../services/rental-request.service';
import './ApplicationModal.css';

const PRESET_HABITS = [
    "Early Riser", "Night Owl", "Non-smoker", "Very Clean", "Quiet Lifestyle",
    "Social", "Fitness Enthusiast", "Work from Home", "Student", "Pet Owner",
    "Vegan", "Musician", "Minimalist", "Plant Parent", "Frequent Traveler",
    "Gamer", "Chef at Home", "Organized", "Eco-friendly", "Introverted"
];

const durationOptions: { label: string; value: RentalDuration }[] = [
    { label: '6 Months', value: '6_MONTHS' },
    { label: '12 Months', value: '12_MONTHS' },
    { label: '24 Months', value: '24_MONTHS' },
];

const livingSituationOptions: { label: string; value: LivingSituation }[] = [
    { label: 'Single', value: 'SINGLE' },
    { label: 'Married', value: 'MARRIED' },
    { label: 'Family', value: 'FAMILY' },
    { label: 'Students', value: 'STUDENTS' },
];

interface ApplicationModalProps {
    property: {
        id: string;
        title: string;
        price: number;
        image: string;
        landlordName?: string;
    };
    onClose: () => void;
    onBack: () => void;
    isReadOnly?: boolean;
}

const ApplicationModal = ({ property, onClose, onBack, isReadOnly = false }: ApplicationModalProps) => {
    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Step 1 form state
    const [moveInDate, setMoveInDate] = useState('');
    const [duration, setDuration] = useState<RentalDuration | ''>('');
    const [occupants, setOccupants] = useState<number | ''>('');
    const [livingSituation, setLivingSituation] = useState<LivingSituation | ''>('');
    const [message, setMessage] = useState('');

    // Step 2 habits state
    const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
    const [customHabit, setCustomHabit] = useState('');

    useEffect(() => {
        if (isReadOnly) {
            setSelectedHabits(['Early Riser', 'Non-smoker', 'Very Clean']);
        }
    }, [isReadOnly]);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const toggleHabit = (habit: string) => {
        if (isReadOnly) return;
        setSelectedHabits(prev =>
            prev.includes(habit) ? prev.filter(h => h !== habit) : [...prev, habit]
        );
    };

    const addCustomHabit = () => {
        const trimmed = customHabit.trim();
        if (trimmed && !selectedHabits.includes(trimmed)) {
            setSelectedHabits(prev => [...prev, trimmed]);
            setCustomHabit('');
        }
    };

    const handleSubmit = async () => {
        if (!duration || !livingSituation || !moveInDate || !occupants) return;

        setLoading(true);
        setSubmitError(null);

        try {
            await rentalRequestService.submitRentalRequest({
                property_id: property.id,
                move_in_date: moveInDate,
                duration: duration as RentalDuration,
                occupants: Number(occupants),
                living_situation: livingSituation as LivingSituation,
                message: message.trim(),
            });

            setIsSubmitted(true);
        } catch (err: any) {
            const apiMessage: string =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                'Something went wrong. Please try again.';
            setSubmitError(apiMessage);
        } finally {
            setLoading(false);
        }
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
                                <FaArrowLeft /> {step === 1 ? 'Back to Details' : 'Back to Preferences'}
                            </button>

                            <div className="property-mini-card">
                                <img src={property.image} alt={property.title} />
                                <div className="mini-info">
                                    <span className="badge">
                                        {isReadOnly ? 'Submitted Application' : `Application Step ${step}/2`}
                                    </span>
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
                                        <p>{property.landlordName || 'Property Owner'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="app-form-section">
                            {step === 1 ? (
                                <>
                                    <div className="form-header">
                                        <h1>{isReadOnly ? 'Your Application' : 'Rental Application'}</h1>
                                        <p>{isReadOnly ? 'This form is currently locked for editing.' : 'Provide your rental preferences to start the process.'}</p>
                                    </div>

                                    <form onSubmit={handleNext} className="premium-form">
                                        <div className="form-row">
                                            <div className="field-group">
                                                <label><FaCalendarAlt /> Move-in Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    disabled={isReadOnly}
                                                    value={moveInDate}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={e => setMoveInDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="field-group">
                                                <label><FaHourglassHalf /> Duration</label>
                                                <select
                                                    required
                                                    className="premium-select"
                                                    disabled={isReadOnly}
                                                    value={duration}
                                                    onChange={e => setDuration(e.target.value as RentalDuration)}
                                                >
                                                    <option value="">Select duration</option>
                                                    {durationOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="field-group">
                                                <label><FaUsers /> Occupants</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Number of people"
                                                    required
                                                    disabled={isReadOnly}
                                                    value={occupants}
                                                    onChange={e => setOccupants(e.target.value === '' ? '' : Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="field-group">
                                                <label><FaUserFriends /> Living Situation</label>
                                                <select
                                                    required
                                                    className="premium-select"
                                                    disabled={isReadOnly}
                                                    value={livingSituation}
                                                    onChange={e => setLivingSituation(e.target.value as LivingSituation)}
                                                >
                                                    <option value="">Select situation</option>
                                                    {livingSituationOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="field-group">
                                            <label><FaCommentDots /> Message to Landlord</label>
                                            <textarea
                                                placeholder="Introduce yourself and tell the landlord why you're a great fit..."
                                                rows={3}
                                                className="premium-textarea"
                                                disabled={isReadOnly}
                                                value={message}
                                                onChange={e => setMessage(e.target.value)}
                                            />
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
                                        <p>{isReadOnly ? 'Habits submitted with your application.' : 'Let the landlord know a bit more about your lifestyle.'}</p>
                                    </div>

                                    <div className="habits-grid">
                                        {PRESET_HABITS.map(habit => (
                                            <div
                                                key={habit}
                                                className={`habit-chip ${selectedHabits.includes(habit) ? 'selected' : ''}`}
                                                onClick={() => toggleHabit(habit)}
                                                style={{ cursor: isReadOnly ? 'default' : 'pointer' }}
                                            >
                                                {habit}
                                            </div>
                                        ))}
                                    </div>

                                    {!isReadOnly && (
                                        <div className="custom-habit-input">
                                            <input
                                                type="text"
                                                value={customHabit}
                                                onChange={e => setCustomHabit(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomHabit())}
                                                placeholder="Add a custom habit..."
                                            />
                                            <button type="button" onClick={addCustomHabit}><FaPlus /></button>
                                        </div>
                                    )}

                                    {submitError && (
                                        <div className="submit-error-banner">
                                            <FaExclamationTriangle />
                                            <span>{submitError}</span>
                                        </div>
                                    )}

                                    {!isReadOnly ? (
                                        <button
                                            onClick={handleSubmit}
                                            className={`submit-btn ${loading ? 'loading' : ''}`}
                                            disabled={loading}
                                        >
                                            {loading ? <div className="spinner"></div> : <><FaPaperPlane /> Submit Application</>}
                                        </button>
                                    ) : (
                                        <button onClick={onClose} className="submit-btn" style={{ marginTop: '20px' }}>
                                            Close Application View
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="success-screen">
                        <FaCheckCircle className="check-icon-anim" />
                        <h2>Application Sent!</h2>
                        <p>Your request has been forwarded to the landlord. You'll be notified once they review it.</p>
                        <button className="final-btn" onClick={onClose}>Return to Properties</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationModal;