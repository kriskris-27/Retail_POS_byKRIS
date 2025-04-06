import { useState, useEffect } from "react";

type ProductForm = {
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  category: string;
  expiryDate?: string;
};

type ProductFormState = {
  name: string;
  price: string;
  costPrice: string;
  stock: string;
  category: string;
  expiryDate: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ProductForm) => void;
  initialData?: ProductForm;
  mode: "create" | "edit";
};

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData, mode }: Props) => {
  const [formData, setFormData] = useState<ProductFormState>({
    name: "",
    price: "",
    costPrice: "",
    stock: "",
    category: "",
    expiryDate: "",
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        name: initialData.name,
        price: initialData.price.toString(),
        costPrice: initialData.costPrice.toString(),
        stock: initialData.stock.toString(),
        category: initialData.category,
        expiryDate: initialData.expiryDate || "",
      });
    } else {
      setFormData({
        name: "",
        price: "",
        costPrice: "",
        stock: "",
        category: "",
        expiryDate: "",
      });
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedForm: ProductForm = {
      name: formData.name.trim(),
      price: Number(formData.price),
      costPrice: Number(formData.costPrice),
      stock: Number(formData.stock),
      category: formData.category.trim(),
      expiryDate: formData.expiryDate || undefined,
    };
    console.log(parsedForm);
    
    onSubmit(parsedForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
      >
        <h2 className="text-xl mb-3 font-bold">
          {mode === "create" ? "Add Product" : "Edit Product"}
        </h2>

        <label>Product name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full my-3 border px-3 py-2 rounded"
          required
        />

        <label>Selling price:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Selling Price"
          className="w-full border my-3 px-3 py-2 rounded"
          min="0"
          required
        />

        <label>Cost price:</label>
        <input
          type="number"
          name="costPrice"
          value={formData.costPrice}
          onChange={handleChange}
          placeholder="Cost Price"
          className="w-full border px-3 my-3 py-2 rounded"
          min="0"
          required
        />

        <label>Stock Quantity:</label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          placeholder="Stock Quantity"
          className="w-full border px-3 my-3 py-2 rounded"
          min="0"
          required
        />

        <label>Category:</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          className="w-full border px-3 my-3 py-2 rounded"
          required
        />

        <label>Expiry:</label>
        <input
          type="date"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleChange}
          className="w-full border px-3 my-3 py-2 rounded"
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {mode === "create" ? "Create" : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormModal;
