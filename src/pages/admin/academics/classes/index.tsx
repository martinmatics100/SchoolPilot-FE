import React, { useEffect, useState, useMemo } from 'react';
import { ReusableTable, type Column } from '../../../../components/table';
import { useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person'; // Teacher icon
import { NavigationButton } from '../../../../components/navigation-button';
import { getInitialAuthData } from '../../../../utils/apiClient';
import { useEnums } from '../../../../hooks/useEnums';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { fetchClasses, deleteClass, createClass } from '../../../../api/classServices';
import { type ClassModel } from '../../../../types/interfaces/i-class';
import { ClassSelectionModal } from '../../../../components/class-selection-modal';
import { createApiClient } from '../../../../utils/apiClient';
import { AssignTeacherModal } from '../../../../components/assign-teachers-modal';
import { fetchTeachers, assignTeacherToClass } from '../../../../api/classServices';

const AVAILABLE_CLASS_TEMPLATES: ClassModel[] = [
    { id: '1', className: 'Primary 1', classLevel: 'Primary', formTeacher: '', rawClassLevel: 2 },
    { id: '2', className: 'Primary 2', classLevel: 'Primary', formTeacher: '', rawClassLevel: 2 },
    { id: '3', className: 'Primary 3', classLevel: 'Primary', formTeacher: '', rawClassLevel: 2 },
    { id: '4', className: 'Primary 4', classLevel: 'Primary', formTeacher: '', rawClassLevel: 2 },
    { id: '5', className: 'Primary 5', classLevel: 'Primary', formTeacher: '', rawClassLevel: 2 },
    { id: '6', className: 'Primary 6', classLevel: 'Primary', formTeacher: '', rawClassLevel: 2 },
    { id: '7', className: 'JSS 1', classLevel: 'JuniorSecondary', formTeacher: '', rawClassLevel: 3 },
    { id: '8', className: 'JSS 2', classLevel: 'JuniorSecondary', formTeacher: '', rawClassLevel: 3 },
    { id: '9', className: 'JSS 3', classLevel: 'JuniorSecondary', formTeacher: '', rawClassLevel: 3 },
    { id: '10', className: 'SSS 1', classLevel: 'SeniorSecondary', formTeacher: '', rawClassLevel: 4 },
    { id: '11', className: 'SSS 2', classLevel: 'SeniorSecondary', formTeacher: '', rawClassLevel: 4 },
    { id: '12', className: 'SSS 3', classLevel: 'SeniorSecondary', formTeacher: '', rawClassLevel: 4 },
];

const Classes = () => {
    const [data, setData] = useState<ClassModel[]>([]);
    const [rawClasses, setRawClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [assigningTeacher, setAssigningTeacher] = useState(false);

    const theme = useTheme();
    const { selectedAccount } = getInitialAuthData();
    const { enums, isLoading: isEnumsLoading } = useEnums({ fetchPermissionData: false });

    const handleAssignTeacher = (id: string) => {
        setSelectedClassId(id);
        setAssignModalOpen(true);
    };

    const handleAssignTeacherSubmit = async (teacherId: string) => {
        if (!selectedClassId) return;

        setAssigningTeacher(true);
        try {
            await assignTeacherToClass(selectedAccount, selectedClassId, teacherId);

            setAssignModalOpen(false);
            setSelectedClassId(null);

            await loadClasses();  // reload class list to show updated teacher
        } catch (error) {
            console.error('Error assigning teacher:', error);
            alert('Failed to assign teacher.');
        } finally {
            setAssigningTeacher(false);
        }
    };

    const classLevelMap = useMemo(() => {
        return (
            enums?.SchoolLevel?.reduce(
                (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    useEffect(() => {
        if (selectedAccount) {
            loadClasses();
        } else {
            console.error('No account selected');
            setData([]);
        }
    }, [selectedAccount]);

    useEffect(() => {
        if (rawClasses.length > 0 && !isEnumsLoading && Object.keys(classLevelMap).length > 0) {
            processClassData();
        }
    }, [rawClasses, isEnumsLoading, classLevelMap]);

    const loadClasses = () => {
        setLoading(true);
        fetchClasses(selectedAccount)
            .then((classesData) => {
                setRawClasses(classesData);
                if (!isEnumsLoading && classesData.length > 0) {
                    processClassData(classesData);
                }
            })
            .catch((error) => {
                console.error('Error fetching classes:', error);
                setData([]);
            })
            .finally(() => setLoading(false));
    };

    const processClassData = (classesData?: any[]) => {
        const dataToProcess = classesData || rawClasses;

        if (dataToProcess.length === 0) {
            setData([]);
            return;
        }

        const mappedData = dataToProcess.map((item: any) => {
            const classLevelValue = item.classLevel?.toString();
            const classLevelName = classLevelMap[classLevelValue] || `Level ${item.classLevel}`;

            return {
                id: item.id,
                className: item.className ? item.className.toUpperCase() : 'NOT AVAILABLE',
                classLevel: classLevelName ? classLevelName.toUpperCase() : 'NOT AVAILABLE',
                formTeacher: item.formTeacher ? item.formTeacher.toUpperCase() : '-',
                rawClassLevel: item.classLevel,
            };
        });

        console.log('Processed class data:', mappedData);
        setData(mappedData);
    };

    const handleAddClasses = async (selectedClasses: ClassModel[]) => {
        if (!selectedAccount) {
            alert('No account selected');
            return;
        }

        setIsCreating(true);
        try {
            const apiClient = createApiClient({ selectedAccount });

            // Prepare payload according to backend expectation
            const payload = {
                Classes: selectedClasses.map(cls => ({
                    ClassName: cls.className,
                    ClassLevel: cls.rawClassLevel
                }))
            };

            console.log('Sending payload to backend:', payload);

            const response = await createClass(apiClient, payload);

            console.log('Backend response:', response);

            if (response && (response.status === 200 || response.classIds)) {
                // Success - close modal first, then reload data
                setModalOpen(false);

                // Reload classes to get the newly created ones with their actual IDs
                await loadClasses();

                // Show success message
                // alert(`Successfully created ${response.classIds.length} classes!`);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error creating classes:', error);
            // alert('Failed to create classes. Please try again.');
            // Don't close modal on error so user can try again
        } finally {
            setIsCreating(false);
        }
    };

    const handleEdit = (id: string) => {
        console.log('Edit class:', id);
    };

    // const handleAssignTeacher = (id: string) => {
    //     console.log('Assign teacher to class:', id);
    //     // You can implement a modal or dialog for teacher assignment here
    //     alert(`Assign teacher functionality for class ID: ${id}`);
    // };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this class?')) {
            return;
        }

        try {
            await deleteClass(selectedAccount, id);
            setData((prev) => prev.filter((cls) => cls.id !== id));
        } catch (error) {
            console.error('Error deleting class:', error);
            alert('Failed to delete class. Please try again.');
        }
    };

    const columns: Column[] = [
        {
            id: 'className',
            label: 'Class Name',
            minWidth: 150,
            sortable: true,
            format: (value: string) => value || 'Not available',
        },
        {
            id: 'classLevel',
            label: 'Class Level',
            minWidth: 150,
            sortable: true,
            format: (value: string, row: ClassModel) => (
                <span>
                    {classLevelMap[row.rawClassLevel.toString()] || value}
                </span>
            ),
        },
        {
            id: 'formTeacher',
            label: 'Form Teacher',
            minWidth: 150,
            sortable: true,
            format: (value: string) => value || 'Not assigned',
        },
    ];

    const actionColumn = {
        label: 'Actions',
        minWidth: 200,
        align: 'center' as const,
        render: (row: ClassModel) => {
            const hasTeacher = row.formTeacher && row.formTeacher !== '-';
            const title = hasTeacher ? "Reassign Form Teacher" : "Assign Form Teacher";

            return (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <IconButton
                        aria-label={title}
                        onClick={() => handleAssignTeacher(row.id)}
                        title={title}
                        size="small"
                    >
                        <PersonIcon color={hasTeacher ? "secondary" : "primary"} />
                    </IconButton>

                    {/* <IconButton
                        aria-label="delete"
                        onClick={() => handleDelete(row.id)}
                        title="Delete Class"
                        size="small"
                    >
                        <DeleteIcon color="error" />
                    </IconButton> */}
                </div>
            );
        },
    };


    if (loading || isEnumsLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <h1>Classes</h1>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginBottom: '16px',
                }}
            >
                <NavigationButton
                    onClick={() => setModalOpen(true)}
                    sx={{ alignContent: 'flex-end' }}
                >
                    <AddIcon />
                </NavigationButton>
            </div>

            <ReusableTable
                title="Class List"
                columns={columns}
                data={data}
                showActionColumn={true}
                actionColumn={actionColumn}
                loading={loading || isEnumsLoading}
                showCheckboxes={false}
                showSorting={false}
                showPagination={true}
            />

            <ClassSelectionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleAddClasses}
                availableClasses={AVAILABLE_CLASS_TEMPLATES}
                existingClasses={data}
                isSubmitting={isCreating}
            />

            <AssignTeacherModal
                open={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                onAssign={handleAssignTeacherSubmit}
                fetchTeachers={() => fetchTeachers(selectedAccount, enums)}
                isSubmitting={assigningTeacher}
            />
        </div>
    );
};

export default Classes;