import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Hotel, BookOpen,
    CheckSquare, LogOut, User as UserIcon, Shield, List, UserCheck, FileText, BarChart2, Briefcase
} from 'lucide-react';
import LogoIcon from './LogoIcon';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Students', path: '/admin/students', icon: <Users size={18} /> },
        { name: 'Staff', path: '/admin/staff', icon: <UserCheck size={18} /> },
        { name: 'Staff Duty', path: '/admin/duty-allocations', icon: <Briefcase size={18} /> },
        { name: 'Halls', path: '/admin/halls', icon: <Hotel size={18} /> },
        { name: 'Exams', path: '/admin/exams', icon: <BookOpen size={18} /> },
        { name: 'Allocate', path: '/admin/allocate', icon: <CheckSquare size={18} /> },
        { name: 'Allocation List', path: '/admin/allocations', icon: <List size={18} /> },
        { name: 'Gantt Chart', path: '/admin/gantt', icon: <BarChart2 size={18} /> },
    ];

    const studentLinks = [
        { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'My Hall Tickets', path: '/student/allocation', icon: <FileText size={18} /> },

    ];

    const staffLinks = [
        { name: 'Dashboard', path: '/staff/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Gantt Chart', path: '/staff/gantt', icon: <BarChart2 size={18} /> },
    ];

    const getLinks = () => {
        if (user?.role === 'admin') return adminLinks;
        if (user?.role === 'staff') return staffLinks;
        return studentLinks;
    };

    return (
        <div className="w-64 bg-[#1e3a8a] dark:bg-gray-900 dark:border-r dark:border-gray-800 text-white flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl transition-colors duration-200">
            <div className="p-8 flex items-center gap-3">
                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm overflow-hidden p-1 text-white">
                    <LogoIcon size={58} className="text-white" />
                </div>
                <div>
                    <h1 className="font-black text-lg tracking-tight">Exam Hall</h1>
                    <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Allocation System</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
                {getLinks().map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive(link.path)
                            ? 'bg-white text-[#1e3a8a] dark:bg-gray-800 dark:text-blue-400 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.2)] font-bold'
                            : 'text-blue-100 hover:bg-white/10 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:text-white dark:hover:text-gray-200 font-medium'
                            }`}
                    >
                        {isActive(link.path) && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1e3a8a] dark:bg-blue-400 rounded-r-full" />
                        )}
                        <span className={`relative z-10 ${isActive(link.path) ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-200`}>
                            {link.icon}
                        </span>
                        <span className="relative z-10">{link.name}</span>
                        {isActive(link.path) && (
                            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#1e3a8a] dark:bg-blue-400" />
                        )}
                    </Link>
                ))}
            </nav>

            <div className="p-4 m-4 bg-[#172554] dark:bg-gray-800/50 rounded-2xl border border-white/5 dark:border-gray-700/50">
                <Link
                    to={`/${user?.role}/profile`}
                    className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-white/5 transition-all group/profile"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-200 border border-blue-400/20 group-hover/profile:border-blue-400/40 transition-all overflow-hidden">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={18} />
                        )}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-bold truncate group-hover/profile:text-blue-200 dark:group-hover/profile:text-blue-400 transition-all">{user?.name}</p>
                        <p className="text-[10px] text-blue-300 dark:text-gray-500 font-bold uppercase tracking-widest">{user?.role}</p>
                    </div>
                </Link>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-red-200 hover:text-red-100 transition-all border border-white/5 hover:border-white/10 text-xs font-bold uppercase tracking-wider group"
                >
                    <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
