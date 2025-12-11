export interface Subject {
    id: string;
    subjectName: string;
}

export interface SubjectModel {
    id: string;
    subjectName: number; // enum value returned from backend
    classes: string; // comma-separated class names
}

export interface SubjectsResponse {
    subjects: SubjectModel[];
    itemCount: number;
}

export interface SubjectClassModel {
    id: string;
    className: string;
}

export interface SubjectModelForAllocation {
    id: string;
    subject: number;          // enum numeric value from backend
    classes: SubjectClassModel[];
}

export interface SubjectModelForAllocationResponse {
    items: SubjectModelForAllocation[];   // backend returns "items"
    itemCount: number;
    pageLength: number;
    currentPage: number;
    pageCount: number;
}
