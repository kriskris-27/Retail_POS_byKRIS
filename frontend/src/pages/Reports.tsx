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
        <div style={{ margin: "2rem" }}>
            <h1>Sales Report</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="period">
                    Select Report Period:{" "}
                    <select
                        id="period"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </label>
                <button type="submit" style={{ marginLeft: "1rem" }}>
                    Fetch Report
                </button>
            </form>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            {report && (
                <div style={{ marginTop: "2rem" }}>
                    <h2>Report Data</h2>
                    <p>
                        <strong>Period:</strong> {report.period}
                    </p>
                    <p>
                        <strong>Total Revenue:</strong> {report.totalRevenue}
                    </p>
                    <p>
                        <strong>Total Profit:</strong> {report.totalProfit}
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
