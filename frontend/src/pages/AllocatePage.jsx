import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AllocatePage = () => {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/admin/exams', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setExams(data);
            } catch (error) {
                toast.error('Failed to fetch exams');
            }
        };
        fetchExams();
    }, [user.token]);

    const handleAllocate = async () => {
        if (!selectedExam) return toast.error('Please select an exam');
        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/allocation/allocate', { examId: selectedExam }, { headers: { Authorization: `Bearer ${user.token}` } });
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Allocation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Automatic Hall Allocation</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-start space-x-4 mb-8 p-4 bg-blue-50 text-blue-700 rounded-lg">
                    <AlertCircle className="mt-1" size={20} />
                    <div><p className="font-semibold">Important Note</p><p className="text-sm">This process will assign students based on dept/year. Existing allocations will be overwritten.</p></div>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam</label>
                    <select className="w-full px-4 py-3 border rounded-lg" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                        <option value="">-- Choose an Exam --</option>
                        {exams.map(exam => (<option key={exam._id} value={exam._id}>{exam.examName} - {exam.department} (Year {exam.year})</option>))}
                    </select>
                </div>
                <button onClick={handleAllocate} disabled={loading || !selectedExam} className={`w-full py-3 rounded-lg font-bold text-white transition ${loading || !selectedExam ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'}`}>
                    {loading ? 'Allocating...' : 'Start Allocation'}
                </button>
            </div>
        </div>
    );
};

export default AllocatePage;
