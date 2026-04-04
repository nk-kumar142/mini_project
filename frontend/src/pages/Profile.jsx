import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Save, ShieldCheck, Image as ImageIcon, Moon, Sun } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setProfileImage(user.profileImage || '');
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword && newPassword !== confirmPassword) {
            return toast.error("New passwords don't match");
        }

        if (newPassword && !currentPassword) {
            return toast.error("Current password is required to set a new password");
        }

        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const payload = { name, email, profileImage };
            if (newPassword) {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            const { data } = await api.put(
                '/auth/profile',
                payload,
                config
            );

            // Update local storage and context
            const updatedUser = {
                ...user,
                name: data.name,
                email: data.email,
                profileImage: data.profileImage,
                token: data.token
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser); // Update context directly

            toast.success('Profile updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Profile Update Error Detail:', error);
            const message = error.response?.data?.message || error.message || 'Error updating profile';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                    <User className="text-blue-600 dark:text-blue-400" size={32} />
                    My Profile
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your personal information and account security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-900/5 dark:shadow-none flex flex-col items-center text-center">
                        <div className="relative group mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-500/20 overflow-hidden">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-blue-600 cursor-pointer hover:scale-110 transition-all">
                                <ImageIcon size={14} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                        <p className="text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-widest mt-1">{user?.role}</p>

                        <div className="w-full mt-8 space-y-4 pt-8 border-t border-gray-50 dark:border-gray-700">
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-300">
                                    <Mail size={16} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-300">
                                    <ShieldCheck size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">Account Status</p>
                                    <p className="text-sm font-bold text-green-600 dark:text-green-400">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-900/5 dark:shadow-none space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-full"></span>
                                Personal Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/50 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm font-bold dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/50 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm font-bold dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                                <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                                Change Password
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Current Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password to save changes"
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/50 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm font-bold dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">New Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/50 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm font-bold dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Confirm Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/50 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm font-bold dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                Theme Preferences
                            </h3>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-400">
                                        {isDarkMode ? <Moon size={20} className="text-blue-400" /> : <Sun size={20} className="text-amber-500" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Dark Mode</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Toggle dark mode appearance</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : <><Save size={16} /> Update Profile</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
