"use client";

import React, { useEffect, useState } from "react";
import Header from "./components/header";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

type ApiResponse = {
  status: {
    code: string;
    message: string;
    namespace: string;
  };
  data: TransactionLog[];
};

interface TransactionLog {
  id: number;
  amount: number;
  source: string;
  sound_url?: string;
  note?: string;
  timestamp: string;
}

export default function Dashboard() {
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  // เก็บ audio object เป็น cache
  const audioCache = React.useRef<Map<number, HTMLAudioElement>>(new Map());
  const audio = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("http://localhost:8000/dashboard/transaction_log_list");
        if (!res.ok) throw new Error("Failed to fetch transaction logs");
        const json: ApiResponse = await res.json();
        setLogs(json.data);

        const sum = json.data.reduce((acc, log) => acc + log.amount, 0);
        setTotalAmount(sum);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const playFromUrl = async (url: string, id: number) => {
    try {
      if (audio.current) {
        audio.current.pause();
        audio.current.currentTime = 0;
      }

      if (playingId === id) {
        setPlayingId(null);
        audio.current = null;
        return;
      }

      let newAudio = audioCache.current.get(id);
      if (!newAudio) {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch audio");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        newAudio = new Audio(blobUrl);
        audioCache.current.set(id, newAudio);
        newAudio.onended = () => {
          setPlayingId(null);
          audio.current = null;
          // ไม่ลบ blobUrl เพื่อให้ cache อยู่
        };
      }

      audio.current = newAudio;
      await newAudio.play();
      setPlayingId(id);

    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <p className="text-center mt-12 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center mt-12 text-red-600">Error: {error}</p>;

  return (
      <main className="max-w-6xl mx-auto p-6 font-sans">
        <Header />

        <section className="my-8 p-6 rounded-lg bg-gradient-to-r from-purple-400 to-yellow-400 shadow-lg text-white text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Transaction Dashboard</h1>
          <p className="text-lg">
            Total Amount:{" "}
            <span className="font-mono text-2xl font-bold">
            {totalAmount.toFixed(2)} THB
          </span>
          </p>
        </section>

        <section className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount (THB)
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Note
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Sound
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Download
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {logs.map(({ id, amount, source, note, timestamp, sound_url }) => (
                <tr
                    key={id}
                    className="hover:bg-blue-50 transition-colors duration-200 cursor-default"
                >
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{id}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-center font-mono text-gray-900">
                    {amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{source}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                    {note || "-"}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-center">
                    {sound_url ? (
                        <button
                            onClick={() => playFromUrl(sound_url, id)}
                            aria-label={playingId === id ? "Pause sound" : "Play sound"}
                            className={`inline-flex items-center justify-center rounded-full w-10 h-10 transition-colors duration-300 ${
                                playingId === id
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-purple-500 hover:bg-purple-600"
                            } text-white focus:outline-none focus:ring-4 focus:ring-blue-300`}
                        >
                          {playingId === id ? (
                              <PauseIcon className="w-6 h-6 transition-transform duration-200" />
                          ) : (
                              <PlayIcon className="w-6 h-6 transition-transform duration-200" />
                          )}
                        </button>
                    ) : (
                        <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-center">
                    {sound_url ? (
                        <a
                            href={sound_url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Download sound"
                            className="inline-flex rounded-full w-10 h-10 bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                        >
                          {/* ไอคอนดาวน์โหลด */}
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-4-4m4 4l4-4m-4-12v8" />
                          </svg>
                        </a>
                    ) : (
                        <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                    {new Date(timestamp).toLocaleString()}
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </section>
      </main>
  );
}
