import { createApiClient, getInitialAuthData } from "../utils/apiClient";

const BASE_URL = "/v1/chat";

export interface ChatRoomSummary {
    chatRoomId: string;
    displayName: string;
    otherUserId?: string | null;
    otherUserName?: string | null;
    otherUserPhotoUrl?: string | null;
    lastMessagePreview?: string | null;
    lastMessageOn?: string | null;
    lastMessageSenderId?: string | null;
    unreadCount: number;
}

export interface ChatMessage {
    id: string;
    senderUserId: string;
    senderName: string;
    body: string;
    replyToMessageId?: string | null;
    isDeleted: boolean;
    createdOn?: string | null;
}

export interface ChatRecipient {
    userId: string;
    name: string;
    email: string;
    role?: string | null;
}

export interface ChatMessagesPage {
    items: ChatMessage[];
    itemCount: number;
}

const getApi = () => {
    const { selectedAccount } = getInitialAuthData();
    return createApiClient({ selectedAccount: selectedAccount ?? undefined });
};

export const fetchMyChatRooms = async (): Promise<ChatRoomSummary[]> => {
    const api = getApi();
    const response = await api.get(`${BASE_URL}/rooms`);
    return response.items ?? [];
};

export const startDirectChat = async (
    targetUserId: string
): Promise<{ chatRoomId: string; message?: string }> => {
    const api = getApi();
    return api.post(`${BASE_URL}/direct/${targetUserId}`, {});
};

export const fetchChatMessages = async (
    roomId: string,
    page = 1,
    pageLength = 50,
    since?: string
): Promise<ChatMessagesPage> => {
    const api = getApi();
    const params = new URLSearchParams({
        page: page.toString(),
        pageLength: pageLength.toString(),
    });
    if (since) params.append("since", since);

    const response = await api.get(
        `${BASE_URL}/rooms/${roomId}/messages?${params.toString()}`
    );
    return {
        items: response.items ?? [],
        itemCount: response.itemCount ?? 0,
    };
};

export const sendChatMessage = async (
    roomId: string,
    body: string,
    replyToMessageId?: string
): Promise<{ messageId: string; sentOn: string }> => {
    const api = getApi();
    return api.post(`${BASE_URL}/rooms/${roomId}/messages`, {
        body,
        replyToMessageId: replyToMessageId ?? null,
    });
};

export const markChatRoomRead = async (roomId: string): Promise<void> => {
    const api = getApi();
    await api.post(`${BASE_URL}/rooms/${roomId}/read`, {});
};

export const fetchChatRecipients = async (
    search?: string
): Promise<ChatRecipient[]> => {
    const api = getApi();
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    const response = await api.get(
        `${BASE_URL}/recipients${params.toString() ? `?${params}` : ""}`
    );
    return response.items ?? [];
};