import React, { useEffect, useState } from 'react';
import BackButton from '../../../components/common/backButton';
import DynamicForm from '../../../components/common/my-form';
import { type FormField } from '../../../components/common/my-form';
import { useEnums } from '../../../hooks/useEnums';
import { createApiClient } from '../../../utils/apiClient';
import AlertMessage from '../../../components/common/message-display/message';
import { NavigationButton } from '../../../components/common/NavigationButton';

const CreateStudent = () => {
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [subjects, setSubjects] = useState<Array<{ id: string, subjectName: string }>>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
    const [selectedDesignation, setSelectedDesignation] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{
        frontendMessage?: { text: string; severity: 'error' | 'warning' | 'info' | 'success' } | null;
        backendMessage?: { text: string; severity: 'error' | 'warning' | 'info' | 'success' } | null;
    }>({ frontendMessage: null, backendMessage: null });

    const handleSubmit = async (data: any) => {
        try {
            // Show loading message
            setAlertMessage({
                frontendMessage: {
                    text: 'Submitting staff data...',
                    severity: 'info'
                }
            });

            if (data.subjectsTaught && Array.isArray(data.subjectsTaught)) {
                data.subjectsTaught = data.subjectsTaught.map((id: string) => id);
            }

            if (data.phone && typeof data.phone === 'object') {
                data.phone = {
                    ...data.phone,
                    phoneType: parseInt(data.phone.phoneType)
                };
            }

            console.log('Staff data ready for API:', data);

            // Simulate API call (replace with actual API call when backend is ready)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success message
            setAlertMessage({
                frontendMessage: {
                    text: 'Staff created successfully!',
                    severity: 'success'
                }
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            setAlertMessage({
                frontendMessage: {
                    text: 'Failed to create staff. Please try again.',
                    severity: 'error'
                },
                // When backend is ready, you can add backend messages like this:
                // backendMessage: {
                //     text: error.response?.data?.message || 'Server error occurred',
                //     severity: 'error'
                // }
            });
        }
    };

    useEffect(() => {
        if (!isLoading && enums) {
            const fields: FormField[] = [
                { name: 'firstName', label: 'First Name', type: 'text', required: true, colSpan: 1 },
                { name: 'lastName', label: 'Last Name', type: 'text', required: true, colSpan: 1 },
                {
                    name: 'email', label: 'Email Address', type: 'email', required: false,
                    infoText: 'This will be used to send notifications and informations', colSpan: 1
                },
                { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, colSpan: 1 },
                {
                    name: 'gender',
                    label: 'Gender',
                    type: 'select',
                    required: true,
                    colSpan: 1,
                    options: enums.Gender?.map(g => ({
                        value: g.value.toString(),
                        label: g.displayName || g.name
                    })) || []
                },
                {
                    name: 'nationality',
                    label: 'Nationality',
                    type: 'select',
                    required: true,
                    colSpan: 1,
                    options: enums.Nationality?.map(n => ({
                        value: n.value.toString(),
                        label: n.displayName || n.name
                    })) || []
                },
                { name: 'address', label: 'Home Address', type: 'address', required: false, colSpan: 3 },
                { name: 'parentsFirstName', label: 'Parent/Guardian First Name', type: 'text', required: false, colSpan: 1 },
                { name: 'parentLastName', label: 'Parent/Guardian Last Name', type: 'text', required: false, colSpan: 1 },
                {
                    name: 'parentEmail', label: 'Parent/Guardian Email Address', type: 'email', required: false,
                    infoText: 'This will be used to send notifications and informations to the parent/guardian', colSpan: 1
                },
                {
                    name: 'phone',
                    label: 'Parent/Guardian Contact Phone',
                    type: 'phone',
                    required: false,
                    colSpan: 3,
                    errorMessage: 'Please provide a valid phone number',
                    extraProps: {
                        enums: {
                            PhoneType: enums.PhoneType,
                            Country: enums.Country
                        }
                    }
                },
                {
                    name: 'notes',
                    label: 'Additional Notes',
                    type: 'multiline',
                    required: false,
                    rows: 4,
                    colSpan: 2
                },
                {
                    name: 'profilePicture',
                    label: 'Profile Picture',
                    type: 'image',
                    multiple: false,
                    required: false,
                    colSpan: 2
                },
            ];

            setFormFields(fields);
        }
    }, [enums, isLoading, selectedDesignation, subjects]);

    if (isLoading && formFields.length === 0) {
        return <div>Loading form...</div>;
    }


    return (
        <div>
            {/* Alert Message Component */}
            <AlertMessage
                frontendMessage={alertMessage.frontendMessage}
                backendMessage={alertMessage.backendMessage}
                autoHideDuration={5000}
                onClose={() => setAlertMessage({ frontendMessage: null, backendMessage: null })}
            />
            <BackButton />
            <NavigationButton
                to=""
                // startIcon={<AddIcon />}
                sx={{ alignContent: 'flex-end' }}
            >
                Go to Student List
            </NavigationButton>
            <DynamicForm
                title="Student Form"
                fields={formFields}
                onSubmit={handleSubmit}
                submitButtonText="Submit"
                columns={3}
            />
        </div>
    )
}

export default CreateStudent
