import React from "react";

export default function Header() {
    return (
        <header className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg p-6 shadow-lg text-center">
            <h1 className="text-3xl font-extrabold mb-2">Notification Dashboard</h1>
            <p>{new Date().toLocaleString()}</p>
        </header>
    );
}
