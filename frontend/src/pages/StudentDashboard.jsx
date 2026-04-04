import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, User as UserIcon, Mail, Hash, BookOpen, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAllocations = async () => {
            try {
                const { data } = await api.get('/allocation/my-allocation', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setAllocations(data);
            } catch (error) {
                console.error("Error fetching allocations", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllocations();
    }, [user.token]);

    return (
        <div className="space-y-8">
            <div className="bg-[#1e3a8a] dark:bg-blue-900/40 dark:border dark:border-blue-800/50 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl dark:shadow-none transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-white/5 rounded-full blur-3xl -mr-10 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Hello, {user.name.split(' ')[0]}!</h1>
                        <p className="text-blue-200 dark:text-blue-300/80 font-medium max-w-lg">Everything you need for your exams is right here. Check your hall details and timeline below.</p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                to="/student/allocation"
                                className="bg-white dark:bg-gray-800 text-[#1e3a8a] dark:text-white px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-gray-700 transition-all shadow-lg dark:shadow-none hover:shadow-white/20 flex items-center gap-2"
                            >
                                <Calendar size={14} /> Full Hall Ticket
                            </Link>

                        </div>
                    </div>
                </div>
            </div>

            {/* Student Profile Section */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <UserIcon size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-tight">Student Profile</h2>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Personal & Academic Details</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar/Basic Info */}
                    <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/50 min-w-[200px] w-full md:w-auto">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-500/20 overflow-hidden mb-4 relative group">
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">{user?.name}</h3>
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">Student</p>
                    </div>

                    {/* Detailed Data Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <Hash size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Register Number</p>
                                <p className="text-sm font-black text-gray-800 dark:text-gray-200">{user?.registerNumber || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-700/50 hover:border-purple-200 dark:hover:border-purple-800/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Department</p>
                                <p className="text-sm font-black text-gray-800 dark:text-gray-200">{user?.department || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-700/50 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <GraduationCap size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Year of Study</p>
                                <p className="text-sm font-black text-gray-800 dark:text-gray-200">{user?.year ? `Year ${user.year}` : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-700/50 hover:border-orange-200 dark:hover:border-orange-800/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <Mail size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email Address</p>
                                <p className="text-sm font-black text-gray-800 dark:text-gray-200 truncate">{user?.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Your Hall Allocations</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-[2rem]"></div>)}
                    </div>
                ) : allocations.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-12 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700 text-center transition-colors">
                        <Calendar size={48} className="mx-auto text-gray-200 dark:text-gray-600 mb-4" />
                        <p className="text-gray-400 dark:text-gray-500 font-bold text-sm uppercase tracking-wide">No Exams Allocated Yet</p>
                        <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">Once the admin publishes the schedule, your hall details will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allocations.map((alc) => (
                            <div key={alc._id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:border-gray-600 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-gray-700 rounded-full -mr-8 -mt-8 group-hover:bg-blue-100 dark:group-hover:bg-gray-600 transition-colors"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center text-[10px] font-black border border-blue-100 dark:border-gray-600 uppercase">
                                            <span>{new Date(alc.examId?.examDate).getDate()}</span>
                                            <span className="text-[8px] opacity-70">{new Date(alc.examId?.examDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">{alc.examId?.examName}</p>
                                            <p className="font-bold text-slate-800 dark:text-white truncate">{alc.examId?.subject}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-transparent dark:border-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-[#1e3a8a] dark:text-blue-400 shadow-sm">
                                                <MapPin size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-300 dark:text-gray-500 uppercase tracking-tighter">Exam Hall</p>
                                                <p className="text-xs font-black text-[#1e3a8a] dark:text-white">{alc.hallId?.hallName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-transparent dark:border-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-orange-500 shadow-sm">
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-300 dark:text-gray-500 uppercase tracking-tighter">Time & Session</p>
                                                <p className="text-xs font-black text-slate-800 dark:text-gray-200">{alc.examId?.time} ({alc.examId?.session})</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                        <Link
                                            to={`/student/hall/${alc.hallId?.hallName}`}
                                            className="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white px-4 py-2 flex items-center justify-center gap-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-colors w-full"
                                        >
                                            View Seating Plan
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                        <CheckCircle size={24} />
                    </div>
                    <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-wide">Exam Instructions</h2>
                    <ul className="mt-4 space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <li className="flex gap-2">
                            <span className="text-blue-500 dark:text-blue-400">•</span>
                            Carry your Hall Ticket and ID card.
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-500 dark:text-blue-400">•</span>
                            Report to the hall 15 minutes before exam.
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-500 dark:text-blue-400">•</span>
                            Electronic gadgets are strictly prohibited.
                        </li>
                    </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-gray-700 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                        <AlertCircle size={24} />
                    </div>
                    <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-wide">Support</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Facing issues with your hall ticket? Contact the admin office immediately.
                    </p>
                    <div className="mt-4 text-xs font-bold text-gray-400 dark:text-gray-500">
                        admin@college.edu
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
