"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Product {
    SKU: string;
    Name: string;
    Category: string;
    Price: number;
    imageUrl?: string;
}

interface OrderItem {
    SKU: string;
    quantity: number;
    product: Product;
}

interface Order {
    items: OrderItem[];
    total: number;
    status: string;
}

export default function ConfirmOrderPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        const orderParam = searchParams.get("order");
        if (!orderParam) {
            alert("ไม่พบข้อมูลออร์เดอร์");
            router.push("/");
            return;
        }
        try {
            const decoded = JSON.parse(decodeURIComponent(orderParam)) as Order;
            setOrder(decoded);
        } catch {
            alert("ข้อมูลออร์เดอร์ไม่ถูกต้อง");
            router.push("/");
        }
    }, [searchParams, router]);

    const handleConfirmPayment = () => {
        if (!order) return;

        setOrder({ ...order, status: "ชำระเงินแล้ว" });
        alert("ยืนยันออเดอร์เรียบร้อยแล้ว");
        // TODO: ส่งข้อมูลไป backend เพื่ออัปเดตสถานะจริง
        router.push(`/order`);
    };

    if (!order) return <div>โหลดข้อมูลออร์เดอร์...</div>;

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-center text-2xl mb-4 font-semibold">ยืนยันออเดอร์</h2>
            <div className="mb-4">
                <strong>สถานะ:</strong> {order.status}
            </div>

            <div>
                {order.items.map(({ SKU, quantity, product }) => (
                    <div key={SKU} className="flex justify-between py-1 border-b">
                        <div>{product.Name}</div>
                        <div>จำนวน: {quantity}</div>
                        <div>฿{(product.Price * quantity).toFixed(2)}</div>
                    </div>
                ))}
            </div>

            <div className="mt-4 font-bold text-lg text-right">รวม: ฿{order.total.toFixed(2)}</div>

            {order.status === "รอชำระเงิน" && (
                <button
                    onClick={handleConfirmPayment}
                    className="mt-6 w-full bg-blue-600 text-white py-2 rounded"
                >
                    ยืนยันออเดอร์ (ชำระเงินแล้ว)
                </button>
            )}
        </div>
    );
}
