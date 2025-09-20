import React, { useEffect, useState } from 'react';
import BackButton from '../../../components/common/backButton';
import DynamicForm from '../../../components/common/my-form';
import { type FormField } from '../../../components/common/my-form';
import { useEnums } from '../../../hooks/useEnums';
import { useAuth } from '../../../context';
import AlertMessage from '../../../components/common/message-display/message';
import { NavigationButton } from '../../../components/common/NavigationButton';
import { API_BASE_URL } from '../../../utils/apiClient';

const CreateStudent = () => {
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });
    const { apiClient, selectedAccount } = useAuth();
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [subjects, setSubjects] = useState<Array<{ id: string, subjectName: string }>>([]);
    const [branches, setBranches] = useState<Array<{ id: string, name: string }>>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
    const [isLoadingBranches, setIsLoadingBranches] = useState(true);
    const [selectedDesignation, setSelectedDesignation] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{
        frontendMessage?: { text: string; severity: 'error' | 'warning' | 'info' | 'success' } | null;
        backendMessage?: { text: string; severity: 'error' | 'warning' | 'info' | 'success' } | null;
    }>({ frontendMessage: null, backendMessage: null });

    useEffect(() => {
        const fetchBranches = async () => {
            if (selectedAccount) {
                setIsLoadingBranches(true);
                setAlertMessage({ frontendMessage: null, backendMessage: null });
                try {
                    const response = await apiClient.getDefaultSchools(selectedAccount);
                    const fetchedBranches = response.regularSchools.flatMap(school =>
                        school.locations.map((location: any) => ({
                            id: location.id,
                            name: location.name
                        }))
                    );
                    setBranches(fetchedBranches);
                } catch (err) {
                    console.error('Failed to fetch branches:', err);
                    setAlertMessage({
                        frontendMessage: {
                            text: 'Failed to load branches. Please try again later.',
                            severity: 'error'
                        }
                    });
                } finally {
                    setIsLoadingBranches(false);
                }
            }
        };
        fetchBranches();
    }, [apiClient, selectedAccount]);

    const handleSubmit = async (data: any) => {
        try {
            setAlertMessage({
                frontendMessage: {
                    text: 'Submitting student data...',
                    severity: 'info'
                }
            });

            // Parse enum values to integers
            data.gender = parseInt(data.gender);
            data.nationality = parseInt(data.nationality);

            // Build the payload to match backend Request structure
            const payload = {
                Student: {
                    FirstName: data.firstName,
                    LastName: data.lastName,
                    DateOfBirth: data.dateOfBirth,
                    Gender: data.gender,
                    Nationality: data.nationality,
                    Address: data.address,
                    Phone: data.phone,
                    StudentLocation: data.locationId
                }
            };

            console.log('Student data ready for API:', payload);

            const response = await apiClient.post('/v1/students/create', payload);

            // Assuming success if response has StudentId
            if (response.StudentId) {
                setAlertMessage({
                    frontendMessage: {
                        text: 'Student created successfully!',
                        severity: 'success'
                    }
                });
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error: any) {
            console.error('Error submitting form:', error);
            setAlertMessage({
                frontendMessage: {
                    text: 'Failed to create student. Please try again.',
                    severity: 'error'
                },
                backendMessage: error.message ? {
                    text: error.message,
                    severity: 'error'
                } : null
            });
        }
    };

    useEffect(() => {
        if (!isLoading && !isLoadingBranches && enums) {
            const fields: FormField[] = [
                { name: 'firstName', label: 'First Name', type: 'text', required: true, colSpan: 1 },
                { name: 'lastName', label: 'Last Name', type: 'text', required: true, colSpan: 1 },
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
                {
                    name: 'locationId',
                    label: 'Choose School Branch',
                    infoText: 'This is to assign the student to the associated school location',
                    type: 'select',
                    required: true,
                    colSpan: 1,
                    options: branches.map(b => ({
                        value: b.id,
                        label: b.name
                    }))
                },
                { name: 'address', label: 'Home Address', type: 'address', required: false, colSpan: 3 },
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
    }, [enums, isLoading, isLoadingBranches, selectedDesignation, subjects, branches]);

    if (isLoading || isLoadingBranches || formFields.length === 0) {
        return <div>Loading form...</div>;
    }

    return (
        <div>
            <AlertMessage
                frontendMessage={alertMessage.frontendMessage}
                backendMessage={alertMessage.backendMessage}
                autoHideDuration={5000}
                onClose={() => setAlertMessage({ frontendMessage: null, backendMessage: null })}
            />
            <BackButton />
            <NavigationButton
                to=""
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
    );
};

export default CreateStudent;