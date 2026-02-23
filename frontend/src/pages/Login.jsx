import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Shield, GraduationCap, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

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

    const getRoleIcon = (r) => {
        switch (r) {
            case 'admin': return <Shield size={18} />;
            case 'staff': return <User size={18} />;
            default: return <GraduationCap size={18} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 md:p-10 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                            <GraduationCap size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Exam Hall Allocation</h1>
                        <p className="text-slate-500 font-medium">Sign in to access your secure portal</p>
                    </div>

                    <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1">
                        {['student', 'staff', 'admin'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 capitalize ${role === r
                                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                    }`}
                            >
                                {getRoleIcon(r)}
                                {r}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {role === 'staff' && (
                            <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100/50 space-y-3">
                                <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs uppercase tracking-wider">
                                    <User size={14} />
                                    <span>Staff Login Credentials</span>
                                </div>
                                <div className="space-y-1.5 pl-1">
                                    <div className="flex items-center gap-2 text-[11px] text-cyan-600/80 font-medium">
                                        <Mail size={12} className="text-cyan-500" />
                                        <span>Email</span>
                                        <span className="text-slate-400 mx-1">•</span>
                                        <span className="text-slate-600 font-bold">arun.it@staff.edu</span>
                                        <button type="button" onClick={() => setIdentifier('arun.it@staff.edu')} className="ml-auto text-[10px] bg-white/50 px-2 py-0.5 rounded text-cyan-600 hover:bg-white transition-colors">Use</button>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-cyan-600/80 font-medium">
                                        <Lock size={12} className="text-cyan-500" />
                                        <span>Password</span>
                                        <span className="text-slate-400 mx-1">•</span>
                                        <span className="text-slate-600 font-bold">staff@123</span>
                                        <button type="button" onClick={() => setPassword('staff@123')} className="ml-auto text-[10px] bg-white/50 px-2 py-0.5 rounded text-cyan-600 hover:bg-white transition-colors">Use</button>
                                    </div>
                                </div>
                                <div className="pt-2 mt-2 border-t border-cyan-100 flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-cyan-600/70">No account yet? <Link to="/register" className="text-cyan-700 hover:underline">Register as Staff →</Link></p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder={role === 'student' ? "Student email address" : "Email address"}
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder={role === 'student' ? "Roll Number (e.g. 7376262IT102)" : "Password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(37,99,235,0.6)] hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-slate-400 font-bold tracking-wider">Exam Hall Allocation System</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-500">
                            New here? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
