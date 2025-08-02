export const API_CONFIG = {
    baseUrl: "https://pay-alert-composite-production.up.railway.app",
    transactionLogEndpoint: "/dashboard/transaction_log_list",
};

export const getTransactionLogUrl = () =>
    `${API_CONFIG.baseUrl}${API_CONFIG.transactionLogEndpoint}`;