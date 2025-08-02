interface HeaderProps {
    totalAmount: number;
    totalTransactions: number;
}

export default function Header({ totalAmount, totalTransactions }: HeaderProps) {
    return (
        <header className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg p-6 shadow-lg text-center">
            <h1 className="text-3xl font-extrabold mb-2">Transaction Summary</h1>
            <p className="text-xl">
                Total Amount:{" "}
                <span className="font-mono text-2xl font-bold">{totalAmount.toFixed(2)} THB</span>
            </p>
            <p className="text-sm mt-1 opacity-80">{totalTransactions} transactions</p>
        </header>
    );
}
