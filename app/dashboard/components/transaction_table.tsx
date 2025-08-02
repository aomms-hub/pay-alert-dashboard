"use client";

import {TransactionLog} from "../type";
import {motion, AnimatePresence} from "framer-motion";
import {PlayIcon, PauseIcon, DownloadIcon} from "lucide-react";
import {useRef, useState, useEffect} from "react";

type Props = {
    logs: TransactionLog[];
};

export default function TransactionTable({logs}: Props) {
    const [playingId, setPlayingId] = useState<Number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const handlePlay = async (log: TransactionLog) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        if (playingId === log.id) {
            setPlayingId(null);
            return;
        }

        const response = await fetch(log.sound_url!);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const newAudio = new Audio(blobUrl);
        audioRef.current = newAudio;
        newAudio.play();
        setPlayingId(log.id);

        newAudio.onended = () => {
            setPlayingId(null);
            URL.revokeObjectURL(blobUrl);
        };
    };

    return (
        <div className="overflow-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                <tr>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-left">Note</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Audio</th>
                </tr>
                </thead>
                <tbody>
                <AnimatePresence>
                    {logs.map((log) => (
                        <motion.tr
                            key={log.id}
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: 10}}
                            transition={{duration: 0.3}}
                            className={`bg-white`}
                        >
                            <td className="px-4 py-2 font-semibold text-green-700">{log.amount.toFixed(2)} ฿</td>
                            <td className="px-4 py-2">{log.source}</td>
                            <td className="px-4 py-2">{log.note || "-"}</td>
                            <td className="px-4 py-2 text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-4 py-2">
                                <div className="flex gap-2 items-center">
                                    {log.sound_url && (
                                        <button
                                            onClick={() => handlePlay(log)}
                                            className="p-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                                        >
                                            {playingId === log.id ? (
                                                <PauseIcon className="w-4 h-4"/>
                                            ) : (
                                                <PlayIcon className="w-4 h-4"/>
                                            )}
                                        </button>
                                    )}
                                    {log.sound_url && (
                                        <a
                                            href={log.sound_url}
                                            download
                                            className="p-1 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
                                        >
                                            <DownloadIcon className="w-4 h-4"/>
                                        </a>
                                    )}
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
}
