// src/components/UserFormModal.tsx
import { useState, useEffect } from "react";

type Role = "admin" | "cashier" | "manager";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    email: string;
    role: Role;
    password?: string;
  }) => void;
  initialData?: {
    name: string;
    email: string;
    role: Role;
  };
  mode: "create" | "edit";
};

const UserFormModal = ({ isOpen, onClose, onSubmit, initialData, mode }: Props) => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: Role;
    password: string;
  }>({
    name: "",
    email: "",
    role: "cashier",
    password: "",
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({ ...initialData, password: "" });
    } else {
      setFormData({ name: "", email: "", role: "cashier", password: "" });
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = mode === "edit" ? { ...formData, password: undefined } : formData;
    onSubmit(dataToSend);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl"
      >
        <h2 className="text-xl font-bold">{mode === "create" ? "Create User" : "Edit User"}</h2>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="admin">Admin</option>
          <option value="cashier">Cashier</option>
          <option value="manager">Manager</option>
        </select>

        {mode === "create" && (
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border px-3 py-2 rounded"
            required
          />
        )}

        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {mode === "create" ? "Create" : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormModal;
