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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
    const itemToRemove = billItems.find(item => item.product === id);
    if (!itemToRemove) return;
    
    // Restore stock in UI
    const updatedProducts = products.map((p) =>
      p._id === id ? { ...p, stock: p.stock + itemToRemove.quantity } : p
    );
    setProducts(updatedProducts);
    
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

  // Filter products based on search term and active category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === null || 
      product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get all unique categories
  const categories = Object.keys(groupedProducts);

  // Increment quantity for an item in the bill
  const incrementQuantity = (id: string) => {
    const product = products.find(p => p._id === id);
    if (!product || product.stock <= 0) return;
    
    setBillItems(items => 
      items.map(item => 
        item.product === id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      )
    );
    
    // Update stock
    setProducts(products => 
      products.map(p => 
        p._id === id 
          ? { ...p, stock: p.stock - 1 } 
          : p
      )
    );
  };

  // Decrement quantity for an item in the bill
  const decrementQuantity = (id: string) => {
    setBillItems(items => {
      const updatedItems = items.map(item => {
        if (item.product === id) {
          const newQuantity = item.quantity - 1;
          if (newQuantity <= 0) return null;
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as BillItem[];
      
      // If item was removed completely
      if (updatedItems.length < items.length) {
        const removedItem = items.find(item => item.product === id);
        if (removedItem) {
          // Restore stock
          setProducts(products => 
            products.map(p => 
              p._id === id 
                ? { ...p, stock: p.stock + 1 } 
                : p
            )
          );
        }
      } else {
        // Just decrement stock
        setProducts(products => 
          products.map(p => 
            p._id === id 
              ? { ...p, stock: p.stock + 1 } 
              : p
          )
        );
      }
      
      return updatedItems;
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-gray-50">
      {/* Left Panel - Product Selection */}
      <div className="w-full md:w-3/5 lg:w-2/3 p-3 md:p-4 overflow-auto">
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 flex items-center">
            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-2">🧾</span>
            Bill Vision POS
          </h2>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button 
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm("")}
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Category Tabs */}
          <div className="mb-4 overflow-x-auto pb-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                  activeCategory === null
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Products
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    activeCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">Try changing your search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
              {filteredProducts.map(product => (
                <button
                  key={product._id}
                  disabled={product.stock === 0}
                  onClick={() => {
                    setSelectedProductId(product._id);
                    
                    // Auto-add to bill if product is selected
                    const existingItem = billItems.find(item => item.product === product._id);
                    if (existingItem) {
                      incrementQuantity(product._id);
                    } else {
                      setBillItems([
                        ...billItems,
                        {
                          product: product._id,
                          name: product.name,
                          price: product.price,
                          quantity: 1,
                        },
                      ]);
                      
                      // Update stock
                      setProducts(products => 
                        products.map(p => 
                          p._id === product._id 
                            ? { ...p, stock: p.stock - 1 } 
                            : p
                        )
                      );
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border ${
                    product.stock === 0
                      ? "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
                      : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md active:bg-blue-50"
                  } transition-all duration-150 h-24`}
                >
                  <span className="font-bold text-gray-800 text-center line-clamp-2 mb-1 text-sm md:text-base">
                    {product.name}
                  </span>
                  <span className="text-blue-600 font-bold">₹{product.price}</span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    Stock: {product.stock}
                  </span>
                </button>
              ))}
            </div>
          )}
          
          {/* Manual Product Selection (Fallback) */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-2 text-sm">Manual Selection</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-grow">
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              
              <div className="w-full sm:w-20">
                <input
                  type="number"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  onKeyDown={handleKeyDown}
                />
              </div>
              
              <button
                className="w-full sm:w-auto bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 font-medium"
                onClick={handleAddToBill}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Bill (Compact for Mobile) */}
      <div className="w-full md:w-2/5 lg:w-1/3 p-3 md:p-4 overflow-auto bg-gray-100">
        <div className="bg-white rounded-2xl shadow-md p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="bg-green-100 text-green-600 p-1.5 rounded-lg mr-2 text-sm">🛒</span>
              Current Bill
            </h3>
            <span className="text-xl font-bold text-blue-600">₹{totalAmount}</span>
          </div>
          
          {/* Mobile-friendly bill items */}
          <div className="md:hidden">
            {billItems.map((item) => (
              <div key={item.product} className="border-b py-3 flex flex-wrap items-center">
                <div className="w-full flex justify-between mb-2">
                  <span className="font-medium">{item.name}</span>
                  <span>₹{item.price}</span>
                </div>
                <div className="w-1/2">
                  <div className="flex items-center">
                    <button 
                      onClick={() => decrementQuantity(item.product)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-700"
                    >
                      -
                    </button>
                    <span className="mx-3">{item.quantity}</span>
                    <button 
                      onClick={() => incrementQuantity(item.product)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="w-1/4 text-right">
                  ₹{item.price * item.quantity}
                </div>
                <div className="w-1/4 text-right">
                  <button
                    onClick={() => handleRemove(item.product)}
                    className="text-red-500 p-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bill Summary - Compact */}
          <div className="border-t border-gray-200 pt-3 mt-auto space-y-3">
            {/* Payment Method */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Payment Method
              </label>
              <div className="flex space-x-1.5">
                {["Cash", "UPI", "Card"].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium ${
                      paymentMethod === method
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
            
            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Customer WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-xs">+91</span>
                </div>
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
              </div>
            </div>
            
            {/* Checkout Button */}
            <button
              className={`w-full py-2.5 rounded-xl font-medium text-white ${
                billItems.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
              onClick={handleCheckout}
              disabled={billItems.length === 0}
            >
              Checkout & Send PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
