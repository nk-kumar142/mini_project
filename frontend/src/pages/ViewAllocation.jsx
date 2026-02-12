import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const ViewAllocation = () => {
    const [allocations, setAllocations] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchMyAllocations = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/allocation/my-allocation', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setAllocations(data);
            } catch (error) { toast.error('Failed to fetch allocations'); }
        };
        fetchMyAllocations();
    }, [user.token]);

    const handleRequest = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/allocation/${id}/request-download`, {}, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            toast.success('Download request sent to admin');

            // Refresh allocations to show updated status
            const { data } = await axios.get('http://localhost:5000/api/allocation/my-allocation', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setAllocations(data);
        } catch (error) {
            toast.error('Failed to send request');
            console.error(error);
        }
    };

    const handleDownload = async (id) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/pdf/hall-ticket/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'HallTicket.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to download ticket');
            console.error(error);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-8">My Hall Allocations</h1>
            {allocations.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm text-center"><p className="text-gray-500">No allocations found yet.</p></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allocations.map((alc) => (
                        <div key={alc._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="bg-primary-600 p-4 text-white"><h3 className="font-bold">{alc.examId?.examName}</h3></div>
                            <div className="p-6">
                                <p>Hall: {alc.hallId?.hallName}</p>
                                <p>Seat: {alc.seatNumber}</p>

                                {alc.downloadRequestStatus === 'none' && (
                                    <button
                                        onClick={() => handleRequest(alc._id)}
                                        className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg"
                                    >
                                        Request Download
                                    </button>
                                )}

                                {alc.downloadRequestStatus === 'requested' && (
                                    <div className="mt-4 w-full bg-yellow-100 text-yellow-800 py-2 rounded-lg text-center font-medium">
                                        Awaiting Admin Approval
                                    </div>
                                )}

                                {alc.downloadRequestStatus === 'approved' && (
                                    <button
                                        onClick={() => handleDownload(alc._id)}
                                        className="mt-4 w-full bg-gray-900 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <Download size={18} /> Download Ticket
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewAllocation;
