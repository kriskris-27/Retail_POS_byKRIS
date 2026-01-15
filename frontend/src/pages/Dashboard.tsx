
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Totals = { totalSales?: number; count?: number };
type Bill = { createdAt: string; totalAmount: number };

const Dashboard = () => {
  const { user } = useAuth();
  const token = useMemo(() => sessionStorage.getItem("token") || user?.token, [user]);

  const [monthly, setMonthly] = useState<Totals>({});
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);
  const [weeklyBills, setWeeklyBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const requests = [
        { key: "monthly", url: `${BASE_URL}/reports/monthly` },
        { key: "lowStock", url: `${BASE_URL}/inventory/low-stock` },
        { key: "expiring", url: `${BASE_URL}/inventory/expiring-soon` },
        { key: "weekly", url: `${BASE_URL}/billing?filterType=weekly` },
      ];

      const results = await Promise.allSettled(
        requests.map((r) =>
          fetch(r.url, { credentials: "include", headers }).then(async (res) => {
            if (!res.ok) {
              throw new Error(`${r.key}: ${res.status} ${res.statusText}`);
            }
            return { key: r.key, data: await res.json() };
          })
        )
      );

      const errors: string[] = [];

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const { key, data } = result.value;
          if (key === "monthly") {
            setMonthly(data || {});
          } else if (key === "lowStock") {
            setLowStockCount(Array.isArray(data) ? data.length : 0);
          } else if (key === "expiring") {
            setExpiringCount(Array.isArray(data) ? data.length : 0);
          } else if (key === "weekly") {
            setWeeklyBills(Array.isArray(data) ? data : []);
          }
        } else {
          errors.push(result.reason?.message || "Request failed");
        }
      });

      if (errors.length) {
        setError(errors.join("; "));
      }

      setLoading(false);
    };

    fetchData();
  }, [token]);

  const revenueMTD = monthly.totalSales ?? 0;
  const ordersMTD = monthly.count ?? 0;
  const avgBasket = ordersMTD > 0 ? revenueMTD / ordersMTD : 0;

  const weeklyTotals = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totals = days.map(() => 0);
    weeklyBills.forEach((bill) => {
      const d = new Date(bill.createdAt);
      const dayIndex = d.getDay();
      totals[dayIndex] += bill.totalAmount || 0;
    });
    return days.map((day, i) => ({ day, value: Math.round(totals[i]) }));
  }, [weeklyBills]);

  const maxSales = Math.max(...weeklyTotals.map((s) => s.value), 1);

  const stats = [
    { label: "Revenue (MTD)", value: `$${revenueMTD.toLocaleString()}`, change: "" },
    { label: "Orders (MTD)", value: ordersMTD.toLocaleString(), change: "" },
    { label: "Avg. Basket", value: `$${avgBasket.toFixed(2)}`, change: "" },
    { label: "Low-stock SKUs", value: lowStockCount.toString(), change: "" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">At-a-glance health for sales, stock, and ops.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/20 transition">
          Download report
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)]"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
            {item.change && <p className="text-sm text-emerald-600">{item.change}</p>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sales</p>
              <h3 className="text-lg font-semibold text-slate-900">This week</h3>
            </div>
            <span className="text-sm text-emerald-600 font-semibold">+8.2%</span>
          </div>
          {loading ? (
            <div className="h-52 grid place-items-center text-sm text-slate-500">Loading chart…</div>
          ) : (
            <div className="flex items-end gap-3 h-52">
              {weeklyTotals.map((point) => (
                <div key={point.day} className="flex flex-col items-center justify-end flex-1 gap-2">
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-slate-200 to-slate-900"
                    style={{ height: `${(point.value / maxSales) * 100}%` }}
                    title={`$${point.value.toLocaleString()}`}
                  />
                  <span className="text-xs text-slate-500">{point.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signals</p>
              <h3 className="text-lg font-semibold text-slate-900">Health</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">Live</span>
          </div>

          <ul className="space-y-2">
            <li className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Low Stock</p>
                <p className="text-sm text-slate-600">
                  {lowStockCount} item{lowStockCount === 1 ? "" : "s"} below reorder point.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Expiring Soon</p>
                <p className="text-sm text-slate-600">
                  {expiringCount} SKU{expiringCount === 1 ? "" : "s"} expiring within 7 days.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Weekly Orders</p>
                <p className="text-sm text-slate-600">
                  {weeklyBills.length} order{weeklyBills.length === 1 ? "" : "s"} in the last 7 days.
                </p>
              </div>
            </li>
          </ul>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
