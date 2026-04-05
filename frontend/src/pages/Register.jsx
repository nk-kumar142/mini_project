import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, GraduationCap, Building2, BookOpen, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import LogoIcon from '../components/LogoIcon';

/* ── Inline SVG Illustration (books + graduation) ── */
const RegisterIllustration = () => (
    <svg viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[400px] drop-shadow-xl">
        {/* Ground shadow */}
        <ellipse cx="250" cy="380" rx="150" ry="16" fill="#bfdbfe" opacity="0.25" />

        {/* Books stack */}
        <rect x="140" y="270" width="180" height="30" rx="4" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.5" transform="rotate(-2 230 285)" />
        <rect x="145" y="245" width="170" height="28" rx="4" fill="#3b82f6" stroke="#2563eb" strokeWidth="1.5" transform="rotate(1 230 259)" />
        <rect x="138" y="218" width="185" height="30" rx="4" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5" transform="rotate(-1 230 233)" />

        {/* Clipboard / form */}
        <rect x="180" y="90" width="140" height="185" rx="10" fill="white" stroke="#bfdbfe" strokeWidth="2" />
        <rect x="210" y="82" width="80" height="16" rx="8" fill="#3b82f6" />

        {/* Form lines */}
        <rect x="200" y="115" width="100" height="8" rx="4" fill="#eff6ff" />
        <rect x="200" y="135" width="80" height="8" rx="4" fill="#bfdbfe" opacity="0.6" />
        <rect x="200" y="160" width="100" height="10" rx="5" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
        <rect x="200" y="180" width="100" height="10" rx="5" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
        <rect x="200" y="200" width="100" height="10" rx="5" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
        <rect x="215" y="225" width="70" height="22" rx="11" fill="#3b82f6" />
        <rect x="230" y="231" width="40" height="8" rx="4" fill="white" opacity="0.7" />

        {/* Checkmark circles */}
        <circle cx="192" cy="165" r="5" fill="#3b82f6" opacity="0.5" />
        <circle cx="192" cy="185" r="5" fill="#3b82f6" opacity="0.5" />
        <circle cx="192" cy="205" r="5" fill="#3b82f6" opacity="0.5" />

        {/* Graduation cap */}
        <g transform="translate(360, 120)">
            <polygon points="0,30 50,10 100,30 50,50" fill="#3b82f6" />
            <polygon points="0,30 50,50 50,70 0,50" fill="#2563eb" />
            <polygon points="100,30 50,50 50,70 100,50" fill="#1d4ed8" />
            <line x1="50" y1="50" x2="50" y2="80" stroke="#37474f" strokeWidth="2" />
            <circle cx="50" cy="83" r="4" fill="#ffd54f" />
            <line x1="50" y1="83" x2="50" y2="100" stroke="#ffd54f" strokeWidth="1.5" />
        </g>

        {/* Pencil */}
        <g transform="translate(80, 130) rotate(-30)">
            <rect x="0" y="0" width="8" height="100" rx="2" fill="#ffd54f" stroke="#ffb300" strokeWidth="1" />
            <polygon points="0,100 8,100 4,115" fill="#37474f" />
            <rect x="0" y="0" width="8" height="12" rx="2" fill="#ef9a9a" />
        </g>

        {/* Ruler */}
        <rect x="370" y="230" width="12" height="120" rx="2" fill="#90caf9" stroke="#64b5f6" strokeWidth="1" transform="rotate(15 376 290)" />
        {/* Ruler marks */}
        <line x1="372" y1="250" x2="378" y2="250" stroke="#64b5f6" strokeWidth="1" transform="rotate(15 376 290)" />
        <line x1="372" y1="270" x2="378" y2="270" stroke="#64b5f6" strokeWidth="1" transform="rotate(15 376 290)" />
        <line x1="372" y1="290" x2="378" y2="290" stroke="#64b5f6" strokeWidth="1" transform="rotate(15 376 290)" />

        {/* Decorative dots */}
        <circle cx="120" cy="110" r="5" fill="#bfdbfe" opacity="0.6" />
        <circle cx="400" cy="180" r="4" fill="#bfdbfe" opacity="0.5" />
        <circle cx="130" cy="320" r="6" fill="#93c5fd" opacity="0.4" />
        <circle cx="380" cy="350" r="5" fill="#bfdbfe" opacity="0.3" />
    </svg>
);

const Register = () => {
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        registerNumber: '', department: '', year: 'I',
        staffId: '', subject: '', adminKey: ''
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
            const dataToSubmit = {
                name: formData.name, email: formData.email,
                password: formData.password, role
            };
            if (role === 'student') {
                dataToSubmit.registerNumber = formData.registerNumber;
                dataToSubmit.department = formData.department;
                dataToSubmit.year = formData.year;
            } else if (role === 'staff') {
                dataToSubmit.staffId = formData.staffId;
                dataToSubmit.subject = formData.subject;
            } else if (role === 'admin') {
                dataToSubmit.adminKey = formData.adminKey;
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

    const inputCls = "w-full bg-white dark:bg-gray-800 border-2 border-[#e0e0e0] dark:border-gray-700 rounded-full py-3 px-5 outline-none focus:border-[#1e3a8a] dark:focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(30,58,138,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all text-sm font-semibold text-[#37474f] dark:text-white placeholder:text-[#b0bec5] dark:placeholder:text-gray-500";
    const inputIconCls = "w-full bg-white dark:bg-gray-800 border-2 border-[#e0e0e0] dark:border-gray-700 rounded-full py-3 pl-14 pr-5 outline-none focus:border-[#1e3a8a] dark:focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(30,58,138,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all text-sm font-semibold text-[#37474f] dark:text-white placeholder:text-[#b0bec5] dark:placeholder:text-gray-500";
    const selectCls = "w-full bg-white dark:bg-gray-800 border-2 border-[#e0e0e0] dark:border-gray-700 rounded-full py-3 px-5 outline-none focus:border-[#1e3a8a] dark:focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(30,58,138,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all text-sm font-semibold text-[#37474f] dark:text-white appearance-none";
    const labelCls = "block text-[10px] font-extrabold text-[#78909c] dark:text-gray-400 uppercase tracking-[0.15em] mb-1.5 pl-2";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 relative overflow-hidden transition-colors duration-200">
            {/* Background circles */}
            <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-blue-200 opacity-25" />
            <div className="absolute -top-[100px] -left-[100px] w-[400px] h-[400px] rounded-full bg-blue-300 opacity-15" />
            <div className="absolute -bottom-[200px] -right-[200px] w-[700px] h-[700px] rounded-full bg-blue-200 opacity-20" />
            <div className="absolute -bottom-[80px] -right-[80px] w-[450px] h-[450px] rounded-full bg-blue-300 opacity-15" />

            {/* Nav */}
            <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 border-2 border-[#1e3a8a] dark:border-blue-400 shadow-sm rounded-xl flex items-center justify-center overflow-hidden p-1 transition-colors duration-200">
                        <LogoIcon size={52} />
                    </div>
                    <span className="text-[#37474f] dark:text-white font-extrabold text-2xl tracking-tight hidden sm:block transition-colors duration-200">ExamHall</span>
                </div>
                <Link
                    to="/login"
                    className="bg-[#1e3a8a] hover:bg-[#172554] text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-300 shadow-md shadow-[#1e3a8a]/20 hover:shadow-lg hover:shadow-[#172554]/30 hover:-translate-y-0.5"
                >
                    Login
                </Link>
            </nav>

            {/* Main */}
            <div className="relative z-10 flex items-start lg:items-center justify-center lg:justify-between max-w-7xl mx-auto px-8 lg:px-16 min-h-[calc(100vh-80px)]">
                {/* Left: Form */}
                <div className="w-full max-w-[480px] lg:max-w-[460px] py-4">
                    {/* Tab header */}
                    <div className="flex items-center gap-8 mb-8">
                        <Link
                            to="/login"
                            className="text-2xl font-extrabold pb-2 border-b-[3px] border-transparent text-[#b0bec5] dark:text-gray-500 hover:text-[#78909c] dark:hover:text-gray-400 transition-all duration-300"
                        >
                            Login
                        </Link>
                        <button
                            className="text-2xl font-extrabold pb-2 border-b-[3px] text-[#37474f] dark:text-white border-[#1e3a8a] dark:border-blue-400 transition-colors duration-200"
                        >
                            Sign up
                        </button>
                    </div>

                    {/* Role selector */}
                    <div className="flex items-center gap-2 mb-6">
                        {[
                            { key: 'student', label: 'Student', icon: <GraduationCap size={16} /> },
                            { key: 'staff', label: 'Staff', icon: <User size={16} /> },
                            { key: 'admin', label: 'Admin', icon: <ShieldCheck size={16} /> },
                        ].map((r) => (
                            <button
                                key={r.key}
                                onClick={() => setRole(r.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${role === r.key
                                    ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white shadow-md shadow-[#1e3a8a]/25 dark:shadow-blue-900/20'
                                    : 'bg-white/70 dark:bg-gray-800 text-[#78909c] dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-[#1e3a8a] dark:hover:text-white border border-[#e0e0e0] dark:border-gray-700'
                                    }`}
                            >
                                {r.icon}
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name + Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Full Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center group-focus-within:bg-blue-200 dark:group-focus-within:bg-gray-600 transition-colors">
                                        <User size={13} className="text-[#1e3a8a] dark:text-blue-400" />
                                    </div>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                        className={inputIconCls} placeholder="John Doe" />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Email</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center group-focus-within:bg-blue-200 dark:group-focus-within:bg-gray-600 transition-colors">
                                        <Mail size={13} className="text-[#1e3a8a] dark:text-blue-400" />
                                    </div>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                        className={inputIconCls} placeholder="john@college.edu" />
                                </div>
                            </div>
                        </div>

                        {/* Password row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center group-focus-within:bg-blue-200 dark:group-focus-within:bg-gray-600 transition-colors">
                                        <Lock size={13} className="text-[#1e3a8a] dark:text-blue-400" />
                                    </div>
                                    <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange}
                                        className="w-full bg-white dark:bg-gray-800 border-2 border-[#e0e0e0] dark:border-gray-700 rounded-full py-3 pl-14 pr-12 outline-none focus:border-[#1e3a8a] dark:focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(30,58,138,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all text-sm font-semibold text-[#37474f] dark:text-white placeholder:text-[#b0bec5] dark:placeholder:text-gray-500"
                                        placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0bec5] dark:text-gray-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center group-focus-within:bg-blue-200 dark:group-focus-within:bg-gray-600 transition-colors">
                                        <Lock size={13} className="text-[#1e3a8a] dark:text-blue-400" />
                                    </div>
                                    <input type={showPassword ? 'text' : 'password'} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                                        className={inputIconCls} placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative py-1">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-blue-50 dark:border-gray-700" /></div>
                            <div className="relative flex justify-center">
                                <span className="bg-slate-50 dark:bg-gray-900 px-3 text-[9px] text-[#90a4ae] dark:text-gray-500 font-bold uppercase tracking-[0.2em] transition-colors">
                                    {role === 'student' ? 'Student Details' : role === 'staff' ? 'Staff Details' : 'Admin Verification'}
                                </span>
                            </div>
                        </div>

                        {/* Role-specific fields */}
                        {role === 'student' ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelCls}>Register Number</label>
                                        <input type="text" name="registerNumber" required value={formData.registerNumber} onChange={handleChange}
                                            className={inputCls} placeholder="7376262IT102" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Year</label>
                                        <select name="year" value={formData.year} onChange={handleChange} className={selectCls}>
                                            {['I', 'II', 'III', 'IV'].map(y => <option key={y} value={y}>{y} Year</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Department</label>
                                    <select name="department" required value={formData.department} onChange={handleChange} className={selectCls}>
                                        <option value="">Choose your department</option>
                                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                    </select>
                                </div>
                            </div>
                        ) : role === 'staff' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Staff ID</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center group-focus-within:bg-blue-200 dark:group-focus-within:bg-gray-600 transition-colors">
                                            <Building2 size={13} className="text-[#1e3a8a] dark:text-blue-400" />
                                        </div>
                                        <input type="text" name="staffId" required value={formData.staffId} onChange={handleChange}
                                            className={inputIconCls} placeholder="STF001" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Subject</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center group-focus-within:bg-blue-200 dark:group-focus-within:bg-gray-600 transition-colors">
                                            <BookOpen size={13} className="text-[#1e3a8a] dark:text-blue-400" />
                                        </div>
                                        <input type="text" name="subject" required value={formData.subject} onChange={handleChange}
                                            className={inputIconCls} placeholder="Mathematics" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className={labelCls}>Admin Secret Key</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center group-focus-within:bg-blue-200 dark:group-focus-within:bg-gray-600 transition-colors">
                                        <ShieldCheck size={13} className="text-[#1e3a8a] dark:text-blue-400" />
                                    </div>
                                    <input type="password" name="adminKey" required value={formData.adminKey} onChange={handleChange}
                                        className={inputIconCls} placeholder="Enter admin secret key" />
                                </div>
                                <p className="text-[10px] text-[#90a4ae] dark:text-gray-500 mt-1.5 pl-2">Contact the system owner for the admin secret key.</p>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold text-sm px-8 py-3 rounded-full transition-all duration-300 shadow-lg shadow-[#1e3a8a]/25 hover:shadow-xl hover:shadow-[#172554]/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </span>
                                ) : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-[#90a4ae] dark:text-gray-500 font-medium mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#1e3a8a] dark:text-blue-400 font-bold hover:text-[#172554] dark:hover:text-blue-300 transition-colors">
                            Sign in instead
                        </Link>
                    </p>
                </div>

                {/* Right: Illustration */}
                <div className="hidden lg:flex items-center justify-center flex-1 pl-12">
                    <div className="relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-300 opacity-10 blur-3xl" />
                        <RegisterIllustration />
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 via-[#1e3a8a] to-blue-900" />
        </div>
    );
};

export default Register;
