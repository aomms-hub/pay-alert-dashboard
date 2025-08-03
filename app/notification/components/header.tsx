import React, { useState, useEffect } from "react";

export default function Header() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // อัพเดตทุก 1 วิ

        return () => clearInterval(timer); // ล้าง timer ตอน component ถูก unmount
    }, []);

    return (
        <header className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg p-6 shadow-lg text-center">
            <h1 className="text-3xl font-extrabold mb-2">Notification Dashboard</h1>
            <p>{currentTime.toLocaleString()}</p>
        </header>
    );
}
