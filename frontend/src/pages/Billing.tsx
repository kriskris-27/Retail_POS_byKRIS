import React, { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;
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
      const res = await fetch("http://localhost:5000/api/products", {
        credentials: "include",
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
    setQuantity(1);
  };

  const handleRemove = (id: string) => {
    setBillItems(billItems.filter((item) => item.product !== id));
  };

  const handleCheckout = async () => {
    const res = await fetch("http://localhost:5000/api/billing/create", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
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
      const billUrl = `http://localhost:5000/api/billing/invoice/${data.billId}`;
      window.open(billUrl, "_blank");

      // ✅ WhatsApp sending logic
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
      fetchProducts();
    } else {
      alert(data.message || "Checkout failed");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddToBill();
  };

  const totalAmount = billItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🧾 Retail POS - Billing</h2>

      <div className="flex gap-4 mb-4">
        <select
          className="p-2 border rounded w-1/2"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} (₹{product.price} | Stock: {product.stock})
            </option>
          ))}
        </select>

        <input
          type="number"
          className="p-2 border rounded w-1/4"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          onKeyDown={handleKeyDown}
        />

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleAddToBill}
        >
          Add to Bill
        </button>
      </div>

      <div className="bg-white rounded shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">🛒 Bill Items</h3>
        {billItems.length === 0 ? (
          <p className="text-gray-500">No items added</p>
        ) : (
          <ul className="space-y-2">
            {billItems.map((item) => (
              <li
                key={item.product}
                className="flex justify-between items-center"
              >
                <span>
                  {item.name} - ₹{item.price} × {item.quantity}
                </span>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => handleRemove(item.product)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="payment" className="font-medium">
          Payment Method:
        </label>
        <select
          id="payment"
          className="p-2 border rounded"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option>Cash</option>
          <option>UPI</option>
          <option>Card</option>
        </select>
      </div>

      {/* ✅ WhatsApp number input */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Customer WhatsApp Number:
        </label>
        <input
          type="tel"
          placeholder="e.g. 9876543210"
          className="p-2 border rounded w-full"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xl font-bold">Total: ₹{totalAmount}</span>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
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
