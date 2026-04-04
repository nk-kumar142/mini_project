import { useState, useEffect } from 'react';
import api from '../services/api';
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
                const { data } = await api.get('/allocation/my-allocation', {
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
            const response = await api.get(`/pdf/my-hall-ticket`, {
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
        <div className="max-w-5xl mx-auto pb-10">
            {allocationsList.length > 0 ? (
                <div className="bg-[#323642] shadow-2xl overflow-hidden font-sans border border-gray-700 mx-4">
                    {/* Header Section */}
                    <div className="bg-[#1c2d54] text-center pt-8 pb-6 border-b-[3px] border-[#cda02c] relative">
                        <h1 className="text-4xl font-black tracking-wider mb-2 text-[#242b35] drop-shadow-sm" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}>
                            EXAMINATION DEPARTMENT
                        </h1>
                        <h2 className="text-[#cda02c] text-xl font-bold tracking-widest mb-4 uppercase">
                            Official Hall Ticket
                        </h2>
                        <p className="text-[#6484a4] text-sm">
                            — Present this ticket at the examination hall —
                        </p>

                        <button
                            onClick={handleDownload}
                            className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 text-white p-2 border border-white/10 rounded-md transition-all sm:hidden md:block"
                            title="Download PDF"
                        >
                            <Download size={20} />
                        </button>
                    </div>

                    {/* Student Information Section */}
                    <div className="p-8 pb-6">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-4">
                                <h3 className="text-white text-[11px] font-bold tracking-[0.25em] mb-4">S T U D E N T I N F O R M A T I O N</h3>
                                <p className="text-gray-400 text-xs mb-1">Name</p>
                                <p className="text-white font-bold text-base tracking-wide uppercase">{user.name}</p>
                            </div>
                            <div className="col-span-6 md:col-span-3">
                                <div className="hidden md:block h-[28px]"></div>
                                <p className="text-gray-400 text-xs mb-1">Register Number</p>
                                <p className="text-white font-bold text-base">{user.registerNumber}</p>
                            </div>
                            <div className="col-span-6 md:col-span-4">
                                <div className="hidden md:block h-[28px]"></div>
                                <p className="text-gray-400 text-xs mb-1">Department</p>
                                <p className="text-white font-bold text-base">{user.department}</p>
                            </div>
                            <div className="col-span-12 md:col-span-1">
                                <div className="hidden md:block h-[28px]"></div>
                                <p className="text-gray-400 text-xs mb-1">Year</p>
                                <p className="text-white font-bold text-base">{user.year || "3"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Title */}
                    <div className="bg-[#24262E] py-2 px-8 flex justify-between items-center border-y border-[#1a1c23]">
                        <h3 className="text-white text-[11px] font-bold tracking-[0.2em] uppercase">E X A M I N A T I O N S C H E D U L E</h3>
                        <div className="w-4 h-6 bg-white/90"></div>
                    </div>

                    {/* Schedule Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#e2e8f0] text-gray-800">
                                    <th className="px-8 py-3 text-xs font-bold tracking-wider">DATE</th>
                                    <th className="px-6 py-3 text-xs font-bold tracking-wider">SESSION</th>
                                    <th className="px-6 py-3 text-xs font-bold tracking-wider">TIME</th>
                                    <th className="px-6 py-3 text-xs font-bold tracking-wider">SUBJECT</th>
                                    <th className="px-6 py-3 text-xs font-bold tracking-wider">HALL</th>
                                    <th className="px-6 py-3 text-xs font-bold tracking-wider">BUILDING</th>
                                    <th className="px-8 py-3 text-xs font-bold tracking-wider text-center">SEAT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3d4251]">
                                {allocationsList.map((alc, index) => (
                                    <tr key={alc._id} className="bg-[#323642] hover:bg-[#393e4b] transition-colors">
                                        <td className="px-8 py-4 text-gray-300 text-sm">
                                            {new Date(alc.examId.examDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 text-sm">
                                            {alc.examId.session}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 text-sm">
                                            {alc.examId.time || (alc.examId.session === 'FN' ? '09:00 - 10:30' : '14:00 - 15:30')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[#a5b9eb] font-bold text-sm">{alc.examId.subject}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {alc.hallId.hallName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {alc.hallId.building}
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span className="text-[#c1cddf] font-bold text-sm">{alc.seatNumber}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Instructions Section */}
                    <div className="p-8 pt-4 pb-8">
                        <div className="bg-[#3e3422] p-4 text-[#d9b470] border-l-4 border-[#cda02c]">
                            <h4 className="text-xs font-bold uppercase mb-2">IMPORTANT INSTRUCTIONS</h4>
                            <div className="flex flex-wrap md:flex-nowrap gap-x-6 gap-y-2 text-[11px] font-medium tracking-wide">
                                <span>1. Bring this hall ticket with a valid ID card to every examination.</span>
                                <span>2. Report 30 minutes before the scheduled time.</span>
                                <span>3. Electronic gadgets are strictly prohibited inside the hall.</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 transition-colors mx-4">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-gray-500 transition-colors">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-xl font-black text-gray-400 dark:text-gray-500 uppercase tracking-wide transition-colors">No Allocations Yet</h2>
                    <p className="text-gray-400 dark:text-gray-500 mt-2 max-w-xs mx-auto text-sm font-medium transition-colors">Your unified hall ticket will appear here once the allocation process is completed by the admin.</p>
                </div>
            )}
        </div>
    );
};

export default ViewAllocation;
