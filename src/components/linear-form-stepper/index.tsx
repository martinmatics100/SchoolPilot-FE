import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import { Dayjs } from 'dayjs';

interface Address {
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
    state: string;
}

interface Phone {
    phoneType: string;
    countryCode: string;
    number: string;
    extension: string;
}

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
    address: Address;
    phone: Phone;
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
    adminUserName: string;
    adminPassword: string;
    adminAddress: Address;
    adminContactPhone: Phone;
}

interface StepContentProps {
    formData: FormData;
    onFormDataChange: (newData: Partial<FormData>) => void;
    errors: { [key: string]: string };
    onErrorsChange: (newErrors: { [key: string]: string }) => void;
}

interface LinearFormStepperProps {
    steps: string[];
    renderStepContent: (step: number, props: StepContentProps) => React.ReactNode;
    onSubmit: (data: FormData) => void;
    initialData?: Partial<FormData>; // Optional initial data
}

const LinearFormStepper: React.FC<LinearFormStepperProps> = ({
    steps,
    renderStepContent,
    onSubmit,
    initialData = {} // Default to empty object if not provided
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        schoolEmail: '',
        category: '',
        ownership: '',
        type: '',
        ownerTitle: '',
        ownerLastName: '',
        ownerFirstName: '',
        currentTerm: '',
        termStartDate: null,
        termEndDate: null,
        principal: '',
        email: '',
        address: {
            addressLine: '',
            city: '',
            postalCode: '',
            country: 'US',
            state: ''
        },
        phone: {
            phoneType: 'home',
            countryCode: 'US',
            number: '',
            extension: ''
        },
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminUserName: '',
        adminPassword: '',
        adminAddress: {
            addressLine: '',
            city: '',
            postalCode: '',
            country: 'US',
            state: ''
        },
        adminContactPhone: {
            phoneType: 'home',
            countryCode: 'US',
            number: '',
            extension: ''
        },
        ...initialData
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleFormDataChange = (newData: Partial<FormData>) => {
        setFormData((prev: FormData) => ({ ...prev, ...newData }));
    };

    const handleErrorsChange = (newErrors: { [key: string]: string }) => {
        setErrors((prev: { [key: string]: string }) => ({ ...prev, ...newErrors }));
    };

    const validateStep = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (activeStep === 0) {
            if (!formData.name?.trim()) newErrors.name = 'School name is required';
            if (!formData.schoolEmail?.trim()) newErrors.schoolEmail = 'School email is required';
            if (formData.schoolEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.schoolEmail)) {
                newErrors.schoolEmail = 'Invalid email format';
            }
            if (!formData.category?.trim()) newErrors.category = 'School category is required';
            if (!formData.ownership?.trim()) newErrors.ownership = 'School ownership is required';
            if (!formData.type?.trim()) newErrors.type = 'School type is required';
            if (!formData.ownerTitle?.trim()) newErrors.ownerTitle = 'Owner title is required';
            if (!formData.ownerLastName?.trim()) newErrors.ownerLastName = 'Owner last name is required';
            if (!formData.ownerFirstName?.trim()) newErrors.ownerFirstName = 'Owner first name is required';
            if (!formData.address?.addressLine?.trim()) newErrors.addressLine = 'Address line is required';
            if (!formData.address?.city?.trim()) newErrors.city = 'City is required';
            if (!formData.address?.postalCode?.trim()) newErrors.postalCode = 'Postal code is required';
            if (!formData.address?.country?.trim()) newErrors.country = 'Country is required';
            if (!formData.address?.state?.trim()) newErrors.state = 'State is required';
            if (!formData.phone?.number?.trim()) newErrors.phoneNumber = 'Phone number is required';
            if (formData.phone?.number && !/^[\d\s\+\-\(\)]{7,}$/.test(formData.phone.number)) {
                newErrors.phoneNumber = 'Invalid phone number format';
            }
        } else if (activeStep === 1) {
            if (!formData.currentTerm?.trim()) newErrors.currentTerm = 'Current term is required';
            if (!formData.termStartDate) newErrors.termStartDate = 'Start date is required';
            if (!formData.termEndDate) newErrors.termEndDate = 'End date is required';
            if (formData.termStartDate && formData.termEndDate &&
                formData.termStartDate.isAfter(formData.termEndDate)) {
                newErrors.termEndDate = 'End date must be after start date';
            }
        } else if (activeStep === 2) {
            if (!formData.adminFirstName?.trim()) newErrors.adminFirstName = "Admin first name is required";
            if (!formData.adminLastName?.trim()) newErrors.adminLastName = "Admin last name is required";
            if (!formData.adminEmail?.trim()) newErrors.adminEmail = "Admin email is required";
            if (formData.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
                newErrors.adminEmail = 'Invalid email format';
            }
            if (!formData.adminUserName?.trim()) newErrors.adminUserName = "Admin username is required";
            if (!formData.adminPassword?.trim()) newErrors.adminPassword = "Admin password is required";
            if (formData.adminPassword && formData.adminPassword.length < 8) {
                newErrors.adminPassword = 'Password must be at least 8 characters';
            }
            if (!formData.adminAddress?.addressLine?.trim()) newErrors.adminAddressLine = 'Admin address line is required';
            if (!formData.adminAddress?.city?.trim()) newErrors.adminCity = 'Admin city is required';
            if (!formData.adminAddress?.postalCode?.trim()) newErrors.adminPostalCode = 'Admin postal code is required';
            if (!formData.adminAddress?.country?.trim()) newErrors.adminCountry = 'Admin country is required';
            if (!formData.adminAddress?.state?.trim()) newErrors.adminState = 'Admin state is required';
            if (!formData.adminContactPhone?.number?.trim()) newErrors.adminPhoneNumber = 'Admin phone number is required';
            if (formData.adminContactPhone?.number && !/^[\d\s\+\-\(\)]{7,}$/.test(formData.adminContactPhone.number)) {
                newErrors.adminPhoneNumber = 'Invalid admin phone number format';
            }
        }

        const currentErrorsCopy = { ...errors };
        let hasErrorsInCurrentStep = false;

        Object.keys(currentErrorsCopy).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(newErrors, key)) {
                currentErrorsCopy[key] = '';
            }
        });

        Object.keys(newErrors).forEach(key => {
            currentErrorsCopy[key] = newErrors[key];
            if (newErrors[key]) {
                hasErrorsInCurrentStep = true;
            }
        });

        setErrors(currentErrorsCopy);
        return !hasErrorsInCurrentStep;
    };

    const handleNext = () => {
        if (!validateStep()) {
            return;
        }
        if (activeStep === steps.length - 1) {
            onSubmit(formData);
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleReset = () => {
        setActiveStep(0);
        setFormData({
            name: '',
            schoolEmail: '',
            category: '',
            ownership: '',
            type: '',
            ownerTitle: '',
            ownerLastName: '',
            ownerFirstName: '',
            currentTerm: '',
            termStartDate: null,
            termEndDate: null,
            principal: '',
            email: '',
            address: {
                addressLine: '',
                city: '',
                postalCode: '',
                country: 'US',
                state: ''
            },
            phone: {
                phoneType: 'home',
                countryCode: 'US',
                number: '',
                extension: ''
            },
            adminFirstName: '',
            adminLastName: '',
            adminEmail: '',
            adminUserName: '',
            adminPassword: '',
            adminAddress: {
                addressLine: '',
                city: '',
                postalCode: '',
                country: 'US',
                state: ''
            },
            adminContactPhone: {
                phoneType: 'home',
                countryCode: 'US',
                number: '',
                extension: ''
            },
            ...initialData
        });
        setErrors({});
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {activeStep === steps.length ? (
                <>
                    <Typography sx={{ mt: 2, mb: 1 }}>
                        All steps completed - Submitted!
                    </Typography>
                    <Button onClick={handleReset}>Reset</Button>
                </>
            ) : (
                <>
                    <Box sx={{ mt: 2 }}>
                        {renderStepContent(activeStep, {
                            formData,
                            onFormDataChange: handleFormDataChange,
                            errors,
                            onErrorsChange: handleErrorsChange
                        })}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                        <Button
                            color="inherit"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Previous
                        </Button>
                        <Box sx={{ flex: '1 1 auto' }} />
                        <Button onClick={handleNext}>
                            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default LinearFormStepper;