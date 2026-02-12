import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Download, CheckCircle, Clock, User, Hash, MapPin, Calendar, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

const AllocationList = () => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchAllocations = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('http://localhost:5000/api/allocation', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setAllocations(data);
        } catch (error) {
            toast.error('Failed to fetch allocations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllocations();
    }, [user.token]);

    const handleApprove = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/allocation/${id}/approve-download`, {}, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            toast.success('Download approved successfully');
            fetchAllocations();
        } catch (error) {
            toast.error('Failed to approve download');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hall Allocation Management</h1>
                    <p className="mt-2 text-sm text-gray-500">View and manage exam hall assignments and ticket download requests.</p>
                </div>
                <div className="bg-primary-50 px-4 py-2 rounded-lg border border-primary-100">
                    <span className="text-primary-700 font-semibold">{allocations.length}</span>
                    <span className="ml-2 text-primary-600 text-sm">Total Allocations</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center gap-2"><User size={14} /> Student</div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center gap-2"><ClipboardList size={14} /> Exam & Subject</div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center gap-2"><MapPin size={14} /> Hall & Seat</div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {allocations.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                                        No allocations found. Start by allocating halls.
                                    </td>
                                </tr>
                            ) : (
                                allocations.map((alc) => {
                                    const status = alc?.downloadRequestStatus || 'none';
                                    return (
                                        <tr key={alc._id} className="hover:bg-gray-50/80 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-bold text-gray-900">{alc.studentId?.name || 'Unknown Student'}</div>
                                                    <div className="text-xs text-secondary-500 font-mono mt-0.5">{alc.studentId?.registerNumber || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="text-sm text-gray-800 font-semibold">{alc.examId?.examName || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Calendar size={12} /> {alc.examId?.subject || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary-50 text-primary-700 px-2 py-1 rounded font-bold text-xs ring-1 ring-primary-100">
                                                        {alc.hallId?.hallName || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Hash size={14} /> <span className="font-bold">{alc.seatNumber}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${status === 'approved'
                                                        ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                        : status === 'requested'
                                                            ? 'bg-amber-50 text-amber-700 ring-amber-600/20 animate-pulse'
                                                            : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                                                    }`}>
                                                    {status === 'requested' && <Clock size={12} className="mr-1" />}
                                                    {status === 'approved' && <CheckCircle size={12} className="mr-1" />}
                                                    {status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {status === 'requested' ? (
                                                    <button
                                                        onClick={() => handleApprove(alc._id)}
                                                        className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-bold text-xs uppercase"
                                                    >
                                                        <CheckCircle size={14} /> Approve
                                                    </button>
                                                ) : status === 'approved' ? (
                                                    <span className="text-green-600 font-bold text-xs flex items-center justify-end gap-1">
                                                        <CheckCircle size={14} /> READY
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">No Request</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllocationList;

