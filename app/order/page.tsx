"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductItem from "./components/product";

interface Product {
    SKU: string;
    Name: string;
    Category: string;
    Price: number;
    imageUrl?: string;
}


const productsRaw: Product[] = [
    { SKU: "10006", Name: "Fukuhara", Category: "พี่พั้น", Price: 200 },
    { SKU: "10007", Name: "Photo Card พี่พั้น", Category: "พี่พั้น", Price: 15 },
    { SKU: "10004", Name: "Postcard 40.- พี่พั้น", Category: "พี่พั้น", Price: 40 },
    { SKU: "10005", Name: "Postcard 50 พี่พั้น", Category: "พี่พั้น", Price: 50 },
    { SKU: "10008", Name: "Postcard+Photo Card พี่พั้น", Category: "พี่พั้น", Price: 50 },
    { SKU: "10017", Name: "บัคเคิลอคริลิค ออม", Category: "ออม", Price: 90 },
    { SKU: "10018", Name: "พกจ รุยคาสะ", Category: "ออม", Price: 120 },
    { SKU: "10016", Name: "พกจ ฮายาคาวะ ออม", Category: "ออม", Price: 150 },
    { SKU: "10015", Name: "พกจ. ชาย", Category: "ออม", Price: 120 },
    { SKU: "10001", Name: "ฟิคชายมีน", Category: "ออม", Price: 270 },
    { SKU: "10011", Name: "ฟิคแมว", Category: "ออม", Price: 390 },
    { SKU: "10014", Name: "สตก ชายมีน", Category: "ออม", Price: 50 },
    { SKU: "10003", Name: "สติกเกอร์ ออม", Category: "ออม", Price: 15 },
    { SKU: "10020", Name: "เข็มกลัดวดช ออม", Category: "ออม", Price: 50 },
    { SKU: "10019", Name: "เซ็ตเข็มกลัด วดช ออม", Category: "ออม", Price: 180 },
    { SKU: "10000", Name: "แอนโธรุยคาสะ", Category: "ออม", Price: 369 },
    { SKU: "10002", Name: "โปรสติกเกอร์ 5 แถม 1", Category: "ออม", Price: 65 },
    { SKU: "10012", Name: "โปส 40 ออม", Category: "ออม", Price: 40 },
    { SKU: "10013", Name: "โปส 50 ออม", Category: "ออม", Price: 50 },
    { SKU: "10009", Name: "เพรัส", Category: "พี่พิก", Price: 285 },
    { SKU: "10010", Name: "โปสเพรัส", Category: "พี่พิก", Price: 50 },
];

const categoryColors: Record<string, string> = {
    "พี่พั้น": "#f9a8d4",
    "ออม": "#a78bfa",
    "พี่พิก": "#3b82f6",
};

export default function Page() {
    const router = useRouter();
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [showCart, setShowCart] = useState(false);

    const addItem = (product: Product) => {
        setQuantities((prev) => ({
            ...prev,
            [product.SKU]: (prev[product.SKU] || 0) + 1,
        }));
    };

    const removeItem = (product: Product) => {
        setQuantities((prev) => {
            const prevQty = prev[product.SKU] || 0;
            if (prevQty <= 1) {
                const { [product.SKU]: _, ...rest } = prev;
                return rest;
            }
            return {
                ...prev,
                [product.SKU]: prevQty - 1,
            };
        });
    };

    const setItem = (product: Product, qty: number) => {
        if (qty <= 0) {
            setQuantities((prev) => {
                const { [product.SKU]: _, ...rest } = prev;
                return rest;
            });
        } else {
            setQuantities((prev) => ({
                ...prev,
                [product.SKU]: qty,
            }));
        }
    };

    const total = productsRaw.reduce(
        (sum, p) => sum + (quantities[p.SKU] || 0) * p.Price,
        0
    );

    const itemsInCart = productsRaw.filter((p) => quantities[p.SKU] && quantities[p.SKU] > 0);

    const handleSendOrder = () => {
        if (Object.keys(quantities).length === 0) {
            alert("กรุณาเลือกสินค้า");
            return;
        }
        // สร้าง payload ส่งไปหน้า confirm ผ่าน query string (หรือเก็บใน session/localStorage ก็ได้)
        const orderData = {
            items: Object.entries(quantities).map(([SKU, qty]) => ({
                SKU,
                quantity: qty,
                product: productsRaw.find((p) => p.SKU === SKU),
            })),
            total,
            status: "รอชำระเงิน",
        };
        // encode เป็น string JSON และ encodeURIComponent เพื่อส่งผ่าน URL
        const encoded = encodeURIComponent(JSON.stringify(orderData));
        router.push(`/confirm?order=${encoded}`);
    };
    return (
        <div className="p-4 max-w-screen-md mx-auto pb-28 relative">
            <h2 className="text-center text-2xl mb-4 font-semibold">จดออร์เดอร์สินค้า</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {productsRaw.map((product) => (
                    <ProductItem
                        key={product.SKU}
                        product={product}
                        quantity={quantities[product.SKU] || 0}
                        onAdd={addItem}
                        onRemove={removeItem}
                        onSet={setItem}
                        categoryColors={categoryColors}
                    />
                ))}
            </div>

            <button
                onClick={() => setShowCart(true)}
                className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full px-4 py-2 shadow-lg flex items-center space-x-2"
            >
                <span>🛒</span>
                <span>{itemsInCart.length} รายการ</span>
            </button>

            {showCart && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-end z-50"
                    onClick={() => setShowCart(false)}
                >
                    <div
                        className="bg-white rounded-t-lg p-4 w-full max-w-md max-h-[70vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold mb-4">รายการสินค้าในตะกร้า</h3>

                        {itemsInCart.length === 0 ? (
                            <p className="text-center text-gray-500">ยังไม่มีสินค้าในตะกร้า</p>
                        ) : (
                            <ul className="space-y-3">
                                {itemsInCart.map((product) => (
                                    <li key={product.SKU} className="flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold">{product.Name}</div>
                                            <div className="text-sm text-gray-600">
                                                ฿{product.Price.toFixed(2)} x{" "}
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="w-16 border rounded px-1 py-0.5 text-center"
                                                    value={quantities[product.SKU]}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        if (!isNaN(val)) setItem(product, val);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="font-semibold">฿{(product.Price * (quantities[product.SKU] || 0)).toFixed(2)}</div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-4 flex justify-between items-center font-bold text-lg">
                            <div>รวมทั้งหมด:</div>
                            <div>฿{total.toFixed(2)}</div>
                        </div>

                        <button
                            onClick={handleSendOrder}
                            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                        >
                            ✅ ส่งออร์เดอร์
                        </button>

                        <button
                            onClick={() => setShowCart(false)}
                            className="mt-2 w-full border border-gray-300 py-2 rounded"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
