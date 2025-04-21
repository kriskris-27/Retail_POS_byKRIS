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
            const response = await fetch(`${BASE_URL}/inventory/expiring-soon"`, {
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
        <div style={{ padding: "2rem" }}>
            <h1>Inventory Dashboard</h1>

            <section style={{ marginBottom: "2rem" }}>
                <h2>Low Stock Products</h2>
                <button onClick={fetchLowStock}>Fetch Low Stock Products</button>
                {lowStock && (
                    <ul>
                        {lowStock.map((product) => (
                            <li key={product._id}>
                                {product.name || "Unnamed Product"} - Stock: {product.stock}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section style={{ marginBottom: "2rem" }}>
                <h2>Expiring Products</h2>
                <button onClick={fetchExpiring}>Fetch Expiring Products</button>
                {expiring && (
                    <ul>
                        {expiring.map((product) => (
                            <li key={product._id}>
                                {product.name || "Unnamed Product"} - Expires: {product.expiryDate}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2>Reduce Stock</h2>
                <form onSubmit={handleReduceStock}>
                    <div>
                        <label>
                            Product ID:
                            <input
                                type="text"
                                value={reduceProductId}
                                onChange={(e) => setReduceProductId(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Quantity to reduce:
                            <input
                                type="number"
                                value={reduceQuantity}
                                onChange={(e) => setReduceQuantity(Number(e.target.value))}
                                required
                            />
                        </label>
                    </div>
                    <button type="submit">Reduce Stock</button>
                </form>
                {message && <p>{message}</p>}
            </section>
        </div>
    );
};

export default Inventory;
