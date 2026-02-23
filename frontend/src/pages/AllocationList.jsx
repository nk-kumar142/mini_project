import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Download, Filter, FileText, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AllocationList = () => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('ALL');
    const { user } = useAuth();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'hall'

    const fetchAllocations = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/allocation', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAllocations(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch allocation list');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllocations();
    }, [user.token]);

    const handleApproveDownload = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/allocation/${id}/approve-download`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('Download approved');
            fetchAllocations();
        } catch (error) {
            toast.error('Approval failed');
        }
    };

    const handleBulkApprove = async (subject) => {
        if (!window.confirm(`Are you sure you want to approve ALL download requests for ${subject}?`)) return;

        try {
            const { data } = await axios.put('http://localhost:5000/api/allocation/approve-subject', { subject }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success(data.message);
            fetchAllocations();
        } catch (error) {
            toast.error('Bulk approval failed');
        }
    };

    // Get unique subjects for filtering
    const subjects = ['ALL', ...new Set(allocations.map(alc => alc.examId?.subject).filter(Boolean))];

    const filteredAllocations = allocations.filter(alc => {
        const matchesSearch = alc.studentId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alc.studentId?.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alc.hallId?.hallName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSubject = selectedSubject === 'ALL' || alc.examId?.subject === selectedSubject;

        return matchesSearch && matchesSubject;
    });

    // Group by Hall for Hall View
    const allocationsByHall = filteredAllocations.reduce((acc, alc) => {
        const hallName = alc.hallId?.hallName || 'Unassigned';
        if (!acc[hallName]) acc[hallName] = [];
        acc[hallName].push(alc);
        return acc;
    }, {});

    // Sort halls alphabetically
    const sortedHalls = Object.keys(allocationsByHall).sort();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight">Allocation List</h1>
                    <p className="text-sm font-medium text-gray-400 mt-1">
                        {filteredAllocations.length} allocations shown
                        {viewMode === 'hall' && ` across ${sortedHalls.length} halls`}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode('hall')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'hall' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Hall View
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search student, register no, or hall..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Filter By:</span>
                        {subjects.map(sub => (
                            <button
                                key={sub}
                                onClick={() => setSelectedSubject(sub)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${selectedSubject === sub
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                    : 'bg-white border-blue-50 text-blue-600 hover:border-blue-200'
                                    }`}
                            >
                                {sub === 'ALL' ? 'All Subjects' : sub}
                            </button>
                        ))}
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="p-6 space-y-10">
                        {filteredAllocations.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 text-sm font-bold bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                                No allocations found matching your filters.
                            </div>
                        ) : (
                            Object.entries(
                                filteredAllocations.reduce((acc, alc) => {
                                    const subject = alc.examId?.subject || 'Unknown Subject';
                                    if (!acc[subject]) acc[subject] = [];
                                    acc[subject].push(alc);
                                    return acc;
                                }, {})
                            ).sort().map(([subject, subjectAllocs]) => (
                                <div key={subject} className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                                                {subject}
                                                <span className="ml-2 text-sm font-bold text-gray-400">
                                                    ({subjectAllocs.length})
                                                </span>
                                            </h2>
                                        </div>
                                        <button
                                            onClick={() => handleBulkApprove(subject)}
                                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle size={14} /> Approve All {subject}
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto bg-white rounded-[2rem] shadow-sm border border-gray-100">
                                        <table className="w-full">
                                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                                                    <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Exam Details</th>
                                                    <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Allocation</th>
                                                    <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Download Access</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {subjectAllocs.map((alc) => (
                                                    <tr key={alc._id} className="hover:bg-blue-50/30 transition-colors group">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm uppercase">
                                                                    {alc.studentId?.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-800 text-sm">{alc.studentId?.name}</p>
                                                                    <p className="text-xs font-medium text-gray-500">{alc.studentId?.registerNumber}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <p className="font-bold text-gray-800 text-sm">{alc.examId?.subject}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{alc.examId?.examName}</p>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider">
                                                                    Hall {alc.hallId?.hallName}
                                                                </span>
                                                                <span className="text-xs font-bold text-gray-500">Seat {alc.seatNumber}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            {alc.downloadRequestStatus === 'approved' ? (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                                    <CheckCircle size={12} /> Approved
                                                                </span>
                                                            ) : alc.downloadRequestStatus === 'requested' ? (
                                                                <button
                                                                    onClick={() => handleApproveDownload(alc._id)}
                                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors"
                                                                >
                                                                    Approve Request
                                                                </button>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No Request</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="p-6 space-y-8">
                        {sortedHalls.map(hallName => {
                            const hallStudents = allocationsByHall[hallName];

                            // Group by Exam Subject & Department
                            const summaryGroup = hallStudents.reduce((acc, student) => {
                                const key = `${student.studentId?.department} - ${student.examId?.subject}`;
                                if (!acc[key]) {
                                    acc[key] = {
                                        department: student.studentId?.department,
                                        subject: student.examId?.subject,
                                        code: student.examId?.examName,
                                        registerNumbers: [],
                                        count: 0
                                    };
                                }
                                acc[key].registerNumbers.push(student.studentId?.registerNumber);
                                acc[key].count++;
                                return acc;
                            }, {});

                            const summaryRows = Object.values(summaryGroup).sort((a, b) => a.department.localeCompare(b.department));

                            return (
                                <div key={hallName} className="border-2 border-gray-800 rounded-none overflow-hidden print:border-black print:break-inside-avoid mb-8">
                                    <div className="bg-white px-6 py-4 border-b-2 border-gray-800 flex justify-between items-center print:border-black">
                                        <div>
                                            <h3
                                                className="font-bold text-gray-900 text-lg uppercase cursor-pointer hover:text-blue-600 underline decoration-dotted decoration-gray-400 hover:decoration-blue-600 transition-colors"
                                                onClick={() => navigate(`/admin/hall/${encodeURIComponent(hallName)}`)}
                                                title="View Detailed Seating Chart"
                                            >
                                                Hall No: {hallName}
                                            </h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider print:hidden">
                                                {hallStudents.length} Students Allocated
                                            </p>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead className="bg-gray-100 border-b-2 border-gray-800 print:bg-white print:border-black">
                                                <tr>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-800 print:border-black w-12">S.No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-800 print:border-black w-64">Branch - Course Code</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-800 print:border-black">Register Nos.</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider w-24">No. of Candidates</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800 print:divide-black">
                                                {summaryRows.map((row, index) => (
                                                    <tr key={index} className="bg-white">
                                                        <td className="px-4 py-4 text-center text-sm font-bold text-gray-900 border-r border-gray-800 print:border-black align-top">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-bold text-gray-900 border-r border-gray-800 print:border-black align-top">
                                                            <div className="uppercase">
                                                                {row.department}
                                                            </div>
                                                            <div className="text-xs font-medium text-gray-600 mt-1">
                                                                {row.subject} ({row.code})
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-xs font-medium text-gray-800 border-r border-gray-800 print:border-black align-top leading-relaxed break-words font-mono text-justify">
                                                            {row.registerNumbers.sort().join(', ')}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-lg font-bold text-gray-900 align-middle">
                                                            {row.count}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-50 font-bold border-t-2 border-gray-800 print:bg-white print:border-black">
                                                    <td colSpan="3" className="px-4 py-3 text-right text-sm uppercase tracking-wider border-r border-gray-800 print:border-black">Total</td>
                                                    <td className="px-4 py-3 text-center text-lg">{hallStudents.length}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllocationList;
