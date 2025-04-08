import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // adjust path as needed
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Product = {
  _id: string;
  name: string;
  price: number;
};

type BillItem = {
  product: Product;
  quantity: number;
  price: number;
};

type Bill = {
  _id: string;
  items: BillItem[];
  paymentMethod: string;
  createdAt: string;
  totalAmount: number;
};

const AllbillsPage = () => {
  const { user } = useAuth(); // 🔐 access current user's role
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "monthly">("all");

  const fetchBills = async () => {
    try {
      setLoading(true);
      let url = `${BASE_URL}/billing/`;
      if (filter !== "all") {
        url += `?filter=${filter}`;
      }

      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch bills: ${res.statusText}`);
      }

      const data: Bill[] = await res.json();
      setBills(data);
    } catch (err: unknown) {
      setError("Failed to load bills. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteByFilter = async () => {
    const confirmed = confirm(`Are you sure you want to delete ${filter} bills?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${BASE_URL}/billing/?filterType=${filter}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete bills.");
      }

      alert(`${filter.charAt(0).toUpperCase() + filter.slice(1)} bills deleted successfully.`);
      fetchBills(); // refresh list after deletion
    } catch (error) {
      console.error(error);
      alert("Error deleting bills. Try again later.");
    }
  };

  useEffect(() => {
    fetchBills();
  }, [filter]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">📄 All Bills</h2>

      {/* Timeline Filter & Delete Button */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {["all", "daily", "weekly", "monthly"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-4 py-2 rounded-full border text-sm transition-all ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        {filter !== "all" && user?.role === "admin" && (
          <button
            onClick={handleDeleteByFilter}
            className="ml-auto px-4 py-2 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-all"
          >
            🗑️ Delete {filter.charAt(0).toUpperCase() + filter.slice(1)} Bills
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-600">Loading bills...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : bills.length === 0 ? (
        <p className="text-gray-500">No bills found.</p>
      ) : (
        <div className="space-y-6">
          {bills.map((bill) => (
            <div key={bill._id} className="bg-white shadow-md p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">🧾 Bill ID: {bill._id}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(bill.createdAt).toLocaleString()}
                </span>
              </div>

              <ul className="text-sm divide-y divide-gray-200 mb-2">
                {bill.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between py-1">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>
                      ₹{item.product.price} × {item.quantity} = ₹
                      {item.product.price * item.quantity}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between mt-4 font-semibold text-sm">
                <span>Payment: {bill.paymentMethod}</span>
                <span>Total: ₹{bill.totalAmount.toFixed(2)}</span>
              </div>

              <div className="mt-3 text-right">
                <a
                  href={`${BASE_URL}/billing/invoice/${bill._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  📄 View Invoice
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllbillsPage;
