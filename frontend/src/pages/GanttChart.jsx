import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart2, Calendar, Clock, Building2, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

/* ── colour palette cycling by exam index ── */
const COLORS = [
    { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    { bg: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
];

/* parse "HH:MM" → minutes from midnight */
const toMins = (t = '', session = '') => {
    let [h, m] = t.split(':').map(Number);
    if (isNaN(h)) h = 0;
    if (isNaN(m)) m = 0;

    // Smart shift: if Afternoon session and h is small (e.g., 1 to 7), assume PM
    if (session === 'AN' && h > 0 && h < 8) {
        h += 12;
    }

    return h * 60 + m;
};

/* timeline range: 08:00 – 18:00 (600 min span) */
const DAY_START = 8 * 60;    // 480
const DAY_END = 18 * 60;   // 1080
const DAY_SPAN = DAY_END - DAY_START; // 600

const timeLabel = (mins) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

const HOUR_MARKS = Array.from({ length: 11 }, (_, i) => DAY_START + i * 60); // 08–18

const GanttChart = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('all');
    const [filterSubject, setFilterSubject] = useState('all');
    const [tooltip, setTooltip] = useState(null); // { exam, hall, count, x, y }

    const fetchData = async () => {
        setLoading(true);
        try {
            const cfg = { headers: { Authorization: `Bearer ${user.token}` } };
            const [examRes, allocRes] = await Promise.all([
                api.get('/admin/exams', cfg),
                api.get('/allocation', cfg),
            ]);
            setExams(examRes.data);
            setAllocations(allocRes.data);
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user.token]);

    /* ── Build chart data ─────────────────────────────── */
    // group allocations by examId and hallId
    const grouped = {};
    allocations.forEach(alc => {
        const eId = alc.examId?._id;
        const hId = alc.hallId?._id;
        if (!eId || !hId) return;
        const key = `${eId}__${hId}`;
        if (!grouped[key]) grouped[key] = { exam: alc.examId, hall: alc.hallId, students: [] };
        grouped[key].students.push(alc);
    });

    const bars = Object.values(grouped);

    // unique sorted dates from exams
    const allDates = [...new Set(exams.map(e => e.examDate?.split('T')[0]))].sort();

    // unique subjects for legend filter
    const uniqueSubjects = [...new Set(exams.map(e => e.subject))].sort();

    const filteredBars = bars.filter(b => {
        const dateMatch = selectedDate === 'all' || b.exam?.examDate?.startsWith(selectedDate);
        const subjectMatch = filterSubject === 'all' || b.exam?.subject === filterSubject;
        return dateMatch && subjectMatch;
    });

    // unique halls from filtered bars
    const halls = [...new Map(filteredBars.map(b => [b.hall?._id, b.hall])).values()];

    // assign colour by exam._id
    const examColorMap = {};
    exams.forEach((e, i) => { examColorMap[e._id] = COLORS[i % COLORS.length]; });

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 transition-colors">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-tight flex items-center gap-2 transition-colors">
                        <BarChart2 size={24} /> Gantt Chart
                    </h1>
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-1 transition-colors">
                        Visual timeline of exam hall allocations
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Date filter */}
                    <select
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50 transition-colors"
                    >
                        <option value="all">All Dates</option>
                        {allDates.map(d => (
                            <option key={d} value={d}>
                                {new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={fetchData}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: <Calendar size={18} />, label: 'Exam Days', value: allDates.length, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' },
                    { icon: <Building2 size={18} />, label: 'Halls Used', value: halls.length, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' },
                    { icon: <BarChart2 size={18} />, label: 'Exam Slots', value: filteredBars.length, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' },
                    { icon: <Users size={18} />, label: 'Allocations', value: filteredBars.reduce((s, b) => s + b.students.length, 0), color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 flex items-center gap-3 transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} transition-colors`}>{s.icon}</div>
                        <div>
                            <p className="text-xl font-black text-slate-800 dark:text-white transition-colors">{s.value}</p>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            {exams.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 p-4 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Exam Legend (Click to Filter)</p>
                        {filterSubject !== 'all' && (
                            <button
                                onClick={() => setFilterSubject('all')}
                                className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase hover:underline transition-colors"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {uniqueSubjects.map((sub) => {
                            // find first exam with this subject for colour
                            const sampleExam = exams.find(e => e.subject === sub);
                            const c = examColorMap[sampleExam._id];
                            const isActive = filterSubject === sub;
                            return (
                                <button
                                    key={sub}
                                    onClick={() => setFilterSubject(isActive ? 'all' : sub)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isActive
                                        ? `${c.bg} border-transparent text-white shadow-md`
                                        : `${c.light} ${c.border} ${c.text}`
                                        }`}
                                >
                                    {!isActive && <div className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />}
                                    <span className={`text-[11px] font-black uppercase tracking-tight`}>
                                        {sub}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Gantt Timeline */}
            {halls.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 p-16 text-center transition-colors">
                    <BarChart2 size={48} className="mx-auto text-gray-200 dark:text-gray-600 mb-4 transition-colors" />
                    <p className="text-gray-400 dark:text-gray-500 font-bold text-sm transition-colors">No allocation data to display.</p>
                    <p className="text-gray-300 dark:text-gray-600 text-xs mt-1 transition-colors">Run the allocator first, then come back here.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 transition-colors">
                        <h2 className="text-sm font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-widest transition-colors">
                            Timeline — Hall × Time
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[720px] p-6">
                            {/* Time axis */}
                            <div className="flex ml-[160px] mb-2 relative">
                                {HOUR_MARKS.map(m => (
                                    <div
                                        key={m}
                                        className="absolute text-[10px] font-bold text-gray-400 dark:text-gray-500 transition-colors"
                                        style={{ left: `${((m - DAY_START) / DAY_SPAN) * 100}%`, transform: 'translateX(-50%)' }}
                                    >
                                        {timeLabel(m)}
                                    </div>
                                ))}
                            </div>

                            {/* Hall rows */}
                            <div className="space-y-3 mt-6">
                                {halls.map(hall => {
                                    const hallBars = filteredBars.filter(b => b.hall?._id === hall?._id);
                                    return (
                                        <div key={hall?._id} className="flex items-stretch gap-4">
                                            {/* Hall label */}
                                            <div className="w-[160px] flex-shrink-0 flex items-center">
                                                <div className="bg-[#1e3a8a]/5 dark:bg-blue-900/10 rounded-xl px-3 py-2 w-full transition-colors">
                                                    <p className="text-[11px] font-black text-[#1e3a8a] dark:text-blue-400 truncate transition-colors">{hall?.hallName}</p>
                                                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider transition-colors">
                                                        {hallBars.reduce((s, b) => s + b.students.length, 0)} students
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Timeline track */}
                                            <div className="flex-1 relative h-14 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden transition-colors">
                                                {/* Hour grid lines */}
                                                {HOUR_MARKS.slice(1, -1).map(m => (
                                                    <div
                                                        key={m}
                                                        className="absolute top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-600 transition-colors"
                                                        style={{ left: `${((m - DAY_START) / DAY_SPAN) * 100}%` }}
                                                    />
                                                ))}

                                                {/* Bars for each exam in this hall */}
                                                {hallBars.map(b => {
                                                    const timeStr = b.exam?.time || '';
                                                    const session = b.exam?.session || '';
                                                    let startMin = DAY_START, endMin = DAY_START + 180;
                                                    if (timeStr.includes(' - ')) {
                                                        const [s, e] = timeStr.split(' - ');
                                                        startMin = toMins(s.trim(), session);
                                                        endMin = toMins(e.trim(), session);
                                                    } else if (timeStr) {
                                                        startMin = toMins(timeStr.trim(), session);
                                                        endMin = startMin + 180;
                                                    }

                                                    const left = Math.max(0, ((startMin - DAY_START) / DAY_SPAN) * 100);
                                                    const width = Math.max(2, ((endMin - startMin) / DAY_SPAN) * 100);
                                                    const c = examColorMap[b.exam?._id] || COLORS[0];

                                                    return (
                                                        <div
                                                            key={b.exam?._id}
                                                            className={`absolute top-2 bottom-2 ${c.bg} rounded-lg cursor-pointer shadow-sm flex items-center px-2 overflow-hidden group hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 transition-all`}
                                                            style={{ left: `${left}%`, width: `${width}%` }}
                                                            onClick={() => navigate(`/${user.role}/hall/${encodeURIComponent(hall.hallName)}`)}
                                                            title="Click to view seating"
                                                            onMouseEnter={e => {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setTooltip({ bar: b, x: rect.left, y: rect.top, w: rect.width });
                                                            }}
                                                            onMouseLeave={() => setTooltip(null)}
                                                        >
                                                            <span className="text-white text-[9px] font-black truncate select-none">
                                                                {b.exam?.subject}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tooltip portal */}
            {tooltip && (
                <div
                    className="fixed z-[9999] bg-[#1e3a8a] text-white rounded-2xl shadow-2xl p-4 min-w-[200px] pointer-events-none"
                    style={{ top: tooltip.y - 120, left: tooltip.x + (tooltip.w / 2) - 100 }}
                >
                    <p className="font-black text-sm mb-1">{tooltip.bar.exam?.subject}</p>
                    <p className="text-[10px] text-blue-200 uppercase tracking-wider mb-2">{tooltip.bar.exam?.examName}</p>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-blue-100">
                            <Calendar size={12} />
                            {tooltip.bar.exam?.examDate
                                ? new Date(tooltip.bar.exam.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                : '—'}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-blue-100">
                            <Clock size={12} />
                            {tooltip.bar.exam?.time || '—'} ({tooltip.bar.exam?.session || '—'})
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-blue-100">
                            <Building2 size={12} />
                            Hall: {tooltip.bar.hall?.hallName}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-blue-100">
                            <Users size={12} />
                            {tooltip.bar.students.length} students allocated
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GanttChart;
