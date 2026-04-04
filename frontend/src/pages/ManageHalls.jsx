import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Hotel, Plus, Search, Trash2, Edit2, X, Check, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageHalls = () => {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        _id: '',
        hallName: '',
        building: '',
        capacity: ''
    });

    const fetchHalls = async () => {
        try {
            const { data } = await api.get('/admin/halls', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setHalls(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch halls');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHalls();
    }, [user.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            if (isEditing) {
                await api.put(`/admin/halls/${formData._id}`, formData, config);
                toast.success('Hall updated successfully');
            } else {
                await api.post('/admin/halls', formData, config);
                toast.success('Hall added successfully');
            }

            setShowModal(false);
            resetForm();
            fetchHalls();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this hall?')) return;
        try {
            await api.delete(`/admin/halls/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success('Hall removed successfully');
            fetchHalls();
        } catch (error) {
            toast.error('Failed to delete hall');
        }
    };

    const handleEdit = (hall) => {
        setFormData(hall);
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ _id: '', hallName: '', building: '', capacity: '' });
        setIsEditing(false);
    };

    const filteredHalls = halls.filter(hall =>
        hall.hallName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hall.building.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-tight transition-colors">Examination Halls</h1>
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-1 transition-colors">{halls.length} halls available containing {halls.reduce((acc, h) => acc + parseInt(h.capacity || 0), 0)} seats</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/30"
                >
                    <Plus size={16} /> Add Hall
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search by hall name or building..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Hall Name</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Building</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Capacity</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {filteredHalls.map((hall) => (
                                <tr key={hall._id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-gray-700 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm uppercase">
                                                {hall.hallName.substring(0, 2)}
                                            </div>
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">{hall.hallName}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-bold">
                                            <Building size={14} />
                                            {hall.building}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 dark:bg-gray-700 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-wider">
                                            {hall.capacity} Seats
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(hall)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(hall._id)}
                                                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredHalls.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-8 py-12 text-center text-gray-400 dark:text-gray-500 text-sm font-bold">
                                        No halls found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden transition-colors">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wide">
                                    {isEditing ? 'Edit Hall' : 'Add New Hall'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <X size={20} className="text-gray-400 dark:text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Hall Name / Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.hallName}
                                        onChange={(e) => setFormData({ ...formData, hallName: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all"
                                        placeholder="e.g. A-101"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Building / Block</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.building}
                                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all"
                                        placeholder="e.g. Main Block"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Seating Capacity</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl py-3.5 px-4 text-sm font-bold text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all"
                                        placeholder="e.g. 60"
                                    />
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/30"
                                    >
                                        {isEditing ? 'Update Hall' : 'Add Hall'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageHalls;
