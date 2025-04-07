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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setEditProduct(null);
            setModalOpen(true);
          }}
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Cost Price</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Expiry</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.price}</td>
                <td className="border p-2">{p.costPrice}</td>
                <td className="border p-2">{p.stock}</td>
                <td className="border p-2">{p.category}</td>
                <td className="border p-2">{p.expiryDate ? p.expiryDate.slice(0, 10) : "—"}</td>
                <td className="border p-2 space-x-2">
                  <button
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                    onClick={() => {
                      setEditProduct(p);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(p._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
