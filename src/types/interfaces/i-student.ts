export interface StudentPayload {
    Student: {
        FirstName: string;
        LastName: string;
        DateOfBirth: string;
        Gender: number;
        Nationality: number;
        Address: any;
        Phone: any;
        StudentLocation: string;
        ClassRoomId: string;
        StreamType: number | null;
    };
}

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    status: string;
    studentId: string;
    class: string;
    rawGender: number;
    rawStatus: number;
    schoolName: string;
}