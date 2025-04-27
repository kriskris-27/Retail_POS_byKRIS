import React, { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
};

type BillItem = {
  product: string;
  name: string;
  price: number;
  quantity: number;
};

const BillingPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const fetchProducts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/products`, {
        credentials: "include",
        headers: token ? {
          "Authorization": `Bearer ${token}`
        } : {}
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToBill = () => {
    const product = products.find((p) => p._id === selectedProductId);
    if (!product || quantity <= 0 || quantity > product.stock) return;

    const existingItem = billItems.find((item) => item.product === product._id);

    if (existingItem) {
      const updatedItems = billItems.map((item) =>
        item.product === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      setBillItems(updatedItems);
    } else {
      setBillItems([
        ...billItems,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity,
        },
      ]);
    }

    // Reduce stock instantly in UI
    const updatedProducts = products.map((p) =>
      p._id === product._id ? { ...p, stock: p.stock - quantity } : p
    );
    setProducts(updatedProducts);

    // Reset inputs
    setQuantity(1);
    setSelectedProductId("");
  };

  const handleRemove = (id: string) => {
    setBillItems(billItems.filter((item) => item.product !== id));
  };

  const totalAmount = billItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  
  const handleCheckout = async () => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/billing/create`, {
      method: "POST",
      credentials: "include",
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        items: billItems.map(({ product, price, quantity }) => ({
          product,
          price,
          quantity,
        })),
        paymentMethod,
      }),
    });
  
    const data = await res.json();
    if (res.ok) {
      alert("Bill Saved!");
  
      // Generate PDF URL without authentication
      const billUrl = `${BASE_URL}/billing/invoice/${data.billId}`;
      
      // Open PDF in new tab
      window.open(billUrl, "_blank");
  
      // ✅ Correct WhatsApp Sending
      if (whatsappNumber.trim()) {
        const cleanNumber = whatsappNumber.replace(/\D/g, "");
        const message = `Thank you for shopping with us! 🧾\nHere is your bill:\n${billUrl}\n\nTotal: ₹${totalAmount}`;
        const encodedMsg = encodeURIComponent(message);
        const whatsappLink = `https://wa.me/91${cleanNumber}?text=${encodedMsg}`;
        window.open(whatsappLink, "_blank");
      }
  
      setBillItems([]);
      setSelectedProductId("");
      setQuantity(1);
      setWhatsappNumber("");
      fetchProducts(); // refresh stock
    } else {
      alert(data.message || "Checkout failed");
    }
  };
  

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddToBill();
    }
  };

 

  // Group products by category
  const groupedProducts = products.reduce<Record<string, Product[]>>(
    (groups, product) => {
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
      return groups;
    },
    {}
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold mb-4">🧾 Bill Vision POS - Billing</h2>

      {/* Category Buttons for Fast Product Selection */}
      {Object.entries(groupedProducts).map(([category, catProducts]) => (
        <div key={category} className="mb-4">
          <h4 className="font-semibold text-base md:text-lg mb-2">{category}</h4>
          <div className="flex flex-wrap gap-2">
            {catProducts.map((product) => (
              <button
                key={product._id}
                disabled={product.stock === 0}
                onClick={() => setSelectedProductId(product._id)}
                className={`px-3 py-2 md:py-1 rounded border text-sm md:text-base ${
                  selectedProductId === product._id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                } ${product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {product.name} (₹{product.price})
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Fallback Dropdown + Quantity + Add */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-end">
        <div className="w-full md:flex-1">
          <label className="block font-medium mb-1">Select Product (Optional)</label>
          <select
            className="p-2 border rounded w-full text-base"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select Product</option>
            {Object.entries(groupedProducts).map(([category, products]) => (
              <optgroup key={category} label={category}>
                {products.map((product) => (
                  <option
                    key={product._id}
                    value={product._id}
                    disabled={product.stock === 0}
                  >
                    {product.name} (₹{product.price} | Stock: {product.stock})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="w-full md:w-32">
          <label className="block font-medium mb-1">Quantity</label>
          <input
            type="number"
            className="p-2 border rounded w-full text-base"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 h-10 mt-5 text-base"
          onClick={handleAddToBill}
        >
          Add to Bill
        </button>
      </div>

      {/* Bill Items */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">🛒 Bill Items</h3>
        {billItems.length === 0 ? (
          <p className="text-gray-500">No items added</p>
        ) : (
          <ul className="space-y-2">
            {billItems.map((item) => (
              <li
                key={item.product}
                className="flex justify-between items-center text-sm md:text-base"
              >
                <span>
                  {item.name} - ₹{item.price} × {item.quantity}
                </span>
                <button
                  className="text-red-500 hover:underline px-2 py-1"
                  onClick={() => handleRemove(item.product)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-4">
        <label htmlFor="payment" className="font-medium">
          Payment Method:
        </label>
        <select
          id="payment"
          className="p-2 border rounded w-full md:w-auto text-base"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
        </select>
      </div>

      {/* WhatsApp */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Customer WhatsApp Number:
        </label>
        <input
          type="tel"
          placeholder="e.g. 9876543210"
          className="p-2 border rounded w-full text-base"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
        />
      </div>

      {/* Total & Checkout */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-xl font-bold">Total: ₹{totalAmount}</span>
        <button
          className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-base"
          onClick={handleCheckout}
          disabled={billItems.length === 0}
        >
          Checkout & Send PDF
        </button>
      </div>
    </div>
  );
};

export default BillingPage;
