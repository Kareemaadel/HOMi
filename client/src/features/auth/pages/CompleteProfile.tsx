import React, { useState, useRef, useEffect } from 'react';
import { 
  User, IdCard, Globe, MapPin, Briefcase,
  Home, Building2, UploadCloud, ArrowRight, ArrowLeft,
  Calendar, Clock, ShieldCheck, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import './CompleteProfile.css';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import type { RegisterRequest } from '../../../types/auth.types';

type UserRole = 'tenant' | 'landlord' | null;

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

const CompleteProfile: React.FC = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<UserRole>(null);
    const [signupData, setSignupData] = useState<SignUpFormData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get signup data from sessionStorage
        const storedData = sessionStorage.getItem('signupData');
        if (storedData) {
            setSignupData(JSON.parse(storedData));
        } else {
            // If no signup data, redirect back to signup
            navigate('/auth');
        }
    }, [navigate]);

    const handleRoleSelection = async () => {
        if (!role || !signupData) {
            setError('Please select a role');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const registerData: RegisterRequest = {
                email: signupData.email,
                password: signupData.password,
                firstName: signupData.firstName,
                lastName: signupData.lastName,
                phone: signupData.phone,
                role: role.toUpperCase() as 'TENANT' | 'LANDLORD',
            };

            await authService.register(registerData);
            console.log('✅ Registration successful!');

            const loginResponse = await authService.login({
                identifier: signupData.email,
                password: signupData.password,
            });
            console.log('✅ Auto-login successful!', loginResponse);

            sessionStorage.removeItem('signupData');

            nextStep();
        } catch (err) {
            console.error('❌ Registration failed:', err);
            let errorMessage = 'Registration failed. Please try again.';
            if (axios.isAxiosError(err) && err.response?.data) {
                const data = err.response.data;
                // Show first specific field error if present, otherwise the general message
                if (Array.isArray(data.errors) && data.errors.length > 0) {
                    errorMessage = data.errors[0].message;
                } else if (data.message) {
                    errorMessage = data.message;
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    // handlers split for clarity
    const completeAsTenant = () => {
        navigate('/', { state: { next: '/tenant-home', force: true } });
    };

    const finishAsLandlord = () => {
        navigate('/', { state: { next: '/landlord-home', force: true } });
    };

    return (
        <div className="onboarding-viewport">
            <div className="onboarding-card">
                {/* Stepper Header */}
                <div className="stepper-nav">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className={`step-indicator ${step === num ? 'active' : step > num ? 'completed' : ''}`}>
                            {step > num ? <CheckCircle2 size={18} /> : <span>{num}</span>}
                        </div>
                    ))}
                </div>

                {/* Error Display */}
                {error && (
                    <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#fee', 
                        color: '#c00', 
                        borderRadius: '4px',
                        marginBottom: '16px',
                        fontSize: '14px',
                    }}>
                        {error}
                    </div>
                )}

                {/* STEP 1: GLOBAL DATA */}
                {step === 1 && (
                    <div className="step-fade-in">
                        <div className="section-title">
                            <h1>Create your identity</h1>
                            <p>Personalize your account to start connecting with the community.</p>
                        </div>

                        <div className="avatar-picker">
                            <div className="avatar-circle" onClick={() => fileInputRef.current?.click()}>
                                <UploadCloud size={28} />
                                <span>Add Photo</span>
                            </div>
                            <input type="file" ref={fileInputRef} hidden />
                        </div>

                        <div className="modern-form-grid">
                            <div className="form-field">
                                <label>Date of Birth</label>
                                <div className="input-wrapper">
                                    <Calendar className="input-icon" size={18} />
                                    <input type="date" />
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Gender (Optional)</label>
                                <select>
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>National ID / Passport</label>
                                <div className="input-wrapper">
                                    <IdCard className="input-icon" size={18} />
                                    <input type="text" placeholder="Document Number" />
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Preferred Language</label>
                                <div className="input-wrapper">
                                    <Globe className="input-icon" size={18} />
                                    <select>
                                        <option value="ar">Arabic (العربية)</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-field full">
                                <label>Current Location</label>
                                <div className="input-wrapper">
                                    <MapPin className="input-icon" size={18} />
                                    <input type="text" placeholder="City, Country" />
                                </div>
                            </div>
                            <div className="form-field full">
                                <label>About You</label>
                                <textarea placeholder="A short bio to introduce yourself..." rows={2}></textarea>
                            </div>
                        </div>

                        <div className="action-footer">
                            <button className="btn-continue" onClick={nextStep}>
                                Next Step <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: ROLE SELECTION */}
                {step === 2 && (
                    <div className="step-fade-in">
                        <div className="section-title center">
                            <h1>Choose your journey</h1>
                            <p>Are you looking for a home or managing properties?</p>
                        </div>

                        <div className="role-grid">
                            <div className={`role-option ${role === 'tenant' ? 'selected' : ''}`} onClick={() => setRole('tenant')}>
                                <div className="role-visual"><User size={32} /></div>
                                <h3>Tenant</h3>
                                <p>Finding my next dream rental</p>
                            </div>
                            <div className={`role-option ${role === 'landlord' ? 'selected' : ''}`} onClick={() => setRole('landlord')}>
                                <div className="role-visual"><Home size={32} /></div>
                                <h3>Landlord</h3>
                                <p>Listing and managing assets</p>
                            </div>
                        </div>

                        <div className="action-footer">
                            <button className="btn-back" onClick={prevStep} disabled={loading}>
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button 
                                className="btn-continue" 
                                disabled={!role || loading} 
                                onClick={handleRoleSelection}
                            >
                                {loading ? 'Creating Account...' : 'Continue'} <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3A: TENANT SPECIFIC */}
                {step === 3 && role === 'tenant' && (
                    <div className="step-fade-in">
                        <div className="section-title">
                            <h1>Rental Preferences</h1>
                            <p>This helps us find listings that match your lifestyle.</p>
                        </div>

                        <div className="modern-form-grid">
                            <div className="form-field">
                                <label>Employment</label>
                                <select>
                                    <option>Employed</option>
                                    <option>Self-employed</option>
                                    <option>Student</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Workplace / Uni</label>
                                <div className="input-wrapper">
                                    <Briefcase className="input-icon" size={16} />
                                    <input type="text" placeholder="Company/School" />
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Income Range</label>
                                <select>
                                    <option>&lt; $500</option>
                                    <option>$500 - $1500</option>
                                    <option>$1500+</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Move-in Date</label>
                                <input type="date" />
                            </div>
                            <div className="form-field">
                                <label>Property Type</label>
                                <select>
                                    <option>Apartment</option>
                                    <option>Villa</option>
                                    <option>Studio</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Duration</label>
                                <select>
                                    <option>6 Months</option>
                                    <option>1 Year</option>
                                    <option>Long-term</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Min Budget ($)</label>
                                <input type="number" placeholder="500" />
                            </div>
                            <div className="form-field">
                                <label>Max Budget ($)</label>
                                <input type="number" placeholder="2500" />
                            </div>
                        </div>

                        <div className="action-footer">
                            <button className="btn-back" onClick={prevStep}><ArrowLeft size={18} /> Back</button>
                            <button className="btn-finish" onClick={completeAsTenant}>Complete Profile</button>
                        </div>
                    </div>
                )}

                {/* STEP 3B: LANDLORD SPECIFIC */}
                {step === 3 && role === 'landlord' && (
                    <div className="step-fade-in">
                        <div className="section-title">
                            <h1>Business Profile</h1>
                            <p>Verified landlords receive 3x more high-quality inquiries.</p>
                        </div>

                        <div className="modern-form-grid">
                            <div className="form-field">
                                <label>Account Type</label>
                                <select>
                                    <option>Individual Owner</option>
                                    <option>Agency</option>
                                    <option>Company</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Company Name</label>
                                <input type="text" placeholder="Legal name" />
                            </div>
                            <div className="form-field">
                                <label>Total Properties</label>
                                <input type="number" placeholder="0" />
                            </div>
                            <div className="form-field">
                                <label>Years Experience</label>
                                <input type="number" placeholder="Ex: 5" />
                            </div>
                            <div className="form-field full">
                                <label>Business Address</label>
                                <div className="input-wrapper">
                                    <Building2 className="input-icon" size={16} />
                                    <input type="text" placeholder="Full address" />
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Payment Method</label>
                                <select>
                                    <option>Bank Transfer</option>
                                    <option>Cash</option>
                                    <option>Online Payment</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Availability</label>
                                <div className="input-wrapper">
                                    <Clock className="input-icon" size={16} />
                                    <input type="text" placeholder="e.g. 9AM - 5PM" />
                                </div>
                            </div>
                            <div className="form-field full">
                                <label>Ownership Proof (Deed/License)</label>
                                <div className="upload-zone">
                                    <ShieldCheck size={24} />
                                    <span>Click to upload verification documents</span>
                                </div>
                            </div>
                        </div>

                        <div className="action-footer">
                            <button className="btn-back" onClick={prevStep}><ArrowLeft size={18} /> Back</button>
                            <button className="btn-finish" onClick={finishAsLandlord}>Finish Setup</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompleteProfile;

// import React, { useState, useRef } from 'react';
// import { 
//   User, IdCard, Globe, MapPin, Briefcase, 
//   Home, Building2, UploadCloud, ArrowRight, ArrowLeft,
//   Calendar, Clock, ShieldCheck, CheckCircle2, Plus, Sparkles,
//   Mail, Phone, MessageSquare
// } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import './CompleteProfile.css';

// type UserRole = 'tenant' | 'landlord' | null;

// const PRESET_HABITS = [
//     "Early Riser", "Night Owl", "Non-smoker", "Very Clean", "Quiet Lifestyle", 
//     "Social", "Fitness Enthusiast", "Work from Home", "Student", "Pet Owner", 
//     "Vegan", "Musician", "Minimalist", "Plant Parent", "Frequent Traveler",
//     "Gamer", "Chef at Home", "Organized", "Eco-friendly", "Introverted"
// ];

// const PROPERTY_RANGES = ["1-2", "3-5", "6-10", "10+"];

// const CompleteProfile: React.FC = () => {
//     const [step, setStep] = useState(1);
//     const [role, setRole] = useState<UserRole>(null);
    
//     // Tenant States
//     const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
//     const [customHabit, setCustomHabit] = useState("");
    
//     // Landlord States
//     const [propertyRange, setPropertyRange] = useState<string>("1-2");

//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const navigate = useNavigate();

//     const totalSteps = role === 'tenant' ? 4 : 3;

//     const nextStep = () => setStep(prev => prev + 1);
//     const prevStep = () => setStep(prev => prev - 1);

//     const toggleHabit = (habit: string) => {
//         setSelectedHabits(prev => 
//             prev.includes(habit) ? prev.filter(h => h !== habit) : [...prev, habit]
//         );
//     };

//     const addCustomHabit = () => {
//         if (customHabit.trim() && !selectedHabits.includes(customHabit.trim())) {
//             setSelectedHabits([...selectedHabits, customHabit.trim()]);
//             setCustomHabit("");
//         }
//     };

//     const handleFinish = () => {
//         const path = role === 'tenant' ? '/tenant-home' : '/landlord-home';
//         navigate('/', { state: { next: path, force: true } });
//     };

//     return (
//         <div className="onboarding-viewport">
//             <div className="onboarding-card">
//                 {/* Stepper Header */}
//                 <div className="stepper-nav">
//                     {Array.from({ length: totalSteps }).map((_, i) => {
//                         const num = i + 1;
//                         return (
//                             <div key={num} className={`step-indicator ${step === num ? 'active' : step > num ? 'completed' : ''}`}>
//                                 {step > num ? <CheckCircle2 size={18} /> : <span>{num}</span>}
//                             </div>
//                         );
//                     })}
//                 </div>

//                 {/* STEP 1: GLOBAL IDENTITY */}
//                 {step === 1 && (
//                     <div className="step-fade-in">
//                         <div className="section-title">
//                             <h1>Create your identity</h1>
//                             <p>Personalize your account to start connecting with the community.</p>
//                         </div>

//                         <div className="avatar-picker">
//                             <div className="avatar-circle" onClick={() => fileInputRef.current?.click()}>
//                                 <UploadCloud size={28} />
//                                 <span>Add Photo</span>
//                             </div>
//                             <input type="file" ref={fileInputRef} hidden />
//                         </div>

//                         <div className="modern-form-grid">
//                             <div className="form-field">
//                                 <label>Date of Birth</label>
//                                 <div className="input-wrapper">
//                                     <Calendar className="input-icon" size={18} />
//                                     <input type="date" />
//                                 </div>
//                             </div>
//                             <div className="form-field">
//                                 <label>Gender (Optional)</label>
//                                 <select>
//                                     <option value="">Select...</option>
//                                     <option value="male">Male</option>
//                                     <option value="female">Female</option>
//                                 </select>
//                             </div>
//                             <div className="form-field">
//                                 <label>National ID / Passport</label>
//                                 <div className="input-wrapper">
//                                     <IdCard className="input-icon" size={18} />
//                                     <input type="text" placeholder="Document Number" />
//                                 </div>
//                             </div>
//                             <div className="form-field">
//                                 <label>Preferred Language</label>
//                                 <div className="input-wrapper">
//                                     <Globe className="input-icon" size={18} />
//                                     <select>
//                                         <option value="en">English</option>
//                                         <option value="ar">Arabic (العربية)</option>
//                                     </select>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="action-footer">
//                             <button className="btn-continue" onClick={nextStep}>
//                                 Next Step <ArrowRight size={18} />
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* STEP 2: ROLE SELECTION */}
//                 {step === 2 && (
//                     <div className="step-fade-in">
//                         <div className="section-title center">
//                             <h1>Choose your journey</h1>
//                             <p>Are you looking for a home or managing properties?</p>
//                         </div>

//                         <div className="role-grid">
//                             <div className={`role-option ${role === 'tenant' ? 'selected' : ''}`} onClick={() => setRole('tenant')}>
//                                 <div className="role-visual"><User size={32} /></div>
//                                 <h3>Tenant</h3>
//                                 <p>Finding my next dream rental</p>
//                             </div>
//                             <div className={`role-option ${role === 'landlord' ? 'selected' : ''}`} onClick={() => setRole('landlord')}>
//                                 <div className="role-visual"><Home size={32} /></div>
//                                 <h3>Landlord</h3>
//                                 <p>Listing and managing assets</p>
//                             </div>
//                         </div>

//                         <div className="action-footer">
//                             <button className="btn-back" onClick={prevStep}><ArrowLeft size={18} /> Back</button>
//                             <button className="btn-continue" disabled={!role} onClick={nextStep}>
//                                 Continue <ArrowRight size={18} />
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* STEP 3 (LANDLORD): BUSINESS & CONTACT */}
//                 {step === 3 && role === 'landlord' && (
//                     <div className="step-fade-in">
//                         <div className="section-title">
//                             <h1>Landlord Profile</h1>
//                             <p>Set up your professional presence and contact details.</p>
//                         </div>

//                         <div className="modern-form-grid">
//                             <div className="form-field">
//                                 <label>Account Type</label>
//                                 <select>
//                                     <option>Individual Owner</option>
//                                     <option>Agency</option>
//                                     <option>Property Manager</option>
//                                 </select>
//                             </div>

//                             <div className="form-field">
//                                 <label>Properties Managed</label>
//                                 <div className="range-selector">
//                                     {PROPERTY_RANGES.map(range => (
//                                         <button 
//                                             key={range} 
//                                             className={`range-btn ${propertyRange === range ? 'active' : ''}`}
//                                             onClick={() => setPropertyRange(range)}
//                                         >
//                                             {range}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="form-field">
//                                 <label>Office / Contact Address</label>
//                                 <div className="input-wrapper">
//                                     <MapPin className="input-icon" size={16} />
//                                     <input type="text" placeholder="St, Building, City" />
//                                 </div>
//                             </div>

//                             <div className="form-field">
//                                 <label>Years of Exp. (Optional)</label>
//                                 <input type="number" placeholder="Ex: 5" />
//                             </div>

//                             <div className="form-field full">
//                                 <label>Landlord Bio</label>
//                                 <textarea placeholder="Tell tenants about your management style or company history..." rows={3}></textarea>
//                             </div>

//                             <div className="contact-preferences-box full">
//                                 <h3>Contact Information</h3>
//                                 <div className="contact-grid">
//                                     <div className="input-wrapper">
//                                         <Mail className="input-icon" size={16} />
//                                         <input type="email" placeholder="Public Email" />
//                                     </div>
//                                     <div className="input-wrapper">
//                                         <Phone className="input-icon" size={16} />
//                                         <input type="tel" placeholder="Phone Number" />
//                                     </div>
//                                     <div className="input-wrapper">
//                                         <MessageSquare className="input-icon" size={16} />
//                                         <input type="tel" placeholder="WhatsApp Number" />
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="form-field full">
//                                 <label>Identity & Ownership Verification</label>
//                                 <div className="upload-zone">
//                                     <ShieldCheck size={24} />
//                                     <span>Upload Property Deed or Commercial License</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="action-footer">
//                             <button className="btn-back" onClick={prevStep}><ArrowLeft size={18} /> Back</button>
//                             <button className="btn-finish" onClick={handleFinish}>Finish Setup</button>
//                         </div>
//                     </div>
//                 )}

//                 {/* STEP 3 (TENANT): PREFERENCES */}
//                 {step === 3 && role === 'tenant' && (
//                     <div className="step-fade-in">
//                         <div className="section-title">
//                             <h1>Rental Preferences</h1>
//                             <p>Help us find listings that match your lifestyle.</p>
//                         </div>
//                         <div className="modern-form-grid">
//                             <div className="form-field">
//                                 <label>Employment</label>
//                                 <select>
//                                     <option>Employed</option>
//                                     <option>Self-employed</option>
//                                     <option>Student</option>
//                                 </select>
//                             </div>
//                             <div className="form-field">
//                                 <label>Workplace / Uni</label>
//                                 <div className="input-wrapper">
//                                     <Briefcase className="input-icon" size={16} />
//                                     <input type="text" placeholder="Company/School" />
//                                 </div>
//                             </div>
//                             <div className="form-field">
//                                 <label>Income Range</label>
//                                 <select>
//                                     <option>&lt; $500</option>
//                                     <option>$500 - $1500</option>
//                                     <option>$1500+</option>
//                                 </select>
//                             </div>
//                             <div className="form-field">
//                                 <label>Move-in Date</label>
//                                 <input type="date" />
//                             </div>
//                             <div className="form-field">
//                                 <label>Min Budget ($)</label>
//                                 <input type="number" placeholder="500" />
//                             </div>
//                             <div className="form-field">
//                                 <label>Max Budget ($)</label>
//                                 <input type="number" placeholder="2500" />
//                             </div>
//                         </div>
//                         <div className="action-footer">
//                             <button className="btn-back" onClick={prevStep}><ArrowLeft size={18} /> Back</button>
//                             <button className="btn-continue" onClick={nextStep}>
//                                 Next: Habits <ArrowRight size={18} />
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* STEP 4 (TENANT): HABITS */}
//                 {step === 4 && role === 'tenant' && (
//                     <div className="step-fade-in">
//                         <div className="section-title">
//                             <h1>Lifestyle & Habits</h1>
//                             <p>Select tags that describe you.</p>
//                         </div>

//                         <div className="habits-container">
//                             <div className="habits-selection-grid">
//                                 {PRESET_HABITS.map(habit => (
//                                     <button 
//                                         key={habit} 
//                                         className={`habit-tag ${selectedHabits.includes(habit) ? 'active' : ''}`}
//                                         onClick={() => toggleHabit(habit)}
//                                     >
//                                         {habit}
//                                         {selectedHabits.includes(habit) && <Sparkles size={12} className="ml-1" />}
//                                     </button>
//                                 ))}
//                             </div>

//                             <div className="custom-habit-group">
//                                 <label>Something else?</label>
//                                 <div className="input-wrapper">
//                                     <input 
//                                         type="text" 
//                                         value={customHabit}
//                                         onChange={(e) => setCustomHabit(e.target.value)}
//                                         placeholder="Add custom tag..." 
//                                     />
//                                     <button className="add-habit-btn" onClick={addCustomHabit}>
//                                         <Plus size={18} />
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="action-footer">
//                             <button className="btn-back" onClick={prevStep}><ArrowLeft size={18} /> Back</button>
//                             <button className="btn-finish" onClick={handleFinish} disabled={selectedHabits.length === 0}>
//                                 Complete Profile
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default CompleteProfile;