import React, { useState } from 'react';
import {
    TextField,
    Box,
    useTheme,
    useMediaQuery,
    InputLabel,
    FormControl,
    Select,
    MenuItem,
    Typography,
    FormHelperText,
    Alert,
    Snackbar,
    Button,
    Stepper,
    Step,
    StepLabel,
    Paper,
    CircularProgress,
    Grid
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import PhoneNumberInput from '../../../components/phoneNumberInput/index';
import AddressInput from '../../../components/addressInput/index';
import InfoIcon from '@mui/icons-material/Info';
import { Tooltip, IconButton } from '@mui/material';

// Enum mappings for backend
const UserTitleEnum: Record<string, number> = {
    'Mr': 1,
    'Mrs': 2,
    'Miss': 3,
    'Dr': 4,
    'Prof': 5,
    'Rev': 6,
    'Other': 0
};

const SchoolTypeEnum: Record<string, number> = {
    'Day School': 1,
    'Boarding School': 2,
    'Day & Boarding School': 3
};

const SchoolCategoryEnum: Record<string, number> = {
    'Nursery': 1,
    'Nursery And Primary': 2,
    'Nursery, Primary And Junior Secondary': 3,
    'Nursery, Primary, Junior And Senior Secondary': 4,
    'Junior And Senior Secondary': 5
};

const SchoolOwnershipEnum: Record<string, number> = {
    'Private School': 1,
    'Military School': 2,
    'Missionary School': 3,
    'Federal Govt; School': 4,
    'State Govt; School': 5,
    'Community School': 6
};

const SchoolTermsEnum: Record<string, number> = {
    'First Term': 1,
    'Second Term': 2,
    'Third Term': 3
};

const SchoolSessionsEnum: Record<string, number> = {
    '2025/2026 SESSION': 1,
    '2026/2027 SESSION': 2,
    '2027/2028 SESSION': 3,
    '2028/2029 SESSION': 4,
    '2029/2030 SESSION': 5
};

const PhoneTypeEnum: Record<string, number> = {
    'Home': 1,
    'Facility': 2,
    'Mobile': 3,
    'Work': 4,
    'Office': 5
};

// Display options
const schoolCategories = [
    'Nursery',
    'Nursery And Primary',
    'Nursery, Primary And Junior Secondary',
    'Nursery, Primary, Junior And Senior Secondary',
    'Junior And Senior Secondary',
];

const schoolOwnerships = [
    'Private School',
    'Military School',
    'Missionary School',
    'Federal Govt; School',
    'State Govt; School',
    'Community School'
];

const schoolTypes = [
    'Day School',
    'Boarding School',
    'Day & Boarding School',
];

const termOptions = [
    'First Term',
    'Second Term',
    'Third Term',
];

const sessionOptions = [
    '2025/2026 SESSION',
    '2026/2027 SESSION',
    '2027/2028 SESSION',
    '2028/2029 SESSION',
    '2029/2030 SESSION',
];

const titles = ['Mr', 'Mrs', 'Miss', 'Dr', 'Prof', 'Rev', 'Other'];
const phoneTypes = ['Home', 'Facility', 'Mobile', 'Work', 'Office'];

// Form data interface
interface CreateSchoolFormData {
    // Account level
    accountName: string;
    ownersFirstName: string;
    ownersLastName: string;
    ownersTitle: string;
    isTestingAgency: boolean;

    // School level
    name: string;
    schoolEmail: string;
    category: string;
    ownership: string;
    type: string;
    currentTerm: string;
    currentSession: string;
    termStartDate: Dayjs | null;
    termEndDate: Dayjs | null;

    // Contact person
    principal: string;
    email: string;

    // School address & phone
    address: {
        addressLine1: string;
        postalCode: string;
        country: string;
        state: string;
    };
    phone: {
        phoneType: string;
        country: string;
        number: string;
        extension: string;
    };

    // Admin user
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
    adminUserName: string;
    adminPassword: string;

    // Admin address & phone
    adminAddress: {
        addressLine1: string;
        postalCode: string;
        country: string;
        state: string;
    };
    adminContactPhone: {
        phoneType: string;
        country: string;
        number: string;
        extension: string;
    };
}

const initialFormData: CreateSchoolFormData = {
    accountName: '',
    ownersFirstName: '',
    ownersLastName: '',
    ownersTitle: '',
    isTestingAgency: true,
    name: '',
    schoolEmail: '',
    category: '',
    ownership: '',
    type: '',
    currentTerm: '',
    currentSession: '',
    termStartDate: null,
    termEndDate: null,
    principal: '',
    email: '',
    address: {
        addressLine1: '',
        postalCode: '',
        country: '',
        state: ''
    },
    phone: {
        phoneType: 'Mobile',
        country: '566', // Nigeria's ISO numeric code
        number: '',
        extension: ''
    },
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminUserName: '',
    adminPassword: '',
    adminAddress: {
        addressLine1: '',
        postalCode: '',
        country: '',
        state: ''
    },
    adminContactPhone: {
        phoneType: 'Mobile',
        country: '566',
        number: '',
        extension: ''
    }
};

export default function CreateSchoolPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<CreateSchoolFormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const LabelWithTooltip = ({ label, tooltip, required }: { label: string; tooltip: string; required?: boolean }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                {label}{required && ' *'}
            </Typography>
            <Tooltip
                title={tooltip}
                arrow
                placement="top"
                componentsProps={{
                    tooltip: {
                        sx: {
                            bgcolor: 'white',
                            color: 'red',
                            fontSize: '0.875rem',
                            padding: '8px 12px',
                            border: '1px solid #ffcdd2',
                            '& .MuiTooltip-arrow': {
                                color: 'white',
                                '&::before': {
                                    border: '1px solid #ffcdd2',
                                    bgcolor: 'white'
                                }
                            }
                        }
                    }
                }}
            >
                <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                    <InfoIcon fontSize="small" sx={{ color: 'action.active', fontSize: 18 }} />
                </IconButton>
            </Tooltip>
        </Box>
    );

    const steps = ['SCHOOL INFO', 'CURRENT TERM', 'ADMIN INFO'];

    // Transform form data to backend payload
    const transformToPayload = (data: CreateSchoolFormData) => {

        const selectedSession = data.currentSession;

        const termValue = SchoolTermsEnum[data.currentTerm] || 1;

        const sessionValue = SchoolSessionsEnum[selectedSession] || 1;

        return {
            name: data.accountName,
            ownersFirstName: data.ownersFirstName,
            ownersLastName: data.ownersLastName,
            ownersTitle: UserTitleEnum[data.ownersTitle] || 0,
            schools: [
                {
                    name: data.name,
                    schoolName: data.name,
                    schoolType: SchoolTypeEnum[data.type] || 1,
                    schoolStatus: 1,
                    schoolCategory: SchoolCategoryEnum[data.category] || 1,
                    schoolOwnership: SchoolOwnershipEnum[data.ownership] || 1,
                    currentTerm: termValue,
                    currentSessions: sessionValue,
                    contactPersonEmail: data.email || data.schoolEmail,
                    contactPersonPhone: {
                        number: data.phone.number?.replace(/\D/g, ''),
                        extension: data.phone.extension || '',
                        type: PhoneTypeEnum[data.phone.phoneType] || 2,
                        country: "NGA"
                    },
                    schoolLocation: [
                        {
                            name: `${data.name} Main Branch`,
                            address: {
                                addressLine1: data.address.addressLine1,
                                addressLine2: "",
                                city: data.address.state,
                                state: data.address.state,
                                zipCode: data.address.postalCode,
                                county: "",
                                country: "NGA"
                            },
                            primaryPhone: {
                                number: data.phone.number?.replace(/\D/g, ''),
                                extension: data.phone.extension || '',
                                type: PhoneTypeEnum[data.phone.phoneType] || 2,
                                country: "NGA"
                            },
                            timeZone: 1,
                            isMainLocation: true
                        }
                    ]
                }
            ],
            initialUser: {
                email: data.adminEmail,
                firstName: data.adminFirstName,
                lastName: data.adminLastName,
                password: data.adminPassword
            },
            isTestingAgency: true,
            initialUserTimeZone: 1
        };
    };

    // Validate current step
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 0:
                if (!formData.ownersTitle) newErrors.ownersTitle = 'Title is required';
                if (!formData.ownersFirstName) newErrors.ownersFirstName = 'First name is required';
                if (!formData.ownersLastName) newErrors.ownersLastName = 'Last name is required';
                if (!formData.name) newErrors.name = 'School name is required';
                if (!formData.schoolEmail) newErrors.schoolEmail = 'School email is required';
                if (!formData.category) newErrors.category = 'School category is required';
                if (!formData.ownership) newErrors.ownership = 'School ownership is required';
                if (!formData.type) newErrors.type = 'School type is required';
                if (!formData.address?.addressLine1) newErrors.addressLine1 = 'Address is required';
                if (!formData.address?.postalCode) newErrors.postalCode = 'Postal code is required';
                if (!formData.address?.country) newErrors.country = 'Country is required';
                if (!formData.address?.state) newErrors.state = 'State is required';
                if (!formData.phone?.number) newErrors.phoneNumber = 'Phone number is required';
                break;
            case 1:
                if (!formData.currentTerm) newErrors.currentTerm = 'Current term is required';
                if (!formData.currentSession) newErrors.currentSession = 'Academic session is required';
                if (!formData.termStartDate) newErrors.termStartDate = 'Start date is required';
                if (!formData.termEndDate) newErrors.termEndDate = 'End date is required';
                break;
            case 2:
                if (!formData.adminFirstName) newErrors.adminFirstName = 'First name is required';
                if (!formData.adminLastName) newErrors.adminLastName = 'Last name is required';
                if (!formData.adminEmail) newErrors.adminEmail = 'Email is required';
                if (!formData.adminUserName) newErrors.adminUserName = 'Username is required';
                if (!formData.adminPassword) newErrors.adminPassword = 'Password is required';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSelectChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDateChange = (name: string) => (value: Dayjs | null) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleAddressChange = (newAddress: {
        addressLine1: string;
        postalCode: string;
        country: string;
        state: string;
    }) => {
        setFormData(prev => ({
            ...prev,
            address: newAddress
        }));

        // Clear address errors
        const addressErrorsFields = ['addressLine1', 'postalCode', 'country', 'state'];
        setErrors(prev => {
            const newErrors = { ...prev };
            addressErrorsFields.forEach(field => {
                delete newErrors[field];
            });
            return newErrors;
        });
    };

    const handlePhoneChange = (newPhone: {
        phoneType: string;
        country: string;
        number: string;
        extension: string;
    }) => {
        setFormData(prev => ({
            ...prev,
            phone: newPhone
        }));
        if (errors.phoneNumber) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.phoneNumber;
                return newErrors;
            });
        }
    };

    const handleAdminAddressChange = (newAddress: {
        addressLine1: string;
        postalCode: string;
        country: string;
        state: string;
    }) => {
        setFormData(prev => ({
            ...prev,
            adminAddress: newAddress
        }));

        // Clear admin address errors
        const adminAddressErrors = ['adminAddressLine1', 'adminPostalCode', 'adminCountry', 'adminState'];
        setErrors(prev => {
            const newErrors = { ...prev };
            adminAddressErrors.forEach(field => {
                delete newErrors[field];
            });
            return newErrors;
        });
    };

    const handleAdminPhoneChange = (newPhone: {
        phoneType: string;
        country: string;
        number: string;
        extension: string;
    }) => {
        setFormData(prev => ({
            ...prev,
            adminContactPhone: newPhone
        }));
        if (errors.adminPhoneNumber) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.adminPhoneNumber;
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(activeStep)) return;

        setLoading(true);
        try {
            const payload = transformToPayload(formData);
            console.log('Submitting payload:', JSON.stringify(payload, null, 2));

            // API call
            const response = await fetch('https://localhost:7029/api/v1/school-setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to create school');
            }

            const result = await response.json();
            setSnackbar({
                open: true,
                message: 'School created successfully!',
                severity: 'success'
            });

            setTimeout(() => {
                window.location.href = '/schoolpilot/authentication/login';
            }, 2000);

        } catch (error) {
            console.error('Error creating school:', error);
            setSnackbar({
                open: true,
                message: error instanceof Error ? error.message : 'Failed to create school',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ width: '100%' }}>
                        {/* Owner Information */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                Account Owner Information
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                flexDirection: isMobile ? 'column' : 'row',
                                mb: 2
                            }}>
                                <FormControl fullWidth error={!!errors.ownersTitle}>
                                    <InputLabel>Title *</InputLabel>
                                    <Select
                                        label="Title *"
                                        name="ownersTitle"
                                        value={formData.ownersTitle || ''}
                                        onChange={handleSelectChange}
                                    >
                                        {titles.map((title) => (
                                            <MenuItem key={title} value={title}>
                                                {title}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.ownersTitle && <FormHelperText>{errors.ownersTitle}</FormHelperText>}
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="First Name *"
                                    name="ownersFirstName"
                                    value={formData.ownersFirstName || ''}
                                    onChange={handleChange}
                                    error={!!errors.ownersFirstName}
                                    helperText={errors.ownersFirstName}
                                />
                                <TextField
                                    fullWidth
                                    label="Last Name *"
                                    name="ownersLastName"
                                    value={formData.ownersLastName || ''}
                                    onChange={handleChange}
                                    error={!!errors.ownersLastName}
                                    helperText={errors.ownersLastName}
                                />
                            </Box>
                        </Box>

                        {/* School Information */}
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                            School Information
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: isMobile ? 'column' : 'row',
                            mb: 2
                        }}>
                            <Box sx={{ width: '100%' }}>
                                <LabelWithTooltip
                                    label="Account Name"
                                    tooltip="This will be your main account identifier and will be visible to all users in the system"
                                    required={true}
                                />
                                <TextField
                                    fullWidth
                                    placeholder="e.g., St. Mary's School Account"
                                    name="accountName"
                                    value={formData.accountName || ''}
                                    onChange={handleChange}
                                    error={!!errors.accountName}
                                    helperText={errors.accountName}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                />
                            </Box>
                            <TextField
                                fullWidth
                                label="School Name *"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                error={!!errors.name}
                                helperText={errors.name}
                                size="small"
                            />
                            <TextField
                                fullWidth
                                label="School Email *"
                                name="schoolEmail"
                                type="email"
                                value={formData.schoolEmail || ''}
                                onChange={handleChange}
                                error={!!errors.schoolEmail}
                                helperText={errors.schoolEmail}
                                size="small"
                            />
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: isMobile ? 'column' : 'row',
                            mb: 2
                        }}>
                            <FormControl fullWidth error={!!errors.category}>
                                <InputLabel>School Category *</InputLabel>
                                <Select
                                    label="School Category *"
                                    name="category"
                                    value={formData.category || ''}
                                    onChange={handleSelectChange}
                                >
                                    {schoolCategories.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                            </FormControl>

                            <FormControl fullWidth error={!!errors.ownership}>
                                <InputLabel>School Ownership *</InputLabel>
                                <Select
                                    label="School Ownership *"
                                    name="ownership"
                                    value={formData.ownership || ''}
                                    onChange={handleSelectChange}
                                >
                                    {schoolOwnerships.map((ownership) => (
                                        <MenuItem key={ownership} value={ownership}>
                                            {ownership}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.ownership && <FormHelperText>{errors.ownership}</FormHelperText>}
                            </FormControl>

                            <FormControl fullWidth error={!!errors.type}>
                                <InputLabel>School Type *</InputLabel>
                                <Select
                                    label="School Type *"
                                    name="type"
                                    value={formData.type || ''}
                                    onChange={handleSelectChange}
                                >
                                    {schoolTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                            </FormControl>
                        </Box>

                        {/* School Address */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                School Address *
                            </Typography>
                            <AddressInput
                                addressLine1={formData.address?.addressLine1 || ''}
                                postalCode={formData.address?.postalCode || ''}
                                country={formData.address?.country || ''}
                                state={formData.address?.state || ''}
                                onChange={handleAddressChange}
                                errors={{
                                    addressLine1: errors.addressLine1,
                                    postalCode: errors.postalCode,
                                    country: errors.country,
                                    state: errors.state
                                }}
                            />
                        </Box>

                        {/* Contact Phone Number */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                School Contact Person Phone Number *
                            </Typography>
                            <PhoneNumberInput
                                phoneType={formData.phone?.phoneType || 'Mobile'}
                                country={formData.phone?.country || '566'}
                                number={formData.phone?.number || ''}
                                extension={formData.phone?.extension || ''}
                                onChange={handlePhoneChange}
                                errors={{
                                    phoneType: errors.phoneType,
                                    country: errors.country,
                                    number: errors.number,
                                    extension: errors.extension
                                }}
                                enums={{
                                    PhoneType: phoneTypes.map((type, index) => ({
                                        value: index + 1,
                                        name: type,
                                        displayName: type
                                    }))
                                }}
                            />
                        </Box>
                    </Box>
                );

            case 1:
                return (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                                Academic Term Setup
                            </Typography>

                            {/* Current Term and Session Row */}
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                flexDirection: isMobile ? 'column' : 'row',
                                mb: 3
                            }}>
                                <FormControl fullWidth error={!!errors.currentTerm}>
                                    <InputLabel>Current Term *</InputLabel>
                                    <Select
                                        label="Current Term *"
                                        name="currentTerm"
                                        value={formData.currentTerm || ''}
                                        onChange={handleSelectChange}
                                    >
                                        {termOptions.map((term) => (
                                            <MenuItem key={term} value={term}>
                                                {term}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.currentTerm && <FormHelperText>{errors.currentTerm}</FormHelperText>}
                                </FormControl>

                                <FormControl fullWidth error={!!errors.currentSession}>
                                    <InputLabel>Academic Session *</InputLabel>
                                    <Select
                                        label="Academic Session *"
                                        name="currentSession"
                                        value={formData.currentSession || ''}
                                        onChange={handleSelectChange}
                                    >
                                        {sessionOptions.map((session) => (
                                            <MenuItem key={session} value={session}>
                                                {session}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.currentSession && <FormHelperText>{errors.currentSession}</FormHelperText>}
                                </FormControl>
                            </Box>

                            {/* Academic Session Dates */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                    Current Academic Session Dates
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 2,
                                    flexDirection: isMobile ? 'column' : 'row'
                                }}>
                                    <DatePicker
                                        label="Start Date *"
                                        value={formData.termStartDate}
                                        onChange={(value) => handleDateChange('termStartDate')(value as Dayjs | null)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.termStartDate,
                                                helperText: errors.termStartDate
                                            }
                                        }}
                                    />
                                    <DatePicker
                                        label="End Date *"
                                        value={formData.termEndDate}
                                        onChange={(value) => handleDateChange('termEndDate')(value as Dayjs | null)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.termEndDate,
                                                helperText: errors.termEndDate
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Contact Person */}
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    School Contact Person
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 2,
                                    flexDirection: isMobile ? 'column' : 'row'
                                }}>
                                    <TextField
                                        fullWidth
                                        label="Principal/Head Teacher Name"
                                        name="principal"
                                        value={formData.principal || ''}
                                        onChange={handleChange}
                                        error={!!errors.principal}
                                        helperText={errors.principal}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Contact Email"
                                        name="email"
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </LocalizationProvider>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                            Admin User Setup
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: isMobile ? 'column' : 'row',
                            mb: 2
                        }}>
                            <TextField
                                fullWidth
                                label="First Name *"
                                name="adminFirstName"
                                value={formData.adminFirstName || ''}
                                onChange={handleChange}
                                error={!!errors.adminFirstName}
                                helperText={errors.adminFirstName}
                            />
                            <TextField
                                fullWidth
                                label="Last Name *"
                                name="adminLastName"
                                value={formData.adminLastName || ''}
                                onChange={handleChange}
                                error={!!errors.adminLastName}
                                helperText={errors.adminLastName}
                            />
                        </Box>

                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Admin Account Credentials
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: isMobile ? 'column' : 'row',
                            mb: 3
                        }}>
                            <TextField
                                fullWidth
                                label="Email *"
                                name="adminEmail"
                                type="email"
                                value={formData.adminEmail || ''}
                                onChange={handleChange}
                                error={!!errors.adminEmail}
                                helperText={errors.adminEmail}
                            />
                            <TextField
                                fullWidth
                                label="Username *"
                                name="adminUserName"
                                value={formData.adminUserName || ''}
                                onChange={handleChange}
                                error={!!errors.adminUserName}
                                helperText={errors.adminUserName}
                            />
                        </Box>

                        <Box sx={{ mb: 4 }}>
                            <TextField
                                fullWidth
                                label="Password *"
                                name="adminPassword"
                                type="password"
                                value={formData.adminPassword || ''}
                                onChange={handleChange}
                                error={!!errors.adminPassword}
                                helperText={errors.adminPassword}
                                sx={{ maxWidth: isMobile ? '100%' : '50%' }}
                            />
                        </Box>

                        {/* Admin Address */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Admin Address
                            </Typography>
                            <AddressInput
                                addressLine1={formData.adminAddress?.addressLine1 || ''}
                                postalCode={formData.adminAddress?.postalCode || ''}
                                country={formData.adminAddress?.country || ''}
                                state={formData.adminAddress?.state || ''}
                                onChange={handleAdminAddressChange}
                                errors={{
                                    addressLine1: errors.adminAddressLine1,
                                    postalCode: errors.adminPostalCode,
                                    country: errors.adminCountry,
                                    state: errors.adminState
                                }}
                            />
                        </Box>

                        {/* Admin Contact Phone */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Admin Phone Number
                            </Typography>
                            <PhoneNumberInput
                                phoneType={formData.adminContactPhone?.phoneType || 'Mobile'}
                                country={formData.adminContactPhone?.country || '566'}
                                number={formData.adminContactPhone?.number || ''}
                                extension={formData.adminContactPhone?.extension || ''}
                                onChange={handleAdminPhoneChange}
                                errors={{
                                    phoneType: errors.adminPhoneType,
                                    country: errors.adminCountry,
                                    number: errors.adminNumber,
                                    extension: errors.adminExtension
                                }}
                                enums={{
                                    PhoneType: phoneTypes.map((type, index) => ({
                                        value: index + 1,
                                        name: type,
                                        displayName: type
                                    }))
                                }}
                            />
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{
            maxWidth: 1200,
            mx: 'auto',
            p: isMobile ? 1 : 3,
            bgcolor: theme.palette.background.default,
            minHeight: '100vh'
        }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
                Create New School
            </Typography>

            <Paper sx={{ p: 3, mb: 3, bgcolor: theme.palette.background.default }}>
                <Stepper activeStep={activeStep} alternativeLabel={isMobile}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: theme.palette.background.default }}>
                {renderStepContent(activeStep)}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={activeStep === 0 || loading}
                    >
                        Back
                    </Button>
                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Submit'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={loading}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}