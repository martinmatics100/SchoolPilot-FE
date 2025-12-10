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