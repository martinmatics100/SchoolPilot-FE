import React from 'react'; // No longer need useState here as state is managed by stepper
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
    FormHelperText
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import LinearFormStepper from '../../../components/common/linear-form-stepper';
import PhoneNumberInput from '../../../components/common/PhoneNumberInput';
import AddressInput from '../../../components/common/AddressInput';

export default function CreateSchoolPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const steps = ['SCHOOL INFO', 'CURRENT TERM', 'ADMIN INFO'];

    // Dropdown options (these are constant, no state needed)
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

    const titles = ['Mr', 'Mrs', 'Miss', 'Dr', 'Prof', 'Rev', 'Other'];

    // Define FormData interface for clarity, consistent with LinearFormStepper
    interface FormData {
        name: string;
        schoolEmail: string;
        category: string;
        ownership: string;
        type: string;
        ownerTitle: string;
        ownerLastName: string;
        ownerFirstName: string;
        currentTerm: string;
        termStartDate: Dayjs | null;
        termEndDate: Dayjs | null;
        principal: string;
        email: string;
        address: {
            addressLine: string;
            city: string;
            postalCode: string;
            country: string;
            state: string;
        };
        phone: {
            phoneType: string;
            countryCode: string;
            number: string;
            extension: string;
        };
        adminFirstName: string;
        adminLastName: string;
        adminEmail: string;
        adminUserName: string;
        adminPassword: string;
        adminAddress: {
            addressLine: string;
            city: string;
            postalCode: string;
            country: string;
            state: string;
        };
        adminContactPhone: {
            phoneType: string;
            countryCode: string;
            number: string;
            extension: string;
        }
    }

    const handleSubmit = (data: FormData) => {
        console.log('Submitted data:', data);
        // Add API call here
    };

    // The renderStepContent function will receive the formData, onFormDataChange,
    // errors, and onErrorsChange from the LinearFormStepper.
    const renderStepContent = (
        step: number,
        { formData, onFormDataChange, errors, onErrorsChange }: {
            formData: FormData;
            onFormDataChange: (newData: Partial<FormData>) => void;
            errors: Record<string, string>;
            onErrorsChange: (newErrors: Record<string, string>) => void;
        }
    ) => {
        // Handlers specific to this step's content, using the passed-down state functions
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            onFormDataChange({ [name]: value } as Partial<FormData>);
            if (errors[name]) {
                onErrorsChange({ [name]: '' });
            }
        };

        const handleSelectChange = (e: any) => {
            const { name, value } = e.target;
            onFormDataChange({ [name]: value } as Partial<FormData>);
            if (errors[name]) {
                onErrorsChange({ [name]: '' });
            }
        };

        const handleDateChange = (name: keyof FormData, value: Dayjs | null) => {
            onFormDataChange({ [name]: value } as Partial<FormData>);
            if (errors[name]) {
                onErrorsChange({ [name]: '' });
            }
        };

        const handleAddressChange = (newAddress: Partial<FormData['address']>) => {
            onFormDataChange({
                address: {
                    ...formData.address,
                    ...newAddress
                }
            });
            const addressErrorsFields = ['addressLine', 'city', 'postalCode', 'country', 'state'];
            const updatedErrors = { ...errors };
            addressErrorsFields.forEach(field => {
                if (updatedErrors[field]) {
                    updatedErrors[field] = '';
                }
            });
            onErrorsChange(updatedErrors);
        };

        const handlePhoneChange = (newPhone: Partial<FormData['phone']>) => {
            onFormDataChange({
                phone: {
                    ...formData.phone,
                    ...newPhone
                }
            });
            if (errors.phoneNumber) {
                onErrorsChange({ phoneNumber: '' });
            }
        };

        switch (step) {
            case 0:
                return (
                    <Box sx={{ width: '100%' }}>
                        {/* School Name and Email Row */}
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: isMobile ? 'column' : 'row',
                            mb: 2
                        }}>
                            <TextField
                                fullWidth
                                label="School Name"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                            <TextField
                                fullWidth
                                label="School Email"
                                name="schoolEmail"
                                value={formData.schoolEmail || ''}
                                onChange={handleChange}
                                error={!!errors.schoolEmail}
                                helperText={errors.schoolEmail}
                            />
                        </Box>

                        {/* School Category, Ownership, and Type */}
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: isMobile ? 'column' : 'row',
                            mb: 2
                        }}>
                            <FormControl fullWidth error={!!errors.category}>
                                <InputLabel>School Category</InputLabel>
                                <Select
                                    label="School Category"
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
                                <InputLabel>School Ownership</InputLabel>
                                <Select
                                    label="School Ownership"
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
                                <InputLabel>School Type</InputLabel>
                                <Select
                                    label="School Type"
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

                        {/* School Owner Section */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                School Owner
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                flexDirection: isMobile ? 'column' : 'row'
                            }}>
                                <FormControl fullWidth error={!!errors.ownerTitle}>
                                    <InputLabel>Title</InputLabel>
                                    <Select
                                        label="Title"
                                        name="ownerTitle"
                                        value={formData.ownerTitle || ''}
                                        onChange={handleSelectChange}
                                    >
                                        {titles.map((title) => (
                                            <MenuItem key={title} value={title}>
                                                {title}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.ownerTitle && <FormHelperText>{errors.ownerTitle}</FormHelperText>}
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="ownerLastName"
                                    value={formData.ownerLastName || ''}
                                    onChange={handleChange}
                                    error={!!errors.ownerLastName}
                                    helperText={errors.ownerLastName}
                                />
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="ownerFirstName"
                                    value={formData.ownerFirstName || ''}
                                    onChange={handleChange}
                                    error={!!errors.ownerFirstName}
                                    helperText={errors.ownerFirstName}
                                />
                            </Box>
                        </Box>

                        {/* School Address */}
                        <Box sx={{ mb: 2 }}>
                            <h3>School Address</h3>
                            <AddressInput
                                addressLine={formData.address.addressLine}
                                city={formData.address.city}
                                postalCode={formData.address.postalCode}
                                country={formData.address.country}
                                state={formData.address.state}
                                onChange={handleAddressChange}
                                errors={{
                                    addressLine: errors.addressLine,
                                    city: errors.city,
                                    postalCode: errors.postalCode,
                                    country: errors.country,
                                    state: errors.state
                                }}
                            />
                        </Box>

                        {/* Contact Phone Number */}
                        <Box sx={{ mb: 2 }}>
                            <h3>Contact Phone Number</h3>
                            <PhoneNumberInput
                                phoneType={formData.phone.phoneType}
                                countryCode={formData.phone.countryCode}
                                number={formData.phone.number}
                                extension={formData.phone.extension}
                                onChange={handlePhoneChange}
                                error={errors.phoneNumber} // Assuming 'phoneNumber' is the key for general phone error
                            />
                        </Box>
                    </Box>
                );
            case 1:
                return (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ width: '100%' }}>
                            {/* Current Term Dropdown - Top Left */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                mb: 3
                            }}>
                                <FormControl sx={{
                                    width: isMobile ? '100%' : '300px',
                                    minWidth: '200px'
                                }} error={!!errors.currentTerm}>
                                    <InputLabel>Current Term</InputLabel>
                                    <Select
                                        label="Current Term"
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
                            </Box>

                            {/* Academic Session Dates */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Current Academic Session
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 2,
                                    flexDirection: isMobile ? 'column' : 'row'
                                }}>
                                    <DatePicker
                                        label="Start Date"
                                        value={formData.termStartDate}
                                        onChange={(value) => handleDateChange('termStartDate', value)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.termStartDate,
                                                helperText: errors.termStartDate,
                                            },
                                        }}
                                    />
                                    <DatePicker
                                        label="End Date"
                                        value={formData.termEndDate}
                                        onChange={(value) => handleDateChange('termEndDate', value)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.termEndDate,
                                                helperText: errors.termEndDate,
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </LocalizationProvider>
                );
            case 2:
                return (
                    <Box>
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: isMobile ? 'column' : 'row',
                            mb: 2
                        }}>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="adminFirstName"
                                value={formData.adminFirstName || ''}
                                onChange={handleChange}
                                error={!!errors.adminFirstName}
                                helperText={errors.adminFirstName}
                            />
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="adminLastName"
                                value={formData.adminLastName || ''}
                                onChange={handleChange}
                                error={!!errors.adminLastName}
                                helperText={errors.adminLastName}
                            />
                        </Box>

                        {/* Admin Account Credentials */}
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
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
                        <Box sx={{ mb: 3 }}>
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


                        {/* School Address */}
                        <Box sx={{ mb: 2 }}>
                            <h3>School Address</h3>
                            <AddressInput
                                addressLine={formData.adminAddress.addressLine}
                                city={formData.adminAddress.city}
                                postalCode={formData.adminAddress.postalCode}
                                country={formData.adminAddress.country}
                                state={formData.adminAddress.state}
                                onChange={(newAddress) => {
                                    onFormDataChange({
                                        adminAddress: {
                                            ...formData.adminAddress,
                                            ...newAddress
                                        }
                                    });
                                    // Clear admin address errors if they exist
                                    const adminAddressErrors = [
                                        'adminAddressLine', 'adminCity',
                                        'adminPostalCode', 'adminCountry', 'adminState'
                                    ];
                                    const updatedErrors = { ...errors };
                                    adminAddressErrors.forEach(field => {
                                        if (updatedErrors[field]) {
                                            updatedErrors[field] = '';
                                        }
                                    });
                                    onErrorsChange(updatedErrors);
                                }}
                                errors={{
                                    addressLine: errors.adminAddressLine,
                                    city: errors.adminCity,
                                    postalCode: errors.adminPostalCode,
                                    country: errors.adminCountry,
                                    state: errors.adminState
                                }}
                            />
                        </Box>

                        {/* Contact Phone Number */}
                        <Box sx={{ mb: 2 }}>
                            <h3>Contact Phone Number</h3>
                            <PhoneNumberInput
                                phoneType={formData.adminContactPhone.phoneType}
                                countryCode={formData.adminContactPhone.countryCode}
                                number={formData.adminContactPhone.number}
                                extension={formData.adminContactPhone.extension}
                                onChange={(newPhone) => {
                                    onFormDataChange({
                                        adminContactPhone: {
                                            ...formData.adminContactPhone,
                                            ...newPhone
                                        }
                                    });
                                    if (errors.adminPhoneNumber) {
                                        onErrorsChange({ adminPhoneNumber: '' });
                                    }
                                }}
                                error={errors.adminPhoneNumber}
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
            p: isMobile ? 1 : 3
        }}>
            <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
                Create New School
            </Typography>
            <LinearFormStepper
                steps={steps}
                renderStepContent={renderStepContent}
                onSubmit={handleSubmit}
            // initialData can be omitted or set to {} as LinearFormStepper provides defaults
            />
        </Box>
    );
}