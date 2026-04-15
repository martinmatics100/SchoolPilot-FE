export interface SchoolDetails {
    id: string;
    schoolName: string;
    currentSession: number;
    currentTerm: number;
}

export interface SchoolSlimResponse {
    id: string;
    schoolName: string;
    currentSession: number;
    currentTerm: number;
}

export interface EnumItem {
    value: number;
    displayName: string;
    name: string;
}

export interface EnumsResponse {
    SchoolSessions?: EnumItem[];
    SchoolTerms?: EnumItem[];
}

export interface SchoolLevel {
    name: string;
    value: number;
}

export interface SchoolTerm {
    name: string;
    value: number;
}

export interface SchoolDetails {
    currentTerm: number;
}

export interface SchoolTermsResponse {
    items?: SchoolTerm[];
}

export interface SchoolInfoResponse {
    id: string;
    schoolName: string;
    schoolEmail: string | null;
    principalName: string | null;
    yearofEstablishment: number | null;
    currentTerm: number | null;
    currentSession: number | null;
    schoolCategory: number | null;
    schoolType: number | null;
    schoolStatus: number | null;
    schoolMotto: string | null;
    contactPersonEmail: string | null;
    contactPersonPhone: {
        id: string;
        phoneNumber: string;
        extension: string | null;
        phoneType: string;
        country: string;
        number: string;
    } | null;
    schoolAddress: {
        id: string;
        addressLine1: string;
        addressLine2: string | null;
        city: string | null;
        state: string;
        zipCode: string | null;
        country: string;
        fullAddress: string;
    } | null;
}