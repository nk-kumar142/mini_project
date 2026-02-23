import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Shield, GraduationCap, Building2, BookOpen, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Student fields
        registerNumber: '',
        department: '',
        year: 'I',
        // Staff fields
        staffId: '',
        subject: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match!");
        }

        setIsLoading(true);
        try {
            // Prepare data based on role
            const dataToSubmit = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role
            };

            if (role === 'student') {
                dataToSubmit.registerNumber = formData.registerNumber;
                dataToSubmit.department = formData.department;
                dataToSubmit.year = formData.year;
            } else if (role === 'staff') {
                dataToSubmit.staffId = formData.staffId;
                dataToSubmit.subject = formData.subject;
            }

            await register(dataToSubmit);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const departments = [
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

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">

                {/* Visual Side */}
                <div className="hidden md:flex w-1/3 bg-[#1e3a8a] p-8 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm mb-6">
                            <Shield className="text-blue-200" size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight leading-tight">Join the<br />Platform</h2>
                        <p className="text-blue-200 text-xs mt-4 leading-relaxed font-medium">Create your account to manage exams, view allocations, and more.</p>
                    </div>

                    <div className="relative z-10">
                        <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Exam Hall System</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="flex-1 p-8 md:p-10">
                    <h1 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Create Account</h1>

                    <div className="bg-slate-50 p-1.5 rounded-xl flex gap-1 mb-8">
                        {['student', 'staff'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${role === r
                                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                    }`}
                            >
                                {r === 'student' ? <GraduationCap size={16} /> : <User size={16} />}
                                {r}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-slate-700"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-slate-700"
                                            placeholder="john@college.edu"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-10 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-slate-700"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-slate-700"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Conditional Fields */}
                            {role === 'student' ? (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Register Number</label>
                                            <input
                                                type="text"
                                                name="registerNumber"
                                                required
                                                value={formData.registerNumber}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-slate-700"
                                                placeholder="e.g. 7376262IT102"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Year</label>
                                            <select
                                                name="year"
                                                value={formData.year}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-slate-700 appearance-none"
                                            >
                                                {['I', 'II', 'III', 'IV'].map(y => <option key={y} value={y}>{y} Year</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Department</label>
                                        <select
                                            name="department"
                                            required
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-slate-700 appearance-none"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Staff ID</label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    name="staffId"
                                                    required
                                                    value={formData.staffId}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-slate-700"
                                                    placeholder="e.g. STF001"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Subject</label>
                                            <div className="relative group">
                                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    required
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-slate-700"
                                                    placeholder="e.g. Mathematics"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(37,99,235,0.6)] hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-sm font-medium text-slate-500">
                            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in instead</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
