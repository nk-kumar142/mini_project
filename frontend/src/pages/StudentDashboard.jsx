import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Download, CheckCircle, AlertCircle, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAllocations = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/allocation/my-allocation', {
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
            <div className="bg-[#1e3a8a] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Hello, {user.name.split(' ')[0]}!</h1>
                        <p className="text-blue-200 font-medium max-w-lg">Everything you need for your exams is right here. Check your hall details and timeline below.</p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                to="/student/allocation"
                                className="bg-white text-[#1e3a8a] px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg hover:shadow-white/20 flex items-center gap-2"
                            >
                                <Calendar size={14} /> Full Hall Ticket
                            </Link>
                            <Link
                                to="/student/gantt"
                                className="bg-blue-500/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <BarChart2 size={14} /> Global Timeline
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Your Hall Allocations</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-[2rem]"></div>)}
                    </div>
                ) : allocations.length === 0 ? (
                    <div className="bg-white p-12 rounded-[2rem] border border-dashed border-gray-200 text-center">
                        <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-wide">No Exams Allocated Yet</p>
                        <p className="text-gray-300 text-xs mt-1">Once the admin publishes the schedule, your hall details will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allocations.map((alc) => (
                            <div key={alc._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 group-hover:bg-blue-100 transition-colors"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center text-[10px] font-black border border-blue-100 uppercase">
                                            <span>{new Date(alc.examId?.examDate).getDate()}</span>
                                            <span className="text-[8px] opacity-70">{new Date(alc.examId?.examDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{alc.examId?.examName}</p>
                                            <p className="font-bold text-slate-800 truncate">{alc.examId?.subject}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#1e3a8a] shadow-sm">
                                                <MapPin size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">Exam Hall</p>
                                                <p className="text-xs font-black text-[#1e3a8a]">{alc.hallId?.hallName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-orange-500 shadow-sm">
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">Time & Session</p>
                                                <p className="text-xs font-black text-slate-800">{alc.examId?.time} ({alc.examId?.session})</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                        <CheckCircle size={24} />
                    </div>
                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide">Exam Instructions</h2>
                    <ul className="mt-4 space-y-3 text-sm text-gray-500 font-medium">
                        <li className="flex gap-2">
                            <span className="text-blue-500">•</span>
                            Carry your Hall Ticket and ID card.
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-500">•</span>
                            Report to the hall 15 minutes before exam.
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-500">•</span>
                            Electronic gadgets are strictly prohibited.
                        </li>
                    </ul>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                        <AlertCircle size={24} />
                    </div>
                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide">Support</h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Facing issues with your hall ticket? Contact the admin office immediately.
                    </p>
                    <div className="mt-4 text-xs font-bold text-gray-400">
                        admin@college.edu
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
