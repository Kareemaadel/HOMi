import React, { useState } from 'react';
import { X, MapPin, DollarSign, Users, Calendar, Info } from 'lucide-react';

interface CreateRequestModalProps {
    type: 'SEARCH_APARTMENT' | 'SEARCH_ROOMMATE';
    activeContractId?: string | null;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ type, activeContractId, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        preferred_city: 'Cairo',
        preferred_area: '',
        budget_min: 0,
        budget_max: 0,
        preferred_gender: 'ANY',
        preferred_move_in_date: '',
        additional_note: '',
        max_occupants: 1,
        contract_id: activeContractId || null
    });

    const isApartmentSearch = type === 'SEARCH_APARTMENT';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clean empty string values to null so the database doesn't crash on invalid Date casts
        const payload = {
            ...formData,
            type,
            preferred_move_in_date: formData.preferred_move_in_date || null,
            budget_min: formData.budget_min || 0,
            budget_max: formData.budget_max || 0,
        };
        
        onSubmit(payload);
    };

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
            style={{ paddingLeft: 'var(--sidebar-width, 0)', zIndex: 9999 }}
        >
            <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl animate-slide-up flex flex-col" style={{ maxHeight: '90vh' }}>
                {/* Modal Header */}
                <div className="bg-blue-600 text-white relative shrink-0" style={{ padding: '24px 32px', borderRadius: '2rem 2rem 0 0' }}>
                    <button onClick={onClose} className="absolute p-2 hover:bg-white/20 rounded-full transition-colors" style={{ top: '20px', right: '24px' }}>
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold flex items-center gap-3" style={{ marginBottom: '4px' }}>
                        {isApartmentSearch ? <MapPin size={28} /> : <Home size={28} />}
                        {isApartmentSearch ? 'Find a Place to Share' : 'Find a Roommate'}
                    </h2>
                    <p className="text-blue-100 text-sm">
                        {isApartmentSearch ? 'Set your preferences to find the perfect roommate with a contract.' : 'Find someone compatible to join you in your current place.'}
                    </p>
                </div>
                
                {/* Scrollable Form Body */}
                <div className="overflow-y-auto custom-scrollbar">

                <form onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {isApartmentSearch ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-600" /> City
                                </label>
                                <select 
                                    className="bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    style={{ width: '100%', padding: '12px' }}
                                    value={formData.preferred_city}
                                    onChange={(e) => setFormData({...formData, preferred_city: e.target.value})}
                                >
                                    <option value="Cairo">Cairo</option>
                                    <option value="Giza">Giza</option>
                                    <option value="Alexandria">Alexandria</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="text-sm font-semibold text-gray-700">Area</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Nasr City"
                                    className="bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    style={{ width: '100%', padding: '12px' }}
                                    value={formData.preferred_area}
                                    onChange={(e) => setFormData({...formData, preferred_area: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 rounded-2xl flex items-center border border-blue-100" style={{ padding: '16px', gap: '12px' }}>
                            <Info className="text-blue-600 shrink-0" size={24} />
                            <p className="text-sm text-blue-800 font-medium">
                                We'll use your current active contract location and rent details for matching.
                            </p>
                        </div>
                    )}

                    {isApartmentSearch && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <DollarSign size={16} className="text-blue-600" /> Monthly Budget Range (EGP)
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <input 
                                    type="number" 
                                    placeholder="Min"
                                    className="bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    style={{ width: '100%', padding: '12px' }}
                                    value={formData.budget_min || ''}
                                    onChange={(e) => setFormData({...formData, budget_min: Number(e.target.value)})}
                                />
                                <input 
                                    type="number" 
                                    placeholder="Max"
                                    className="bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    style={{ width: '100%', padding: '12px' }}
                                    value={formData.budget_max || ''}
                                    onChange={(e) => setFormData({...formData, budget_max: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Users size={16} className="text-blue-600" /> Roommate Gender
                            </label>
                            <select 
                                className="bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                style={{ width: '100%', padding: '12px' }}
                                value={formData.preferred_gender}
                                onChange={(e) => setFormData({...formData, preferred_gender: e.target.value})}
                            >
                                <option value="ANY">Any</option>
                                <option value="MALE">Male only</option>
                                <option value="FEMALE">Female only</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar size={16} className="text-blue-600" /> Move-in Date
                            </label>
                            <input 
                                type="date" 
                                className="bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                style={{ width: '100%', padding: '12px' }}
                                value={formData.preferred_move_in_date}
                                onChange={(e) => setFormData({...formData, preferred_move_in_date: e.target.value})}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label className="text-sm font-semibold text-gray-700">Additional Notes</label>
                        <textarea 
                            placeholder="Tell potential roommates something about yourself or your preferences..."
                            className="bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none transition-all"
                            style={{ width: '100%', padding: '12px' }}
                            value={formData.additional_note}
                            onChange={(e) => setFormData({...formData, additional_note: e.target.value})}
                        ></textarea>
                    </div>

                    <button 
                        type="submit"
                        className="bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2"
                        style={{ width: '100%', padding: '16px', marginTop: '16px', flexShrink: 0 }}
                    >
                        Start Matching
                    </button>
                </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRequestModal;
