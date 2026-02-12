import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Key, User, LogIn, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [role, setRole] = useState('student');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(identifier, password);
            toast.success('Login successful!');
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-[#0061f2] flex items-center justify-center p-4 md:p-8 font-sans">
            {/* Main Rounded Card */}
            <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[580px]">

                {/* Left Section: Blue Sidebar with 3D Spheres */}
                <div className="md:w-5/12 bg-gradient-to-br from-[#0061f2] to-[#004bb3] p-10 md:p-14 relative overflow-hidden flex flex-col justify-center text-white">
                    {/* Abstract 3D Spheres */}
                    {/* Top Left Sphere */}
                    <div className="absolute top-[-10%] left-[-15%] w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.3),20px_20px_40px_rgba(0,0,0,0.2)]"></div>

                    {/* Middle Bottom Sphere (Large) */}
                    <div className="absolute bottom-[10%] right-[-5%] w-48 h-48 rounded-full bg-gradient-to-br from-blue-400/80 to-blue-800 shadow-[inset_-5px_-5px_20px_rgba(0,0,0,0.4),10px_10px_30px_rgba(0,0,0,0.2)] z-10"></div>

                    {/* Bottom Left Sphere */}
                    <div className="absolute bottom-[-5%] left-[5%] w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-900 shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.4)]"></div>

                    {/* Content */}
                    <div className="relative z-20">
                        <h2 className="text-5xl font-black tracking-tight mb-2">WELCOME</h2>
                        <h3 className="text-lg font-bold text-blue-100 uppercase tracking-widest leading-tight">
                            Exam Hall <br /> Allocation System
                        </h3>
                        <p className="mt-6 text-sm text-blue-200/80 font-medium leading-relaxed max-w-xs">
                            Access your student portal or admin desk with our secure, professional management platform.
                        </p>
                    </div>
                </div>

                {/* Right Section: Sign In Form */}
                <div className="flex-1 p-8 md:p-14 flex flex-col justify-center bg-white">
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 italic">Sign in</h1>
                        <p className="text-gray-400 text-sm font-medium">Access your professional account dashboard</p>

                        {/* Role Selector Pills */}
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setRole('student')}
                                className={`px-5 py-1.5 text-xs font-black uppercase tracking-widest rounded-full transition-all ${role === 'student' ? 'bg-[#0061f2] text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                            >
                                Student
                            </button>
                            <button
                                onClick={() => setRole('admin')}
                                className={`px-5 py-1.5 text-xs font-black uppercase tracking-widest rounded-full transition-all ${role === 'admin' ? 'bg-[#0061f2] text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                            >
                                Admin
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* User ID / Email Input */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#0061f2] transition-colors">
                                    {role === 'admin' ? <Mail size={20} /> : <User size={20} />}
                                </div>
                                <input
                                    type={role === 'admin' ? 'email' : 'text'}
                                    required
                                    placeholder={role === 'admin' ? 'Email Address' : 'User Registration Number'}
                                    className="w-full pl-12 pr-4 py-4 bg-[#f3f6f9] border-none rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400 text-sm shadow-sm"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#0061f2] transition-colors">
                                    <Key size={20} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Password"
                                    className="w-full pl-12 pr-12 py-4 bg-[#f3f6f9] border-none rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400 text-sm shadow-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-black text-[#0061f2] uppercase tracking-widest hover:text-[#004bb3]"
                                >
                                    {showPassword ? <EyeOff size={18} /> : 'SHOW'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            <label className="flex items-center gap-2 cursor-pointer hover:text-gray-600 transition-colors">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#0061f2] border-blue-600' : 'bg-white border-gray-300'}`}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    {rememberMe && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                Remember me
                            </label>
                            <Link to="/forgot-password" px-title="Under Protection" className="hover:text-[#0061f2] transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button
                                type="submit"
                                className="w-full bg-[#002f6c] text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-[#001d44] hover:scale-[1.01] active:scale-95 transition-all text-center"
                            >
                                Sig In
                            </button>

                            <div className="relative flex items-center justify-center py-2">
                                <div className="flex-grow border-t border-gray-100"></div>
                                <span className="flex-shrink mx-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Or</span>
                                <div className="flex-grow border-t border-gray-100"></div>
                            </div>

                            <button
                                type="button"
                                className="w-full border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                            >
                                Sig In with other
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-xs font-bold text-gray-400">
                                Don't have an account? {' '}
                                <Link to="/register" className="text-[#0061f2] hover:underline uppercase tracking-widest text-[10px]">Sign Up</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Bottom-right decoration */}
            <div className="absolute bottom-[-5%] right-[-5%] w-64 h-64 rounded-full bg-blue-500/20 blur-3xl z-0"></div>
        </div>
    );
};

export default Login;
