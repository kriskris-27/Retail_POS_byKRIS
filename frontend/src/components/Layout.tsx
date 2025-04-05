import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = {
    admin: [
        { name: 'Dashboard', path: '/' },
        { name: 'Users', path: '/users' },
        { name: 'Products', path: '/products' },
        { name: 'Sales', path: '/sales' },
        { name: 'Inventory', path: '/inventory' },
        { name: 'Reports', path: '/reports' },
    ],
    manager: [
        { name: 'Dashboard', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'Sales', path: '/sales' },
        { name: 'Inventory', path: '/inventory' },
        { name: 'Reports', path: '/reports' },
    ],
    cashier: [
        { name: 'Dashboard', path: '/' },
        { name: 'Sales', path: '/sales' },
    ],
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userNavigation = user ? navigation[user.role as keyof typeof navigation] : [];

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-gray-800">Retail System</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {userNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`${
                                            location.pathname === item.path
                                                ? 'border-indigo-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center">
                            {user && (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-700">
                                        {user.name} ({user.role})
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
