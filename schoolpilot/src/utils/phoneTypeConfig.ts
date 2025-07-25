// src/utils/phoneTypeConfig.ts

type PhoneTypeConfig = {
    requiresExtension: boolean;
    label: string;
};

export const PHONE_TYPE_CONFIG: Record<number, PhoneTypeConfig> = {
    // Map your enum values to their configuration
    1: { requiresExtension: false, label: "Home" },
    2: { requiresExtension: true, label: "Work" },
    3: { requiresExtension: false, label: "Mobile" },
    4: { requiresExtension: true, label: "Facility" },
    5: { requiresExtension: false, label: "Fax" }
};

// Helper function to get config
export const getPhoneTypeConfig = (typeId: number) => {
    return PHONE_TYPE_CONFIG[typeId] || {
        requiresExtension: false,
        label: `Unknown (${typeId})`
    };
};