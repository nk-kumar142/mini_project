import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Users, UserCheck, Hotel, BookOpen,
    CheckSquare, GraduationCap, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalStaff: 0,
        totalHalls: 0,
        totalExams: 0,
        totalAllocations: 0
    });
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/admin/stats', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, [user.token]);

    const cards = [
        { label: 'Total Students', value: stats.totalStudents, icon: <Users size={24} />, color: 'text-blue-600', link: '/admin/students' },
        { label: 'Total Staff', value: stats.totalStaff, icon: <UserCheck size={24} />, color: 'text-emerald-600', link: '/admin/staff' },
        { label: 'Exam Halls', value: stats.totalHalls, icon: <Hotel size={24} />, color: 'text-purple-600', link: '/admin/halls' },
        { label: 'Scheduled Exams', value: stats.totalExams, icon: <BookOpen size={24} />, color: 'text-orange-600', link: '/admin/exams' },
        { label: 'Allocations', value: stats.totalAllocations, icon: <CheckSquare size={24} />, color: 'text-pink-600', link: '/admin/allocations' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm font-medium text-gray-400 mt-1">Overview of the examination system</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <GraduationCap size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic Year</p>
                        <p className="text-xs font-black text-[#1e3a8a]">2025 - 2026</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {cards.map((card, index) => (
                    <Link
                        to={card.link}
                        key={index}
                        className="bg-white p-6 rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-colors ${card.color}`}>
                                {card.icon}
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                                <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-800 mb-1">{card.value}</p>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{card.label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Simplified Quick Actions or Recent Activity could go here */}
                <div className="bg-[#1e3a8a] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-20"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-black uppercase tracking-wide mb-2">Hall Allocation</h2>
                        <p className="text-blue-200 text-sm mb-6 max-w-md">Automatically allocate students to exam halls based on seating capacity and department rules.</p>
                        <Link
                            to="/admin/allocate"
                            className="inline-flex items-center gap-2 bg-white text-[#1e3a8a] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors"
                        >
                            Start Allocation <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
