import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { logout, user } = useAuth();

  return (
    <div className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800">Bill Vision POS</h2>

      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{user.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
