import { useState, useEffect, useRef } from 'react';

const TIME_PRESETS = [
    { label: 'FN', session: 'FN', start: '10:00', end: '13:00', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
    { label: 'AN', session: 'AN', start: '14:00', end: '17:00', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200' },
];
import axios from 'axios';
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
                className="w-full bg-gray-50 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 flex items-center justify-between gap-2 text-left"
            >
                <span className={selected.length === 0 ? 'text-gray-300' : ''}>{label}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                    {DEPARTMENTS.map(dept => {
                        const checked = selected.includes(dept);
                        return (
                            <label
                                key={dept}
                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${dept === 'All Departments' ? 'border-b border-gray-100 font-black text-[#1e3a8a]' : 'text-gray-700 font-semibold'}`}
                            >
                                <div
                                    onClick={() => toggle(dept)}
                                    className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}
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
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide"
                        >
                            {d.length > 20 ? d.slice(0, 20) + '…' : d}
                            <button type="button" onClick={() => toggle(d)} className="hover:text-red-500 transition-colors">
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
            const { data } = await axios.get('http://localhost:5000/api/admin/exams', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setExams(data);
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
                await axios.put(`http://localhost:5000/api/admin/exams/${formData._id}`, payload, config);
                toast.success('Exam updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/admin/exams', payload, config);
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
            await axios.delete(`http://localhost:5000/api/admin/exams/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('Exam removed successfully');
            fetchExams();
        } catch (error) {
            toast.error('Failed to delete exam');
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
                    <h1 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight">Exam Schedule</h1>
                    <p className="text-sm font-medium text-gray-400 mt-1">{exams.length} exams scheduled</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/30"
                >
                    <Plus size={16} /> Schedule Exam
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by exam name, subject or department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Date &amp; Time</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Exam Details</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Dept &amp; Year</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredExams.map((exam) => (
                                <tr key={exam._id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center text-[10px] font-black border border-blue-100 uppercase">
                                                <span>{new Date(exam.examDate).getDate()}</span>
                                                <span className="text-[8px] opacity-70">{new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                                    <Clock size={12} />
                                                    {exam.time} ({exam.session})
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="font-bold text-gray-800 text-sm">{exam.subject}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{exam.examName}</p>
                                    </td>
                                    <td className="px-8 py-5 max-w-xs">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider break-words">
                                            {Array.isArray(exam.department) ? exam.department.join(', ') : exam.department} — {exam.year}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(exam)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(exam._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredExams.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-8 py-12 text-center text-gray-400 text-sm font-bold">
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
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-wide">
                                    {isEditing ? 'Edit Exam' : 'Schedule New Exam'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Exam Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.examName}
                                            onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="e.g. Semester Exam May 2025"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="e.g. Data Structures"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.examDate}
                                            onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        {/* Quick preset buttons */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Quick Time Presets</label>
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
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Start Time</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={formData.startTime}
                                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">End Time</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={formData.endTime}
                                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Session</label>
                                                <select
                                                    required
                                                    value={formData.session}
                                                    onChange={(e) => {
                                                        const sel = e.target.value;
                                                        const preset = TIME_PRESETS.find(p => p.session === sel);
                                                        setFormData(f => ({ ...f, session: sel, startTime: preset ? preset.start : f.startTime, endTime: preset ? preset.end : f.endTime }));
                                                    }}
                                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20"
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
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                            Department <span className="text-blue-400 normal-case font-semibold">(multi-select)</span>
                                        </label>
                                        <DeptMultiSelect
                                            selected={formData.departments}
                                            onChange={(val) => setFormData({ ...formData, departments: val })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Year</label>
                                        <select
                                            required
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            {['I', 'II', 'III', 'IV'].map(y => <option key={y} value={y}>{y} Year</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors"
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
