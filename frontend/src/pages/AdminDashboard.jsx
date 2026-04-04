/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Users, UserCheck, Hotel, BookOpen,
    CheckSquare, Search, Star, Archive, Plus, Share2, MoreHorizontal, UploadCloud, FileText, LayoutList
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CloudCard = ({ title, count, bgColor, icon: Icon, isStarred }) => (
    <div className={`${bgColor} rounded-[20px] p-5 text-white flex flex-col justify-between aspect-[4/3] relative shadow-md transition-transform hover:-translate-y-1 overflow-hidden`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="flex justify-between items-start relative z-10 w-full">
            <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center backdrop-blur-sm">
                <Icon size={16} className="text-white" />
            </div>
            {isStarred && <Star size={16} fill="#FFD700" className="text-[#FFD700]" />}
        </div>
        <div className="mt-auto relative z-10">
            <h3 className="font-black text-[15px] tracking-wide mb-1">{title}</h3>
            <p className="text-white text-opacity-80 text-xs font-bold">{count}</p>
        </div>
    </div>
);

const FileCard = ({ title, count, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
        <div className="flex items-start gap-3 mb-2">
            <div className={`${colorClass} opacity-80 group-hover:opacity-100 transition-opacity`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-1 text-right">
                <div className={`w-1.5 h-1.5 rounded-full inline-block ${colorClass.replace('text-', 'bg-')}`}></div>
            </div>
        </div>
        <h3 className="font-bold tracking-tight text-[#111c43] dark:text-gray-100 text-sm">{title}</h3>
        <p className="text-xs text-gray-400 font-bold mt-1 mb-3">{count}</p>
        <div className="w-6 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div className={`h-full w-full ${colorClass.replace('text-', 'bg-')}`}></div>
        </div>
    </div>
);

const RecentItem = ({ title, ext, size, icon: Icon, bgClass, colorClass }) => (
    <div className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
        <div className="flex items-center gap-4 min-w-[200px]">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass} ${colorClass}`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div>
                <h4 className="font-bold text-sm text-[#111c43] dark:text-gray-100">{title}</h4>
            </div>
        </div>
        <div className="hidden sm:block text-xs font-bold text-gray-400 uppercase tracking-widest">{ext}</div>
        <div className="hidden sm:block text-xs font-bold text-gray-500 w-16 text-right">{size}</div>
        <div className="flex items-center gap-4 mr-2">
            <button className="text-blue-500 hover:scale-110 transition-transform"><Share2 size={16} strokeWidth={3} /></button>
            <button className="text-blue-200 hover:text-blue-400"><MoreHorizontal size={18} strokeWidth={3} /></button>
        </div>
    </div>
);


const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalStaff: 0,
        totalHalls: 0,
        totalExams: 0,
        totalAllocations: 0
    });
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const [statsRes, studentsRes] = await Promise.all([
                    api.get('/admin/stats', config),
                    api.get('/admin/students', config)
                ]);
                setStats(statsRes.data);
                setStudents(studentsRes.data);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            }
        };
        fetchData();
    }, [user.token]);

    const filteredStudents = students.filter(student =>
        (student.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (student.registerNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    return (
        <div className="flex flex-col xl:flex-row gap-8 min-h-full font-sans max-w-[1400px] mx-auto bg-[#f8fafc] dark:bg-transparent -m-8 p-8 transition-colors">
            {/* Left Content */}
            <div className="flex-1 space-y-8">
                {/* Search */}
                <div className="bg-white dark:bg-gray-800 rounded-full py-3.5 px-6 shadow-sm flex items-center gap-3 w-full lg:w-2/3 border border-gray-100 dark:border-gray-700">
                    <Search size={18} className="text-blue-200 dark:text-gray-400" strokeWidth={2.5} />
                    <input type="text" placeholder="Search" className="bg-transparent outline-none flex-1 text-sm font-bold text-gray-700 dark:text-gray-200 placeholder-blue-200 dark:placeholder-gray-500" />
                </div>

                {/* Categories */}
                <div>
                    <h2 className="text-[17px] font-black text-[#111c43] dark:text-white mb-4 tracking-tight">Categories</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link to="/admin/students">
                            <CloudCard title="Students" count={`${stats.totalStudents} files`} bgColor="bg-[#6B5AED]" icon={Users} isStarred={true} />
                        </Link>
                        <Link to="/admin/staff">
                            <CloudCard title="Staff" count={`${stats.totalStaff} files`} bgColor="bg-[#00B4B5]" icon={UserCheck} />
                        </Link>
                        <Link to="/admin/halls">
                            <CloudCard title="Halls" count={`${stats.totalHalls} files`} bgColor="bg-[#EE5E99]" icon={Hotel} />
                        </Link>
                        <Link to="/admin/exams">
                            <CloudCard title="Exams" count={`${stats.totalExams} files`} bgColor="bg-[#3180D8]" icon={BookOpen} />
                        </Link>
                    </div>
                </div>

                {/* Files (Sub Categories) */}
                <div>
                    <h2 className="text-[17px] font-black text-[#111c43] dark:text-white mb-4 tracking-tight">Files</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
                        <Link className="contents" to="/admin/allocations">
                            <FileCard title="Allocations" count={`${stats.totalAllocations} files`} icon={LayoutList} colorClass="text-[#6B5AED]" />
                        </Link>
                        <Link className="contents" to="/admin/duty-allocations">
                            <FileCard title="Duty Assigned" count={`System files`} icon={UserCheck} colorClass="text-[#00B4B5]" />
                        </Link>
                        <FileCard title="Schedules" count={`${stats.totalExams} files`} icon={Archive} colorClass="text-[#EE5E99]" />
                        <FileCard title="Reports" count="21 files" icon={FileText} colorClass="text-[#3180D8]" />
                        <Link to="/admin/allocate" className="bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-blue-500 hover:text-blue-600 min-h-[100px]">
                            <Plus size={24} strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>

                {/* Recent files */}
                <div>
                    <h2 className="text-[17px] font-black text-[#111c43] dark:text-white mb-4 tracking-tight">Recent files</h2>
                    <div className="space-y-3">
                        <RecentItem title="Student_Roster" ext="PNG file" size="5 MB" icon={FileText} bgClass="bg-[#6B5AED] bg-opacity-20" colorClass="text-[#6B5AED]" />
                        <RecentItem title="Exam_Schedule_T1" ext="AVI file" size="105 MB" icon={Archive} bgClass="bg-[#EE5E99] bg-opacity-20" colorClass="text-[#EE5E99]" />
                        <RecentItem title="Hall_Capacities" ext="MP3 file" size="21 MB" icon={LayoutList} bgClass="bg-[#3180D8] bg-opacity-20" colorClass="text-[#3180D8]" />
                        <RecentItem title="Allocation_Rules" ext="DOCx file" size="500 kb" icon={CheckSquare} bgClass="bg-[#00B4B5] bg-opacity-20" colorClass="text-[#00B4B5]" />
                    </div>
                </div>
            </div>

            {/* Right Sidebar Cloud Add */}
            <div className="w-full xl:w-[320px] shrink-0 bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col pt-16 mt-8 xl:mt-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-gray-700 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <Link to="/admin/allocate" className="flex flex-col items-center justify-center p-10 border-2 border-transparent hover:border-blue-100 dark:hover:border-gray-600 rounded-3xl transition-colors mb-10 group cursor-pointer relative z-10 w-full hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-[#111c43] dark:text-white mb-3 shadow-[0_4px_15px_-4px_rgba(49,128,216,0.3)] bg-white dark:bg-gray-700">
                        <UploadCloud size={24} className="text-[#3180D8] dark:text-blue-400 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    <span className="font-bold text-xs text-[#111c43] dark:text-white tracking-wide">Add new files</span>
                </Link>

                <div className="relative z-10 w-full mb-6">
                    <h3 className="font-black text-xs uppercase tracking-widest text-[#111c43] dark:text-gray-300 mb-4">Student Search</h3>
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Name or Reg No..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl py-2.5 pl-9 pr-4 text-[11px] font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-800 dark:text-gray-200"
                        />
                    </div>

                    <div className="space-y-2">
                        {searchQuery && filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <Link to={`/admin/students`} key={student._id} className="bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:border-blue-200 dark:hover:border-gray-500 transition-colors group">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center text-blue-600 font-bold overflow-hidden shadow-sm shrink-0">
                                            {student.profileImage ? (
                                                <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                                            ) : (
                                                student.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-[11px] text-[#111c43] dark:text-gray-200 truncate group-hover:text-blue-600 transition-colors">{student.name}</p>
                                            <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{student.registerNumber}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[9px] uppercase font-black text-gray-400 dark:text-gray-500 tracking-widest">{student.department.split(' ')[0]}</p>
                                        <p className="font-bold text-[10px] text-blue-600 dark:text-blue-400">Yr {student.year}</p>
                                    </div>
                                </Link>
                            ))
                        ) : searchQuery ? (
                            <p className="text-center text-[10px] font-bold text-gray-400 py-2">No matching students.</p>
                        ) : (
                            <div className="text-center py-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-50 dark:border-gray-700 border-dashed">
                                <Users size={20} className="mx-auto mb-1.5 text-gray-300 dark:text-gray-600" />
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Find student details</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;

