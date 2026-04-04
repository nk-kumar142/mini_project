import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (identifier, password, role) => {
        const { data } = await api.post('/auth/login', { identifier, password, role });
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
