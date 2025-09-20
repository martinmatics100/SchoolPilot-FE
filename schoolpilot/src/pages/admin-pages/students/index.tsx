import React, { useEffect, useState, useMemo } from 'react';
import { ReusableTable, type Column } from '../../../components/common/table-component';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SchoolIcon from '@mui/icons-material/School';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { NavigationButton } from '../../../components/common/NavigationButton';
import { createApiClient, getInitialAuthData } from '../../../utils/apiClient';
import { useEnums } from '../../../hooks/useEnums';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    status: string;
    studentId: string;
    class: string;
    rawGender: number;
    rawStatus: number;
    schoolName: string;
}

// Define status configuration with icons and colors
const statusConfig = {
    active: {
        icon: CheckCircleIcon,
        color: 'success',
        textColor: 'green'
    },
    graduated: {
        icon: SchoolIcon,
        color: 'success',
        textColor: 'green'
    },
    transferred: {
        icon: SwapHorizIcon,
        color: 'info',
        textColor: '#1976d2' // Blue
    },
    withdrawn: {
        icon: ExitToAppIcon,
        color: 'warning',
        textColor: '#ed6c02' // Orange
    },
    suspended: {
        icon: DoNotDisturbIcon,
        color: 'warning',
        textColor: '#ed6c02' // Orange
    },
    expelled: {
        icon: CancelIcon,
        color: 'error',
        textColor: 'red'
    },
    default: {
        icon: CancelIcon,
        color: 'error',
        textColor: 'red'
    }
};

const StudentList = () => {
    const [data, setData] = useState<Student[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState<string>('studentfullName');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [loading, setLoading] = useState(false);
    const [rawStudents, setRawStudents] = useState<any[]>([]);

    const theme = useTheme();
    const { selectedAccount } = getInitialAuthData();
    const { enums, isLoading: isEnumsLoading } = useEnums({ fetchPermissionData: false });

    const studentStatusMap = useMemo(() => {
        return enums?.StudentStatus?.reduce(
            (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            },
            {}
        ) || {};
    }, [enums]);

    const genderMap = useMemo(() => {
        return enums?.Gender?.reduce(
            (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            },
            {}
        ) || {};
    }, [enums]);

    // Helper function to get status configuration
    const getStatusConfig = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        return statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.default;
    };

    useEffect(() => {
        if (selectedAccount) {
            fetchStudents();
        }
    }, [page, rowsPerPage, sortBy, order, selectedAccount]);

    useEffect(() => {
        if (rawStudents.length > 0 && !isEnumsLoading) {
            processStudentData();
        }
    }, [rawStudents, isEnumsLoading, studentStatusMap, genderMap]);

    const fetchStudents = async () => {
        if (!selectedAccount) {
            console.error('No account selected');
            setData([]);
            setTotalCount(0);
            return;
        }

        setLoading(true);
        try {
            const api = createApiClient({ selectedAccount });
            const response = await api.get(`/v1/students?page=${page}&pageLength=${rowsPerPage}`);
            console.log('API Response:', response);

            setRawStudents(response.items || []);
            setTotalCount(response.itemCount || 0);

        } catch (error) {
            console.error('Error fetching students:', error);
            setData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const processStudentData = () => {
        const mappedData = rawStudents.map((item: any) => {
            const genderValue = item.gender?.toString();
            const statusValue = item.status?.toString();

            // Get the status name from enum map
            const statusName = studentStatusMap[statusValue] || 'Unknown';

            return {
                id: item.id,
                firstName: item.firstName || 'Not available',
                lastName: item.lastName || 'Not available',
                schoolName: item.schoolName,
                gender: genderMap[genderValue] || 'Not available',
                status: statusName.toLowerCase(),
                studentId: item.studentId || 'pending',
                class: item.className || 'not available',
                rawGender: item.gender,
                rawStatus: item.status,
            };
        });

        setData(mappedData);
    };

    const columns: Column[] = [
        {
            id: 'studentfullName',
            label: 'Student Name',
            minWidth: 150,
            sortable: false,
            format: (value, row: Student) => (
                <div>
                    <h4 style={{ display: 'flex', gap: 6 }}>{row.lastName}, {row.firstName}</h4>
                    <h6 style={{ color: theme.palette.text.primary }}>
                        <span style={{ color: theme.palette.info.dark }}>STUDENT ID:</span> {row.studentId}
                    </h6>
                </div>
            ),
        },
        {
            id: 'gender',
            label: 'Gender',
            minWidth: 120,
            sortable: false,
            format: (value: string, row: Student) => {
                if (!isEnumsLoading && enums) {
                    return genderMap[row.rawGender?.toString()] || 'Not available';
                }
                return value;
            },
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            align: 'center',
            format: (value: string, row: Student) => {
                // Get the current status value
                const currentStatus = !isEnumsLoading && enums
                    ? (studentStatusMap[row.rawStatus?.toString()] || 'Unknown').toLowerCase()
                    : value;

                // Get the appropriate configuration for this status
                const config = getStatusConfig(currentStatus);
                const StatusIcon = config.icon;

                return (
                    <span
                        style={{
                            color: config.textColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <StatusIcon color={config.color as any} />
                        <span style={{ marginLeft: 4, textTransform: 'capitalize' }}>
                            {currentStatus}
                        </span>
                    </span>
                );
            },
        },
        {
            id: 'class',
            label: 'Class',
            minWidth: 150,
            sortable: false,
            format: (value: string) => value || 'Not available',
        },
        {
            id: 'schoolName',
            label: 'School Name',
            minWidth: 150,
            sortable: false,
            format: (value: string) => value || 'Not available',
        }
    ];

    const actionColumn = {
        label: 'Actions',
        minWidth: 150,
        align: 'center' as const,
        render: (row: Student) => (
            <div>
                <IconButton aria-label="edit" onClick={() => handleEdit(row.id)}>
                    <EditIcon color="primary" />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon color="error" />
                </IconButton>
            </div>
        ),
    };

    const handleEdit = (id: string) => {
        console.log('Edit student:', id);
    };

    const handleDelete = async (id: string) => {
        console.log('Delete student:', id);
        try {
            const api = createApiClient({ selectedAccount });
            await api.delete(`/v1/students/${id}`);
            await fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    const handleSortChange = (sortByField: string, sortOrder: 'asc' | 'desc') => {
        setSortBy(sortByField);
        setOrder(sortOrder);
        setPage(1);
    };

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage + 1);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    if (isEnumsLoading && loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <NavigationButton
                to="create-student"
                startIcon={<AddIcon />}
                sx={{ alignContent: 'flex-end' }}
            >
                Create Student
            </NavigationButton>
            <ReusableTable
                title="Students List"
                columns={columns}
                data={data}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                showActionColumn={true}
                actionColumn={actionColumn}
                sortBy={sortBy}
                order={order}
                onSortChange={handleSortChange}
                onSelectedRowsChange={(selected) => console.log('Selected rows:', selected)}
                page={page - 1}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                totalCount={totalCount}
                loading={loading || isEnumsLoading}
            />
        </div>
    );
};

export default StudentList;