import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false, staffOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    if (staffOnly && user.role !== 'staff' && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;
