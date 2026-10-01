import { createApiClient } from "../utils/apiClient";

const BASE_URL = "/v1/billing";

export const getOrCreatePaymentReference = async (
    selectedAccount: string | null
): Promise<{ referenceCode: string; issuedOn: string }> => {
    if (!selectedAccount) throw new Error("No account selected");
    const api = createApiClient({ selectedAccount });
    return api.get(`${BASE_URL}/payment-reference`);
};

export const submitPaymentProof = async (
    selectedAccount: string | null,
    payload: {
        referenceCode: string;
        plan: number;         // enum value
        amount: number;
        bankReference?: string;
        note?: string;
        proofAssetId?: string;
    }
) => {
    if (!selectedAccount) throw new Error("No account selected");
    const api = createApiClient({ selectedAccount });
    return api.post(`${BASE_URL}/submit-proof`, payload);
};

export const getMyPaymentSubmissions = async (
    selectedAccount: string | null
) => {
    if (!selectedAccount) throw new Error("No account selected");
    const api = createApiClient({ selectedAccount });
    return api.get(`${BASE_URL}/submissions`);
};




// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface PlanOption {
    plan: number;
    name: string;
    studentMin: number;
    studentMax: number;
    pricePerTerm: number;
    features: string[];
    isRecommended: boolean;
    isCurrent: boolean;
}

export interface CurrentBillingState {
    accountId: string;

    // Current subscription
    currentPlan: number;
    currentPlanName: string;
    currentPlanPricePerTerm: number;
    currentPlanStudentCap: number;
    status: number;         // 1=Trial, 2=Active, 3=Expired, 4=Suspended
    billingCycle: number;   // 1=Term, 2=Year
    trialEndsOn: string | null;
    paidUntil: string | null;

    // Student counts
    currentStudentCount: number;
    isOverCurrentPlanCap: boolean;

    // Recommendation
    recommendedPlan: number;
    recommendedPlanName: string;
    recommendedPricePerTerm: number;
    shouldUpgrade: boolean;

    // Renewal forecast
    nextRenewalOn: string | null;
    nextRenewalPlan: number;
    nextRenewalPlanName: string;
    nextRenewalAmount: number;

    // Catalogue
    planOptions: PlanOption[];
}

export const getCurrentBillingState = async (
    selectedAccount: string | null
): Promise<CurrentBillingState> => {
    if (!selectedAccount) throw new Error("No account selected");
    const api = createApiClient({ selectedAccount });
    return api.get(`${BASE_URL}/current-state`);
};