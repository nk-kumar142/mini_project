import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ManageStudents from './pages/ManageStudents';
import ManageHalls from './pages/ManageHalls';
import ManageExams from './pages/ManageExams';
import AllocatePage from './pages/AllocatePage';
import AllocationList from './pages/AllocationList';
import StudentDashboard from './pages/StudentDashboard';
import ViewAllocation from './pages/ViewAllocation';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<PrivateRoute adminOnly><Layout /></PrivateRoute>}>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="students" element={<ManageStudents />} />
                        <Route path="halls" element={<ManageHalls />} />
                        <Route path="exams" element={<ManageExams />} />
                        <Route path="allocate" element={<AllocatePage />} />
                        <Route path="allocations" element={<AllocationList />} />
                    </Route>

                    {/* Student Routes */}
                    <Route path="/student" element={<PrivateRoute><Layout /></PrivateRoute>}>
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="allocation" element={<ViewAllocation />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
