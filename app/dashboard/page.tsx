"use client";

import React, {useEffect, useState} from "react";
import { LayoutGridIcon, TableIcon } from "lucide-react";
import Header from "./components/header";
import TransactionCard from "../dashboard/components/transaction_card";
import TransactionTable from "../dashboard/components/transaction_table";
import {TransactionLog, ApiResponse} from "./type";
import {getTransactionLogUrl} from "../config";
import { RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
    const [logs, setLogs] = useState<TransactionLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"card" | "table">("card");
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split("T")[0];
    });

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(getTransactionLogUrl());
            url.searchParams.set("start_date", startDate);
            url.searchParams.set("end_date", endDate);

            const res = await fetch(url.toString(), { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to fetch logs");

            const json: ApiResponse = await res.json();
            setLogs(json.data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };
    const totalAmount = logs.reduce((sum, log) => sum + log.amount, 0);
    const exportToCSV = () => {
        if (!logs.length) return alert("ไม่มีข้อมูลให้ดาวน์โหลด");

        const headers = ["ID", "Amount", "Source", "Note", "Date", "Time"];
        const rows = logs.map((log) => [
            log.id,
            log.amount.toFixed(2),
            log.source,
            log.note ? log.note.replace(/,/g, " ") : "",
            new Date(log.timestamp).toLocaleDateString(),
            new Date(log.timestamp).toLocaleTimeString(),
        ]);

        const csvContent =
            [headers, ...rows]
                .map((e) => e.join(","))
                .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `transaction_logs_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, [startDate, endDate]);

    return (
        <div className="max-w-6xl mx-auto p-6 font-sans">
            <Header totalAmount={totalAmount} totalTransactions={logs.length}/>
            <div className="p-4 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row gap-2 md:items-end mb-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">เริ่มวันที่</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block mt-1 px-2 py-1 border rounded"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">ถึงวันที่</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block mt-1 px-2 py-1 border rounded"
                        />
                    </div>
                    <div className="self-end">
                        <button
                            onClick={fetchLogs}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Transaction History</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchLogs}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    >
                                        <RotateCw className="w-4 h-4" />
                                    </motion.div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <RotateCw className="w-4 h-4" />
                                    Refresh
                                </>
                            )}
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            title="Export"
                        >
                            Export CSV
                        </button>
                        <button
                            onClick={() => setViewMode(viewMode === "card" ? "table" : "card")}
                            className="p-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            title={viewMode === "card" ? "Switch to Table View" : "Switch to Card View"}
                        >
                            {viewMode === "card" ? (
                                <TableIcon className="w-5 h-5" />
                            ) : (
                                <LayoutGridIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-600 mb-4">Error: {error}</p>}

                {logs.length === 0 && !loading && <p className="text-gray-500">No transactions found.</p>}

                <div className="flex flex-col gap-4">
                    <AnimatePresence mode="wait">
                        {viewMode === "card" ? (
                            <motion.div
                                key="card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                            >
                                <AnimatePresence>
                                    {logs.map((log) => (
                                        <motion.div
                                            key={log.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <TransactionCard log={log} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="table"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TransactionTable logs={logs} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
}
