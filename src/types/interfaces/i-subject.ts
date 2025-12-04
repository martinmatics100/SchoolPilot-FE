export interface Subject {
    id: string;
    subjectName: string;
}

export interface SubjectModel {
    id: string;
    subjectName: string;
    subjectCode: string;
    level: number[];
    category: number[];
    teacher?: string;
    createdDate?: string;
}

export interface SubjectsResponse {
    subjects: SubjectModel[];
    itemCount: number;
}