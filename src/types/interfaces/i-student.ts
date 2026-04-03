// In studentService.ts - Update the interfaces to match backend

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
        ReligiousSubject: number;
        LanguageSubject: number;
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

// Backend GetStudentById.Result structure
export interface StudentDetail {
    id: string;
    schoolId: string;
    schoolName: string;
    firstName: string;
    lastName: string;
    gender: string;        // This comes as description from GetEnumDescription()
    status: string;        // This comes as description from GetEnumDescription()
    createdOn?: string;
    modifiedOn?: string;
    classRoomId: string;
    className: string;
    dateOfBirth?: string;
    // Note: Email, PhoneNumber, Address, etc are commented out in backend
}

// Backend UpdateStudent.Command structure
export interface UpdateStudentPayload {
    Id: string;
    SchoolId: string;
    FirstName: string;
    LastName: string;
    Gender: number;
    Status: number;
    ClassRoomId: string;
    StreamType: number | null;
    Email?: string;
    PhoneNumber?: string;
    DateOfBirth?: string;
    Address?: {
        AddressLine1: string;
        State: string;
        Country: string;
    };
    EmergencyContactName?: string;
    EmergencyContactPhone?: string;
    Notes?: string;
}