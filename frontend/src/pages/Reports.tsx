import React, { useState } from "react";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ReportData {
    period: string;
    totalRevenue: number;
    totalProfit: number;
    salesCount: number;
}

const Reports: React.FC = () => {
    const [period, setPeriod] = useState("daily");
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchReport = async () => {
        setLoading(true);
        setError("");
        setReport(null);
        try {
            const response = await fetch(`${BASE_URL}/advanced-reports/sales-report?period=${period}`, {
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error("Failed to fetch report");
            }
            const data = await response.json();
            setReport(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchReport();
    };

    return (
        <div className="m-8">
  <h1 className="text-2xl font-bold mb-4">Sales Report</h1>
  <form onSubmit={handleSubmit} className="flex items-center gap-4 mb-6">
    <label htmlFor="period" className="flex items-center gap-2 text-lg">
      Select Report Period:
      <select
        id="period"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="border px-3 py-1 rounded"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
    </label>
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
    >
      Fetch Report
    </button>
  </form>

  {loading && <p className="text-gray-500">Loading...</p>}
  {error && <p className="text-red-600">Error: {error}</p>}

  {report && (
    <div className="mt-8 bg-white shadow rounded p-6 space-y-2 border">
      <h2 className="text-xl font-semibold mb-2">Report Data</h2>
      <p>
        <strong>Period:</strong> {report.period}
      </p>
      <p>
        <strong>Total Revenue:</strong> ₹{report.totalRevenue}
      </p>
      <p>
        <strong>Total Profit:</strong> ₹{report.totalProfit}
      </p>
      <p>
        <strong>Sales Count:</strong> {report.salesCount}
      </p>
    </div>
  )}
</div>

    );
};

export default Reports;
