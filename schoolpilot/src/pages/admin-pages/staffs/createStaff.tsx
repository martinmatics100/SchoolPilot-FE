import React, { useEffect, useState } from 'react';
import BackButton from '../../../components/common/backButton';
import DynamicForm from '../../../components/common/my-form';
import { type FormField } from '../../../components/common/my-form';
import { useEnums } from '../../../hooks/useEnums';
import { createApiClient } from '../../../utils/apiClient';
import AlertMessage from '../../../components/common/message-display/message';
import { NavigationButton } from '../../../components/common/NavigationButton';

const CreateStaff = () => {
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [subjects, setSubjects] = useState<Array<{ id: string, subjectName: string }>>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
    const [selectedDesignation, setSelectedDesignation] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{
        frontendMessage?: { text: string; severity: 'error' | 'warning' | 'info' | 'success' } | null;
        backendMessage?: { text: string; severity: 'error' | 'warning' | 'info' | 'success' } | null;
    }>({ frontendMessage: null, backendMessage: null });

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const apiClient = createApiClient();
                const subjectsData = await apiClient.getSubjects();
                setSubjects(subjectsData);
            } catch (error) {
                console.error('Error fetching subjects:', error);
                setAlertMessage({
                    frontendMessage: {
                        text: 'Failed to load subjects. Please refresh the page.',
                        severity: 'error'
                    }
                });
            } finally {
                setIsLoadingSubjects(false);
            }
        };

        fetchSubjects();
    }, []);

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

    // Function to check if subjects taught should be hidden
    const shouldHideSubjectsTaught = (designation: string | null) => {
        if (!designation || !enums?.StaffDesignation) return false;

        const selectedDesignationObj = enums.StaffDesignation.find(
            d => d.value.toString() === designation
        );

        // Return true only for NonAcademic and Accountant
        return selectedDesignationObj?.name === 'Non-Academic Staff' ||
            selectedDesignationObj?.name === 'Accountant';

    };

    useEffect(() => {
        if (!isLoading && enums) {
            const fields: FormField[] = [
                { name: 'firstName', label: 'First Name', type: 'text', required: true, colSpan: 1 },
                { name: 'lastName', label: 'Last Name', type: 'text', required: true, colSpan: 1 },
                {
                    name: 'email', label: 'Email Address', type: 'email', required: true,
                    infoText: 'This will be used to send notifications and informations', colSpan: 1
                },
                { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: false, colSpan: 1 },
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
                    name: 'designation',
                    label: 'Designation',
                    type: 'select',
                    required: true,
                    colSpan: 1,
                    options: enums.StaffDesignation?.map(d => ({
                        value: d.value.toString(),
                        label: d.displayName || d.name
                    })) || [],
                    onChange: (value: string) => setSelectedDesignation(value)
                },
                {
                    name: 'employmentType',
                    label: 'Employment Type',
                    type: 'select',
                    required: true,
                    colSpan: 1,
                    options: enums.EmploymentType?.map(e => ({
                        value: e.value.toString(),
                        label: e.displayName || e.name
                    })) || []
                },
                {
                    name: 'subjectsTaught',
                    label: 'Subjects Taught',
                    type: 'multiselect',
                    required: !shouldHideSubjectsTaught(selectedDesignation), // Only required if field is visible
                    colSpan: 1,
                    options: subjects.map(subject => ({
                        value: subject.id.toString(),
                        label: subject.subjectName
                    })),
                    hidden: shouldHideSubjectsTaught(selectedDesignation)
                },
                {
                    name: 'maritalStatus',
                    label: 'Marital Status',
                    type: 'select',
                    required: false,
                    colSpan: 1,
                    options: enums.MaritalStatus?.map(m => ({
                        value: m.value.toString(),
                        label: m.displayName || m.name
                    })) || []
                },
                {
                    name: 'qualifications',
                    label: 'Qualifications',
                    type: 'select',
                    required: true,
                    colSpan: 1,
                    options: enums.Qualifications?.map(q => ({
                        value: q.value.toString(),
                        label: q.displayName || q.name
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
                { name: 'startDate', label: 'Start Date', type: 'date', required: true, colSpan: 1 },
                { name: 'address', label: 'Home Address', type: 'address', required: true, colSpan: 3 },
                {
                    name: 'phone',
                    label: 'Contact Phone',
                    type: 'phone',
                    required: true,
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
                    required: true,
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
                Go to Staff List
            </NavigationButton>
            <DynamicForm
                title="Staff Form"
                fields={formFields}
                onSubmit={handleSubmit}
                submitButtonText="Submit"
                columns={3}
            />
        </div>
    );
};

export default CreateStaff;