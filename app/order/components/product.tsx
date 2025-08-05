import {useState, useRef} from "react";

interface Product {
    SKU: string;
    Name: string;
    Category: string;
    Price: number;
    imageUrl?: string;
}

interface ProductItemProps {
    product: Product;
    quantity: number;
    onAdd: (product: Product) => void;
    onRemove: (product: Product) => void;
    onSet: (product: Product, qty: number) => void;
    categoryColors: Record<string, string>;
}

export default function ProductItem({
                                        product,
                                        quantity,
                                        onAdd,
                                        onRemove,
                                        onSet,
                                        categoryColors,
                                    }: ProductItemProps) {
    const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
    const [longPressTriggered, setLongPressTriggered] = useState(false);

    const startLongPress = () => {
        setLongPressTriggered(false);
        longPressTimeout.current = setTimeout(() => {
            setLongPressTriggered(true);
            const input = prompt(`ตั้งจำนวนสำหรับ ${product.Name}`, quantity.toString());
            const parsed = parseInt(input ?? "");
            if (!isNaN(parsed) && parsed >= 0) {
                onSet(product, parsed);
            }
        }, 500);
    };

    const cancelLongPress = () => {
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
        }
    };

    // ลบ event เก่าออก และใช้ onClick แทน
    const handleClick = () => {
        if (!longPressTriggered) {
            onAdd(product);
        }
    };

    return (
        <div
            className="relative rounded-xl p-2 w-full flex flex-col items-center justify-center border cursor-pointer active:scale-95 transition-all select-none"
            style={{backgroundColor: categoryColors[product.Category] || "#ddd"}}
            onClick={handleClick}
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
        >
            {!product.imageUrl ? (
                <div className="w-full h-28 flex items-center justify-center text-white font-bold text-center px-2">
                    {product.Name}
                </div>
            ) : (
                <img
                    src={product.imageUrl}
                    alt={product.Name}
                    className="rounded mb-2 object-cover w-full h-28"
                />
            )}

            {product.imageUrl && (
                <div className="text-sm font-semibold text-center line-clamp-2 mt-1">{product.Name}</div>
            )}

            <div className="text-sm text-gray-700 mt-1">฿{product.Price.toFixed(2)}</div>

            {quantity > 0 && (
                <div
                    className="absolute top-1 right-1 bg-black text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {quantity}
                </div>
            )}

            {quantity > 0 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(product);
                    }}
                    className="
                      absolute bottom-2 right-2
                      bg-red-700 hover:bg-red-800
                      text-white text-lg font-bold
                      rounded-full
                      w-8 h-8
                      flex items-center justify-center
                      shadow-md
                      transition-colors
                      select-none
                    "
                    aria-label="ลดจำนวน"
                >
                    −
                </button>
            )}

        </div>
    );
}

