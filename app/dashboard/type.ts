export type ApiResponse = {
    status: {
        code: string;
        message: string;
        namespace: string;
    };
    data: TransactionLog[];
};

export type TransactionLog = {
    id: number;
    amount: number;
    source: string;
    note: string | null;
    sound_url: string | null;
    timestamp: string;
};