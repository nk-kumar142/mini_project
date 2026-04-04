import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex bg-[#f8fafc] dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <Sidebar />
            <div className="flex-1 ml-64 p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
