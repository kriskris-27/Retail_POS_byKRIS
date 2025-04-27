import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // adjust path as needed
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Product = {
  _id: string;
  name: string;
  price: number;
};

type BillItem = {
  product: Product;
  quantity: number;
  price: number;
};

type Bill = {
  _id: string;
  items: BillItem[];
  paymentMethod: string;
  createdAt: string;
  totalAmount: number;
};

const AllbillsPage = () => {
  const { user } = useAuth(); // 🔐 access current user's role
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "monthly">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  const fetchBills = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      let url = `${BASE_URL}/billing/`;
      if (filter !== "all") {
        url += `?filter=${filter}`;
      }

      const res = await fetch(url, {
        credentials: "include",
        headers: token ? {
          "Authorization": `Bearer ${token}`
        } : {}
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch bills: ${res.statusText}`);
      }

      const data: Bill[] = await res.json();
      setBills(data);
    } catch (err: unknown) {
      setError("Failed to load bills. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteByFilter = async () => {
    const confirmed = confirm(`Are you sure you want to delete ${filter} bills?`);
    if (!confirmed) return;

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/billing/?filterType=${filter}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? {
          "Authorization": `Bearer ${token}`
        } : {}
      });

      if (!res.ok) {
        throw new Error("Failed to delete bills.");
      }

      alert(`${filter.charAt(0).toUpperCase() + filter.slice(1)} bills deleted successfully.`);
      fetchBills(); // refresh list after deletion
    } catch (error) {
      console.error(error);
      alert("Error deleting bills. Try again later.");
    }
  };

  useEffect(() => {
    fetchBills();
  }, [filter]);

  // Filter bills based on search term
  const filteredBills = bills.filter(bill => {
    if (!searchTerm) return true;
    
    // Search by bill ID
    if (bill._id.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    
    // Search by payment method
    if (bill.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    
    // Search by product name
    return bill.items.some(item => 
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort bills based on selected order
  const sortedBills = [...filteredBills].sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "highest":
        return b.totalAmount - a.totalAmount;
      case "lowest":
        return a.totalAmount - b.totalAmount;
      default:
        return 0;
    }
  });

  // Calculate total revenue for the current filtered bills
  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

  // Open bill details modal
  const openBillDetails = (bill: Bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 sm:text-3xl sm:truncate flex items-center">
                <span className="bg-white/20 p-2 rounded-lg mr-3">📊</span>
                Bills Dashboard
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-blue-100">
                  <span className="bg-white/10 px-2.5 py-1 rounded-full">
                    {filteredBills.length} Bills
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-blue-100">
                  <span className="bg-white/10 px-2.5 py-1 rounded-full">
                    Total Revenue: ₹{totalRevenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters & Search Section */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Time Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {["all", "daily", "weekly", "monthly"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center">
              <label className="text-sm text-gray-500 mr-2">Sort by:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                className="bg-gray-100 border-0 text-gray-700 rounded-lg text-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>

            {/* Delete Button (Admin Only) */}
            {filter !== "all" && user?.role === "admin" && (
              <button
                onClick={handleDeleteByFilter}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete {filter} Bills
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by bill ID, product name, or payment method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Bills Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        ) : sortedBills.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bills found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search criteria." : "No bills available for the selected time period."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedBills.map((bill) => (
              <div 
                key={bill._id} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
                onClick={() => openBillDetails(bill)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        {formatDate(bill.createdAt)}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800 truncate">
                        Bill #{bill._id.substring(bill._id.length - 8)}
                      </h3>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bill.paymentMethod === "Cash" ? "bg-green-100 text-green-800" :
                      bill.paymentMethod === "Card" ? "bg-blue-100 text-blue-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {bill.paymentMethod}
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-3 max-h-20 overflow-hidden">
                    {bill.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-600">
                        <span className="truncate max-w-[60%]">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="text-gray-700">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {bill.items.length > 3 && (
                      <div className="text-xs text-gray-500 italic">
                        +{bill.items.length - 3} more items
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-900">
                      Total: ₹{bill.totalAmount.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`${BASE_URL}/billing/invoice/${bill._id}`, "_blank");
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Invoice
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 flex justify-between items-center">
              <h3 className="text-xl font-bold">Bill Details</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Bill ID</div>
                  <div className="font-medium">{selectedBill._id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Date & Time</div>
                  <div className="font-medium">{formatDate(selectedBill.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Payment Method</div>
                  <div className="font-medium">{selectedBill.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Amount</div>
                  <div className="font-medium text-blue-600">₹{selectedBill.totalAmount.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-3">Items</h4>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedBill.items.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.product.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            ₹{item.product.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                          ₹{selectedBill.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => window.open(`${BASE_URL}/billing/invoice/${selectedBill._id}`, "_blank")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                View Invoice PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllbillsPage;
