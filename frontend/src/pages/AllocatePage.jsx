import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Play, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AllocatePage = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [selectedExamIds, setSelectedExamIds] = useState([]);
    const [exams, setExams] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const { data } = await api.get('/admin/exams', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                // Sort by date ascending (oldest first for allocation flow usually)
                setExams(data.sort((a, b) => new Date(a.examDate) - new Date(b.examDate)));
            } catch (error) {
                toast.error('Failed to load exams list');
            }
        };
        fetchExams();
    }, []);

    const toggleExam = (id) => {
        setSelectedExamIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedExamIds(exams.map(e => e._id));
        } else {
            setSelectedExamIds([]);
        }
    };

    const handleAllocate = async () => {
        if (selectedExamIds.length === 0) {
            toast.error('Please select at least one exam');
            return;
        }

        setLoading(true);
        setStatus(null);
        try {
            const payload = { examIds: selectedExamIds };
            const { data } = await api.post('/allocation/allocate', payload, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStatus({ type: 'success', message: data.message });
            toast.success(data.message);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Allocation failed' });
            toast.error('Allocation process failed');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('WARNING: This will delete ALL current allocations. Are you sure?')) return;

        setLoading(true);
        try {
            await api.delete('/allocation/reset', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStatus({ type: 'success', message: 'All allocations have been reset.' });
            toast.success('System reset successful');
        } catch (error) {
            toast.error('Failed to reset system');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-tight transition-colors">Seat Allocation</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto transition-colors">Select specific exams to assign seats. The system will group concurrent exams for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Allocation Card */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl dark:shadow-none border border-blue-100 dark:border-gray-700 flex flex-col items-center text-center space-y-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <div className="w-20 h-20 bg-blue-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 transition-colors">
                        <Play size={32} className="ml-1" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-wide transition-colors">Generate Allocations</h2>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 transition-colors">Pick exams below to start seat distribution.</p>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex flex-col gap-3 px-2">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedExamIds.length === exams.length && exams.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 rounded border-blue-200 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:checked:bg-blue-500 transition-colors"
                                    />
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Select All Upcoming</span>
                                </label>
                                <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase transition-colors">
                                    {selectedExamIds.length} Selected
                                </span>
                            </div>

                            {/* Subject Quick-Select Pills */}
                            <div className="flex flex-wrap gap-2">
                                {[...new Set(exams.map(e => e.subject))].map(subject => {
                                    const subjectIds = exams.filter(e => e.subject === subject).map(e => e._id);
                                    const isTotallySelected = subjectIds.every(id => selectedExamIds.includes(id));
                                    return (
                                        <button
                                            key={subject}
                                            onClick={() => {
                                                if (isTotallySelected) {
                                                    setSelectedExamIds(prev => prev.filter(id => !subjectIds.includes(id)));
                                                } else {
                                                    setSelectedExamIds(prev => [...new Set([...prev, ...subjectIds])]);
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight transition-all border ${isTotallySelected
                                                ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white shadow-sm'
                                                : 'bg-white dark:bg-gray-700 border-blue-100 dark:border-gray-600 text-blue-600 dark:text-blue-400 hover:border-blue-300 dark:hover:border-gray-500'
                                                }`}
                                        >
                                            {subject}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="max-h-56 overflow-y-auto px-2 space-y-2 custom-scrollbar">
                            {exams.length === 0 ? (
                                <p className="text-sm text-gray-400 dark:text-gray-500 py-4 italic transition-colors">No upcoming exams found.</p>
                            ) : (
                                exams.map(exam => (
                                    <label
                                        key={exam._id}
                                        className={`flex items-start space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedExamIds.includes(exam._id)
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50 ring-1 ring-blue-100 dark:ring-blue-800/50'
                                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600 hover:border-blue-100 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedExamIds.includes(exam._id)}
                                            onChange={() => toggleExam(exam._id)}
                                            className="mt-1 w-4 h-4 rounded border-blue-200 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:checked:bg-blue-500 transition-colors"
                                        />
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight uppercase font-outfit transition-colors">{exam.subject}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium transition-colors">
                                                {new Date(exam.examDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {exam.session}
                                            </p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleAllocate}
                        disabled={loading || selectedExamIds.length === 0}
                        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] transition-all disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Start Selected Allocation'}
                    </button>
                </div>

                {/* Reset Card */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl dark:shadow-none border border-red-100 dark:border-gray-700 flex flex-col items-center text-center space-y-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
                    <div className="w-20 h-20 bg-red-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-2 transition-colors">
                        <RotateCcw size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-wide transition-colors">Reset System</h2>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 transition-colors">Clears all current seating arrangements. Use this before starting a new exam cycle.</p>
                    </div>
                    <button
                        onClick={handleReset}
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Reset All Allocations'}
                    </button>
                </div>
            </div>

            {status && (
                <div className={`p-6 rounded-2xl flex items-center gap-4 ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/50' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/50'
                    }`}>
                    {status.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    <p className="font-bold">{status.message}</p>
                </div>
            )}
        </div>
    );
};

export default AllocatePage;
