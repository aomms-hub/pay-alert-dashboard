// app/dashboard/components/TransactionCard.tsx

"use client";

import { PlayIcon, PauseIcon, DownloadIcon } from "lucide-react";
import { useState, useRef } from "react";
import { TransactionLog } from "../type";

type Props = {
    log: TransactionLog;
};

export default function TransactionCard({ log }: Props) {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlay = async () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        if (playing) {
            setPlaying(false);
            return;
        }

        const response = await fetch(log.sound_url!);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const newAudio = new Audio(blobUrl);
        audioRef.current = newAudio;
        newAudio.play();
        setPlaying(true);

        newAudio.onended = () => {
            setPlaying(false);
            URL.revokeObjectURL(blobUrl);
        };
    };

    return (
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-lg font-semibold text-green-700">
                        💸 {log.amount.toFixed(2)} บาท
                    </p>
                    <p className="text-sm text-gray-500">{log.source}</p>
                </div>
                <div className="flex gap-2">
                    {log.sound_url && (
                        <button
                            onClick={handlePlay}
                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
                        >
                            {playing ? (
                                <PauseIcon className="w-5 h-5" />
                            ) : (
                                <PlayIcon className="w-5 h-5" />
                            )}
                        </button>
                    )}
                    {log.sound_url && (
                        <a
                            href={log.sound_url}
                            download
                            className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-800 transition"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </a>
                    )}
                </div>
            </div>

            {log.note && (
                <p className="text-sm mt-1 text-gray-600">
                    📝 หมายเหตุ: <span className="font-medium">{log.note}</span>
                </p>
            )}

            <p className="text-xs text-gray-400 mt-2">
                {new Date(log.timestamp).toLocaleString()}
            </p>
        </div>
    );
}
