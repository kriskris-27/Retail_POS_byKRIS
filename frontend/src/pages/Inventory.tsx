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
    const [message, setMessage] = useState("");

    const fetchLowStock = async () => {
        console.log("Fetching low-stock products");
        try {
            const response = await fetch(`${BASE_URL}/inventory/low-stock`, {
                credentials: "include",
            });
            const data = await response.json();

            if (Array.isArray(data)) {
                setLowStock(data);
            } else if (data.message) {
                setMessage(data.message);
                setLowStock([]); // ensure lowStock is an array for .map
            } else {
                setMessage("Unexpected response format");
            }
        } catch (error) {
            console.error("Error fetching low stock products", error);
        }
    };

    const fetchExpiring = async () => {
        console.log("Fetching expiring products");
        try {
            const response = await fetch(`${BASE_URL}/inventory/expiring-soon`, {
                credentials: "include",
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setExpiring(data);
            } else {
                setMessage("Unexpected response format");
                setExpiring([]);
            }
        } catch (error) {
            console.error("Error fetching expiring products", error);
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-center mb-8">Inventory Dashboard</h1>

            {/* Low Stock Products */}
            <section className="mb-10 bg-white p-6 rounded shadow">
                <h2 className="text-2xl font-semibold mb-4">Low Stock Products</h2>
                <button
                    onClick={fetchLowStock}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mb-4"
                >
                    Fetch Low Stock Products
                </button>
                {lowStock !== null && (
                    <>
                        {lowStock.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                                {lowStock.map((product) => (
                                    <li key={product._id} className="text-gray-700">
                                        {product.name || "Unnamed Product"} - Stock: {product.stock}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No low-stock products</p>
                        )}
                    </>
                )}
            </section>

            {/* Expiring Products */}
            <section className="mb-10 bg-white p-6 rounded shadow">
                <h2 className="text-2xl font-semibold mb-4">Expiring Products</h2>
                <button
                    onClick={fetchExpiring}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mb-4"
                >
                    Fetch Expiring Products
                </button>
                {expiring !== null && (
                    <>
                        {expiring.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                                {expiring.map((product) => (
                                    <li key={product._id} className="text-gray-700">
                                        {product.name || "Unnamed Product"} - Expires: {product.expiryDate}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No expiring products</p>
                        )}
                    </>
                )}
            </section>

            {message && <p className="mt-4 text-center text-green-600">{message}</p>}
        </div>
    );
};

export default Inventory;
