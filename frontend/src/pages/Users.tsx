// src/pages/Users.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import UserFormModal from "../components/UserFormModal";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


type User = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "cashier" | "manager";
};

type UserFormData = {
  name: string;
  email: string;
  role: "admin" | "cashier" | "manager";
  password?: string;
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const { user } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin`, {
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchUsers();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await fetch(`${BASE_URL}/admin/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleCreateOrUpdate = async (formData: UserFormData) => {
    try {
      const endpoint = editUser
        ? `${BASE_URL}/admin/update/${editUser._id}`
        : `${BASE_URL}/admin/create`;

      const method = editUser ? "PUT" : "POST";

      await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      await fetchUsers(); // Refresh
      setModalOpen(false);
      setEditUser(null);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // Get unique roles for filter
  const roles = ["all", ...new Set(users.map(u => u.role))];

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-4 md:p-6 max-w-full overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 md:p-6 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <button
            className="bg-white text-blue-600 px-5 py-3 rounded-xl font-semibold shadow-md hover:bg-blue-50 transition-all duration-200 text-sm md:text-base flex items-center gap-2 w-full md:w-auto justify-center"
            onClick={() => {
              setEditUser(null);
              setModalOpen(true);
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add User
          </button>
        </div>

        {/* Search and filter section */}
        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder-blue-200 border border-blue-400/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-white/10 text-white border border-blue-400/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none min-w-[150px]"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map(role => (
              <option key={role} value={role} className="text-gray-800">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-md">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => (
            <div key={u._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{u.name}</h3>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      u.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center">
                  <svg className="w-5 h-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-gray-700">{u.email}</span>
                </div>
                
                <div className="mt-5 flex justify-between gap-3">
                  <button
                    className="flex-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl py-3 font-medium hover:bg-amber-100 transition-colors duration-200 flex items-center justify-center gap-1"
                    onClick={() => {
                      setEditUser(u);
                      setModalOpen(true);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                    Edit
                  </button>
                  <button
                    className="flex-1 bg-red-50 text-red-600 border border-red-200 rounded-xl py-3 font-medium hover:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-1"
                    onClick={() => handleDelete(u._id)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditUser(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editUser || undefined}
        mode={editUser ? "edit" : "create"}
      />
    </div>
  );
};

export default Users;
