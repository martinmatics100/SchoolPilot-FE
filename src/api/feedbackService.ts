import { createApiClient, getInitialAuthData } from "../utils/apiClient";

const BASE_URL = "/v1/feedback";

export interface FeedbackItem {
    id: string;
    accountId?: string;
    accountName?: string;
    submittedByUserId?: string;
    submittedByName?: string;
    submittedByEmail?: string;

    type: number;               // FeedbackAndSupport enum value
    status: number;             // FeedbackStatus enum value

    title: string;
    description: string;
    pageUrl?: string | null;
    severity?: string | null;

    internalNotes?: string | null;
    publicReply?: string | null;

    resolvedByUserId?: string | null;
    resolvedOn?: string | null;

    createdOn?: string | null;
    modifiedOn?: string | null;
}

export interface FeedbackPage {
    items: FeedbackItem[];
    itemCount: number;
}

export interface CreateFeedbackPayload {
    type: number;
    title: string;
    description: string;
    pageUrl?: string;
    severity?: string;
}

export const createFeedback = async (
    payload: CreateFeedbackPayload
): Promise<{ feedbackId: string; message: string }> => {
    const { selectedAccount } = getInitialAuthData();
    if (!selectedAccount) throw new Error("No account selected");

    const api = createApiClient({ selectedAccount });
    return api.post(`${BASE_URL}`, payload);
};

export const fetchAllFeedback = async (
    page = 1,
    pageLength = 20,
    type?: number,
    status?: number
): Promise<FeedbackPage> => {
    const { selectedAccount } = getInitialAuthData();

    // Super admins have no selected account — that's fine for this
    // endpoint, which returns feedback across every account.
    const api = createApiClient({ selectedAccount: selectedAccount ?? undefined });

    const params = new URLSearchParams({
        page: page.toString(),
        pageLength: pageLength.toString(),
    });
    if (type !== undefined) params.append("type", type.toString());
    if (status !== undefined) params.append("status", status.toString());

    const response = await api.get(`${BASE_URL}?${params.toString()}`);
    return {
        items: response.items || [],
        itemCount: response.itemCount || 0,
    };
};

export const fetchMyFeedback = async (
    page = 1,
    pageLength = 20
): Promise<FeedbackPage> => {
    const { selectedAccount } = getInitialAuthData();
    if (!selectedAccount) throw new Error("No account selected");

    const api = createApiClient({ selectedAccount });
    const params = new URLSearchParams({
        page: page.toString(),
        pageLength: pageLength.toString(),
    });

    const response = await api.get(`${BASE_URL}/mine?${params.toString()}`);
    return {
        items: response.items || [],
        itemCount: response.itemCount || 0,
    };
};


export interface UpdateFeedbackPayload {
    status: number;              // FeedbackStatus enum value
    publicReply?: string | null;
    internalNotes?: string | null;
}

export const updateFeedback = async (
    feedbackId: string,
    payload: UpdateFeedbackPayload
): Promise<{ feedbackId: string; status: number; message: string }> => {
    const { selectedAccount } = getInitialAuthData();

    // Super admins have no account — send undefined so the client
    // doesn't try to add an X-Account-Id header.
    const api = createApiClient({
        selectedAccount: selectedAccount ?? undefined,
    });

    return api.put(`${BASE_URL}/${feedbackId}`, payload);
};