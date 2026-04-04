import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ManageStudents from './pages/ManageStudents';
import ManageHalls from './pages/ManageHalls';
import ManageExams from './pages/ManageExams';
import ManageStaff from './pages/ManageStaff';
import ManageDutyAllocations from './pages/ManageDutyAllocations';
import AllocatePage from './pages/AllocatePage';
import AllocationList from './pages/AllocationList';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ViewAllocation from './pages/ViewAllocation';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GanttChart from './pages/GanttChart';
import HallSeatingView from './pages/HallSeatingView';
import Profile from './pages/Profile';

function App() {
    return (
        <Router>
            <AuthProvider>
                <ThemeProvider>
                    <Toaster position="top-right" />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<PrivateRoute adminOnly><Layout /></PrivateRoute>}>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="students" element={<ManageStudents />} />
                            <Route path="staff" element={<ManageStaff />} />
                            <Route path="halls" element={<ManageHalls />} />
                            <Route path="exams" element={<ManageExams />} />
                            <Route path="allocate" element={<AllocatePage />} />
                            <Route path="allocations" element={<AllocationList />} />
                            <Route path="duty-allocations" element={<ManageDutyAllocations />} />
                            <Route path="gantt" element={<GanttChart />} />
                            <Route path="hall/:hallName" element={<HallSeatingView />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>

                        {/* Student Routes */}
                        <Route path="/student" element={<PrivateRoute><Layout /></PrivateRoute>}>
                            <Route path="dashboard" element={<StudentDashboard />} />
                            <Route path="allocation" element={<ViewAllocation />} />
                            <Route path="gantt" element={<GanttChart />} />
                            <Route path="hall/:hallName" element={<HallSeatingView />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>

                        {/* Staff Routes */}
                        <Route path="/staff" element={<PrivateRoute staffOnly><Layout /></PrivateRoute>}>
                            <Route path="dashboard" element={<StaffDashboard />} />
                            <Route path="gantt" element={<GanttChart />} />
                            <Route path="hall/:hallName" element={<HallSeatingView />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>

                        <Route path="/" element={<Navigate to="/login" />} />
                    </Routes>
                </ThemeProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
