import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Plus, Search, Trash2, Edit2, X, Check, Filter, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageStaff = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    // Change Password Modal state
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [pwdTarget, setPwdTarget] = useState(null); // { _id, name }
    const [pwdForm, setPwdForm] = useState({ newPassword: '', confirmPassword: '' });

    const [formData, setFormData] = useState({
        _id: '',
        name: '',
        email: '',
        password: '',
        staffId: '',
        subject: '',
        department: ''
    });

    const fetchStaff = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/staff', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStaffList(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch staff list');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [user.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            if (isEditing) {
                // Remove password if empty to avoid overwriting with empty string
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;

                await axios.put(`http://localhost:5000/api/admin/staff/${formData._id}`, updateData, config);
                toast.success('Staff updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/admin/staff', formData, config);
                toast.success('Staff added successfully');
            }

            setShowModal(false);
            resetForm();
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/staff/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('Staff removed successfully');
            fetchStaff();
        } catch (error) {
            toast.error('Failed to delete staff');
        }
    };

    const handleEdit = (staff) => {
        setFormData({
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            password: '', // Don't show numeric hash/password
            staffId: staff.staffId,
            subject: staff.subject,
            department: staff.department || ''
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ _id: '', name: '', email: '', password: '', staffId: '', subject: '', department: '' });
        setIsEditing(false);
    };

    const openPwdModal = (staff) => {
        setPwdTarget({ _id: staff._id, name: staff.name });
        setPwdForm({ newPassword: '', confirmPassword: '' });
        setShowPwdModal(true);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (pwdForm.newPassword.length < 4) {
            toast.error('Password must be at least 4 characters');
            return;
        }
        try {
            await axios.put(
                `http://localhost:5000/api/admin/staff/${pwdTarget._id}`,
                { password: pwdForm.newPassword },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            toast.success(`Password changed for ${pwdTarget.name}`);
            setShowPwdModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    const filteredStaff = staffList.filter(staff =>
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.staffId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedStaff = filteredStaff.reduce((acc, staff) => {
        const dept = staff.department || 'Unassigned';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(staff);
        return acc;
    }, {});

    const departments = Object.keys(groupedStaff).sort();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tight">Staff Management</h1>
                    <p className="text-sm font-medium text-gray-400 mt-1">{staffList.length} staff members registered</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/30"
                >
                    <Plus size={16} /> Add Staff
                </button>
            </div>

            {/* Total Staff per Department Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {departments.map((dept) => (
                    <div key={dept} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{dept}</p>
                        <p className="text-2xl font-black text-blue-600 mt-1">{groupedStaff[dept].length}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, staff ID or subject..."
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
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Staff Details</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">ID & Subject</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {departments.map(dept => (
                                <React.Fragment key={dept}>
                                    <tr className="bg-blue-50/50">
                                        <td colSpan="3" className="px-8 py-3 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                            Department: {dept}
                                        </td>
                                    </tr>
                                    {groupedStaff[dept].map((staff) => (
                                        <tr key={staff._id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm uppercase">
                                                        {staff.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{staff.name}</p>
                                                        <p className="text-xs font-medium text-gray-500">{staff.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider">
                                                        {staff.staffId}
                                                    </span>
                                                    <p className="text-xs font-bold text-gray-500">{staff.subject}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {user?.role === 'admin' && (
                                                        <button
                                                            onClick={() => openPwdModal(staff)}
                                                            title="Change Password"
                                                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                        >
                                                            <KeyRound size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(staff)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(staff._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                            {filteredStaff.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-8 py-12 text-center text-gray-400 text-sm font-bold">
                                        No staff members found matching your search.
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
                                    {isEditing ? 'Edit Staff Details' : 'Add New Staff'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="e.g. Dr. Kumar"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-blue-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="admin@example.com"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Password {isEditing && '(Leave blank to keep current)'}</label>
                                        <input
                                            type="password"
                                            required={!isEditing}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-blue-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Staff ID</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.staffId}
                                            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="e.g. STAFF001"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Department</label>
                                        <select
                                            required
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 appearance-none"
                                        >
                                            <option value="">Select Department</option>
                                            <option value="IT">Information Technology</option>
                                            <option value="CSE">Computer Science</option>
                                            <option value="ECE">Electronics & Communication</option>
                                            <option value="EEE">Electrical & Electronics</option>
                                            <option value="MECH">Mechanical Engineering</option>
                                            <option value="CIVIL">Civil Engineering</option>
                                            <option value="AIML">AI & Machine Learning</option>
                                            <option value="CSBS">CS & Business Systems</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Subject / Specialization</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="e.g. Mathematics, Physics"
                                    />
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
                                        {isEditing ? 'Update Staff Member' : 'Add Staff Member'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Change Password Modal (Admin Only) ── */}
            {showPwdModal && user?.role === 'admin' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-wide">Change Password</h2>
                                    <p className="text-xs text-gray-400 mt-1 font-medium">For: {pwdTarget?.name}</p>
                                </div>
                                <button onClick={() => setShowPwdModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Admin badge */}
                            <div className="mb-6 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                                <KeyRound size={14} className="text-amber-500" />
                                <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest">Admin Action — Password Reset</span>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={pwdForm.newPassword}
                                        onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-amber-400/30"
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={pwdForm.confirmPassword}
                                        onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-amber-400/30"
                                        placeholder="Re-enter new password"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPwdModal(false)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-amber-400/30"
                                    >
                                        Set Password
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

export default ManageStaff;
