export const API_CONFIG = {
    baseUrl: "https://pay-alert-composite-production.up.railway.app",
    transactionLogEndpoint: "/dashboard/transaction_log_list",
};

export const HOST = {
    // host_domain: "pay-alert-composite-production.up.railway.app"
    host_domain: "127.0.0.1:8000"
}

export const getTransactionLogUrl = () =>
    `${API_CONFIG.baseUrl}${API_CONFIG.transactionLogEndpoint}`;

export const getWebSocket = () => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = HOST.host_domain;
    return `${protocol}://${host}/notification/ws`;
}