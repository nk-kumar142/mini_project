import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageHalls = () => {
    const [halls, setHalls] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ hallName: '', building: '', capacity: '' });
    const { user } = useAuth();

    const fetchHalls = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/halls', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setHalls(data);
        } catch (error) {
            toast.error('Failed to fetch halls');
        }
    };

    useEffect(() => {
        fetchHalls();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/halls', formData, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            toast.success('Hall added');
            setFormData({ hallName: '', building: '', capacity: '' });
            setShowForm(false);
            fetchHalls();
        } catch (error) {
            toast.error('Failed to add hall');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/halls/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                toast.success('Hall deleted');
                fetchHalls();
            } catch (error) {
                toast.error('Failed to delete hall');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Manage Halls</h1>
                <button onClick={() => setShowForm(!showForm)} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
                    <Plus size={20} className="inline mr-2" />
                    Add Hall
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input placeholder="Hall Name" className="px-4 py-2 border rounded-lg" value={formData.hallName} onChange={(e) => setFormData({ ...formData, hallName: e.target.value })} required />
                    <input placeholder="Building" className="px-4 py-2 border rounded-lg" value={formData.building} onChange={(e) => setFormData({ ...formData, building: e.target.value })} required />
                    <input type="number" placeholder="Capacity" className="px-4 py-2 border rounded-lg" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} required />
                    <button type="submit" className="md:col-span-3 bg-primary-600 text-white py-2 rounded-lg font-semibold">Save Hall</button>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Hall Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Building</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Capacity</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {halls.map((hall) => (
                            <tr key={hall._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-sm text-gray-900">{hall.hallName}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{hall.building}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{hall.capacity}</td>
                                <td className="px-6 py-4 text-sm">
                                    <button onClick={() => handleDelete(hall._id)} className="text-red-600 hover:text-red-900">
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

export default ManageHalls;
