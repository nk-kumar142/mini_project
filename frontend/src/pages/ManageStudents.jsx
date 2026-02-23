import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit, Search, Filter, Plus, ChevronLeft, GraduationCap, Building2, Users, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [explorerType, setExplorerType] = useState('dept'); // 'dept' or 'year'
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', registerNumber: '', department: '', year: '' });
    const [page, setPage] = useState(1);
    const itemsPerPage = 50;
    const csvInputRef = useRef(null);

    const { user } = useAuth();

    const deptsInfo = [
        { name: 'Information Technology', code: 'IT', color: 'bg-blue-500' },
        { name: 'Mechanical Engineering', code: 'MECH', color: 'bg-orange-500' },
        { name: 'Civil Engineering', code: 'CIVIL', color: 'bg-emerald-500' },
        { name: 'Mechatronics Engineering', code: 'MCT', color: 'bg-purple-500' },
        { name: 'Artificial Intelligence & Data Science', code: 'AIDS', color: 'bg-indigo-500' },
        { name: 'Artificial Intelligence & Machine Learning', code: 'AIML', color: 'bg-pink-500' },
        { name: 'Computer Science & Engineering', code: 'CSE', color: 'bg-sky-500' },
        { name: 'Electronics & Communication Engineering', code: 'ECE', color: 'bg-rose-500' },
        { name: 'Electrical & Electronics Engineering', code: 'EEE', color: 'bg-amber-500' },
        { name: 'Computer Science & Business System', code: 'CSBS', color: 'bg-teal-500' }
    ];

    const yearsInfo = [
        { name: '1st Year', value: '1', color: 'bg-rose-500', icon: '1' },
        { name: '2nd Year', value: '2', color: 'bg-amber-500', icon: '2' },
        { name: '3rd Year', value: '3', color: 'bg-emerald-500', icon: '3' },
        { name: '4th Year', value: '4', color: 'bg-blue-500', icon: '4' }
    ];

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/students', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setStudents(data);
        } catch (error) {
            toast.error('Failed to fetch students');
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/admin/students/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                toast.success('Student record updated');
            } else {
                await axios.post('http://localhost:5000/api/admin/students', formData, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                toast.success('Student added successfully');
            }
            setEditingId(null);
            setShowForm(false);
            setFormData({ name: '', email: '', password: '', registerNumber: '', department: '', year: '' });
            fetchStudents();
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Action failed';
            toast.error(message);
        }
    };

    const handleEdit = (student) => {
        setFormData({
            name: student.name,
            email: student.email,
            password: '',
            registerNumber: student.registerNumber,
            department: student.department,
            year: student.year
        });
        setEditingId(student._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/students/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                toast.success('Student deleted');
                fetchStudents();
            } catch (error) {
                toast.error('Failed to delete student');
            }
        }
    };

    const handleCSVImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const lines = text.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const students = lines.slice(1).map(line => {
                const vals = line.split(',').map(v => v.trim());
                const obj = {};
                headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
                return obj;
            }).filter(s => s.name && s.email && s.registernumber && s.department && s.year)
                .map(s => ({ name: s.name, email: s.email, registerNumber: s.registernumber, department: s.department, year: s.year }));

            if (students.length === 0) {
                toast.error('No valid rows found. Check CSV format.');
                return;
            }
            try {
                const { data } = await axios.post('http://localhost:5000/api/admin/students/bulk', { students }, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                toast.success(data.message);
                fetchStudents();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Import failed');
            } finally {
                csvInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.registerNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        // Primary Explorer Filters
        const matchesPrimaryDept = selectedDept ? student.department === selectedDept : true;
        const matchesPrimaryYear = selectedYear ? student.year === selectedYear : true;

        // Sub-Filters (Within a view)
        const matchesSubDept = deptFilter ? student.department === deptFilter : true;
        const matchesSubYear = yearFilter ? student.year === yearFilter : true;

        return matchesSearch && matchesPrimaryDept && matchesPrimaryYear && matchesSubDept && matchesSubYear;
    });

    const paginatedStudents = filteredStudents.slice(0, page * itemsPerPage);

    const getDeptCount = (deptName) => {
        return students.filter(s => s.department === deptName).length;
    };

    const getYearCount = (yearValue) => {
        return students.filter(s => s.year === yearValue).length;
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {(selectedDept || selectedYear) && (
                        <button
                            onClick={() => { setSelectedDept(null); setSelectedYear(null); setPage(1); }}
                            className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-gray-100 text-blue-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tight">
                            {selectedDept || (selectedYear ? `${selectedYear}${selectedYear === '1' ? 'st' : selectedYear === '2' ? 'nd' : selectedYear === '3' ? 'rd' : 'th'} Year` : 'Student Explorer')}
                        </h1>
                        <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest mt-1">
                            {selectedDept || selectedYear ? 'Enhanced Drill-down' : 'Select a category to manage students'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!selectedDept && !selectedYear && (
                        <div className="bg-white p-1.5 rounded-2xl flex shadow-lg shadow-blue-900/5 border border-gray-100">
                            <button
                                onClick={() => { setExplorerType('dept'); setPage(1); }}
                                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${explorerType === 'dept' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Departments
                            </button>
                            <button
                                onClick={() => { setExplorerType('year'); setPage(1); }}
                                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${explorerType === 'year' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Years
                            </button>
                        </div>
                    )}
                    {/* Hidden CSV input */}
                    <input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleCSVImport}
                    />
                    <button
                        onClick={() => csvInputRef.current?.click()}
                        className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/10"
                        title="Import students from CSV (columns: name, email, registerNumber, department, year)"
                    >
                        <Upload size={15} />
                        Import CSV
                    </button>
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            if (!showForm) {
                                setEditingId(null);
                                setFormData({
                                    name: '', email: '', password: '', registerNumber: '',
                                    department: selectedDept || '', year: selectedYear || ''
                                });
                            }
                        }}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10"
                    >
                        <Plus size={16} />
                        {editingId ? 'Edit Mode Active' : 'Add Student'}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                            className="w-full px-5 py-3 bg-[#f8f8f2] border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-bold text-[13px]"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-5 py-3 bg-[#f8f8f2] border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-bold text-[13px]"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder={editingId ? 'Leave blank to keep current email' : 'Leave blank to auto-generate (e.g. jatin.it25@gmail.com)'}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            {editingId ? 'Reset Password' : 'Password'}
                            <span className="text-gray-300 font-medium normal-case tracking-normal ml-1">
                                {editingId ? '(leave blank to keep current)' : '(default: register number)'}
                            </span>
                        </label>
                        <input
                            type="password"
                            className="w-full px-5 py-3 bg-[#f8f8f2] border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-bold text-[13px]"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={editingId ? 'Leave blank → keeps current password' : 'Leave blank → uses register number'}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Register Number</label>
                        <input
                            className="w-full px-5 py-3 bg-[#f8f8f2] border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-bold text-[13px]"
                            value={formData.registerNumber}
                            onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                        <select
                            className="w-full px-5 py-3 bg-[#f8f8f2] border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-bold text-[13px] cursor-pointer"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            required
                        >
                            <option value="">Select Dept</option>
                            {deptsInfo.map(d => (
                                <option key={d.code} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Year</label>
                        <select
                            className="w-full px-5 py-3 bg-[#f8f8f2] border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-bold text-[13px] cursor-pointer"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            required
                        >
                            <option value="">Select Year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 flex gap-3 mt-2">
                        <button type="submit" className="flex-1 bg-blue-500 text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md">
                            {editingId ? 'Update Profile' : 'Add Student'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setEditingId(null); }}
                            className="px-8 bg-gray-100 text-gray-400 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {!selectedDept && !selectedYear ? (
                /* Explorer View: Department or Year Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {explorerType === 'dept' ? deptsInfo.map((dept) => (
                        <button
                            key={dept.code}
                            onClick={() => { setSelectedDept(dept.name); setPage(1); }}
                            className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:border-blue-100 transition-all duration-300 text-left relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 ${dept.color} opacity-[0.03] rounded-bl-[4rem] group-hover:scale-110 transition-transform`} />

                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-12 h-12 ${dept.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/10`}>
                                    <GraduationCap size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-gray-900 tracking-tight">{getDeptCount(dept.name)}</span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Students</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-[15px] font-black text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{dept.name}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{dept.code} Department</p>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                <span className="text-[10px] font-black uppercase tracking-widest">Manage Department</span>
                                <ChevronLeft className="rotate-180" size={14} />
                            </div>
                        </button>
                    )) : yearsInfo.map((yr) => (
                        <button
                            key={yr.value}
                            onClick={() => { setSelectedYear(yr.value); setPage(1); }}
                            className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:border-blue-100 transition-all duration-300 text-left relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 ${yr.color} opacity-[0.03] rounded-bl-[4rem] group-hover:scale-110 transition-transform`} />

                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-12 h-12 ${yr.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/10 font-bold text-2xl`}>
                                    {yr.icon}
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-gray-900 tracking-tight">{getYearCount(yr.value)}</span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Students</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-[15px] font-black text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{yr.name}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Batch 202{6 - yr.value}</p>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                <span className="text-[10px] font-black uppercase tracking-widest">Manage Year</span>
                                <ChevronLeft className="rotate-180" size={14} />
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                /* Detail View: Student Table with Pagination */
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-lg shadow-black/5 border border-gray-100">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={`Search student...`}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-bold text-[13px]"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            />
                        </div>

                        {/* Context-aware dropdowns */}
                        {/* Year Tabs for Department View */}
                        {selectedDept && (
                            <div className="flex bg-gray-100/80 p-1 rounded-xl overflow-x-auto min-w-0">
                                {['', '1', '2', '3', '4'].map((yr) => (
                                    <button
                                        key={yr}
                                        onClick={() => { setYearFilter(yr); setPage(1); }}
                                        className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${yearFilter === yr
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {yr === '' ? 'All' : `${yr === '1' ? 'I' : yr === '2' ? 'II' : yr === '3' ? 'III' : 'IV'} Year`}
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedYear && (
                            <div className="relative w-full md:w-64">
                                <select
                                    className="w-full px-5 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-black text-[11px] uppercase tracking-widest appearance-none cursor-pointer text-blue-600"
                                    value={deptFilter}
                                    onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="">All Departments</option>
                                    {deptsInfo.map(d => (
                                        <option key={d.code} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                                <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none text-blue-400" size={14} />
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-[#dbeafe] border-b border-gray-200/50">
                                <tr>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">Name</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">Reg No</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">Email</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">Dept</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">Year</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-[13px] font-bold text-gray-700">
                                {paginatedStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                        <td className="px-8 py-5 text-center">{student.name}</td>
                                        <td className="px-8 py-5 text-gray-500 text-center">{student.registerNumber}</td>
                                        <td className="px-6 py-5 text-center" title={student.email}>
                                            <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-lg inline-block max-w-[160px] truncate">
                                                {student.email || '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-gray-500 text-center truncate max-w-[150px]">{student.department.split(' ')[0]}...</td>
                                        <td className="px-8 py-5 text-gray-500 text-center">{student.year}</td>
                                        <td className="px-8 py-5 text-center flex justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(student)}
                                                className="p-2 text-blue-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student._id)}
                                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredStudents.length > paginatedStudents.length && (
                            <div className="p-8 text-center border-t border-gray-50">
                                <button
                                    onClick={() => setPage(page + 1)}
                                    className="px-8 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-100 transition-all"
                                >
                                    Load More ({filteredStudents.length - paginatedStudents.length} Remaining)
                                </button>
                            </div>
                        )}
                        {filteredStudents.length === 0 && (
                            <div className="p-20 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
                                    <Users className="text-gray-300" size={32} />
                                </div>
                                <h3 className="text-[15px] font-black text-gray-800 uppercase tracking-tight">No students found</h3>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Try adjusting your search</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;
