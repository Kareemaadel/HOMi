import React, { useState, useEffect } from 'react';
import './MyProfile.css'; // Reuse profile styles for consistency
import { FaCheckCircle, FaMagic } from 'react-icons/fa';
import { authService } from '../../../services/auth.service';

interface LifestyleHabitsProps {
    role?: string | null;
}

const LifestyleHabits: React.FC<LifestyleHabitsProps> = ({ role }) => {
    const [userHabits, setUserHabits] = useState<string[]>([]);
    const [initialHabits, setInitialHabits] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const availableHabits = [
        'Non-smoker', 'Early Riser', 'Social', 'Work from Home', 'Vegan', 'Musician',
        'Gamer', 'Chef at Home', 'Pet Owner', 'Very Clean', 'Night Owl', 'Quiet Lifestyle',
        'Fitness Enthusiast', 'Student', 'Minimalist', 'Plant Parent', 'Frequent Traveler',
        'Organized', 'Eco-friendly', 'Introverted'
    ];

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                if (role === 'TENANT') {
                    const data = await authService.getUserHabits();
                    setUserHabits(data.habit_names || []);
                    setInitialHabits(data.habit_names || []);
                }
            } catch (err) {
                console.error('Failed to fetch habits:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHabits();
    }, [role]);

    const hasChanges = JSON.stringify([...userHabits].sort()) !== JSON.stringify([...initialHabits].sort());

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await authService.setHabits(userHabits);
            setInitialHabits([...userHabits]);
            setMessage({ type: 'success', text: 'Habits updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update habits. Please try again.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    if (loading) {
        return (
            <div className="profile-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div className="loading-spinner" style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div className="profile-wrapper">
            <div className="profile-edit-surface">
                <div className="form-section-title">Lifestyle Habits</div>
                <p className="section-subtitle">Your habits help us find the perfect roommates for you using our AI matching engine.</p>

                {message && (
                    <div
                        style={{
                            padding: '10px 16px',
                            borderRadius: 8,
                            marginBottom: 20,
                            fontSize: 14,
                            fontWeight: 500,
                            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                            color: message.type === 'success' ? '#15803d' : '#dc2626',
                            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                        }}
                    >
                        {message.text}
                    </div>
                )}

                <div className="habits-grid-modern" style={{ marginTop: '1rem' }}>
                    {availableHabits.map(habit => (
                        <button
                            key={habit}
                            onClick={() => {
                                if (userHabits.includes(habit)) {
                                    setUserHabits(userHabits.filter(h => h !== habit));
                                } else {
                                    setUserHabits([...userHabits, habit]);
                                }
                            }}
                            className={`habit-pill-modern ${userHabits.includes(habit) ? 'active' : ''}`}
                        >
                            {userHabits.includes(habit) && <FaCheckCircle className="pill-icon" />}
                            {habit}
                        </button>
                    ))}
                </div>

                {userHabits.length < 3 && (
                    <div className="habit-warning">
                        <span className="warning-dot"></span>
                        Select at least {3 - userHabits.length} more habit(s) to be eligible for Roommate Matching.
                    </div>
                )}

                <button
                    className="prime-save-button"
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    style={{ opacity: saving || !hasChanges ? 0.65 : 1, marginTop: '1rem' }}
                >
                    {saving ? 'Saving…' : 'Save Habits'}
                </button>

                <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4" style={{ background: '#f0f9ff', border: '1px solid #dbeafe', padding: '1.5rem', borderRadius: '1rem' }}>
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <FaMagic className="text-blue-600" style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900" style={{ color: '#1e3a8a', margin: 0, fontSize: '1rem' }}>AI Matching Ready</h4>
                        <p className="text-sm text-blue-700 mt-1" style={{ color: '#1d4ed8', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                            Once you select 3 habits, our engine will analyze your lifestyle compatibility with thousands of other potential roommates.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LifestyleHabits;
