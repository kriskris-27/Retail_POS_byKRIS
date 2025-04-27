import React, { useState, useEffect } from "react";
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
    const [showAnimation, setShowAnimation] = useState(false);

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
            setShowAnimation(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Auto-fetch report on initial load
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Reset animation after it plays
        if (showAnimation) {
            const timer = setTimeout(() => setShowAnimation(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [showAnimation]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchReport();
    };

    // Calculate profit percentage
    const profitPercentage = report ? Math.round((report.totalProfit / report.totalRevenue) * 100) : 0;

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 shadow-lg text-white">
                    <h1 className="text-3xl font-bold mb-2 flex items-center">
                        <span className="bg-white/20 p-2 rounded-lg mr-3">📊</span>
                        Sales Analytics Dashboard
                    </h1>
                    <p className="text-blue-100 max-w-2xl">
                        View comprehensive sales reports and track your business performance metrics over time.
                    </p>
                </div>

                {/* Report Controls */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:w-auto">
                            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                                Report Period
                            </label>
                            <select
                                id="period"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="w-full sm:w-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                            >
                                <option value="daily">Daily Report</option>
                                <option value="weekly">Weekly Report</option>
                                <option value="monthly">Monthly Report</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full sm:w-auto mt-4 sm:mt-0 sm:self-end bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center transition-colors"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    Generate Report
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Data Cards */}
                {report && (
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 ${showAnimation ? 'animate-fade-in' : ''}`}>
                        {/* Revenue Card */}
                        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-700">Total Revenue</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {report.period}
                                    </span>
                                </div>
                                <div className="flex items-end space-x-2">
                                    <p className="text-3xl font-bold text-gray-900">₹{report.totalRevenue.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
                        </div>

                        {/* Profit Card */}
                        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-700">Total Profit</h3>
                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {profitPercentage}% margin
                                    </span>
                                </div>
                                <div className="flex items-end space-x-2">
                                    <p className="text-3xl font-bold text-gray-900">₹{report.totalProfit.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
                        </div>

                        {/* Sales Count Card */}
                        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-700">Total Sales</h3>
                                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        Transactions
                                    </span>
                                </div>
                                <div className="flex items-end space-x-2">
                                    <p className="text-3xl font-bold text-gray-900">{report.salesCount}</p>
                                    <p className="text-sm text-gray-500 mb-1">orders</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2"></div>
                        </div>
                    </div>
                )}

                {/* Detailed Report Section */}
                {report && (
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Report Analysis</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-3">Performance Summary</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">Revenue Target</span>
                                                <span className="text-sm font-medium text-gray-700">85%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "85%" }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">Profit Margin</span>
                                                <span className="text-sm font-medium text-gray-700">{profitPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${profitPercentage}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">Sales Growth</span>
                                                <span className="text-sm font-medium text-gray-700">62%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "62%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-3">Report Highlights</h3>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <span>Average transaction value: ₹{report.salesCount ? Math.round(report.totalRevenue / report.salesCount) : 0}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <span>Profit per transaction: ₹{report.salesCount ? Math.round(report.totalProfit / report.salesCount) : 0}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <span>Report period: {report.period}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && !error && !report && (
                    <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Generating your sales report...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
