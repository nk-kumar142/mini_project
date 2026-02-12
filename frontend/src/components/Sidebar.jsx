import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Hotel, BookOpen,
    CheckSquare, LogOut, User as UserIcon, Shield
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Students', path: '/admin/students', icon: <Users size={18} /> },
        { name: 'Halls', path: '/admin/halls', icon: <Hotel size={18} /> },
        { name: 'Exams', path: '/admin/exams', icon: <BookOpen size={18} /> },
        { name: 'Allocate', path: '/admin/allocate', icon: <CheckSquare size={18} /> },
        { name: 'Allocation List', path: '/admin/allocations', icon: <CheckSquare size={18} /> },
    ];

    const studentLinks = [
        { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'View Allocation', path: '/student/allocation', icon: <CheckSquare size={18} /> },
    ];

    const links = user?.role === 'admin' ? adminLinks : studentLinks;

    return (
        <div className="w-72 bg-white h-screen flex flex-col fixed left-0 top-0 border-r border-gray-50 z-50">
            {/* Logo Section */}
            <div className="px-8 py-10">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-md border border-gray-100">
                        <Shield size={22} fill="currentColor" className="opacity-80" />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-gray-900 tracking-tight leading-none">Exam Hall <span className="text-blue-500">Allocation</span></h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Allocation System</p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-4 py-2 space-y-1">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`flex items-center space-x-3 px-5 py-3 rounded-xl transition-all duration-200 group font-bold text-[13px] ${isActive
                                ? 'bg-[#0089d1] text-white shadow-lg shadow-blue-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                        >
                            <span className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`}>
                                {link.icon}
                            </span>
                            <span className="tracking-tight">{link.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Footer / Profile Section */}
            <div className="p-4 space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-gray-50 shadow-sm flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50/50 rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                        <UserIcon size={18} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-black text-gray-900 truncate tracking-tight">System Admin</p>
                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{user?.role}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3.5 bg-red-50/50 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-black text-[11px] uppercase tracking-widest"
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
