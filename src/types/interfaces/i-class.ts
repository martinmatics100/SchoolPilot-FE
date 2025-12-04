export interface ClassPayload {
    ClassName: string;
    ClassLevel: number;
    TeacherId: string | null;
}

export interface ClassModel {
    id: string;
    className: string;
    classLevel: string; // This should match the SchoolLevel enum values
    formTeacher: string;
    rawClassLevel: number; // This should be the numeric value from SchoolLevel enum
}