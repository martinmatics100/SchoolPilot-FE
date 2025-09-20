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
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { createApiClient, getInitialAuthData } from '../../../utils/apiClient';
import { useEnums } from '../../../hooks/useEnums';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';



interface UserModel {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    role: string;
    status: string;
    userId: string;
    rawGender: number;
    rawStatus: number;
    rawRole: number;
    schoolName: string;
}

// Define status configuration with icons and colors
const statusConfig = {
    active: {
        icon: CheckCircleIcon,
        color: 'success',
        textColor: 'green'
    },
    default: {
        icon: CancelIcon,
        color: 'error',
        textColor: 'red'
    }
};

const Index = () => {
    const [data, setData] = useState<UserModel[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = React.useState<string>('username');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [snackbar, setSnackbar] = React.useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });
    const [rawUsers, setRawUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);


    const theme = useTheme();
    const { selectedAccount } = getInitialAuthData();
    const { enums, isLoading: isEnumsLoading } = useEnums({ fetchPermissionData: false });

    const userStatusMap = useMemo(() => {
        return enums?.UserStatus?.reduce(
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

    const roleMap = useMemo(() => {
        return enums?.UserRole?.reduce(
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
        if (rawUsers.length > 0 && !isEnumsLoading) {
            processUserData();
        }
    }, [rawUsers, isEnumsLoading, userStatusMap, genderMap]);

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
            const response = await api.get(`/v1/users?page=${page}&pageLength=${rowsPerPage}`);
            console.log('API Response:', response);

            setRawUsers(response.items || []);
            setTotalCount(response.itemCount || 0);

        } catch (error) {
            console.error('Error fetching students:', error);
            setData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const processUserData = () => {
        const mappedData = rawUsers.map((item: any) => {
            const genderValue = item.gender?.toString();
            const roleValue = item.role?.toString();
            const statusValue = item.status?.toString();

            // Get the display names from enum maps
            const statusName = userStatusMap[statusValue] || 'Unknown';
            const genderName = genderMap[genderValue] || 'Not available';
            const roleName = roleMap[roleValue] || 'Not available';

            return {
                id: item.id,
                firstName: item.firstName || 'Not available',
                lastName: item.lastName || 'Not available',
                email: item.email || 'Not available',
                schoolName: item.schoolName,
                gender: genderName,
                role: roleName,
                status: statusName.toLowerCase(),
                userId: item.UserId || 'pending',
                rawGender: item.gender,
                rawStatus: item.status,
                rawRole: roleMap[roleValue] || 'Not available',
            };
        });

        setData(mappedData);
    };

    const columns: Column[] = [
        {
            id: 'fullName',
            label: 'Full Name',
            minWidth: 150,
            sortable: true,
            format: (value, row: UserModel) => (
                <div>
                    <h4 style={{ display: 'flex', gap: 6 }}>{row.lastName}, {row.firstName}</h4>
                    <h6 style={{ color: theme.palette.text.primary }}>
                        <span style={{ color: theme.palette.info.dark }}>USER ID:</span> {row.userId}
                    </h6>
                </div>
            ),
        },
        {
            id: 'email',
            label: 'Email',
            minWidth: 150,
            sortable: true,
            format: (value: string) => value || 'Not available',
        },
        {
            id: 'gender',
            label: 'Gender',
            minWidth: 100,
            sortable: true,
            format: (value: string) => value || 'Not available',
        },
        {
            id: 'role',
            label: 'Role',
            minWidth: 100,
            sortable: true,
            format: (value: string) => value || 'Not available',
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            align: 'center',
            format: (value: string, row: UserModel) => {
                // Get the current status value
                const currentStatus = !isEnumsLoading && enums
                    ? (userStatusMap[row.rawStatus?.toString()] || 'Unknown').toLowerCase()
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
            id: 'schoolName',
            label: 'School',
            minWidth: 150,
            sortable: true,
            format: (value: string) => value || 'Not available',
        },
    ];

    const actionColumn = {
        label: 'Actions',
        minWidth: 150,
        align: 'center' as const,
        render: (row: any) => (
            <div>
                <IconButton
                    aria-label="edit"
                    onClick={() => handleEdit(row.Id)}
                >
                    <EditIcon color="primary" />
                </IconButton>
                <IconButton
                    aria-label="delete"
                    onClick={() => handleDelete(row.Id)}
                >
                    <DeleteIcon color="error" />
                </IconButton>
            </div>
        ),
    };

    const handleEdit = (username: string) => {
        console.log('Edit user:', username);
    };

    const handleDelete = (id: string) => {
        console.log('Delete user:', id);
        // Optionally update userData here for single row deletion
        setData((prev) => prev.filter((user) => user.id !== id));
    };

    const handleDeleteSelected = async () => {
        if (selectedRows.length === 0) return;

        setIsDeleting(true);
        try {
            const response = await fetch('/api/users/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usernames: selectedRows }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete users');
            }

            setData((prev) =>
                prev.filter((user) => !selectedRows.includes(user.id))
            );
            setSelectedRows([]);
            setSnackbar({
                open: true,
                message: `Successfully deleted ${selectedRows.length} user(s)`,
                severity: 'success',
            });
        } catch (error) {
            console.error('Error deleting users:', error);
            setSnackbar({
                open: true,
                message: 'Failed to delete users',
                severity: 'error',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // const handleSortChange = (sortByField: string, sortOrder: 'asc' | 'desc') => {
    //     setSortBy(sortByField);
    //     setOrder(sortOrder);
    //     console.log('Request new data sorted by:', sortByField, 'order:', sortOrder);
    // };

    const handleSnackbarClose = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const handleSortChange = (sortByField: string, sortOrder: 'asc' | 'desc') => {
        setSortBy(sortByField);
        setOrder(sortOrder);
        setPage(1);
        console.log('Request new data sorted by:', sortByField, 'order:', sortOrder);
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
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginBottom: '16px',
                }}
            >
                <NavigationButton
                    onClick={handleDeleteSelected}
                    startIcon={<DeleteIcon />}
                    sx={{
                        alignContent: 'flex-end',
                        backgroundColor: 'red',
                        color: 'white',
                        '&:hover': { backgroundColor: '#cc0000' },
                        '&.Mui-disabled': {
                            backgroundColor: '#ff6666',
                            color: '#cccccc',
                        },
                    }}
                    disabled={selectedRows.length === 0 || isDeleting}
                >
                    Delete Selected ({selectedRows.length})
                </NavigationButton>
                <NavigationButton
                    to="create-staff"
                    startIcon={<AddIcon />}
                    sx={{ alignContent: 'flex-end' }}
                >
                    Add Student
                </NavigationButton>
            </div>
            <ReusableTable
                title="Users List"
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
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Index;