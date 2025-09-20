import React, { useEffect, useState } from 'react';
import BackButton from '../../../components/common/backButton';
import DynamicForm from '../../../components/common/my-form';
import { type FormField } from '../../../components/common/my-form';
import { useEnums } from '../../../hooks/useEnums';
import { createApiClient } from '../../../utils/apiClient';
import AlertMessage from '../../../components/common/message-display/message';
import { NavigationButton } from '../../../components/common/NavigationButton';
import { useAuth } from '../../../context';

const CreateStaff = () => {
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
                    text: 'Submitting staff data...',
                    severity: 'info'
                }
            });

            // Parse enum values to integers
            data.gender = parseInt(data.gender);
            data.role = parseInt(data.role);
            data.employmentType = parseInt(data.employmentType);
            data.maritalStatus = data.maritalStatus ? parseInt(data.maritalStatus) : undefined;
            data.qualifications = parseInt(data.qualifications);
            data.nationality = parseInt(data.nationality);

            // Transform phone data
            let phoneData = null;
            if (data.phone && typeof data.phone === 'object') {
                phoneData = {
                    Number: data.phone.number,
                    Extension: data.phone.extension || '',
                    PhoneType: parseInt(data.phone.phoneType),
                    Country: data.phone.country || ''
                };
            }

            // Transform address data
            let addressData = null;
            if (data.address1 && typeof data.address1 === 'object') {
                addressData = {
                    AddressLine1: data.address1.addressLine1,
                    AddressLine2: data.address1.addressLine2 || '',
                    City: data.address1.city || '',
                    State: data.address1.state || '',
                    ZipCode: data.address1.postalCode || '',
                    County: data.address1.county || '',
                    Country: data.address1.country || ''
                };
            }

            // Transform user locations
            let userLocations = [];
            if (data.userLocations && Array.isArray(data.userLocations)) {
                userLocations = data.userLocations.map((location: any) => ({
                    Id: location.id,
                    Name: location.name,
                    IsPrimaryLocation: location.isPrimaryLocation
                }));
            } else if (data.locationId) {
                // Fallback: create user location from locationId
                const selectedBranch = branches.find(b => b.id === data.locationId);
                userLocations = [{
                    Id: data.locationId,
                    Name: selectedBranch?.name || '',
                    IsPrimaryLocation: true
                }];
            }

            // Build the payload to match backend Request structure
            const payload = {
                Staff: {
                    FirstName: data.firstName,
                    LastName: data.lastName,
                    Email: data.email,
                    DateOfBirth: data.dateOfBirth || null,
                    Gender: data.gender,
                    Role: data.role,
                    EmploymentType: data.employmentType,
                    MaritalStatus: data.maritalStatus,
                    Qualifications: data.qualifications,
                    Nationality: data.nationality,
                    StartDate: data.startDate,
                    Address: addressData,
                    Phone: phoneData,
                    Notes: data.notes || '',
                    ProfilePictureId: data.profilePictureId || null,
                    UserLocations: userLocations
                }
            };

            console.log('Staff data ready for API:', payload);

            // Make API call to create staff
            const response = await apiClient.post('/v1/users/create-invite', payload);

            // Assuming success if response has UserId
            if (response.UserId) {
                setAlertMessage({
                    frontendMessage: {
                        text: 'Staff created successfully!',
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
                    text: 'Failed to create staff. Please try again.',
                    severity: 'error'
                },
                backendMessage: error.message ? {
                    text: error.message,
                    severity: 'error'
                } : null
            });
        }
    };

    const shouldHideSubjectsTaught = (designation: string | null) => {
        if (!designation || !enums?.UserRole) return false;

        const selectedDesignationObj = enums.UserRole.find(
            d => d.value.toString() === designation
        );

        return selectedDesignationObj?.name === 'Non-Academic Staff' ||
            selectedDesignationObj?.name === 'Accountant' ||
            selectedDesignationObj?.name === 'Parent' ||
            selectedDesignationObj?.name === 'Student';
    };

    const shouldHideSomeInputs = (designation: string | null) => {
        if (!designation || !enums?.UserRole) return false;

        const selectedDesignationObj = enums.UserRole.find(
            d => d.value.toString() === designation
        );

        return selectedDesignationObj?.name === 'Parent';
    };

    useEffect(() => {
        if (!isLoading && !isLoadingBranches && enums) {
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
                    name: 'role',
                    label: 'Role',
                    type: 'select',
                    required: true,
                    colSpan: 1,
                    options: enums.UserRole?.map(d => ({
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
                    })) || [],
                    hidden: shouldHideSomeInputs(selectedDesignation)
                },
                {
                    name: 'locationId',
                    label: 'Choose Branch',
                    type: 'select',
                    required: true,
                    colSpan: 1,
                    options: branches.map(b => ({
                        value: b.id,
                        label: b.name
                    }))
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
                    })) || [],
                    hidden: shouldHideSomeInputs(selectedDesignation)
                },
                {
                    name: 'qualifications',
                    label: 'Qualifications',
                    type: 'select',
                    required: !shouldHideSomeInputs(selectedDesignation),
                    colSpan: 1,
                    options: enums.Qualifications?.map(q => ({
                        value: q.value.toString(),
                        label: q.displayName || q.name
                    })) || [],
                    hidden: shouldHideSomeInputs(selectedDesignation)
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
                { name: 'startDate', label: 'Start Date', type: 'date', required: true, colSpan: 1, hidden: shouldHideSomeInputs(selectedDesignation), },
                { name: 'address1', label: 'Home Address', type: 'address', required: true, colSpan: 3 },
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
                Go to User List
            </NavigationButton>
            <DynamicForm
                title="User Form"
                fields={formFields}
                onSubmit={handleSubmit}
                submitButtonText="Submit"
                columns={3}
            />
        </div>
    );
};

export default CreateStaff;