"use client";

import React, { useEffect, useState, useRef } from "react";
import {getWebSocket} from "../config";

type Notification = {
    id: string;
    amount: number;
    source?: string;
    timestamp: string;
    sound_url?: string;
};

export default function NotificationPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [readyToPlay, setReadyToPlay] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const unlockAudio = () => {
        const audio = new Audio();
        audio.src = "";
        audio.play().catch(() => {});
    };

    const playSound = (url: string) => {
        console.log("Try to play sound:", url);

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.addEventListener("canplaythrough", () => {
            console.log("Audio ready, start playing");
            audio.play()
                .then(() => console.log("Audio playing started"))
                .catch((err) => console.warn("Play failed:", err));
        });

        audio.addEventListener("error", (e) => {
            console.error("Audio error event:", e);
        });

        audio.load();
    };


    const connectWebSocket = () => {
        ws.current = new WebSocket(getWebSocket());

        ws.current.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.current.onmessage = (event) => {
            try {
                const raw = JSON.parse(event.data);
                const data: Notification = {
                    id: `${Date.now()}-${Math.random()}`,
                    ...raw,
                };

                console.log("Received notification:", data);
                if (readyToPlay && data.sound_url) {
                    playSound(data.sound_url);
                }

                setNotifications((prev) => [data, ...prev].slice(0, 5));
            } catch (err) {
                console.error("Invalid message format:", err);
            }
        };

        ws.current.onclose = () => {
            console.log("WebSocket disconnected");
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket error", error);
        };
    };

    useEffect(() => {
        if (readyToPlay) {
            connectWebSocket();
            unlockAudio();
        }

        return () => {
            ws.current?.close();
        };
    }, [readyToPlay]);

    return (
        <div className="max-w-xl mx-auto p-6 font-sans">
            <h1 className="text-3xl font-bold mb-4">Notification Dashboard</h1>

            {!readyToPlay && (
                <button
                    className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setReadyToPlay(true)}
                >
                    🔔 เริ่มระบบแจ้งเตือน Real-time (Click เพื่อเริ่มใช้งาน)
                </button>
            )}

            {notifications.length === 0 ? (
                <p className="text-gray-500">Waiting for notifications...</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map(({ id, amount, source, timestamp }) => (
                        <li
                            key={id}
                            className="p-4 bg-green-50 border border-green-200 rounded shadow-sm"
                        >
                            <p className="text-lg font-semibold text-green-700">
                                💸 เงินเข้า {amount} บาท
                            </p>
                            {source && <p className="text-sm text-gray-600">ที่มา: {source}</p>}
                            <p className="text-xs text-gray-400">
                                เวลา: {new Date(timestamp).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
