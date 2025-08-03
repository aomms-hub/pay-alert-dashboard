"use client";

import React, {useEffect, useState, useRef} from "react";
import {motion, AnimatePresence} from "framer-motion";
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
    const [soundQueue, setSoundQueue] = useState<string[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const unlockAudio = () => {
        const audio = new Audio();
        audio.src = "";
        audio.play().catch(() => {
        });
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
                    setSoundQueue((queue) => [...queue, data.sound_url!]);
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

    useEffect(() => {
        if (!isPlaying && soundQueue.length > 0) {
            const url = soundQueue[0];
            const audio = new Audio(url);
            audioRef.current = audio;
            setIsPlaying(true);

            audio.addEventListener("ended", () => {
                setIsPlaying(false);
                setSoundQueue((queue) => queue.slice(1));
            });

            audio.addEventListener("error", () => {
                setIsPlaying(false);
                setSoundQueue((queue) => queue.slice(1));
            });

            audio.play().catch((err) => {
                console.warn("Audio play failed:", err);
                setIsPlaying(false);
                setSoundQueue((queue) => queue.slice(1));
            });
        }
    }, [soundQueue, isPlaying]);

    return (
        <div
            className="max-w-xl mx-auto p-6 font-sans bg-gradient-to-r from-green-50 via-green-100 to-green-50 rounded-xl shadow-lg">
            <h1 className="text-4xl font-extrabold mb-6 text-green-900 tracking-wide drop-shadow-md">
                🔔 Notification Dashboard
            </h1>

            {!readyToPlay && (
                <button
                    className="mb-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 active:scale-95 transition-transform duration-150"
                    onClick={() => setReadyToPlay(true)}
                >
                    🔔 คลิกเพื่อเริ่มรับแจ้งเตือน Real-time
                </button>
            )}

            {readyToPlay && (
                <AnimatePresence mode="wait">
                    {notifications.length === 0 ? (
                        <motion.p
                            key="empty"
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -10}}
                            className="text-center text-green-700 italic select-none"
                        >
                            รอรับการแจ้งเตือน...
                        </motion.p>
                    ) : (
                        <motion.ul
                            key="list"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            className="space-y-5"
                        >
                            {notifications.map(({id, amount, source, timestamp}) => (
                                <motion.li
                                    key={id}
                                    initial={{opacity: 0, x: -50}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: 50}}
                                    transition={{duration: 0.4}}
                                    className="p-5 bg-white rounded-lg shadow-md border border-green-200 hover:shadow-lg cursor-default select-text"
                                >
                                    <p className="text-xl font-bold text-green-900 mb-1">
                                        💸 เงินเข้า {amount} บาท
                                    </p>
                                    {source && (
                                        <p className="text-sm text-green-700 mb-1">ที่มา: {source}</p>
                                    )}
                                    <p className="text-xs text-green-500 font-mono">
                                        เวลา: {new Date(timestamp).toLocaleString()}
                                    </p>
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            )}


            <footer className="mt-10 text-center text-green-700 italic text-xs select-none">
                <p>{new Date().toLocaleString()}</p>
            </footer>
        </div>
    );
}
