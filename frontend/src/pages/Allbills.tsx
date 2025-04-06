import { useEffect, useState } from "react";

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
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/billing/", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch bills: ${res.statusText}`);
      }

      const data: Bill[] = await res.json();
      console.log((data));
      
      setBills(data);
    } catch (err: unknown) {
      setError("Failed to load bills. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">📄 All Bills</h2>

      {loading ? (
        <p className="text-gray-600">Loading bills...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : bills.length === 0 ? (
        <p className="text-gray-500">No bills found.</p>
      ) : (
        <div className="space-y-6">
          {bills.map((bill) => (
            <div key={bill._id} className="bg-white shadow-md p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">🧾 Bill ID: {bill._id}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(bill.createdAt).toLocaleString()}
                </span>
              </div>

              <ul className="text-sm divide-y divide-gray-200 mb-2">
                {bill.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between py-1">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>
                      ₹{item.product.price} × {item.quantity} = ₹
                      {item.product.price * item.quantity}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between mt-4 font-semibold text-sm">
                <span>Payment: {bill.paymentMethod}</span>
                <span>Total: ₹{bill.totalAmount.toFixed(2)}</span>
              </div>

              <div className="mt-3 text-right">
                <a
                  href={`http://localhost:5000/api/billing/invoice/${bill._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  📄 View Invoice
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllbillsPage;
