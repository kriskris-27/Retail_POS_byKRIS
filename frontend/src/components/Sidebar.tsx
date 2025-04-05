import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <aside className="w-64 bg-gray-800 text-white h-screen p-5">
            <ul>
                <li className="mb-3">
                    <Link to="/" className="block p-2 hover:bg-gray-700">Dashboard</Link>
                </li>
                <li className="mb-3">
                    <Link to="/sales" className="block p-2 hover:bg-gray-700">Sales</Link>
                </li>
                <li className="mb-3">
                    <Link to="/inventory" className="block p-2 hover:bg-gray-700">Inventory</Link>
                </li>
                <li className="mb-3">
                    <Link to="/login" className="block p-2 hover:bg-gray-700">Login</Link>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
