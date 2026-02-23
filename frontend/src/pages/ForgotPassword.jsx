import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setEmailSent(true);
            toast.success('Reset link sent to your email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 p-8 md:p-10">
                <div className="mb-8">
                    <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest transition-colors mb-6">
                        <ArrowLeft size={14} /> Back to Login
                    </Link>
                    <h1 className="text-2xl font-black text-[#1e3a8a] tracking-tight mb-2">Forgot Password?</h1>
                    <p className="text-gray-500 text-sm font-medium">Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                {!emailSent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="john@college.edu"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(37,99,235,0.6)] hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Sending Link...' : 'Send Reset Link'} <Send size={16} />
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-6 py-4">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto animate-bounce">
                            <Mail size={32} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide">Check your email</h2>
                            <p className="text-gray-500 text-sm font-medium mt-2">We've sent a password reset link to <br /><span className="text-blue-600 font-bold">{email}</span></p>
                        </div>
                        <button
                            onClick={() => setEmailSent(false)}
                            className="text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest hover:underline"
                        >
                            Resend Email
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
