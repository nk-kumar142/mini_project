import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, User as UserIcon } from 'lucide-react';

const StudentDashboard = () => {
    const [allocation, setAllocation] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchMyAllocation = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/allocation/my-allocation', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                if (data && data.length > 0) setAllocation(data[0]);
            } catch (error) { console.error('Error fetching allocation'); }
        };
        fetchMyAllocation();
    }, [user.token]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 bg-gradient-to-r from-primary-50 to-white">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
                <p className="text-gray-600 mt-2">Here is your exam hall information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-primary-600 mb-4"><Calendar size={28} /></div>
                    <h3>Department</h3><p>{user?.department}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-primary-600 mb-4"><MapPin size={28} /></div>
                    <h3>Reg No</h3><p>{user?.registerNumber}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-primary-600 mb-4"><UserIcon size={28} /></div>
                    <h3>Year</h3><p>{user?.year}st Year</p>
                </div>
            </div>

            {allocation && (
                <div className="mt-8 bg-white p-8 rounded-xl shadow-md border-t-4 border-primary-600">
                    <h2 className="text-xl font-bold mb-6">Allocation</h2>
                    <div className="flex justify-between">
                        <div><p className="text-sm font-semibold">Subject</p><p className="text-lg font-bold">{allocation.examId?.subject}</p></div>
                        <div><p className="text-sm font-semibold">Hall</p><p className="text-lg font-bold text-primary-600">{allocation.hallId?.hallName}</p></div>
                        <div><p className="text-sm font-semibold">Seat</p><p className="text-3xl font-black text-primary-600">{allocation.seatNumber}</p></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
