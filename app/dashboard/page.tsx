"use client";

import React, {useEffect, useState} from "react";
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

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(getTransactionLogUrl(), {cache: "no-store"});
            if (!res.ok) throw new Error("Failed to fetch logs");
            const json: ApiResponse = await res.json();
            setLogs(json.data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Auto fetch every 30 seconds
    useEffect(() => {
        fetchLogs();
        const interval = setInterval(() => {
            fetchLogs();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const totalAmount = logs.reduce((sum, log) => sum + log.amount, 0);

    return (
        <div className="max-w-6xl mx-auto p-6 font-sans">
            <Header totalAmount={totalAmount} totalTransactions={logs.length}/>
            <div className="p-4 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Transaction Dashboard</h1>
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
                            onClick={() => setViewMode(viewMode === "card" ? "table" : "card")}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                            {viewMode === "card" ? "Table View" : "Card View"}
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
