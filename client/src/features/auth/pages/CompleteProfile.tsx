import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    User, IdCard, Globe,
    Home, Building2, UploadCloud, ArrowRight, ArrowLeft,
    Calendar, Clock, CheckCircle2,
    Briefcase, LogOut,
} from 'lucide-react';
import axios from 'axios';
import './CompleteProfile.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import type { Gender } from '../../../types/auth.types';

type UserRole = 'tenant' | 'landlord' | null;

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
    availability: string;
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
    availability: '',
});

type CachedProfile = NonNullable<ReturnType<typeof authService.getCurrentUser>>['profile'];

function hydrateStep1FromProfile(profile: CachedProfile | null | undefined): Step1Draft {
    const d = defaultStep1();
    if (!profile) return d;
    d.birthdate = formatDateForInput(profile.birthdate);
    d.gender = (profile.gender as Gender | '') || '';
    d.nationalId = '';
    d.preferredLanguage = profile.preferredLanguage || 'en';
    return d;
}

function tenantPrefsFromProfile(profile: CachedProfile | null | undefined): Partial<TenantStep3Draft> {
    const out: Partial<TenantStep3Draft> = {};
    if (!profile) return out;
    const raw = profile.tenantRentalPreferences;
    if (raw && typeof raw === 'object') {
        const o = raw as Record<string, unknown>;
        const s = (v: unknown) => (typeof v === 'string' ? v : '');
        out.employment = s(o.employment);
        out.workplace = s(o.workplace);
        out.incomeRange = s(o.incomeRange);
        out.moveInDate = s(o.moveInDate);
        out.propertyType = s(o.propertyType);
        out.duration = s(o.duration);
    }
    if (profile.preferredBudgetMin != null) out.budgetMin = String(profile.preferredBudgetMin);
    if (profile.preferredBudgetMax != null) out.budgetMax = String(profile.preferredBudgetMax);
    return out;
}

function landlordBizFromProfile(profile: CachedProfile | null | undefined): Partial<LandlordStep3Draft> {
    const out: Partial<LandlordStep3Draft> = {};
    if (!profile) return out;
    const raw = profile.landlordBusinessProfile;
    if (raw && typeof raw === 'object') {
        const o = raw as Record<string, unknown>;
        const s = (v: unknown) => (typeof v === 'string' ? v : '');
        const n = (v: unknown) => (typeof v === 'number' ? String(v) : typeof v === 'string' ? v : '');
        out.accountType = s(o.accountType);
        out.companyName = s(o.companyName);
        out.totalProperties = n(o.totalProperties);
        out.yearsExperience = n(o.yearsExperience);
        out.availability = s(o.availability);
    }
    if (profile.bio) out.businessAddress = profile.bio;
    return out;
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
    if (!t.availability.trim()) return 'Please enter availability.';
    return null;
}

const CompleteProfile: React.FC = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<UserRole>(null);
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
                fromSettings?: boolean;
                initialStep?: number;
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
            const profile = cached?.profile;
            const emailVerified = cached?.user?.emailVerified ?? false;

            if (
                isAuthed &&
                cached &&
                !locState?.fromSettings &&
                !locState?.step &&
                !locState?.initialStep
            ) {
                const step2Done = profile?.onboardingStep2Completed === true;
                const onboardingDone =
                    profile?.onboardingStep3Completed === true || profile?.onboardingStep3Skipped === true;
                if (profile?.isVerificationComplete && step2Done && onboardingDone) {
                    navigate('/', {
                        state: { next: authService.resolvePostAuthRoute(), force: true },
                        replace: true,
                    });
                    setHydrated(true);
                    return;
                }
            }

            if (
                locState?.fromSettings &&
                locState?.initialStep === 1 &&
                isAuthed &&
                cached &&
                profile?.isVerificationComplete
            ) {
                setSettingsOnlyFlow(true);
                setStep(1);
                setRole(cached.user.role === 'LANDLORD' ? 'landlord' : 'tenant');
                setAlreadyLoggedIn(true);
                setStep1(hydrateStep1FromProfile(profile));
                setHydrated(true);
                return;
            }

            if (locState?.step === 3) {
                setSettingsOnlyFlow(!!locState.fromSettings);
                setStep(3);
                const r = (locState.role || cached?.user?.role || 'TENANT').toString().toUpperCase();
                setRole(r === 'LANDLORD' ? 'landlord' : 'tenant');
                if (cached) {
                    setAlreadyLoggedIn(true);
                    setStep1(hydrateStep1FromProfile(cached.profile));
                    if (r === 'TENANT') {
                        setTenantStep3({
                            ...defaultTenantStep3(),
                            ...tenantPrefsFromProfile(cached.profile),
                        });
                    } else {
                        setLandlordStep3({
                            ...defaultLandlordStep3(),
                            ...landlordBizFromProfile(cached.profile),
                        });
                    }
                }
                setHydrated(true);
                return;
            }

            if (cached) {
                setAlreadyLoggedIn(true);

                const hasAppRole = cached.user.role === 'LANDLORD' || cached.user.role === 'TENANT';
                const idDone = !!cached.profile?.isVerificationComplete;

                if (locState?.fromSettings && idDone && hasAppRole) {
                    setSettingsOnlyFlow(true);
                    setStep(3);
                    setRole(cached.user.role === 'LANDLORD' ? 'landlord' : 'tenant');
                    setStep1(hydrateStep1FromProfile(cached.profile));
                    if (cached.user.role === 'TENANT') {
                        setTenantStep3({
                            ...defaultTenantStep3(),
                            ...tenantPrefsFromProfile(cached.profile),
                        });
                    } else {
                        setLandlordStep3({
                            ...defaultLandlordStep3(),
                            ...landlordBizFromProfile(cached.profile),
                        });
                    }
                    setHydrated(true);
                    return;
                }

                setSettingsOnlyFlow(false);

                if (!idDone) {
                    setStep(1);
                    setStep1(hydrateStep1FromProfile(cached.profile));
                } else if (
                    localStorage.getItem('authProvider') === 'email' &&
                    !emailVerified
                ) {
                    navigate('/verify-email', {
                        replace: true,
                        state: {
                            email: cached.user.email,
                            returnUrl: '/complete-profile',
                            role: cached.user.role === 'LANDLORD' ? 'landlord' : 'tenant',
                        },
                    });
                    setHydrated(true);
                    return;
                } else if (hasAppRole && cached.profile?.onboardingStep2Completed !== true) {
                    setStep(2);
                    setRole(cached.user.role === 'LANDLORD' ? 'landlord' : 'tenant');
                    setStep1(hydrateStep1FromProfile(cached.profile));
                } else if (
                    hasAppRole &&
                    !cached.profile?.onboardingStep3Completed &&
                    !cached.profile?.onboardingStep3Skipped
                ) {
                    setStep(3);
                    setRole(cached.user.role === 'LANDLORD' ? 'landlord' : 'tenant');
                    setStep1(hydrateStep1FromProfile(cached.profile));
                    if (cached.user.role === 'TENANT') {
                        setTenantStep3({
                            ...defaultTenantStep3(),
                            ...tenantPrefsFromProfile(cached.profile),
                        });
                    } else {
                        setLandlordStep3({
                            ...defaultLandlordStep3(),
                            ...landlordBizFromProfile(cached.profile),
                        });
                    }
                } else if (!hasAppRole) {
                    setStep(2);
                    setStep1(hydrateStep1FromProfile(cached.profile));
                } else {
                    navigate('/', {
                        state: { next: authService.resolvePostAuthRoute(), force: true },
                        replace: true,
                    });
                    setHydrated(true);
                    return;
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

    const goNextFromStep1 = async () => {
        const cached = authService.getCurrentUser();
        const verificationComplete = !!cached?.profile?.isVerificationComplete;
        const msg = validateStep1(step1, verificationComplete);
        if (msg) {
            setError(msg);
            return;
        }
        setError(null);

        if (settingsOnlyFlow) {
            setLoading(true);
            try {
                if (alreadyLoggedIn && cached?.user) {
                    if (localStorage.getItem('authProvider') === 'email' && !cached.user.emailVerified) {
                        setError('Please verify your email before saving identity.');
                        return;
                    }
                    if (!verificationComplete) {
                        await authService.completeVerification({
                            nationalId: step1.nationalId.trim(),
                            gender: step1.gender as Gender,
                            birthdate: step1.birthdate,
                            preferredLanguage: step1.preferredLanguage,
                        });
                    } else if (step1.preferredLanguage) {
                        await authService.updateProfile({
                            preferredLanguage: step1.preferredLanguage,
                        });
                    }
                    await authService.getProfile();
                }
                navigate('/settings');
            } catch (err) {
                let errorMessage = 'Could not save identity. Please try again.';
                if (axios.isAxiosError(err) && err.response?.data) {
                    const data = err.response.data as { message?: string };
                    if (data.message) errorMessage = data.message;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
            return;
        }

        if (alreadyLoggedIn && cached?.user) {
            if (localStorage.getItem('authProvider') === 'email' && !cached.user.emailVerified) {
                setError('Please verify your email before saving identity.');
                return;
            }
            if (!verificationComplete) {
                setLoading(true);
                try {
                    await authService.completeVerification({
                        nationalId: step1.nationalId.trim(),
                        gender: step1.gender as Gender,
                        birthdate: step1.birthdate,
                        preferredLanguage: step1.preferredLanguage,
                    });
                    await authService.getProfile();
                } catch (err) {
                    let errorMessage = 'Could not save identity. Please try again.';
                    if (axios.isAxiosError(err) && err.response?.data) {
                        const data = err.response.data as { message?: string; code?: string };
                        if (data.message) errorMessage = data.message;
                    }
                    setError(errorMessage);
                    setLoading(false);
                    return;
                } finally {
                    setLoading(false);
                }
            }
        }

        setStep(2);
    };

    const handleRoleSelection = async () => {
        if (!role) {
            setError('Please select a role');
            return;
        }

        if (!alreadyLoggedIn) {
            setError('Please sign in to continue.');
            navigate('/auth', { replace: true });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await authService.updateRole({ role: role.toUpperCase() });
            await authService.getProfile();
            const u = authService.getCurrentUser();
            const userEmail = u?.user?.email;

            if (localStorage.getItem('authProvider') === 'email' && !u?.user.emailVerified) {
                navigate('/verify-email', {
                    replace: true,
                    state: {
                        email: userEmail,
                        returnUrl: '/complete-profile',
                        step: 3,
                        role,
                    },
                });
                return;
            }

            const p = u?.profile;
            if (p?.onboardingStep3Completed || p?.onboardingStep3Skipped) {
                navigate('/', {
                    state: { next: authService.resolvePostAuthRoute(), force: true },
                    replace: true,
                });
                return;
            }

            navigate('/complete-profile', {
                replace: true,
                state: {
                    step: 3,
                    role: role as 'tenant' | 'landlord',
                    ...(settingsOnlyFlow ? { fromSettings: true } : {}),
                },
            });
        } catch (err) {
            console.error('❌ Role update failed:', err);
            let errorMessage = 'Could not save your role. Please try again.';
            if (axios.isAxiosError(err) && err.response?.data) {
                const data = err.response.data as { message?: string; errors?: { message: string }[] };
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
            navigate('/settings');
            return;
        }
        if (step > 1) setStep((s) => s - 1);
    };

    const handleStep3Skip = async () => {
        setLoading(true);
        setError(null);
        try {
            await authService.skipOnboardingStep3();
            navigate('/', { state: { next: authService.resolvePostAuthRoute(), force: true }, replace: true });
        } catch (err) {
            console.error('Skip failed:', err);
            const msg =
                axios.isAxiosError(err) && err.response?.data?.message
                    ? (err.response.data as { message: string }).message
                    : 'Could not save your profile. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        navigate('/auth', { replace: true });
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

            if (!cached.profile.isVerificationComplete) {
                const msg = validateStep1(step1, false);
                if (msg) {
                    setError(msg);
                    return;
                }
                await authService.completeVerification({
                    nationalId: step1.nationalId.trim(),
                    gender: step1.gender as Gender,
                    birthdate: step1.birthdate,
                    preferredLanguage: step1.preferredLanguage,
                });
            }

            const min = Number(tenantStep3.budgetMin);
            const max = Number(tenantStep3.budgetMax);
            await authService.updateProfile({
                preferredBudgetMin: min,
                preferredBudgetMax: max,
                preferredLanguage: step1.preferredLanguage || null,
                tenantRentalPreferences: {
                    employment: tenantStep3.employment.trim(),
                    workplace: tenantStep3.workplace.trim(),
                    incomeRange: tenantStep3.incomeRange.trim(),
                    moveInDate: tenantStep3.moveInDate.trim(),
                    propertyType: tenantStep3.propertyType.trim(),
                    duration: tenantStep3.duration.trim(),
                },
                onboardingStep3Complete: true,
            });

            await authService.getProfile();

            navigate('/', { state: { next: authService.resolvePostAuthRoute(), force: true }, replace: true });
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

            if (!cached.profile.isVerificationComplete) {
                const msg = validateStep1(step1, false);
                if (msg) {
                    setError(msg);
                    return;
                }
                await authService.completeVerification({
                    nationalId: step1.nationalId.trim(),
                    gender: step1.gender as Gender,
                    birthdate: step1.birthdate,
                    preferredLanguage: step1.preferredLanguage,
                });
            }

            const businessBio = landlordStep3.businessAddress.trim();
            const tp = Number(landlordStep3.totalProperties);
            const ye = Number(landlordStep3.yearsExperience);
            await authService.updateProfile({
                bio: businessBio,
                preferredLanguage: step1.preferredLanguage || null,
                landlordBusinessProfile: {
                    accountType: landlordStep3.accountType.trim(),
                    companyName: landlordStep3.companyName.trim(),
                    totalProperties: tp,
                    yearsExperience: ye,
                    availability: landlordStep3.availability.trim(),
                },
                onboardingStep3Complete: true,
            });

            await authService.getProfile();

            navigate('/', { state: { next: authService.resolvePostAuthRoute(), force: true }, replace: true });
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
            if (step === 1) {
                if (num === 1) return { completed: false, active: true };
                if (num === 2) return { completed: false, active: false };
                return { completed: false, active: false };
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
            <div className="onboarding-card" style={{ position: 'relative' }}>
                {/* Logout button — visible during initial onboarding (steps 1 & 2), not in settings flow */}
                {!settingsOnlyFlow && step < 3 && (
                    <button
                        onClick={() => void handleLogout()}
                        title="Sign out"
                        style={{
                            position: 'absolute', top: 16, right: 16,
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '8px', padding: '7px 12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                            color: '#ef4444', fontSize: '0.8rem', fontWeight: 600,
                            transition: 'background 0.2s',
                            zIndex: 10,
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.16)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                    >
                        <LogOut size={14} />
                        Sign out
                    </button>
                )}

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
                            <button className="btn-continue" onClick={() => void goNextFromStep1()}>
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
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                {!settingsOnlyFlow && (
                                    <button type="button" className="btn-back" onClick={goBack} disabled={loading}>
                                        <ArrowLeft size={18} /> Back to identity
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="btn-continue"
                                    disabled={!role || loading}
                                    onClick={() => void handleRoleSelection()}
                                >
                                    {loading ? 'Saving…' : 'Continue'} <ArrowRight size={18} />
                                </button>
                            </div>
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
                             {!settingsOnlyFlow && (
                                <button className="btn-skip" onClick={() => void handleStep3Skip()} disabled={loading}>
                                    Skip for now
                                </button>
                            )}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {settingsOnlyFlow ? (
                                    <button
                                        className="btn-back"
                                        onClick={() => navigate('/settings')}
                                        disabled={loading}
                                    >
                                        <ArrowLeft size={18} /> Back to Settings
                                    </button>
                                ) : (
                                    <button className="btn-back" onClick={goBack} disabled={loading}>
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                )}
                                <button className="btn-finish" onClick={() => void submitTenantProfile()} disabled={loading}>
                                    {loading ? 'Saving…' : 'Complete Profile'}
                                </button>
                            </div>
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
                        </div>

                        <div className="action-footer">
                            {!settingsOnlyFlow && (
                                <button className="btn-skip" onClick={handleStep3Skip} disabled={loading}>
                                    Skip for now
                                </button>
                            )}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {settingsOnlyFlow ? (
                                    <button
                                        className="btn-back"
                                        onClick={() => navigate('/settings')}
                                        disabled={loading}
                                    >
                                        <ArrowLeft size={18} /> Back to Settings
                                    </button>
                                ) : (
                                    <button className="btn-back" onClick={goBack} disabled={loading}>
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                )}
                                <button className="btn-finish" onClick={() => void submitLandlordProfile()} disabled={loading}>
                                    {loading ? 'Saving…' : 'Finish Setup'}
                                </button>
                            </div>
                        </div>


                    </div>
                )}
            </div>
        </div>
    );
};

export default CompleteProfile;

// export default CompleteProfile;