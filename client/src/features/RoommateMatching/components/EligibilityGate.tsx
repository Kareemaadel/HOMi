import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCircle, CheckCircle2, ArrowRight, Sparkles, Lock } from 'lucide-react';

interface EligibilityGateProps {
    reasons: string[];
}

const EligibilityGate: React.FC<EligibilityGateProps> = ({ reasons = [] }) => {
    const navigate = useNavigate();

    const hasReason = (r: string) => Array.isArray(reasons) && reasons.includes(r);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-8 px-4 animate-fade-in relative overflow-hidden">
            {/* Background Decorative Elements - Subtle */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#2563eb]/5 rounded-full blur-[80px] -z-10 animate-pulse"></div>

            <div className="max-w-3xl w-full relative">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-6 relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Lock size={32} strokeWidth={2} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-[#2563eb] border border-gray-100">
                            <Sparkles size={16} />
                        </div>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        Unlock <span className="text-[#2563eb]">Roommate Matching</span>
                    </h2>
                    
                    <p className="text-gray-500 mb-8 text-base max-w-lg leading-relaxed">
                        Complete your verification and lifestyle profile to access our AI-powered matching pool.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
                        {/* Requirement 1 */}
                        <div className={`group relative p-6 rounded-2xl transition-all duration-300 flex flex-col items-center text-center border ${
                            hasReason('PROFILE_INCOMPLETE') 
                                ? 'border-gray-200 bg-white hover:border-[#2563eb]/30' 
                                : 'border-[#3b82f6]/20 bg-[#f0f9ff]'
                        }`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                                hasReason('PROFILE_INCOMPLETE') ? 'bg-gray-50 text-gray-400' : 'bg-white text-[#2563eb] shadow-sm'
                            }`}>
                                {hasReason('PROFILE_INCOMPLETE') ? <UserCircle size={24} /> : <CheckCircle2 size={24} />}
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">Identity Profile</h4>
                            <p className="text-xs text-gray-500">Verification, gender, and birthdate.</p>
                            
                            {!hasReason('PROFILE_INCOMPLETE') && (
                                <div className="absolute top-4 right-4 text-[#2563eb]">
                                    <CheckCircle2 size={16} strokeWidth={3} />
                                </div>
                            )}
                        </div>

                        {/* Requirement 2 */}
                        <div className={`group relative p-6 rounded-2xl transition-all duration-300 flex flex-col items-center text-center border ${
                            hasReason('INSUFFICIENT_HABITS') 
                                ? 'border-gray-200 bg-white hover:border-[#2563eb]/30' 
                                : 'border-[#3b82f6]/20 bg-[#f0f9ff]'
                        }`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                                hasReason('INSUFFICIENT_HABITS') ? 'bg-gray-50 text-gray-400' : 'bg-white text-[#2563eb] shadow-sm'
                            }`}>
                                {hasReason('INSUFFICIENT_HABITS') ? <Sparkles size={24} /> : <CheckCircle2 size={24} />}
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">Lifestyle Habits</h4>
                            <p className="text-xs text-gray-500">Select at least 3 habits.</p>

                            {!hasReason('INSUFFICIENT_HABITS') && (
                                <div className="absolute top-4 right-4 text-[#2563eb]">
                                    <CheckCircle2 size={16} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/settings')}
                        className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <span>Update My Profile</span>
                        <ArrowRight size={20} />
                    </button>
                    
                    <div className="mt-8 flex items-center justify-center gap-6 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-[#2563eb]" />
                            <span>Secured</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Sparkles size={14} className="text-[#2563eb]" />
                            <span>AI Matching</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EligibilityGate;
