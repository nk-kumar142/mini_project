import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Plus, Trash2, BookOpen, Hotel, Calendar, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageDutyAllocations = () => {
    const [allocations, setAllocations] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [exams, setExams] = useState([]);
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAllocations, setSelectedAllocations] = useState([]);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        staffId: '',
        examId: '',
        hallId: ''
    });

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            const [allocRes, staffRes, examRes, hallRes] = await Promise.all([
                api.get('/admin/duty-allocations', config),
                api.get('/admin/staff', config),
                api.get('/admin/exams', config),
                api.get('/admin/halls', config)
            ]);

            setAllocations(allocRes.data);
            setStaffList(staffRes.data);
            setExams(examRes.data);
            setHalls(hallRes.data);
            setSelectedAllocations([]);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.post('/admin/duty-allocations', formData, config);
            toast.success('Staff duty allocated successfully');
            setFormData({ staffId: '', examId: '', hallId: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to allocate duty');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this duty allocation?')) return;
        try {
            await api.delete(`/admin/duty-allocations/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('Duty allocation removed');
            fetchData();
        } catch (error) {
            toast.error('Failed to remove duty allocation');
        }
    };
    const handleAutoAssign = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await api.post('/admin/duty-allocations/auto', {}, config);
            toast.success(response.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to auto-assign duties');
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedAllocations(allocations.map(a => a._id));
        } else {
            setSelectedAllocations([]);
        }
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) {
            setSelectedAllocations([...selectedAllocations, id]);
        } else {
            setSelectedAllocations(selectedAllocations.filter(aId => aId !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedAllocations.length} duty allocations?`)) return;
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await api.post('/admin/duty-allocations/bulk-delete', { ids: selectedAllocations }, config);
            toast.success(response.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete selected allocations');
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-tight transition-colors">Staff Duty Allocation</h1>
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-1 transition-colors">Assign staff to oversee exams in specific halls</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to Assign Duty */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -z-10 transition-colors"></div>
                        <h2 className="text-xl font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wide mb-6 transition-colors">Assign Duty</h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 transition-colors">Select Staff</label>
                                <select
                                    required
                                    value={formData.staffId}
                                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                >
                                    <option value="">-- Choose Staff --</option>
                                    {staffList.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.department})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 transition-colors">Select Exam</label>
                                <select
                                    required
                                    value={formData.examId}
                                    onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                >
                                    <option value="">-- Choose Exam --</option>
                                    {exams.map(e => (
                                        <option key={e._id} value={e._id}>{e.examName} ({new Date(e.examDate).toLocaleDateString()} {e.session})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 transition-colors">Select Hall</label>
                                <select
                                    required
                                    value={formData.hallId}
                                    onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                >
                                    <option value="">-- Choose Hall --</option>
                                    {halls.map(h => (
                                        <option key={h._id} value={h._id}>{h.hallName} (Cap: {h.capacity})</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/30"
                            >
                                <Plus size={16} /> Allocate Duty
                            </button>
                        </form>
                    </div>
                </div>

                {/* List of Allocations */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                            <h2 className="text-lg font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wide transition-colors">Current Duty Allocations</h2>
                            <div className="flex items-center gap-3">
                                {selectedAllocations.length > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 size={14} /> Delete Selected ({selectedAllocations.length})
                                    </button>
                                )}
                                <button
                                    onClick={handleAutoAssign}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
                                >
                                    <Zap size={14} /> Auto Assign Duties
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 dark:bg-gray-700/50 transition-colors">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={allocations.length > 0 && selectedAllocations.length === allocations.length}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Staff</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Exam</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Date & Time</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Hall</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 transition-colors">
                                    {allocations.map((alloc) => (
                                        <tr key={alloc._id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAllocations.includes(alloc._id)}
                                                    onChange={(e) => handleSelectOne(e, alloc._id)}
                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase transition-colors">
                                                        {alloc.staffId?.name?.substring(0, 2) || 'ST'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 dark:text-gray-200 text-xs transition-colors">{alloc.staffId?.name}</p>
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold transition-colors">{alloc.staffId?.department}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs font-bold transition-colors">
                                                    <BookOpen size={12} />
                                                    {alloc.examId?.examName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[10px] font-bold transition-colors">
                                                    <Calendar size={12} />
                                                    {new Date(alloc.examId?.examDate).toLocaleDateString()} {alloc.examId?.session} ({alloc.examId?.time})
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs font-bold transition-colors">
                                                    <Hotel size={12} />
                                                    {alloc.hallId?.hallName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(alloc._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {allocations.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider transition-colors">
                                                No duty allocations found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageDutyAllocations;
