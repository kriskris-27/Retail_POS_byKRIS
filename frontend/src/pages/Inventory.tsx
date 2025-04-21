import React, { useState } from "react";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


interface Product {
    _id: string;
    name?: string;
    stock: number;
    expiryDate?: string;
}

const Inventory: React.FC = () => {
    const [lowStock, setLowStock] = useState<Product[] | null>(null);
    const [expiring, setExpiring] = useState<Product[] | null>(null);
    const [reduceProductId, setReduceProductId] = useState("");
    const [reduceQuantity, setReduceQuantity] = useState(0);
    const [message, setMessage] = useState("");

    const fetchLowStock = async () => {
        try {
            const response = await fetch(`${BASE_URL}/inventory/low-stock`, {
                credentials: "include",
            });
            const data = await response.json();
            setLowStock(data);
        } catch (error) {
            console.error("Error fetching low stock products", error);
        }
    };

    const fetchExpiring = async () => {
        try {
            const response = await fetch(`${BASE_URL}/inventory/expiring-soon`, {
                credentials: "include",
            });
            const data = await response.json();
            setExpiring(data);
        } catch (error) {
            console.error("Error fetching expiring products", error);
        }
    };

    const handleReduceStock = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const payload = {
                items: [
                    { productId: reduceProductId, quantity: reduceQuantity }
                ]
            };
            const response = await fetch(`${BASE_URL}/inventory/reduce-stock`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            setMessage(data.message || "Stock updated successfully.");
        } catch (error) {
            console.error("Error reducing stock", error);
            setMessage("Error reducing stock");
        }
    };

    return (
        <div className="p-8">
  <h1 className="text-3xl font-bold mb-6">Inventory Dashboard</h1>

  {/* Low Stock Products */}
  <section className="mb-10">
    <h2 className="text-xl font-semibold mb-2">Low Stock Products</h2>
    <button
      onClick={fetchLowStock}
      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mb-4"
    >
      Fetch Low Stock Products
    </button>
    {lowStock && (
      <ul className="list-disc list-inside space-y-1">
        {lowStock.map((product) => (
          <li key={product._id}>
            {product.name || "Unnamed Product"} - Stock: {product.stock}
          </li>
        ))}
      </ul>
    )}
  </section>

  {/* Expiring Products */}
  <section className="mb-10">
    <h2 className="text-xl font-semibold mb-2">Expiring Products</h2>
    <button
      onClick={fetchExpiring}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mb-4"
    >
      Fetch Expiring Products
    </button>
    {expiring && (
      <ul className="list-disc list-inside space-y-1">
        {expiring.map((product) => (
          <li key={product._id}>
            {product.name || "Unnamed Product"} - Expires: {product.expiryDate}
          </li>
        ))}
      </ul>
    )}
  </section>

  {/* Reduce Stock */}
  <section>
    <h2 className="text-xl font-semibold mb-2">Reduce Stock</h2>
    <form onSubmit={handleReduceStock} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">
          Product ID:
          <input
            type="text"
            value={reduceProductId}
            onChange={(e) => setReduceProductId(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </label>
      </div>
      <div>
        <label className="block font-medium mb-1">
          Quantity to reduce:
          <input
            type="number"
            value={reduceQuantity}
            onChange={(e) => setReduceQuantity(Number(e.target.value))}
            required
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </label>
      </div>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Reduce Stock
      </button>
    </form>
    {message && <p className="mt-4 text-green-600">{message}</p>}
  </section>
</div>

    );
};

export default Inventory;
