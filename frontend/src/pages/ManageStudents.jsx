import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const { user } = useAuth();

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/students', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setStudents(data);
        } catch (error) {
            toast.error('Failed to fetch students');
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/students/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                toast.success('Student deleted');
                fetchStudents();
            } catch (error) {
                toast.error('Failed to delete student');
            }
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Manage Students</h1>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Reg No</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Dept</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Year</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {students.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{student.registerNumber}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{student.department}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{student.year}</td>
                                <td className="px-6 py-4 text-sm">
                                    <button onClick={() => handleDelete(student._id)} className="text-red-600 hover:text-red-900">
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

export default ManageStudents;
