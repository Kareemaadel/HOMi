import React, { useState, useEffect } from 'react';
import { roommateMatchingService } from '../services/roommateMatchingService';
import type { RoommateRequest, RoommateMatch, EligibilityResponse } from '../types/roommateMatchingTypes';
import EligibilityGate from '../components/EligibilityGate';
import MatchCard from '../components/MatchCard';
import CreateRequestModal from '../components/CreateRequestModal';
import { Search, Home, UserPlus, RefreshCw, Loader2, Info, ArrowRight, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

// Global Layout Components
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import '../../home/pages/TenantHome.css'; // Reuse dashboard layout styles

const RoommateMatching: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'SEARCH_APARTMENT' | 'SEARCH_ROOMMATE'>('SEARCH_APARTMENT');
    const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
    const [myRequest, setMyRequest] = useState<RoommateRequest | null>(null);
    const [matches, setMatches] = useState<RoommateMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [matchingInProgress, setMatchingInProgress] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchData = async () => {
        try {
            setLoading(true);
            const el = await roommateMatchingService.checkEligibility();
            setEligibility(el);

            if (el.eligible) {
                const req = await roommateMatchingService.getMyActiveRequest();
                setMyRequest(req);
                
                if (req) {
                    setActiveTab(req.type);
                    const m = await roommateMatchingService.getMatches();
                    setMatches(m);
                }
            }
        } catch (error) {
            console.error('Error fetching matching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateRequest = async (data: any) => {
        try {
            const req = await roommateMatchingService.createRequest(data);
            setMyRequest(req);
            setShowCreateModal(false);
            handleFindMatches(req.id);
        } catch (error: any) {
            alert('Failed to create request: ' + (error.response?.data?.message || error.message || 'Unknown error'));
        }
    };

    const handleFindMatches = async (requestId: string) => {
        try {
            setMatchingInProgress(true);
            await roommateMatchingService.findMatches(requestId);
            const m = await roommateMatchingService.getMatches();
            setMatches(m);
        } catch (error) {
            console.error('Matching failed:', error);
        } finally {
            setMatchingInProgress(false);
        }
    };

    const handleAcceptMatch = async (matchId: string) => {
        try {
            await roommateMatchingService.respondToMatch(matchId, 'ACCEPTED');
            const m = await roommateMatchingService.getMatches();
            setMatches(m);
        } catch (error) {
            alert('Action failed');
        }
    };

    const handleDeclineMatch = async (matchId: string) => {
        try {
            await roommateMatchingService.respondToMatch(matchId, 'DECLINED');
            const m = await roommateMatchingService.getMatches();
            setMatches(m);
        } catch (error) {
            alert('Action failed');
        }
    };

    const handleCancelRequest = async () => {
        if (!myRequest) return;
        if (window.confirm('Are you sure you want to cancel your matching request?')) {
            try {
                await roommateMatchingService.cancelRequest(myRequest.id);
                setMyRequest(null);
                setMatches([]);
            } catch (error) {
                alert('Cancel failed');
            }
        }
    };

    if (loading) {
        return (
            <div className="tenant-dashboard-root">
                <Sidebar />
                <div className="main-wrapper">
                    <Header />
                    <main className="content-area flex items-center justify-center">
                        <Loader2 className="animate-spin text-homi-500" size={48} />
                    </main>
                    <Footer />
                </div>
            </div>
        );
    }

    if (eligibility && !eligibility.eligible) {
        return (
            <div className="tenant-dashboard-root">
                <Sidebar />
                <div className="main-wrapper">
                    <Header />
                    <main className="content-area">
                        <EligibilityGate reasons={eligibility.reasons} />
                    </main>
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <div className="tenant-dashboard-root">
            <Sidebar />
            <div className="main-wrapper">
                <Header />
                <main 
                    className="flex-1 flex flex-col items-center w-full min-h-screen px-4"
                    style={{ paddingTop: '120px', paddingBottom: '60px' }}
                >
                    <div className="w-full max-w-4xl flex flex-col items-center text-center animate-fade-in">
                        {/* Header */}
                        <div className="flex flex-col items-center gap-2 mb-10">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">Roommate Matching</h1>
                            <p className="text-gray-500 text-lg">AI-powered compatibility scoring for your next shared home.</p>
                            
                            {myRequest && (
                                <button 
                                    onClick={handleCancelRequest}
                                    className="mt-2 text-red-500 hover:text-red-600 font-semibold text-sm transition-colors"
                                >
                                    Cancel My Request
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex justify-center w-full mb-12">
                            <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex gap-2">
                                <button
                                    onClick={() => !myRequest && setActiveTab('SEARCH_APARTMENT')}
                                    disabled={!!myRequest && myRequest.type !== 'SEARCH_APARTMENT'}
                                    className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 whitespace-nowrap ${
                                        activeTab === 'SEARCH_APARTMENT' 
                                            ? 'bg-white text-blue-600 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-700'
                                    } ${!!myRequest && myRequest.type !== 'SEARCH_APARTMENT' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Home size={18} className="shrink-0" />
                                    <span>Search for Apartment</span>
                                </button>
                                <button
                                    onClick={() => !myRequest && setActiveTab('SEARCH_ROOMMATE')}
                                    disabled={!!myRequest && myRequest.type !== 'SEARCH_ROOMMATE'}
                                    className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 whitespace-nowrap ${
                                        activeTab === 'SEARCH_ROOMMATE' 
                                            ? 'bg-white text-blue-600 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-700'
                                    } ${!!myRequest && myRequest.type !== 'SEARCH_ROOMMATE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <UserPlus size={18} className="shrink-0" />
                                    <span>Search for Roommate</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        {!myRequest ? (
                            <div className="flex flex-col items-center w-full">
                                <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mb-8 rotate-3 transform transition-transform hover:rotate-0 shadow-inner">
                                    {activeTab === 'SEARCH_APARTMENT' ? <Home size={48} /> : <UserPlus size={48} />}
                                </div>
                                
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                                    {activeTab === 'SEARCH_APARTMENT' 
                                        ? 'Find your dream shared home' 
                                        : 'Find the perfect roommate'}
                                </h2>
                                
                                <p className="text-gray-500 max-w-lg mb-8 text-lg leading-relaxed">
                                    {activeTab === 'SEARCH_APARTMENT'
                                        ? "Join our matching pool to find verified tenants who have an active contract and are looking for a compatible roommate."
                                        : "List your room and let our AI find the most compatible candidates based on habits, lifestyle, and preferences."}
                                </p>
                                
                                <div className="w-full flex justify-center mb-10">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all whitespace-nowrap"
                                        style={{ minWidth: '260px' }}
                                    >
                                        <span>Create My Request</span>
                                        <ArrowRight size={20} className="shrink-0" />
                                    </button>
                                </div>
                                
                                <div className="flex items-center justify-center gap-8 text-sm font-semibold text-gray-400">
                                    <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-blue-500" /> AI Verified</span>
                                    <span className="flex items-center gap-2"><Sparkles size={18} className="text-blue-500" /> Best Matches</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {/* My Request Info */}
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-homi-600 to-homi-800 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <div className="bg-gradient-to-r from-homi-500 via-homi-600 to-homi-700 p-10 rounded-[3rem] text-white flex flex-col lg:flex-row justify-between items-center gap-8 shadow-xl relative overflow-hidden">
                                        {/* Abstract background shapes */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                                        <div className="flex gap-6 items-center flex-1">
                                            <div className="p-5 bg-white/20 rounded-[2rem] backdrop-blur-md shadow-inner">
                                                <RefreshCw className={matchingInProgress ? 'animate-spin' : ''} size={32} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-3 py-0.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">Active Status</span>
                                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                                </div>
                                                <h3 className="text-3xl font-black tracking-tight">
                                                    {myRequest.type === 'SEARCH_APARTMENT' ? 'Searching for Apartment' : 'Searching for Roommate'} 
                                                </h3>
                                                <p className="text-white/70 font-medium flex items-center gap-1 mt-1">
                                                    <MapPin size={16} /> {myRequest.preferred_area || 'Current Location'} • Budget: {myRequest.budget_min}-{myRequest.budget_max} EGP
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 w-full lg:w-auto">
                                            <button
                                                onClick={() => handleFindMatches(myRequest.id)}
                                                disabled={matchingInProgress}
                                                className="flex-1 lg:flex-none px-8 py-4 bg-white text-homi-600 rounded-2xl font-bold hover:bg-homi-50 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                            >
                                                {matchingInProgress ? 'Matching...' : '🔄 Refresh Matches'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Matches Grid */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Recommended for You</h2>
                                            <p className="text-gray-500 mt-1">Our AI analyzed {matches.length * 12} compatibility factors to find these matches.</p>
                                        </div>
                                        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl text-sm font-black border border-gray-200">
                                            {matches.length} matches
                                        </div>
                                    </div>

                                    {matches.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {matches.map(match => (
                                                <MatchCard 
                                                    key={match.id} 
                                                    match={match} 
                                                    currentUserId={currentUser.id}
                                                    onAccept={handleAcceptMatch}
                                                    onDecline={handleDeclineMatch}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-200 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                                                <Search size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found just yet</h3>
                                            <p className="text-gray-500 max-w-xs">We're still searching for the perfect roommate for you. Try refreshing or come back later!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </main>
                <Footer />
            </div>

            {showCreateModal && (
                <CreateRequestModal 
                    type={activeTab} 
                    activeContractId={null} // TODO: Pass real contract ID if SEARCH_ROOMMATE
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateRequest}
                />
            )}
        </div>
    );
};

export default RoommateMatching;
