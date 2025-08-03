"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    const linkClass = (path: string) =>
        `px-3 py-2 rounded-md text-sm font-medium transition ${
            pathname === path
                ? "bg-green-100 text-green-800"
                : "text-gray-600 hover:bg-gray-100 hover:text-green-700"
        }`;

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex gap-4">
            <Link href="/notification" className={linkClass("/notification")}>
                🔔 Notification Dashboard
            </Link>
            <Link href="/dashboard" className={linkClass("/dashboard")}>
                📊 Transaction History
            </Link>
        </nav>
    );
}
