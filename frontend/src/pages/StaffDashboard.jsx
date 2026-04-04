import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, BookOpen, Calendar,
    Search, Clock, MapPin, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
    const [stats, setStats] = useState({
        totalExams: 0,
        upcomingExams: 0,
        totalAllocations: 0,
        totalHalls: 0
    });
    const [exams, setExams] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [dutyAllocations, setDutyAllocations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };

                const [statsRes, examsRes, allocRes, dutyRes] = await Promise.all([
                    api.get('/staff/stats', config),
                    api.get('/staff/exams', config),
                    api.get('/staff/allocations', config),
                    api.get('/staff/duty-allocations', config)
                ]);

                setStats(statsRes.data);
                setExams(examsRes.data);
                setAllocations(allocRes.data);
                setDutyAllocations(dutyRes.data);
            } catch (error) {
                console.error("Error fetching staff dashboard data:", error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user.token]);

    const filteredAllocations = allocations.filter(alc =>
        alc.studentId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alc.studentId?.registerNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5); // Limit to top 5 results

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-tight transition-colors">Staff Dashboard</h1>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 transition-colors">Welcome back, {user.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Exams', value: stats.totalExams, icon: <BookOpen />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Upcoming Exams', value: stats.upcomingExams, icon: <Calendar />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Allocations', value: stats.totalAllocations, icon: <Users />, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Examination Halls', value: stats.totalHalls, icon: <MapPin />, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-700 flex items-center justify-between group hover:scale-[1.02] transition-transform">
                        <div>
                            <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-800 dark:text-white">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} dark:bg-opacity-10 ${stat.color} dark:text-opacity-90`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Exams Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wide transition-colors">Upcoming Examination Schedule</h2>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                        {exams.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date & Session</th>
                                            <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Subject</th>
                                            <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Dept & Year</th>
                                            <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {exams.filter(e => new Date(e.examDate) >= new Date()).slice(0, 5).map((exam) => (
                                            <tr key={exam._id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center text-[10px] font-black border border-blue-100 dark:border-gray-600">
                                                            <span>{new Date(exam.examDate).getDate()}</span>
                                                            <span className="uppercase text-[8px] opacity-70">{new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 dark:text-white text-sm">{new Date(exam.examDate).toLocaleDateString()}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{exam.session}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-gray-800 dark:text-white text-sm">{exam.subject}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{exam.examName}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider">
                                                        {exam.department} - {exam.year}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                        <Clock size={14} />
                                                        {exam.time}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-10 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">No upcoming exams found.</div>
                        )}
                        {exams.length > 5 && (
                            <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 text-center">
                                <button className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">View All Schedule</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Student Finder Widget */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wide transition-colors">Find Student Allocation</h2>
                    <div className="bg-[#1e3a8a] dark:bg-blue-900/40 dark:border dark:border-blue-800/50 text-white p-8 rounded-[2.5rem] shadow-xl dark:shadow-none relative overflow-hidden transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                        <div className="relative z-10 space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-blue-200 dark:text-blue-300 uppercase tracking-widest mb-2 block">Search Student</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 dark:text-blue-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Name or Register No..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-blue-800/50 dark:bg-gray-800 border border-blue-400/30 dark:border-gray-700 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-blue-400/70 dark:placeholder:text-gray-500 focus:outline-none focus:bg-blue-800 dark:focus:bg-gray-700 focus:border-blue-400 dark:focus:border-blue-500 transition-all text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {searchQuery && filteredAllocations.length > 0 ? (
                                    filteredAllocations.map(alc => (
                                        <div key={alc._id} className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center text-blue-600 font-bold overflow-hidden shadow-sm">
                                                    {alc.studentId?.profileImage ? (
                                                        <img src={alc.studentId?.profileImage} alt={alc.studentId?.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        alc.studentId?.name?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{alc.studentId?.name}</p>
                                                    <p className="text-[10px] text-blue-200">{alc.studentId?.registerNumber}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-bold text-blue-200">Hall {alc.hallId?.hallName}</p>
                                                <p className="font-bold text-white">Seat {alc.seatNumber}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : searchQuery ? (
                                    <p className="text-center text-xs text-blue-300 py-2">No matching students found.</p>
                                ) : (
                                    <div className="text-center py-4 opacity-50">
                                        <Users size={32} className="mx-auto mb-2" />
                                        <p className="text-xs">Start typing to search student allocations</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Exam Duties / Venue Details Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wide transition-colors">My Exam Duties (Venue Details)</h2>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                    {dutyAllocations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date & Session</th>
                                        <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Exam</th>
                                        <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Venue / Hall</th>
                                        <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {dutyAllocations.map((duty) => (
                                        <tr key={duty._id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-gray-700 text-purple-600 dark:text-purple-400 flex flex-col items-center justify-center text-[10px] font-black border border-purple-100 dark:border-gray-600">
                                                        <span>{new Date(duty.examId?.examDate).getDate()}</span>
                                                        <span className="uppercase text-[8px] opacity-70">{new Date(duty.examId?.examDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 dark:text-white text-sm">{new Date(duty.examId?.examDate).toLocaleDateString()}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{duty.examId?.session}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-gray-800 dark:text-white text-sm">{duty.examId?.examName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{duty.examId?.subject}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-400 text-[11px] font-black uppercase tracking-wider border border-blue-100 dark:border-gray-600">
                                                    <MapPin size={14} />
                                                    {duty.hallId?.hallName} ({duty.hallId?.building})
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                    <Clock size={14} />
                                                    {duty.examId?.time}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">You have not been assigned any exam duties yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
