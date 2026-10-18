import * as signalR from "@microsoft/signalr";
import { getInitialAuthData } from "../utils/apiClient";

// The SignalR hub base URL — points at the API (same host as your REST calls).
// Adjust if your API_BASE_URL is different.
const HUB_URL =
    (import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7029") + "/hubs/chat";

let connection: signalR.HubConnection | null = null;

/**
 * Get the shared SignalR connection, creating it on first call.
 * Automatically attaches the JWT from localStorage.
 */
export const getChatConnection = (): signalR.HubConnection => {
    if (connection) return connection;

    const { accessToken } = getInitialAuthData();

    connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
            accessTokenFactory: () => {
                // Read the current token at call time so refreshes are picked up.
                const { accessToken: token } = getInitialAuthData();
                return token ?? "";
            },
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

    return connection;
};

/**
 * Start the connection if it's not already running.
 */
export const startChatConnection = async (): Promise<void> => {
    const conn = getChatConnection();
    if (conn.state === signalR.HubConnectionState.Disconnected) {
        try {
            await conn.start();
        } catch (err) {
            console.error("SignalR start failed", err);
            throw err;
        }
    }
};

/**
 * Stop the connection. Call on logout.
 */
export const stopChatConnection = async (): Promise<void> => {
    if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
        await connection.stop();
    }
    connection = null;
};