import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Hotel, BookOpen, CheckSquare, Sparkles, TrendingUp, ArrowUpRight, Plus, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalHalls: 0,
        totalExams: 0,
        totalAllocations: 0,
    });
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/admin/stats', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, [user.token]);

    const cards = [
        {
            label: 'STUDENTS',
            value: stats.totalStudents,
            today: '+ 4 today',
            icon: <Users size={22} />,
            color: 'text-blue-600',
            bg: 'bg-blue-600',
            shadow: 'shadow-blue-100'
        },
        {
            label: 'HALLS',
            value: stats.totalHalls,
            today: '+ 1 today',
            icon: <Hotel size={22} />,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500',
            shadow: 'shadow-emerald-100'
        },
        {
            label: 'EXAMS',
            value: stats.totalExams,
            today: '+ 0 today',
            icon: <BookOpen size={22} />,
            color: 'text-purple-600',
            bg: 'bg-purple-600',
            shadow: 'shadow-purple-100'
        },
        {
            label: 'ALLOCATIONS',
            value: stats.totalAllocations,
            today: '+ 2 today',
            icon: <CheckSquare size={22} />,
            color: 'text-orange-500',
            bg: 'bg-orange-600',
            shadow: 'shadow-orange-100'
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-0 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pt-2">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Welcome Back, Admin <Sparkles className="text-amber-400" size={24} />
                    </h1>
                    <p className="text-gray-400 font-semibold text-sm mt-1 tracking-tight">Here's a quick overview of your examination system status.</p>
                </div>

                {/* System Health Badge */}
                <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner">
                        <TrendingUp size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none mb-1">System Health</span>
                        <span className="text-sm font-black text-gray-800 tracking-tight">Online & Stable</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 group relative overflow-hidden">
                        {/* Decorative Background Accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>

                        <div className="relative z-10">
                            <div className={`w-14 h-14 ${card.bg} text-white rounded-2xl flex items-center justify-center shadow-lg ${card.shadow} mb-8 transition-transform group-hover:-translate-y-1`}>
                                {card.icon}
                            </div>

                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{card.label}</p>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{card.value}</h3>
                                <div className="flex items-center gap-1 text-[11px] font-black text-emerald-500 uppercase tracking-tight">
                                    {card.today}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                {/* Allocation Engine Banner */}
                <div className="lg:col-span-7 bg-[#111827] rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[360px]">
                    <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full"></div>

                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-3xl font-black mb-6 tracking-tight">Exam Allocation Engine</h2>
                        <p className="text-gray-400 leading-relaxed mb-10 font-semibold text-sm tracking-tight opacity-90">
                            Automate your exam hall assignments with ease. Our intelligent engine handles student capacity, subject conflicts, and seat numbering in seconds.
                        </p>
                        <button className="bg-white text-gray-900 px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-lg hover:scale-[1.02] active:scale-95">
                            Run New Allocation
                        </button>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-10 border border-gray-50 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Quick Actions</h3>
                    <div className="space-y-4 flex-1">
                        {[
                            { name: 'Add New Student', icon: <Users size={16} />, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                            { name: 'Schedule Exam', icon: <BookOpen size={16} />, color: 'text-purple-600', bg: 'bg-purple-50/50' },
                            { name: 'Setup New Hall', icon: <Hotel size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
                        ].map((action) => (
                            <button key={action.name} className="w-full flex items-center justify-between p-4 px-5 rounded-2xl border border-gray-50/50 hover:bg-gray-50 transition-all group shadow-sm hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${action.bg} ${action.color}`}>
                                        {action.icon}
                                    </div>
                                    <span className="text-[13px] font-black text-gray-700 tracking-tight">{action.name}</span>
                                </div>
                                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
                            </button>
                        ))}
                    </div>

                    {/* Bottom Utility Link */}
                    <div className="mt-10 pt-6 border-t border-gray-50 text-center">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Advanced Settings</p>
                    </div>
                </div>
            </div>

            {/* Floating Decoration (Bottom Right) */}
            <div className="fixed bottom-10 right-10 z-50">
                <div className="w-12 h-12 bg-[#000000] rounded-2xl flex items-center justify-center text-[#10b981] shadow-2xl border border-gray-800 animate-pulse">
                    <Sparkles size={20} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
