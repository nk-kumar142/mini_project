import { useState, useEffect, useRef } from 'react';

const TIME_PRESETS = [
    { label: 'FN', session: 'FN', start: '10:00', end: '13:00', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40 border-blue-200 dark:border-blue-700' },
    { label: 'AN', session: 'AN', start: '14:00', end: '17:00', color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800/40 border-orange-200 dark:border-orange-700' },
];
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus, Search, Trash2, Edit2, X, Clock, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
    'All Departments',
    'Information Technology',
    'Computer Science & Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechatronics Engineering',
    'Artificial Intelligence & Data Science',
    'Artificial Intelligence & Machine Learning',
    'Computer Science & Business System'
];

/* ── Multi-select department dropdown component ── */
const DeptMultiSelect = ({ selected, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggle = (dept) => {
        if (dept === 'All Departments') {
            // If "All Departments" clicked, select all OR clear
            if (selected.includes('All Departments')) {
                onChange([]);
            } else {
                onChange([...DEPARTMENTS]);
            }
            return;
        }
        let next;
        if (selected.includes(dept)) {
            next = selected.filter(d => d !== dept && d !== 'All Departments');
        } else {
            const withNew = [...selected.filter(d => d !== 'All Departments'), dept];
            // If all individual depts selected, also add All Departments
            const individualDepts = DEPARTMENTS.filter(d => d !== 'All Departments');
            next = individualDepts.every(d => withNew.includes(d))
                ? ['All Departments', ...withNew]
                : withNew;
        }
        onChange(next);
    };

    const label = selected.length === 0
        ? 'Select Departments'
        : selected.includes('All Departments')
            ? 'All Departments'
            : selected.length === 1
                ? selected[0]
                : `${selected.length} Departments Selected`;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 flex items-center justify-between gap-2 text-left transition-colors"
            >
                <span className={selected.length === 0 ? 'text-gray-300 dark:text-gray-500' : ''}>{label}</span>
                <ChevronDown size={16} className={`text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                    {DEPARTMENTS.map(dept => {
                        const checked = selected.includes(dept);
                        return (
                            <label
                                key={dept}
                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${dept === 'All Departments' ? 'border-b border-gray-100 dark:border-gray-700 font-black text-[#1e3a8a] dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 font-semibold'}`}
                            >
                                <div
                                    onClick={() => toggle(dept)}
                                    className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800'}`}
                                >
                                    {checked && <Check size={10} color="white" strokeWidth={3} />}
                                </div>
                                <span onClick={() => toggle(dept)} className="text-xs">{dept}</span>
                            </label>
                        );
                    })}
                </div>
            )}

            {/* Selected tags */}
            {selected.length > 0 && !selected.includes('All Departments') && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {selected.map(d => (
                        <span
                            key={d}
                            className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide"
                        >
                            {d.length > 20 ? d.slice(0, 20) + '…' : d}
                            <button type="button" onClick={() => toggle(d)} className="hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ── Main Component ── */
const ManageExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExams, setSelectedExams] = useState([]);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        _id: '',
        examName: '',
        examDate: '',
        subject: '',
        departments: [],   // now an array
        year: 'I',
        startTime: '',
        endTime: '',
        session: 'FN'
    });

    const fetchExams = async () => {
        try {
            const { data } = await api.get('/admin/exams', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setExams(data);
            setSelectedExams([]);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch exams');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, [user.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.departments.length === 0) {
            toast.error('Please select at least one department');
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Send department as joined string for backward compat OR send array
            if (!formData.startTime || !formData.endTime) {
                toast.error('Please set both start time and end time');
                return;
            }
            if (formData.startTime >= formData.endTime) {
                toast.error('End time must be after start time');
                return;
            }
            const payload = {
                ...formData,
                time: `${formData.startTime} - ${formData.endTime}`,
                department: formData.departments.includes('All Departments')
                    ? 'All Departments'
                    : formData.departments.join(', ')
            };

            if (isEditing) {
                await api.put(`/admin/exams/${formData._id}`, payload, config);
                toast.success('Exam updated successfully');
            } else {
                await api.post('/admin/exams', payload, config);
                toast.success('Exam scheduled successfully');
            }

            setShowModal(false);
            resetForm();
            fetchExams();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this exam?')) return;
        try {
            await api.delete(`/admin/exams/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('Exam removed successfully');
            fetchExams();
        } catch (error) {
            toast.error('Failed to delete exam');
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedExams(exams.map(ex => ex._id));
        } else {
            setSelectedExams([]);
        }
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) {
            setSelectedExams([...selectedExams, id]);
        } else {
            setSelectedExams(selectedExams.filter(eId => eId !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedExams.length} exams? Doing so will also delete all their student seat allocations and staff duty allocations.`)) return;
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await api.post('/admin/exams/bulk-delete', { ids: selectedExams }, config);
            toast.success(response.data.message);
            fetchExams();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete selected exams');
            setLoading(false);
        }
    };

    const handleEdit = (exam) => {
        // Handle department which is now an array from backend
        let deptArr = [];
        if (Array.isArray(exam.department)) {
            deptArr = exam.department;
        } else if (typeof exam.department === 'string') {
            deptArr = exam.department.split(', ').map(d => d.trim()).filter(Boolean);
        }

        // Parse existing time string "HH:MM - HH:MM" back into start/end
        let startTime = '', endTime = '';
        if (exam.time && exam.time.includes(' - ')) {
            [startTime, endTime] = exam.time.split(' - ').map(t => t.trim());
        } else if (exam.time) {
            startTime = exam.time;
        }
        setFormData({
            ...exam,
            departments: deptArr,
            startTime,
            endTime,
            examDate: new Date(exam.examDate).toISOString().split('T')[0]
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            _id: '',
            examName: '',
            examDate: '',
            subject: '',
            departments: [],
            year: 'I',
            startTime: '',
            endTime: '',
            session: 'FN'
        });
        setIsEditing(false);
    };

    const filteredExams = exams.filter(exam =>
        exam.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.department || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-tight transition-colors">Exam Schedule</h1>
                    <p className="text-sm font-medium text-gray-400 mt-1">{exams.length} exams scheduled</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedExams.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={loading}
                            className="flex items-center gap-2 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-800/60 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} /> Delete Selected ({selectedExams.length})
                        </button>
                    )}
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/30"
                    >
                        <Plus size={16} /> Schedule Exam
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search by exam name, subject or department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-8 py-5 text-left">
                                    <input
                                        type="checkbox"
                                        checked={exams.length > 0 && selectedExams.length === exams.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                                    />
                                </th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date &amp; Time</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Exam Details</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Dept &amp; Year</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {filteredExams.map((exam) => (
                                <tr key={exam._id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <input
                                            type="checkbox"
                                            checked={selectedExams.includes(exam._id)}
                                            onChange={(e) => handleSelectOne(e, exam._id)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                                        />
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center text-[10px] font-black border border-blue-100 dark:border-gray-600 uppercase">
                                                <span>{new Date(exam.examDate).getDate()}</span>
                                                <span className="text-[8px] opacity-70">{new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                    <Clock size={12} />
                                                    {exam.time} ({exam.session})
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-gray-800 dark:text-white text-sm">{exam.subject}</p>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{exam.examName}</p>
                                    </td>
                                    <td className="px-8 py-5 max-w-xs">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider break-words">
                                            {Array.isArray(exam.department) ? exam.department.join(', ') : exam.department} — {exam.year}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(exam)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(exam._id)}
                                                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredExams.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-gray-400 dark:text-gray-500 text-sm font-bold">
                                        No exams scheduled.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-colors">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wide">
                                    {isEditing ? 'Edit Exam' : 'Schedule New Exam'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <X size={20} className="text-gray-400 dark:text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Exam Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.examName}
                                            onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all"
                                            placeholder="e.g. Semester Exam May 2025"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all"
                                            placeholder="e.g. Data Structures"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.examDate}
                                            onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        {/* Quick preset buttons */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Quick Time Presets</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {TIME_PRESETS.map(preset => {
                                                    const active = formData.startTime === preset.start && formData.endTime === preset.end;
                                                    return (
                                                        <button
                                                            key={preset.label}
                                                            type="button"
                                                            onClick={() => setFormData(f => ({ ...f, session: preset.session, startTime: preset.start, endTime: preset.end }))}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-black uppercase tracking-wider transition-all ${active
                                                                ? preset.session === 'FN'
                                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                                    : 'bg-orange-500 text-white border-orange-500 shadow-md'
                                                                : preset.color
                                                                }`}
                                                        >
                                                            <span>{preset.label}</span>
                                                            <span className="opacity-70 font-semibold">{preset.start} – {preset.end}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {/* Manual inputs */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Start Time</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={formData.startTime}
                                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">End Time</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={formData.endTime}
                                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Session</label>
                                                <select
                                                    required
                                                    value={formData.session}
                                                    onChange={(e) => {
                                                        const sel = e.target.value;
                                                        const preset = TIME_PRESETS.find(p => p.session === sel);
                                                        setFormData(f => ({ ...f, session: sel, startTime: preset ? preset.start : f.startTime, endTime: preset ? preset.end : f.endTime }));
                                                    }}
                                                    className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3 px-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all"
                                                >
                                                    <option value="FN">FN</option>
                                                    <option value="AN">AN</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
                                            Department <span className="text-blue-400 normal-case font-semibold">(multi-select)</span>
                                        </label>
                                        <DeptMultiSelect
                                            selected={formData.departments}
                                            onChange={(val) => setFormData({ ...formData, departments: val })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Year</label>
                                        <select
                                            required
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all"
                                        >
                                            {['I', 'II', 'III', 'IV'].map(y => <option key={y} value={y}>{y} Year</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/30"
                                    >
                                        {isEditing ? 'Update Schedule' : 'Schedule Exam'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageExams;
