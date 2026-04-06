import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Shield, GraduationCap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import LogoIcon from '../components/LogoIcon';

/* ── Inline SVG Illustration (laptop + coffee + plant) ── */
const LaptopIllustration = () => (
    <svg viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[420px] drop-shadow-xl">
        {/* Laptop base shadow */}
        <ellipse cx="250" cy="380" rx="160" ry="18" fill="#bfdbfe" opacity="0.3" />

        {/* Laptop screen */}
        <rect x="105" y="80" width="250" height="170" rx="12" fill="#37474f" stroke="#455a64" strokeWidth="3" />
        <rect x="115" y="90" width="230" height="150" rx="6" fill="#eff6ff" />

        {/* Screen content - dashboard mockup */}
        <rect x="125" y="100" width="210" height="20" rx="4" fill="#93c5fd" opacity="0.6" />
        <rect x="125" y="128" width="60" height="45" rx="6" fill="#3b82f6" opacity="0.5" />
        <rect x="195" y="128" width="60" height="45" rx="6" fill="#2563eb" opacity="0.4" />
        <rect x="265" y="128" width="60" height="45" rx="6" fill="#1d4ed8" opacity="0.3" />
        <rect x="125" y="182" width="200" height="8" rx="4" fill="#bfdbfe" opacity="0.5" />
        <rect x="125" y="196" width="150" height="8" rx="4" fill="#bfdbfe" opacity="0.4" />
        <rect x="125" y="210" width="180" height="8" rx="4" fill="#bfdbfe" opacity="0.3" />

        {/* Webcam dot */}
        <circle cx="230" cy="85" r="3" fill="#78909c" />

        {/* Laptop base/keyboard */}
        <path d="M80 250 L105 250 L115 260 L345 260 L355 250 L380 250 L400 280 Q400 290 390 290 L70 290 Q60 290 60 280 Z" fill="#546e7a" stroke="#455a64" strokeWidth="2" />

        {/* Keyboard details */}
        <rect x="130" y="255" width="200" height="3" rx="1.5" fill="#78909c" opacity="0.5" />

        {/* Trackpad */}
        <rect x="200" y="262" width="60" height="18" rx="4" fill="#607d8b" opacity="0.3" />

        {/* Coffee cup */}
        <ellipse cx="420" cy="310" rx="28" ry="6" fill="#a1887f" opacity="0.3" />
        <path d="M395 270 Q393 310 400 310 L440 310 Q447 310 445 270 Z" fill="#e8d5c4" stroke="#d7ccc8" strokeWidth="2" />
        <ellipse cx="420" cy="270" rx="25" ry="8" fill="#efebe9" stroke="#d7ccc8" strokeWidth="2" />
        <ellipse cx="420" cy="270" rx="18" ry="5" fill="#8d6e63" />
        {/* Steam */}
        <path d="M415 258 Q413 248 417 240" stroke="#bfdbfe" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M425 256 Q423 244 427 236" stroke="#bfdbfe" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
        {/* Cup handle */}
        <path d="M445 278 Q460 280 460 290 Q460 300 445 302" stroke="#d7ccc8" strokeWidth="3" fill="none" />

        {/* Potted plant */}
        <path d="M60 310 L50 250 L90 250 L80 310 Z" fill="#8d6e63" stroke="#795548" strokeWidth="2" />
        <ellipse cx="70" cy="310" rx="15" ry="5" fill="#6d4c41" />

        {/* Plant leaves */}
        <path d="M70 250 Q60 210 40 200 Q55 195 70 230" fill="#3b82f6" opacity="0.9" />
        <path d="M70 245 Q80 200 100 185 Q90 195 70 225" fill="#2563eb" opacity="0.8" />
        <path d="M65 240 Q45 215 30 220 Q40 210 65 225" fill="#93c5fd" opacity="0.7" />
        <path d="M75 238 Q90 215 110 215 Q95 220 75 230" fill="#3b82f6" opacity="0.6" />
        <path d="M68 248 Q55 228 35 235 Q45 225 68 235" fill="#2563eb" opacity="0.5" />
    </svg>
);

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login');

    const { login } = useAuth();
    const navigate = useNavigate();

    const demoCredentials = {
        student: { id: 'it13001@gmail.com', pass: '7376262IT13001' },
        staff: { id: 'arun.it@staff.edu', pass: 'staff@123' },
        admin: { id: 'admin@example.com', pass: 'admin@123' }
    };

    const handleAutoFill = () => {
        const creds = demoCredentials[role];
        if (creds) {
            setIdentifier(creds.id);
            setPassword(creds.pass);
            toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} demo credentials filled!`, {
                icon: '⚡',
                style: {
                    borderRadius: '10px',
                    background: '#1e3a8a',
                    color: '#fff',
                },
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await login(identifier, password, role);
            toast.success(`Welcome back, ${user.name}!`);
            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'staff') navigate('/staff/dashboard');
            else navigate('/student/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const roles = [
        { key: 'student', label: 'Student', icon: <GraduationCap size={16} /> },
        { key: 'staff', label: 'Staff', icon: <User size={16} /> },
        { key: 'admin', label: 'Admin', icon: <Shield size={16} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 relative overflow-hidden transition-colors duration-200">
            {/* ── Background decorative circles ── */}
            <div className="absolute -top-[200px] -right-[200px] w-[700px] h-[700px] rounded-full bg-blue-200 dark:bg-blue-900/20 opacity-30 dark:opacity-20 transition-colors duration-200" />
            <div className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] rounded-full bg-blue-300 dark:bg-blue-800/20 opacity-20 dark:opacity-10 transition-colors duration-200" />
            <div className="absolute top-[50px] right-[50px] w-[350px] h-[350px] rounded-full bg-[#1e3a8a] opacity-15" />
            <div className="absolute -bottom-[150px] -left-[150px] w-[400px] h-[400px] rounded-full bg-blue-200 opacity-20" />

            {/* ── Top Nav ── */}
            <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 py-5">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white dark:bg-gray-800 border-2 border-[#1e3a8a] dark:border-blue-400 shadow-sm rounded-xl flex items-center justify-center overflow-hidden p-1 transition-colors duration-200">
                            <LogoIcon size={52} />
                        </div>
                        <span className="text-[#37474f] dark:text-white font-extrabold text-2xl tracking-tight hidden sm:block transition-colors duration-200">ExamHall</span>
                    </div>
                </div>

                <Link
                    to="/register"
                    className="bg-[#1e3a8a] hover:bg-[#172554] text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-300 shadow-md shadow-[#1e3a8a]/20 hover:shadow-lg hover:shadow-[#172554]/30 hover:-translate-y-0.5"
                >
                    Sign Up
                </Link>
            </nav>

            {/* ── Main Content ── */}
            <div className="relative z-10 flex items-center justify-center lg:justify-between max-w-7xl mx-auto px-8 lg:px-16 min-h-[calc(100vh-80px)]">
                {/* Left: Form */}
                <div className="w-full max-w-[420px] lg:max-w-[400px]">
                    {/* Tab switcher */}
                    <div className="flex items-center gap-8 mb-10">
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`text-2xl font-extrabold pb-2 border-b-[3px] transition-all duration-300 ${activeTab === 'login'
                                ? 'text-[#37474f] dark:text-white border-[#1e3a8a] dark:border-blue-400'
                                : 'text-[#b0bec5] dark:text-gray-500 border-transparent hover:text-[#78909c] dark:hover:text-gray-400'
                                }`}
                        >
                            Login
                        </button>
                        <Link
                            to="/register"
                            className="text-2xl font-extrabold pb-2 border-b-[3px] border-transparent text-[#b0bec5] dark:text-gray-500 hover:text-[#78909c] dark:hover:text-gray-400 transition-all duration-300"
                        >
                            Sign up
                        </Link>
                    </div>

                    {/* Role selector pills */}
                    <div className="flex items-center gap-2 mb-8">
                        {roles.map((r) => (
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
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email input */}
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center group-focus-within:bg-blue-200 dark:group-focus-within:bg-gray-600 transition-colors">
                                <Mail size={15} className="text-[#1e3a8a] dark:text-blue-400" />
                            </div>
                            <input
                                type="text"
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border-2 border-[#e0e0e0] dark:border-gray-700 rounded-full py-3.5 pl-16 pr-5 outline-none focus:border-[#1e3a8a] dark:focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(30,58,138,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all text-sm font-semibold text-[#37474f] dark:text-white placeholder:text-[#b0bec5] dark:placeholder:text-gray-500"
                                placeholder={role === 'student' ? 'Email or Register Number' : role === 'staff' ? 'Email or Staff ID' : 'Email address'}
                            />
                        </div>

                        {/* Password input */}
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center group-focus-within:bg-blue-200 dark:group-focus-within:bg-gray-600 transition-colors">
                                <Lock size={15} className="text-[#1e3a8a] dark:text-blue-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border-2 border-[#e0e0e0] dark:border-gray-700 rounded-full py-3.5 pl-16 pr-14 outline-none focus:border-[#1e3a8a] dark:focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(30,58,138,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all text-sm font-semibold text-[#37474f] dark:text-white placeholder:text-[#b0bec5] dark:placeholder:text-gray-500"
                                placeholder={role === 'student' ? 'Roll Number (e.g. 7376262IT102)' : 'Password'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#b0bec5] dark:text-gray-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Forgot + Login row */}
                        <div className="flex items-center justify-between pt-2">
                            <Link to="/forgot-password" className="text-sm font-bold text-[#1e3a8a] hover:text-[#172554] transition-colors">
                                Forgot your password?
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold text-sm px-8 py-3 rounded-full transition-all duration-300 shadow-lg shadow-[#1e3a8a]/25 hover:shadow-xl hover:shadow-[#172554]/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </span>
                                ) : 'Login'}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-[#90a4ae] dark:text-gray-500 font-medium mt-10">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[#1e3a8a] dark:text-blue-400 font-bold hover:text-[#172554] dark:hover:text-blue-300 transition-colors">
                            Create one now
                        </Link>
                    </p>

                    {/* Demo Credentials Box */}
                    <div className="mt-8 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 backdrop-blur-sm transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-[#1e3a8a] dark:text-blue-400">
                                <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-800/40">
                                    <Shield size={14} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Demo Access</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAutoFill}
                                className="text-[10px] font-bold bg-[#1e3a8a] text-white px-3 py-1 rounded-full hover:bg-[#172554] transition-colors shadow-sm active:scale-95"
                            >
                                Auto-fill
                            </button>
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#78909c] dark:text-gray-400 font-medium tracking-tight">Email:</span>
                                <code className="bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-blue-100/50 dark:border-gray-700 text-[#1e3a8a] dark:text-blue-300 font-bold">
                                    {demoCredentials[role].id}
                                </code>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#78909c] dark:text-gray-400 font-medium tracking-tight">
                                    {role === 'student' ? 'Reg No:' : 'Password:'}
                                </span>
                                <code className="bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-blue-100/50 dark:border-gray-700 text-[#1e3a8a] dark:text-blue-300 font-bold">
                                    {demoCredentials[role].pass}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Illustration */}
                <div className="hidden lg:flex items-center justify-center flex-1 pl-16">
                    <div className="relative">
                        {/* Glow behind illustration */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-blue-300 opacity-10 blur-3xl" />
                        <LaptopIllustration />
                    </div>
                </div>
            </div>

            {/* Bottom decorative bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 via-[#1e3a8a] to-blue-900" />
        </div>
    );
};

export default Login;
