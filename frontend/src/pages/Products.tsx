import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProductFormModal from "../components/ProductFormModal";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Product = {
  _id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  category: string;
  expiryDate?: string;
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        credentials: "include",
      });
      const data = await res.json();
      setProducts(data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      await fetch(`${BASE_URL}/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      console.log(id);
      
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleCreateOrUpdate = async (formData: Omit<Product, "_id">) => {
    try {
      const endpoint = editProduct
        ? `${BASE_URL}/products/${editProduct._id}`
        : `${BASE_URL}/products/`;

      const method = editProduct ? "PUT" : "POST";
        console.log(formData);
        
      await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      await fetchProducts();
      setModalOpen(false);
      setEditProduct(null);
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  // Get unique categories for filter
  const categories = ["all", ...new Set(products.map(p => p.category))];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-6 max-w-full overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 md:p-6 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Product Management</h2>
          <button
            className="bg-white text-blue-600 px-5 py-3 rounded-xl font-semibold shadow-md hover:bg-blue-50 transition-all duration-200 text-sm md:text-base flex items-center gap-2 w-full md:w-auto justify-center"
            onClick={() => {
              setEditProduct(null);
              setModalOpen(true);
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Product
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
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder-blue-200 border border-blue-400/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-white/10 text-white border border-blue-400/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none min-w-[150px]"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category} className="text-gray-800">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-md">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">${product.price}</div>
                    <div className="text-sm text-gray-500">Cost: ${product.costPrice}</div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <span className="text-gray-700">{product.stock} in stock</span>
                  </div>
                  {product.expiryDate && (
                    <div className="text-sm text-gray-500">
                      Expires: {new Date(product.expiryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="mt-5 flex justify-between gap-3">
                  <button
                    className="flex-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl py-3 font-medium hover:bg-amber-100 transition-colors duration-200 flex items-center justify-center gap-1"
                    onClick={() => {
                      setEditProduct(product);
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
                    onClick={() => handleDelete(product._id)}
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

      {/* Mobile-friendly pagination (optional) */}
      {filteredProducts.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-xl overflow-hidden shadow-sm">
            <button className="bg-white px-4 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button className="bg-blue-600 px-4 py-3 border border-blue-600 text-white">1</button>
            <button className="bg-white px-4 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50">2</button>
            <button className="bg-white px-4 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50">3</button>
            <button className="bg-white px-4 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditProduct(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editProduct || undefined}
        mode={editProduct ? "edit" : "create"}
      />
    </div>
  );
};

export default Products;
