import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import toast from 'react-hot-toast';

const HallSeatingView = () => {
    const { hallName } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllocationsHelp = async () => {
            try {
                // Fetch ALL allocations then filter by Hall Name (simplest for now without new backend route)
                const { data } = await api.get('/allocation', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const hallAllocs = data.filter(a => a.hallId?.hallName === hallName);
                // Sort by seat number
                hallAllocs.sort((a, b) => a.seatNumber - b.seatNumber);
                setAllocations(hallAllocs);
                setLoading(false);
            } catch (error) {
                toast.error('Failed to load seating chart');
                setLoading(false);
            }
        };
        fetchAllocationsHelp();
    }, [hallName, user.token]);

    // Grid Layout Logic: 10 seats per row (A1..A10, B1..B10...)
    // Each Row has 5 Groups of 2 Seats (Matches image Column 1..5)
    // Row letters: A, B, C...
    const seatsPerRow = 10;
    const rows = [];
    if (allocations.length > 0) {
        const totalSeats = allocations.reduce((max, curr) => Math.max(max, curr.seatNumber), 0);
        const rowCount = Math.ceil(totalSeats / seatsPerRow);

        for (let r = 0; r < rowCount; r++) {
            const rowLabel = String.fromCharCode(65 + r); // A, B, C...
            const rowSeats = [];
            for (let c = 1; c <= seatsPerRow; c++) {
                const seatNum = r * seatsPerRow + c;
                const allocation = allocations.find(a => a.seatNumber === seatNum);
                rowSeats.push({ seatNum, allocation });
            }
            rows.push({ label: rowLabel, seats: rowSeats });
        }
    }

    if (loading) return <div className="p-10 text-center dark:text-gray-300">Loading Seating Chart...</div>;

    return (
        <div className="space-y-6 transition-colors">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-tight transition-colors">
                        Hall Seating: {hallName}
                    </h1>
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 transition-colors">
                        {allocations.length} Candidates | {allocations[0]?.examId?.examName}
                    </p>
                </div>
            </div>

            {/* Print Header Matching Reference */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="border-2 border-gray-800 mb-8 hidden print:block">
                    <div className="grid grid-cols-4 text-center font-bold border-b-2 border-gray-800 divide-x-2 divide-gray-800 bg-gray-100">
                        <div className="p-2">Degree: B.E./B.Tech</div>
                        <div className="p-2">Session: FN</div>
                        <div className="p-2">Date: {new Date(allocations[0]?.examId?.examDate).toLocaleDateString()}</div>
                        <div className="p-2">Venue: {hallName}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-gray-800 dark:border-gray-600 print:text-black transition-colors">
                        <thead>
                            <tr className="bg-gray-800 dark:bg-gray-900 text-white print:bg-white print:text-black print:border-b-2 print:border-black transition-colors">
                                <th className="p-3 border-r border-gray-600 dark:border-gray-700 print:border-black w-16 transition-colors">Row</th>
                                {/* 5 Columns based on image */}
                                {[1, 2, 3, 4, 5].map(col => (
                                    <th key={col} className="p-3 border-r border-gray-600 dark:border-gray-700 print:border-black text-center transition-colors" colSpan="2">
                                        Column {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.label} className="border-b border-gray-800 dark:border-gray-600 transition-colors">
                                    <td className="p-4 font-black text-center border-r-2 border-gray-800 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-200 print:bg-white text-xl transition-colors">
                                        {row.label}
                                    </td>
                                    {row.seats.map((seat, idx) => (
                                        <td
                                            key={idx}
                                            className={`p-2 border-r border-gray-400 dark:border-gray-700 text-center w-32 h-24 align-middle relative group ${(idx + 1) % 2 === 0 ? 'border-r-2 border-gray-800 dark:border-gray-600' : ''
                                                } transition-colors`}
                                        >
                                            <div className="absolute top-1 left-1 text-[10px] text-gray-400 dark:text-gray-500 font-bold px-1 rounded bg-gray-50 dark:bg-gray-700 print:hidden transition-colors">
                                                {row.label}{idx + 1}
                                            </div>

                                            {seat.allocation ? (
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className="font-black text-sm text-gray-900 dark:text-gray-100 font-mono transition-colors">
                                                        {seat.allocation.studentId?.registerNumber}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase transition-colors">
                                                        {seat.allocation.studentId?.department}
                                                    </span>
                                                    <div className="hidden group-hover:flex absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs p-2 rounded shadow-lg z-10 whitespace-nowrap pointer-events-none transition-colors">
                                                        {seat.allocation.studentId?.name}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-200 dark:text-gray-700 text-xs font-mono transition-colors">-</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HallSeatingView;
