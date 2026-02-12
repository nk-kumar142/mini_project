import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageExams = () => {
    const [exams, setExams] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ examName: '', examDate: '', subject: '', department: '', year: '' });
    const { user } = useAuth();

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

    useEffect(() => {
        fetchExams();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/exams', formData, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            toast.success('Exam added');
            setFormData({ examName: '', examDate: '', subject: '', department: '', year: '' });
            setShowForm(false);
            fetchExams();
        } catch (error) {
            toast.error('Failed to add exam');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/exams/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                toast.success('Exam deleted');
                fetchExams();
            } catch (error) {
                toast.error('Failed to delete exam');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Manage Exams</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
                    <Plus size={20} className="inline mr-2" />
                    Add Exam
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Exam Name" className="px-4 py-2 border rounded-lg" value={formData.examName} onChange={(e) => setFormData({ ...formData, examName: e.target.value })} required />
                    <input type="date" className="px-4 py-2 border rounded-lg" value={formData.examDate} onChange={(e) => setFormData({ ...formData, examDate: e.target.value })} required />
                    <input placeholder="Subject" className="px-4 py-2 border rounded-lg" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                    <select className="px-4 py-2 border rounded-lg" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required>
                        <option value="">Select Department</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="Mechanical">Mechanical</option>
                    </select>
                    <select className="px-4 py-2 border rounded-lg" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} required>
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>
                    <button type="submit" className="md:col-span-2 bg-primary-600 text-white py-2 rounded-lg font-semibold">Save Exam</button>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Exam Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Subject</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {exams.map((exam) => (
                            <tr key={exam._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-sm text-gray-900">{exam.examName}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{exam.subject}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(exam.examDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm">
                                    <button onClick={() => handleDelete(exam._id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageExams;
