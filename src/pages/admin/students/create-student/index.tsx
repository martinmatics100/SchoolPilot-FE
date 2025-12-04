import React, { useEffect, useState } from 'react';
import DynamicForm from '../../../../components/my-form';
import { type FormField } from '../../../../components/my-form';
import { useEnums } from '../../../../hooks/useEnums';
import { useAuth } from '../../../../context';
import MessageDisplay from '../../../../components/message-display';
import { NavigationButton } from '../../../../components/navigation-button';
import { fetchBranches } from '../../../../api/userService';
import { createStudent } from '../../../../api/studentService';
import { type StudentPayload } from '../../../../types/interfaces/i-student';
import { type Branch } from '../../../../types/interfaces/i-user';


const CreateStudent = () => {
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });
    const { apiClient, selectedAccount } = useAuth();
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [subjects, setSubjects] = useState<Array<{ id: string, subjectName: string }>>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoadingBranches, setIsLoadingBranches] = useState(true);
    const [selectedDesignation, setSelectedDesignation] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});

    useEffect(() => {
        const loadBranches = async () => {
            if (selectedAccount) {
                setIsLoadingBranches(true);
                setAlertMessage({});
                try {
                    const fetchedBranches = await fetchBranches(selectedAccount, apiClient);
                    setBranches(fetchedBranches);
                } catch (err) {
                    console.error('Failed to fetch branches:', err);
                    setAlertMessage({
                        feMessage: 'Failed to load branches. Please try again later.',
                        httpStatus: 500
                    });
                } finally {
                    setIsLoadingBranches(false);
                }
            }
        };
        loadBranches();
    }, [apiClient, selectedAccount]);

    const handleSubmit = async (data: any) => {
        try {
            setAlertMessage({
                feMessage: 'Submitting student data...'
            });

            // Parse enum values to integers
            data.gender = parseInt(data.gender);
            data.nationality = parseInt(data.nationality);

            // Build the payload to match backend Request structure
            const payload: StudentPayload = {
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

            const response = await createStudent(apiClient, payload);

            if (response.StudentId || response.studentId) {
                setAlertMessage({
                    feMessage: `Student ${data.lastName}, ${data.firstName} has been created successfully!`,
                    httpStatus: 200
                });
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error: any) {
            console.error('Error submitting form:', error);
            setAlertMessage({
                feMessage: 'Failed to create student. Please try again.',
                beMessage: error.message || 'Unknown error occurred',
                httpStatus: error.status || 500
            });
        }
    };

    useEffect(() => {
        if (!isLoading && !isLoadingBranches && enums) {
            const fields: FormField[] = [
                { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Enter Student First Name', colSpan: 1 },
                { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter Student Last Name', colSpan: 1 },
                { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, colSpan: 1 },
                {
                    name: 'gender',
                    label: 'Gender',
                    type: 'select',
                    required: true,
                    placeholder: 'Select Gender',
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
                    placeholder: 'Select Nationality',
                    colSpan: 1,
                    options: enums.Nationality?.map(n => ({
                        value: n.value.toString(),
                        label: n.displayName || n.name
                    })) || []
                },
                {
                    name: 'locationId',
                    label: 'Branch',
                    infoText: 'This is to assign the student to the associated school location',
                    type: 'select',
                    required: true,
                    placeholder: 'Select School Location',
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
            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />
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