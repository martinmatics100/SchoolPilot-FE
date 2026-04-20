import React, { useEffect, useState } from 'react';
import DynamicForm from '../../../../components/my-form';
import { type FormField } from '../../../../components/my-form';
import { useEnums } from '../../../../hooks/useEnums';
import { useAuth } from '../../../../context';
import { NavigationButton } from '../../../../components/navigation-button';
import MessageDisplay from '../../../../components/message-display';
import { fetchSubjects, fetchBranches, createStaff } from '../../../../api/userService';
import { type UserModel, type Branch, type Subject } from '../../../../types/interfaces/i-user';


const CreateStaff = () => {
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });
    const { apiClient, selectedAccount } = useAuth();
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
    const [isLoadingBranches, setIsLoadingBranches] = useState(true);
    const [selectedDesignation, setSelectedDesignation] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});
    const [submittedData, setSubmittedData] = useState<{ firstName: string; lastName: string } | null>(null);

    useEffect(() => {
        const loadSubjects = async () => {
            try {
                const subjectsData = await fetchSubjects();
                setSubjects(subjectsData);
            } catch (error) {
                console.error('Error fetching subjects:', error);
                setAlertMessage({
                    feMessage: 'Failed to load subjects. Please refresh the page.'
                });
            } finally {
                setIsLoadingSubjects(false);
            }
        };

        loadSubjects();
    }, []);

    useEffect(() => {
        const loadBranches = async () => {
            if (selectedAccount) {
                setIsLoadingBranches(true);
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
                feMessage: 'Submitting staff data...'
            });

            setSubmittedData({
                firstName: data.firstName,
                lastName: data.lastName
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
                const selectedBranch = branches.find(b => b.id === data.locationId);
                userLocations = [{
                    Id: data.locationId,
                    Name: selectedBranch?.name || '',
                    IsPrimaryLocation: true
                }];
            }

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

            const response = await createStaff(apiClient, payload);

            if (response.userId) {
                setAlertMessage({
                    feMessage: `User ${data.lastName}, ${data.firstName} has been created successfully!`,
                    httpStatus: 200
                });
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error: any) {
            console.error('Error submitting form:', error);
            setAlertMessage({
                feMessage: 'Failed to create staff. Please try again.',
                beMessage: error.message || 'Unknown error occurred',
                httpStatus: error.status || 500
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
                { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Enter User First Name', colSpan: 1 },
                { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter User Last Name', colSpan: 1 },
                {
                    name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter User Valid Email Address', required: true,
                    infoText: 'This will be used to send notifications and informations', colSpan: 1
                },
                { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: false, colSpan: 1 },
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
                    name: 'role',
                    label: 'Role',
                    type: 'select',
                    required: true,
                    placeholder: 'Select User Role',
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
                    placeholder: 'Select Employment Type',
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
                    infoText: 'This is to assign the User to the associated school location',
                    type: 'select',
                    required: true,
                    placeholder: 'Select School Location',
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
                    placeholder: 'Select Marital Status',
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
                    placeholder: 'Select Education Qualification',
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
                    placeholder: 'Select Nationality',
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
            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />
            <NavigationButton
                to="/app/users"
                sx={{ alignContent: 'flex-end' }}
                variant='outlined'
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