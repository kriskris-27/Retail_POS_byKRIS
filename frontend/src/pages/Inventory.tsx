import React, { useState, useEffect } from "react";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Product {
    _id: string;
    name?: string;
    stock: number;
    expiryDate?: string;
    category?: string;
}

const Inventory: React.FC = () => {
    const [lowStock, setLowStock] = useState<Product[] | null>(null);
    const [expiring, setExpiring] = useState<Product[] | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState({
        lowStock: false,
        expiring: false
    });

    // Auto-fetch data on component mount
    useEffect(() => {
        fetchLowStock();
        fetchExpiring();
    }, []);

    const fetchLowStock = async () => {
        setLoading(prev => ({ ...prev, lowStock: true }));
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
            setMessage("Failed to fetch low stock products");
        } finally {
            setLoading(prev => ({ ...prev, lowStock: false }));
        }
    };

    const fetchExpiring = async () => {
        setLoading(prev => ({ ...prev, expiring: true }));
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
            setMessage("Failed to fetch expiring products");
        } finally {
            setLoading(prev => ({ ...prev, expiring: false }));
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 sm:text-3xl sm:truncate flex items-center">
                                <span className="bg-white/20 p-2 rounded-lg mr-3">📦</span>
                                Inventory Dashboard
                            </h2>
                            <p className="mt-1 text-blue-100 text-sm">
                                Monitor low stock and expiring products
                            </p>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                            <button
                                onClick={fetchLowStock}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Low Stock Products Card */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
                            <h3 className="text-lg font-medium text-white">Low Stock Products</h3>
                        </div>
                        <div className="p-6">
                            {loading.lowStock ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500"></div>
                                </div>
                            ) : lowStock === null ? (
                                <div className="text-center py-8">
                                    <button
                                        onClick={fetchLowStock}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200"
                                    >
                                        Fetch Low Stock Products
                                    </button>
                                </div>
                            ) : lowStock.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {lowStock.map((product) => (
                                                <tr key={product._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name || "Unnamed Product"}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category || "Uncategorized"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mt-2 text-sm font-medium">No low-stock products</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Expiring Products Card */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                            <h3 className="text-lg font-medium text-white">Expiring Products</h3>
                        </div>
                        <div className="p-6">
                            {loading.expiring ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
                                </div>
                            ) : expiring === null ? (
                                <div className="text-center py-8">
                                    <button
                                        onClick={fetchExpiring}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200"
                                    >
                                        Fetch Expiring Products
                                    </button>
                                </div>
                            ) : expiring.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {expiring.map((product) => (
                                                <tr key={product._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name || "Unnamed Product"}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            {formatDate(product.expiryDate)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mt-2 text-sm font-medium">No expiring products</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Message */}
                {message && (
                    <div className="mt-6 bg-white rounded-xl shadow-md p-4 text-center">
                        <p className="text-blue-600">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;
