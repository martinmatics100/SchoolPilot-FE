import { type SvgIconTypeMap } from '@mui/material';
import { type OverridableComponent } from '@mui/material/OverridableComponent';

export interface UserModel {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    role: string;
    status: string;
    userId: string;
    rawGender: number;
    rawStatus: number;
    rawRole: number;
    schoolName: string;
}

export interface StatusConfig {
    [key: string]: {
        icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string };
        color: string;
        textColor: string;
        bgColor: string;
    };
}

export interface Subject {
    id: string;
    subjectName: string;
}

export interface Branch {
    id: string;
    name: string;
}