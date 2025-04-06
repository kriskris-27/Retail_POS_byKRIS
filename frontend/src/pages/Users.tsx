// src/pages/Users.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import UserFormModal from "../components/UserFormModal";

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

  const { user } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin", {
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
      await fetch(`http://localhost:5000/api/admin/delete/${id}`, {
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
        ? `http://localhost:5000/api/admin/update/${editUser._id}`
        : "http://localhost:5000/api/admin/create";

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setEditUser(null);
            setModalOpen(true);
          }}
        >
          + Create User
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="border p-2">{u.name}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2 capitalize">{u.role}</td>
                <td className="border p-2 space-x-2">
                  <button
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                    onClick={() => {
                      setEditUser(u);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(u._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
