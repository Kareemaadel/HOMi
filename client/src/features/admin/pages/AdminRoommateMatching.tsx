import React, { useState, useEffect } from 'react';
import { roommateMatchingService } from '../../RoommateMatching/services/roommateMatchingService';
import type { RoommateRequest } from '../../RoommateMatching/types/roommateMatchingTypes';
import { Search, MapPin, Calendar, User, PieChart, Activity, Shield } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import './adminDashboard.css';

const AdminRoommateMatching: React.FC = () => {
    const [requests, setRequests] = useState<RoommateRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await roommateMatchingService.browseRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredRequests = requests.filter(req => 
        req.user?.profile?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.preferred_area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.preferred_city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-shell">
            <AdminSidebar />
            <main className="admin-main">
                <div className="admin-content p-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Roommate Matching Management</h1>
                            <p className="text-gray-500">Monitor active requests and matching activity across the platform.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                                <Activity className="text-homi-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Active Requests</p>
                                    <p className="text-xl font-bold">{requests.length}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                                <Shield className="text-emerald-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Success Rate</p>
                                    <p className="text-xl font-bold">12%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search by user or area..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-homi-500 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200">Export CSV</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Budget</th>
                                        <th className="px-6 py-4">Created</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading requests...</td></tr>
                                    ) : filteredRequests.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No requests found.</td></tr>
                                    ) : filteredRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                        {req.user?.profile?.avatar_url ? (
                                                            <img src={req.user.profile.avatar_url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={20} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{req.user?.profile?.first_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    req.type === 'SEARCH_APARTMENT' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                                }`}>
                                                    {req.type === 'SEARCH_APARTMENT' ? 'SEARCHING APARTMENT' : 'PROVIDING ROOM'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    {req.preferred_area}, {req.preferred_city}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {req.budget_min ? `${req.budget_min} - ${req.budget_max} EGP` : 'From contract'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-homi-500 hover:text-homi-600 font-bold text-sm">View Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminRoommateMatching;
