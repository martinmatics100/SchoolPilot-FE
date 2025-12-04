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