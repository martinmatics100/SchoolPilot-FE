import React, { useEffect, useState } from 'react';
import DynamicForm, { type FormField } from '../../../../components/my-form';
import MessageDisplay from '../../../../components/message-display';
import { NavigationButton } from '../../../../components/navigation-button';
import { useEnums } from '../../../../hooks/useEnums';
import { useAuth } from '../../../../context';
import { fetchClasses } from '../../../../api/classServices';
import { fetchTeachers } from '../../../../api/classServices';
import { createSubject } from '../../../../api/subjectServies';

const CreateSubject = () => {
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });
    const { apiClient, selectedAccount } = useAuth();

    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [alertMessage, setAlertMessage] = useState<any>({});
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

    // Fetch classes
    useEffect(() => {
        const loadClasses = async () => {
            if (selectedAccount) {
                setIsLoadingClasses(true);
                try {
                    const fetched = await fetchClasses(selectedAccount);
                    setClasses(
                        fetched.map((c: any) => ({
                            value: c.id,
                            label: c.className
                        }))
                    );
                } catch (err) {
                    setAlertMessage({
                        feMessage: 'Unable to load classes.',
                        httpStatus: 500
                    });
                } finally {
                    setIsLoadingClasses(false);
                }
            }
        };
        loadClasses();
    }, [selectedAccount]);

    // Fetch teachers
    useEffect(() => {
        const loadTeachers = async () => {
            if (selectedAccount && enums) {
                setIsLoadingTeachers(true);
                try {
                    const fetched = await fetchTeachers(selectedAccount, enums, {
                        excludeAssignedTeachers: false,
                    });
                    setTeachers(
                        fetched.map((t: any) => ({
                            value: t.id,
                            label: `${t.firstName} ${t.lastName}`
                        }))
                    );
                } catch (err) {
                    setAlertMessage({
                        feMessage: 'Unable to load teachers.',
                        httpStatus: 500
                    });
                } finally {
                    setIsLoadingTeachers(false);
                }
            }
        };
        loadTeachers();
    }, [selectedAccount, enums]);

    // Build form
    useEffect(() => {
        if (!isLoading && !isLoadingClasses && !isLoadingTeachers && enums) {
            const fields: FormField[] = [
                {
                    name: 'subject',
                    label: 'Subject Name',
                    type: 'select',
                    required: true,
                    placeholder: 'Select Subject',
                    colSpan: 1,
                    options: enums.AcademicSubjects?.map(s => ({
                        value: s.value.toString(),
                        label: s.displayName || s.name
                    })) || []
                },
                {
                    name: 'classIds',
                    label: 'Classes Offering Subject',
                    type: 'multiselect',
                    required: true,
                    placeholder: 'Select Classes',
                    colSpan: 2,
                    options: classes
                },
                {
                    name: 'userAffiliationId',
                    label: 'Subject Teacher',
                    type: 'select',
                    required: true,
                    placeholder: 'Select Teacher',
                    colSpan: 1,
                    options: teachers
                },
                {
                    name: 'fullMarkObtanable',
                    label: 'Total Marks Obtainable',
                    type: 'number',
                    required: true,
                    placeholder: '1 - 100',
                    colSpan: 1
                },
                {
                    name: 'passMark',
                    label: 'Pass Mark',
                    type: 'number',
                    required: true,
                    placeholder: '1 - 100',
                    colSpan: 1
                },
                // {
                //     name: 'isPrerequisite',
                //     label: 'Is Prerequisite?',
                //     type: 'checkbox',
                //     required: false,
                //     colSpan: 1
                // }
            ];

            setFormFields(fields);
        }
    }, [enums, isLoading, isLoadingClasses, isLoadingTeachers, classes, teachers]);

    // Handle submission
    const handleSubmit = async (data: any) => {
        try {
            setAlertMessage({ feMessage: 'Submitting subject data...' });

            const payload = {
                subject: parseInt(data.subject),
                classIds: data.classIds,
                userAffiliationId: data.userAffiliationId,
                fullMarkObtanable: parseInt(data.fullMarkObtanable),
                passMark: parseInt(data.passMark),
                isPrerequisite: Boolean(data.isPrerequisite)
            };

            await createSubject(apiClient, payload);

            setAlertMessage({
                feMessage: 'Subject created successfully!',
                httpStatus: 200
            });
        } catch (err: any) {
            setAlertMessage({
                feMessage: 'Failed to create subject.',
                beMessage: err.message,
                httpStatus: 500
            });
        }
    };

    if (isLoading || isLoadingClasses || isLoadingTeachers || formFields.length === 0) {
        return <div>Loading form...</div>;
    }

    return (
        <div>
            <MessageDisplay {...alertMessage} />

            <NavigationButton to="">
                Go to Subject List
            </NavigationButton>

            <DynamicForm
                title="Create Subject"
                fields={formFields}
                onSubmit={handleSubmit}
                submitButtonText="Submit"
                columns={3}
            />
        </div>
    );
};

export default CreateSubject;
