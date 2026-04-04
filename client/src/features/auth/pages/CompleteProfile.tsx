import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    User, IdCard, Globe,
    Home, Building2, UploadCloud, ArrowRight, ArrowLeft,
    Calendar, Clock, ShieldCheck, CheckCircle2,
    Briefcase,
} from 'lucide-react';
import axios from 'axios';
import './CompleteProfile.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import type { Gender, RegisterRequest } from '../../../types/auth.types';

type UserRole = 'tenant' | 'landlord' | null;

interface SignUpFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
}

interface Step1Draft {
    birthdate: string;
    gender: Gender | '';
    nationalId: string;
    preferredLanguage: string;
}

interface TenantStep3Draft {
    employment: string;
    workplace: string;
    incomeRange: string;
    moveInDate: string;
    propertyType: string;
    duration: string;
    budgetMin: string;
    budgetMax: string;
}

interface LandlordStep3Draft {
    accountType: string;
    companyName: string;
    totalProperties: string;
    yearsExperience: string;
    businessAddress: string;
    paymentMethod: string;
    availability: string;
}

const STEP1_SESSION_KEY = 'homi_completeProfile_step1';

function step1LocalKey(userId: string): string {
    return `homi_completeProfile_step1_${userId}`;
}

function step3SkippedKey(userId: string): string {
    return `homi_step3_skipped_${userId}`;
}

function step3DraftKey(userId: string): string {
    return `homi_completeProfile_step3_draft_${userId}`;
}

function formatDateForInput(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = String(iso).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '';
}

const defaultStep1 = (): Step1Draft => ({
    birthdate: '',
    gender: '',
    nationalId: '',
    preferredLanguage: 'en',
});

const defaultTenantStep3 = (): TenantStep3Draft => ({
    employment: '',
    workplace: '',
    incomeRange: '',
    moveInDate: '',
    propertyType: '',
    duration: '',
    budgetMin: '',
    budgetMax: '',
});

const defaultLandlordStep3 = (): LandlordStep3Draft => ({
    accountType: '',
    companyName: '',
    totalProperties: '',
    yearsExperience: '',
    businessAddress: '',
    paymentMethod: '',
    availability: '',
});

function loadStep1Draft(userId: string | undefined): Step1Draft {
    const d = defaultStep1();
    try {
        const s = sessionStorage.getItem(STEP1_SESSION_KEY);
        if (s) Object.assign(d, JSON.parse(s) as Partial<Step1Draft>);
    } catch {
        /* ignore */
    }
    if (userId) {
        try {
            const loc = localStorage.getItem(step1LocalKey(userId));
            if (loc) Object.assign(d, JSON.parse(loc) as Partial<Step1Draft>);
        } catch {
            /* ignore */
        }
    }
    return d;
}

function persistStep1Draft(draft: Step1Draft): void {
    const json = JSON.stringify(draft);
    sessionStorage.setItem(STEP1_SESSION_KEY, json);
    const uid = authService.getCurrentUser()?.user?.id;
    if (uid) localStorage.setItem(step1LocalKey(uid), json);
}

function copyStep1SessionToLocal(userId: string): void {
    const s = sessionStorage.getItem(STEP1_SESSION_KEY);
    if (s) localStorage.setItem(step1LocalKey(userId), s);
}

function clearStep1Draft(userId: string | undefined): void {
    sessionStorage.removeItem(STEP1_SESSION_KEY);
    if (userId) localStorage.removeItem(step1LocalKey(userId));
}

function validateTenantStep3(t: TenantStep3Draft): string | null {
    if (!t.employment.trim()) return 'Please select employment.';
    if (!t.workplace.trim()) return 'Please enter workplace or university.';
    if (!t.incomeRange.trim()) return 'Please select income range.';
    if (!t.moveInDate.trim()) return 'Please choose a move-in date.';
    if (!t.propertyType.trim()) return 'Please select property type.';
    if (!t.duration.trim()) return 'Please select duration.';
    if (!t.budgetMin.trim() || !t.budgetMax.trim()) return 'Please enter minimum and maximum budget.';
    const min = Number(t.budgetMin);
    const max = Number(t.budgetMax);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0) {
        return 'Budget values must be valid numbers greater than zero.';
    }
    if (min > max) return 'Minimum budget cannot be greater than maximum budget.';
    return null;
}

function validateLandlordStep3(t: LandlordStep3Draft): string | null {
    if (!t.accountType.trim()) return 'Please select account type.';
    if (!t.companyName.trim()) return 'Please enter company or legal name.';
    if (!t.totalProperties.trim()) return 'Please enter total properties.';
    const tp = Number(t.totalProperties);
    if (!Number.isFinite(tp) || tp < 0) return 'Total properties must be a valid number (0 or more).';
    if (!t.yearsExperience.trim()) return 'Please enter years of experience.';
    const ye = Number(t.yearsExperience);
    if (!Number.isFinite(ye) || ye < 0) return 'Years of experience must be a valid number (0 or more).';
    if (!t.businessAddress.trim()) return 'Please enter business address.';
    if (!t.paymentMethod.trim()) return 'Please select payment method.';
    if (!t.availability.trim()) return 'Please enter availability.';
    return null;
}

const CompleteProfile: React.FC = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<UserRole>(null);
    const [signupData, setSignupData] = useState<SignUpFormData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step1, setStep1] = useState<Step1Draft>(defaultStep1);
    const [tenantStep3, setTenantStep3] = useState<TenantStep3Draft>(defaultTenantStep3);
    const [landlordStep3, setLandlordStep3] = useState<LandlordStep3Draft>(defaultLandlordStep3);

    const navigate = useNavigate();
    const location = useLocation();

    const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [settingsOnlyFlow, setSettingsOnlyFlow] = useState(false);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const locState = location.state as {
                step?: number;
                role?: string;
                /** When true with step 3, back navigation stays in settings-only flow (step 2 ↔ 3). */
                fromSettings?: boolean;
            } | null;

            const isAuthed = authService.isAuthenticated();
            if (isAuthed) {
                try {
                    await authService.getProfile();
                } catch {
                    /* ignore */
                }
            }

            if (cancelled) return;

            const cached = authService.getCurrentUser();

            if (locState?.step === 3) {
                setSettingsOnlyFlow(!!locState.fromSettings);
                setStep(3);
                const r = (locState.role || cached?.user?.role || 'TENANT').toString().toUpperCase();
                setRole(r === 'LANDLORD' ? 'landlord' : 'tenant');
                if (cached) {
                    setAlreadyLoggedIn(true);
                    setSignupData({
                        email: cached.user.email,
                        password: '',
                        firstName: cached.profile?.firstName || '',
                        lastName: cached.profile?.lastName || '',
                        phone: cached.profile?.phoneNumber || '',
                    });
                }
                const uid = cached?.user?.id;
                if (uid) {
                    try {
                        const d = localStorage.getItem(step3DraftKey(uid));
                        if (d) {
                            const parsed = JSON.parse(d) as {
                                tenant?: TenantStep3Draft;
                                landlord?: LandlordStep3Draft;
                            };
                            if (parsed.tenant) setTenantStep3({ ...defaultTenantStep3(), ...parsed.tenant });
                            if (parsed.landlord) setLandlordStep3({ ...defaultLandlordStep3(), ...parsed.landlord });
                        }
                    } catch {
                        /* ignore */
                    }
                }
                setHydrated(true);
                return;
            }

            const storedData = sessionStorage.getItem('signupData');
            if (storedData) {
                setSignupData(JSON.parse(storedData) as SignUpFormData);
                setAlreadyLoggedIn(false);
                setSettingsOnlyFlow(false);
                setStep1(loadStep1Draft(undefined));
                setHydrated(true);
                return;
            }

            if (cached) {
                setAlreadyLoggedIn(true);
                setSignupData({
                    email: cached.user.email,
                    password: '',
                    firstName: cached.profile?.firstName || '',
                    lastName: cached.profile?.lastName || '',
                    phone: cached.profile?.phoneNumber || '',
                });

                const hasAppRole = cached.user.role === 'LANDLORD' || cached.user.role === 'TENANT';
                const idDone = !!cached.profile?.isVerificationComplete;

                if (locState?.fromSettings && idDone && hasAppRole) {
                    setSettingsOnlyFlow(true);
                    setStep(3);
                    setRole(cached.user.role === 'LANDLORD' ? 'landlord' : 'tenant');
                    const uid = cached.user.id;
                    try {
                        const d = localStorage.getItem(step3DraftKey(uid));
                        if (d) {
                            const parsed = JSON.parse(d) as {
                                tenant?: TenantStep3Draft;
                                landlord?: LandlordStep3Draft;
                            };
                            if (parsed.tenant) setTenantStep3({ ...defaultTenantStep3(), ...parsed.tenant });
                            if (parsed.landlord) setLandlordStep3({ ...defaultLandlordStep3(), ...parsed.landlord });
                        }
                    } catch {
                        /* ignore */
                    }
                    if (cached.profile?.preferredBudgetMin != null) {
                        setTenantStep3((t) => ({
                            ...t,
                            budgetMin: String(cached.profile!.preferredBudgetMin),
                        }));
                    }
                    if (cached.profile?.preferredBudgetMax != null) {
                        setTenantStep3((t) => ({
                            ...t,
                            budgetMax: String(cached.profile!.preferredBudgetMax),
                        }));
                    }
                    setHydrated(true);
                    return;
                }

                setSettingsOnlyFlow(false);
                const merged = loadStep1Draft(cached.user.id);
                if (!merged.birthdate) merged.birthdate = formatDateForInput(cached.profile?.birthdate);
                if (!merged.gender) merged.gender = (cached.profile?.gender as Gender | '') || '';
                setStep1(merged);

                if (cached.profile?.preferredBudgetMin != null) {
                    setTenantStep3((t) => ({
                        ...t,
                        budgetMin: String(cached.profile.preferredBudgetMin),
                    }));
                }
                if (cached.profile?.preferredBudgetMax != null) {
                    setTenantStep3((t) => ({
                        ...t,
                        budgetMax: String(cached.profile.preferredBudgetMax),
                    }));
                }

                setHydrated(true);
                return;
            }

            navigate('/auth');
            setHydrated(true);
        })();

        return () => {
            cancelled = true;
        };
    }, [navigate, location.state]);

    const userId = authService.getCurrentUser()?.user?.id;

    useEffect(() => {
        if (step !== 3 || !userId) return;
        try {
            localStorage.setItem(
                step3DraftKey(userId),
                JSON.stringify({ tenant: tenantStep3, landlord: landlordStep3 })
            );
        } catch {
            /* ignore */
        }
    }, [step, userId, tenantStep3, landlordStep3]);

    useEffect(() => {
        if (step !== 2 || role !== null) return;
        const r = authService.getCurrentUser()?.user?.role;
        if (r === 'LANDLORD') setRole('landlord');
        else if (r === 'TENANT') setRole('tenant');
    }, [step, role]);

    const validateStep1 = (draft: Step1Draft, verificationComplete: boolean): string | null => {
        if (!draft.birthdate.trim()) return 'Please enter your date of birth.';
        if (!draft.gender) return 'Please select a gender.';
        if (!verificationComplete && !draft.nationalId.trim()) return 'Please enter your National ID or passport number.';
        return null;
    };

    const goNextFromStep1 = () => {
        const cached = authService.getCurrentUser();
        const verificationComplete = !!cached?.profile?.isVerificationComplete;
        const msg = validateStep1(step1, verificationComplete);
        if (msg) {
            setError(msg);
            return;
        }
        setError(null);
        persistStep1Draft(step1);
        setStep(2);
    };

    const handleRoleSelection = async () => {
        if (!role) {
            setError('Please select a role');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let userEmail = signupData?.email;

            if (alreadyLoggedIn) {
                await authService.updateRole({ role: role.toUpperCase() });
                await authService.getProfile();
                userEmail = signupData?.email || authService.getCurrentUser()?.user?.email;
                const u = authService.getCurrentUser()?.user;
                if (u?.emailVerified && role) {
                    navigate('/complete-profile', {
                        replace: true,
                        state: {
                            step: 3,
                            role: role as 'tenant' | 'landlord',
                            ...(settingsOnlyFlow ? { fromSettings: true } : {}),
                        },
                    });
                    return;
                }
            } else if (signupData) {
                const registerData: RegisterRequest = {
                    email: signupData.email,
                    password: signupData.password,
                    firstName: signupData.firstName,
                    lastName: signupData.lastName,
                    phone: signupData.phone,
                    role: role.toUpperCase() as 'TENANT' | 'LANDLORD',
                };

                await authService.register(registerData);
                await authService.login({
                    identifier: signupData.email,
                    password: signupData.password,
                });
                sessionStorage.removeItem('signupData');

                userEmail = signupData.email;

                const newUid = authService.getCurrentUser()?.user?.id;
                if (newUid) copyStep1SessionToLocal(newUid);

                try {
                    await authService.sendVerificationEmail();
                } catch {
                    console.warn('Could not send verification email automatically');
                }
            }

            navigate('/verify-email', {
                state: {
                    email: userEmail,
                    returnUrl: '/complete-profile',
                    step: 3,
                    role,
                },
            });
        } catch (err) {
            console.error('❌ Registration failed:', err);
            let errorMessage = 'Registration failed. Please try again.';
            if (axios.isAxiosError(err) && err.response?.data) {
                const data = err.response.data;
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

    const goBack = () => {
        setError(null);
        if (settingsOnlyFlow) {
            if (step === 3) setStep(2);
            else navigate('/settings');
            return;
        }
        if (step > 1) setStep((s) => s - 1);
    };

    const handleStep3Skip = () => {
        const uid = authService.getCurrentUser()?.user?.id;
        if (uid) localStorage.setItem(step3SkippedKey(uid), '1');
        const home = role === 'landlord' ? '/landlord-home' : '/tenant-home';
        navigate('/', { state: { next: home, force: true }, replace: true });
    };

    const submitTenantProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const v = validateTenantStep3(tenantStep3);
            if (v) {
                setError(v);
                return;
            }

            const cached = authService.getCurrentUser();
            if (!cached) {
                setError('Session expired. Please sign in again.');
                return;
            }

            const uid = cached.user.id;
            const s1 = loadStep1Draft(uid);

            if (!cached.profile.isVerificationComplete) {
                const msg = validateStep1(s1, false);
                if (msg) {
                    setError(msg);
                    return;
                }
                await authService.completeVerification({
                    nationalId: s1.nationalId.trim(),
                    gender: s1.gender as Gender,
                    birthdate: s1.birthdate,
                });
            }

            const min = Number(tenantStep3.budgetMin);
            const max = Number(tenantStep3.budgetMax);
            await authService.updateProfile({
                preferredBudgetMin: min,
                preferredBudgetMax: max,
            });

            localStorage.removeItem(step3SkippedKey(uid));
            localStorage.removeItem(step3DraftKey(uid));
            clearStep1Draft(uid);

            await authService.getProfile();

            navigate('/', { state: { next: '/tenant-home', force: true }, replace: true });
        } catch (err) {
            console.error(err);
            let errorMessage = 'Could not save your profile. Please try again.';
            if (axios.isAxiosError(err) && err.response?.data) {
                const data = err.response.data as { message?: string; code?: string };
                if (data.code === 'ALREADY_VERIFIED' || data.code === 'EMAIL_NOT_VERIFIED') {
                    errorMessage = data.message || errorMessage;
                } else if (data.message) errorMessage = data.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const submitLandlordProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const v = validateLandlordStep3(landlordStep3);
            if (v) {
                setError(v);
                return;
            }

            const cached = authService.getCurrentUser();
            if (!cached) {
                setError('Session expired. Please sign in again.');
                return;
            }

            const uid = cached.user.id;
            const s1 = loadStep1Draft(uid);

            if (!cached.profile.isVerificationComplete) {
                const msg = validateStep1(s1, false);
                if (msg) {
                    setError(msg);
                    return;
                }
                await authService.completeVerification({
                    nationalId: s1.nationalId.trim(),
                    gender: s1.gender as Gender,
                    birthdate: s1.birthdate,
                });
            }

            localStorage.removeItem(step3SkippedKey(uid));
            localStorage.removeItem(step3DraftKey(uid));
            clearStep1Draft(uid);

            await authService.getProfile();

            navigate('/', { state: { next: '/landlord-home', force: true }, replace: true });
        } catch (err) {
            console.error(err);
            let errorMessage = 'Could not save your profile. Please try again.';
            if (axios.isAxiosError(err) && err.response?.data) {
                const data = err.response.data as { message?: string };
                if (data.message) errorMessage = data.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const stepIndicator = useCallback(
        (num: number) => {
            if (!settingsOnlyFlow) {
                const completed = step > num;
                const active = step === num;
                return { completed, active };
            }
            if (num === 1) return { completed: true, active: false };
            if (num === 2) return { completed: step === 3, active: step === 2 };
            return { completed: false, active: step === 3 };
        },
        [settingsOnlyFlow, step]
    );

    if (!hydrated) {
        return (
            <div className="onboarding-viewport">
                <div className="onboarding-card" style={{ textAlign: 'center', padding: 48 }}>
                    <p style={{ color: '#94a3b8' }}>Loading…</p>
                </div>
            </div>
        );
    }

    const req = <span style={{ color: '#dc2626' }}>*</span>;

    return (
        <div className="onboarding-viewport">
            <div className="onboarding-card">
                <div className="stepper-nav">
                    {[1, 2, 3].map((num) => {
                        const { completed, active } = stepIndicator(num);
                        return (
                            <div
                                key={num}
                                className={`step-indicator ${active ? 'active' : completed ? 'completed' : ''}`}
                            >
                                {completed && !active ? <CheckCircle2 size={18} /> : <span>{num}</span>}
                            </div>
                        );
                    })}
                </div>

                {error && (
                    <div
                        style={{
                            padding: '12px',
                            backgroundColor: '#fee',
                            color: '#c00',
                            borderRadius: '4px',
                            marginBottom: '16px',
                            fontSize: '14px',
                        }}
                    >
                        {error}
                    </div>
                )}

                {!settingsOnlyFlow && step === 1 && (
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
                                <label>Date of Birth {req}</label>
                                <div className="input-wrapper">
                                    <Calendar className="input-icon" size={18} />
                                    <input
                                        type="date"
                                        value={step1.birthdate}
                                        onChange={(e) => setStep1((s) => ({ ...s, birthdate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Gender {req}</label>
                                <select
                                    value={step1.gender}
                                    onChange={(e) =>
                                        setStep1((s) => ({ ...s, gender: e.target.value as Gender | '' }))
                                    }
                                >
                                    <option value="">Select…</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="PREFER_NOT_TO_SAY">Preferred not to say</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>National ID / Passport {req}</label>
                                <div className="input-wrapper">
                                    <IdCard className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Document number"
                                        value={step1.nationalId}
                                        onChange={(e) => setStep1((s) => ({ ...s, nationalId: e.target.value }))}
                                        disabled={!!authService.getCurrentUser()?.profile?.isVerificationComplete}
                                        title={
                                            authService.getCurrentUser()?.profile?.isVerificationComplete
                                                ? 'Verified ID cannot be changed here'
                                                : undefined
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Preferred Language</label>
                                <div className="input-wrapper">
                                    <Globe className="input-icon" size={18} />
                                    <select
                                        value={step1.preferredLanguage}
                                        onChange={(e) =>
                                            setStep1((s) => ({ ...s, preferredLanguage: e.target.value }))
                                        }
                                    >
                                        <option value="ar">Arabic (العربية)</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="action-footer">
                            <button className="btn-continue" onClick={goNextFromStep1}>
                                Next Step <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-fade-in">
                        <div className="section-title center">
                            <h1>Choose your journey</h1>
                            <p>Are you looking for a home or managing properties?</p>
                        </div>

                        <div className="role-grid">
                            <div
                                className={`role-option ${role === 'tenant' ? 'selected' : ''}`}
                                onClick={() => setRole('tenant')}
                            >
                                <div className="role-visual">
                                    <User size={32} />
                                </div>
                                <h3>Tenant</h3>
                                <p>Finding my next dream rental</p>
                            </div>
                            <div
                                className={`role-option ${role === 'landlord' ? 'selected' : ''}`}
                                onClick={() => setRole('landlord')}
                            >
                                <div className="role-visual">
                                    <Home size={32} />
                                </div>
                                <h3>Landlord</h3>
                                <p>Listing and managing assets</p>
                            </div>
                        </div>

                        <div className="action-footer">
                            <button className="btn-back" onClick={goBack} disabled={loading}>
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button className="btn-continue" disabled={!role || loading} onClick={handleRoleSelection}>
                                {loading ? 'Saving…' : 'Continue'} <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && role === 'tenant' && (
                    <div className="step-fade-in">
                        <div className="section-title">
                            <h1>Rental Preferences</h1>
                            <p>This helps us find listings that match your lifestyle.</p>
                        </div>

                        <div className="modern-form-grid">
                            <div className="form-field">
                                <label>Employment {req}</label>
                                <select
                                    value={tenantStep3.employment}
                                    onChange={(e) =>
                                        setTenantStep3((s) => ({ ...s, employment: e.target.value }))
                                    }
                                >
                                    <option value="" disabled>
                                        Select…
                                    </option>
                                    <option value="Employed">Employed</option>
                                    <option value="Self-employed">Self-employed</option>
                                    <option value="Student">Student</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Workplace / Uni {req}</label>
                                <div className="input-wrapper">
                                    <Briefcase className="input-icon" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Company/School"
                                        value={tenantStep3.workplace}
                                        onChange={(e) =>
                                            setTenantStep3((s) => ({ ...s, workplace: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Income range {req}</label>
                                <select
                                    value={tenantStep3.incomeRange}
                                    onChange={(e) =>
                                        setTenantStep3((s) => ({ ...s, incomeRange: e.target.value }))
                                    }
                                >
                                    <option value="" disabled>
                                        Select…
                                    </option>
                                    <option value="< $500">&lt; $500</option>
                                    <option value="$500 - $1500">$500 - $1500</option>
                                    <option value="$1500+">$1500+</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Move-in Date {req}</label>
                                <input
                                    type="date"
                                    value={tenantStep3.moveInDate}
                                    onChange={(e) =>
                                        setTenantStep3((s) => ({ ...s, moveInDate: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="form-field">
                                <label>Property Type {req}</label>
                                <select
                                    value={tenantStep3.propertyType}
                                    onChange={(e) =>
                                        setTenantStep3((s) => ({ ...s, propertyType: e.target.value }))
                                    }
                                >
                                    <option value="" disabled>
                                        Select…
                                    </option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Villa">Villa</option>
                                    <option value="Studio">Studio</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Duration {req}</label>
                                <select
                                    value={tenantStep3.duration}
                                    onChange={(e) =>
                                        setTenantStep3((s) => ({ ...s, duration: e.target.value }))
                                    }
                                >
                                    <option value="" disabled>
                                        Select…
                                    </option>
                                    <option value="6 Months">6 Months</option>
                                    <option value="1 Year">1 Year</option>
                                    <option value="Long-term">Long-term</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Min Budget ($) {req}</label>
                                <input
                                    type="number"
                                    placeholder="500"
                                    value={tenantStep3.budgetMin}
                                    onChange={(e) =>
                                        setTenantStep3((s) => ({ ...s, budgetMin: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="form-field">
                                <label>Max Budget ($) {req}</label>
                                <input
                                    type="number"
                                    placeholder="2500"
                                    value={tenantStep3.budgetMax}
                                    onChange={(e) =>
                                        setTenantStep3((s) => ({ ...s, budgetMax: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="action-footer">
                            <button className="btn-back" onClick={goBack} disabled={loading}>
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button className="btn-finish" onClick={() => void submitTenantProfile()} disabled={loading}>
                                {loading ? 'Saving…' : 'Complete Profile'}
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <button
                                type="button"
                                onClick={handleStep3Skip}
                                disabled={loading}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    textDecoration: 'underline',
                                    textUnderlineOffset: 3,
                                }}
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && role === 'landlord' && (
                    <div className="step-fade-in">
                        <div className="section-title">
                            <h1>Business Profile</h1>
                            <p>Verified landlords receive more high-quality inquiries.</p>
                        </div>

                        <div className="modern-form-grid">
                            <div className="form-field">
                                <label>Account Type {req}</label>
                                <select
                                    value={landlordStep3.accountType}
                                    onChange={(e) =>
                                        setLandlordStep3((s) => ({ ...s, accountType: e.target.value }))
                                    }
                                >
                                    <option value="" disabled>
                                        Select…
                                    </option>
                                    <option value="Individual Owner">Individual Owner</option>
                                    <option value="Agency">Agency</option>
                                    <option value="Company">Company</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Company Name {req}</label>
                                <input
                                    type="text"
                                    placeholder="Legal name or &quot;Individual&quot;"
                                    value={landlordStep3.companyName}
                                    onChange={(e) =>
                                        setLandlordStep3((s) => ({ ...s, companyName: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="form-field">
                                <label>Total Properties {req}</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    min={0}
                                    value={landlordStep3.totalProperties}
                                    onChange={(e) =>
                                        setLandlordStep3((s) => ({ ...s, totalProperties: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="form-field">
                                <label>Years Experience {req}</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 5"
                                    min={0}
                                    value={landlordStep3.yearsExperience}
                                    onChange={(e) =>
                                        setLandlordStep3((s) => ({ ...s, yearsExperience: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="form-field full">
                                <label>Business Address {req}</label>
                                <div className="input-wrapper">
                                    <Building2 className="input-icon" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Full address"
                                        value={landlordStep3.businessAddress}
                                        onChange={(e) =>
                                            setLandlordStep3((s) => ({ ...s, businessAddress: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Payment Method {req}</label>
                                <select
                                    value={landlordStep3.paymentMethod}
                                    onChange={(e) =>
                                        setLandlordStep3((s) => ({ ...s, paymentMethod: e.target.value }))
                                    }
                                >
                                    <option value="" disabled>
                                        Select…
                                    </option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Online Payment">Online Payment</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Availability {req}</label>
                                <div className="input-wrapper">
                                    <Clock className="input-icon" size={16} />
                                    <input
                                        type="text"
                                        placeholder="e.g. 9AM - 5PM"
                                        value={landlordStep3.availability}
                                        onChange={(e) =>
                                            setLandlordStep3((s) => ({ ...s, availability: e.target.value }))
                                        }
                                    />
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
                            <button className="btn-back" onClick={goBack} disabled={loading}>
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button className="btn-finish" onClick={() => void submitLandlordProfile()} disabled={loading}>
                                {loading ? 'Saving…' : 'Finish Setup'}
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <button
                                type="button"
                                onClick={handleStep3Skip}
                                disabled={loading}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    textDecoration: 'underline',
                                    textUnderlineOffset: 3,
                                }}
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompleteProfile;
