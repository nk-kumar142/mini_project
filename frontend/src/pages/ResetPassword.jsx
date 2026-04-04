import { useState } from 'react';
import api from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Key, ArrowLeft, RefreshCw, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const userId = location.state?.userId;

    // Redirect if no user ID is present (e.g. direct access)
    if (!userId) {
        navigate('/forgot-password');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { id: userId, newPassword });
            toast.success('Password updated successfully! You can now log in.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[#f0f9ff] dark:bg-gray-900 flex items-center justify-center p-2 md:p-4 font-sans transition-colors">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl dark:shadow-none overflow-hidden p-8 md:p-12 relative border border-transparent dark:border-gray-700 transition-colors">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-br-[4rem] rotate-180"></div>

                <div className="relative z-10">
                    <Link to="/forgot-password" className="inline-flex items-center gap-2 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors mb-8 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Verification</span>
                    </Link>

                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2 italic transition-colors">New Credentials</h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mb-8 leading-relaxed transition-colors">
                        Establish a robust primary access credential to secure your dashboard environment.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                <Key size={20} />
                            </div>
                            <input
                                type="password"
                                required
                                placeholder="New Security Key"
                                className="w-full pl-12 pr-4 py-4 bg-[#f8f8f2] dark:bg-gray-700 border-none rounded-2xl text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-gray-400 dark:placeholder:text-gray-500 text-sm shadow-sm dark:shadow-none"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                required
                                placeholder="Confirm Security Key"
                                className="w-full pl-12 pr-4 py-4 bg-[#f8f8f2] dark:bg-gray-700 border-none rounded-2xl text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-gray-400 dark:placeholder:text-gray-500 text-sm shadow-sm dark:shadow-none"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-3 border-b-4 ${loading
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-blue-600 text-white border-blue-800 hover:bg-blue-700 shadow-blue-500/20 active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <RefreshCw size={16} />
                                    Update Credentials
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Bottom decoration */}
                <div className="absolute bottom-[-5%] right-[-5%] w-32 h-32 rounded-full bg-blue-500/10 blur-2xl"></div>
            </div>
        </div>
    );
};

export default ResetPassword;
