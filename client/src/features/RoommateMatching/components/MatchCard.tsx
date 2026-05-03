import React from 'react';
import type { RoommateMatch } from '../types/roommateMatchingTypes';
import { MapPin, Check, X, ShieldCheck, Zap, User } from 'lucide-react';

interface MatchCardProps {
    match: RoommateMatch;
    currentUserId: string;
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, currentUserId, onAccept, onDecline }) => {
    const isAccepted = match.status === 'ACCEPTED';
    const otherUser = match.request1?.user_id === currentUserId ? match.request2?.user : match.request1?.user;
    const compatibility = Math.round(match.compatibility_score);

    // Dynamic color based on compatibility
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
        if (score >= 60) return 'text-homi-500 bg-homi-50 border-homi-100';
        return 'text-amber-500 bg-amber-50 border-amber-100';
    };

    const scoreStyle = getScoreColor(compatibility);

    return (
        <div className="group bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-homi/10 hover:-translate-y-2">
            {/* Compatibility Header */}
            <div className="relative h-32 bg-gradient-to-br from-homi-500 via-homi-600 to-purple-600 p-6 flex justify-between items-start">
                <div className={`px-4 py-2 rounded-2xl border backdrop-blur-md flex items-center gap-2 font-bold shadow-lg ${scoreStyle}`}>
                    <Zap size={16} fill="currentColor" />
                    {compatibility}% Match
                </div>
                
                {match.status === 'PENDING' && (
                    <div className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                        New Potential Match
                    </div>
                )}
            </div>

            {/* User Info */}
            <div className="px-8 pb-8 -mt-12 relative z-10">
                <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-xl shadow-gray-200">
                        <div className="w-full h-full rounded-[1.75rem] bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-50">
                            {otherUser?.profile?.avatar_url ? (
                                <img src={otherUser.profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-gray-300" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-1">
                        {otherUser?.profile?.first_name || 'Homi User'}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-gray-500 font-medium text-sm">
                        <MapPin size={14} className="text-homi-500" />
                        Cairo, Egypt
                    </div>
                </div>

                {/* Compatibility Reasons */}
                <div className="bg-gray-50/50 rounded-2xl p-4 mb-6 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-left">Why you'll match</p>
                    <p className="text-sm text-gray-600 leading-relaxed italic text-left">
                        "{match.compatibility_reasons || 'Compatible habits and lifestyle preferences.'}"
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {match.status === 'PENDING' ? (
                        <>
                            <button
                                onClick={() => onDecline(match.id)}
                                className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => onAccept(match.id)}
                                className="flex-[2] py-4 bg-homi-500 text-white rounded-2xl font-bold hover:bg-homi-600 transition-all shadow-lg shadow-homi/20 flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                Connect
                            </button>
                        </>
                    ) : (
                        <div className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${
                            isAccepted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-400'
                        }`}>
                            {isAccepted ? (
                                <>
                                    <ShieldCheck size={20} />
                                    Mutual Match!
                                </>
                            ) : (
                                'Declined'
                            )}
                        </div>
                    )}
                </div>
                
                {isAccepted && (
                    <p className="mt-4 text-center text-xs text-emerald-600 font-medium animate-pulse">
                        Check your messages to connect
                    </p>
                )}
            </div>
        </div>
    );
};

export default MatchCard;
