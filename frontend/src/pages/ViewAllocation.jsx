import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Download, MapPin, Calendar, Clock, Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ViewAllocation = () => {
    const [allocation, setAllocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAllocation = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/allocation/my-allocation', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setAllocation(data); // Assuming returning array or single object? usually array of allocations
            } catch (error) {
                console.error("Error fetching allocation", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllocation();
    }, [user.token]);

    const handleDownload = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/pdf/my-hall-ticket`, {
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `HallTicket_${user.registerNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Download failed. Please try again.');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const allocationsList = Array.isArray(allocation) ? allocation : (allocation ? [allocation] : []);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="text-center">
                <h1 className="text-3xl font-black text-[#1e3a8a] uppercase tracking-tight">Official Hall Ticket</h1>
                <p className="text-gray-400 text-sm font-medium mt-1">Unified examination schedule and allocation details.</p>
            </div>

            {allocationsList.length > 0 ? (
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-3 bg-blue-600"></div>

                    <div className="p-10 space-y-10">
                        {/* Student Info Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Student Information</p>
                                <h2 className="text-3xl font-black text-slate-800">{user.name?.toUpperCase()}</h2>
                                <div className="flex gap-4 text-sm font-bold text-gray-500">
                                    <span>REG: {user.registerNumber}</span>
                                    <span className="text-gray-200">|</span>
                                    <span>DEPT: {user.department}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] transition-all flex items-center gap-3 active:scale-95"
                            >
                                <Download size={18} /> Download All Subjects
                            </button>
                        </div>

                        {/* Exam Schedule Table */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Calendar size={16} />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Examination Schedule</h3>
                            </div>

                            <div className="overflow-x-auto rounded-3xl border border-gray-50 bg-gray-50/30">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800 text-white">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Date & Session</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Subject / Exam</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Hall & Building</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Seat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {allocationsList.map((alc) => (
                                            <tr key={alc._id} className="bg-white hover:bg-blue-50/30 transition-colors">
                                                <td className="px-6 py-6">
                                                    <div className="space-y-1">
                                                        <p className="font-black text-slate-700">{new Date(alc.examId.examDate).toLocaleDateString()}</p>
                                                        <p className="text-[10px] font-bold text-blue-600 uppercase italic">{alc.examId.session}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 font-bold text-slate-600">
                                                    <div>
                                                        <p className="text-slate-800 font-black">{alc.examId.subject}</p>
                                                        <p className="text-xs text-gray-400 font-medium">{alc.examId.examName}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                                            <MapPin size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-700">Hall {alc.hallId.hallName}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{alc.hallId.building}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className="text-2xl font-black text-blue-600">{alc.seatNumber}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Instructions Footer */}
                        <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex-shrink-0 flex items-center justify-center">
                                <CheckCircle size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-orange-800 uppercase tracking-wider">Important Instructions</p>
                                <p className="text-xs text-orange-700/80 leading-relaxed font-medium">
                                    Please bring your original ID card along with this hall ticket. Report to the examination hall at least 30 minutes before the scheduled time. Electronic gadgets are strictly prohibited.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-xl font-black text-gray-400 uppercase tracking-wide">No Allocations Yet</h2>
                    <p className="text-gray-400 mt-2 max-w-xs mx-auto text-sm font-medium">Your unified hall ticket will appear here once the allocation process is completed by the admin.</p>
                </div>
            )}
        </div>
    );
};

export default ViewAllocation;
