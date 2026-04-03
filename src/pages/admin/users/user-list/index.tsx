import React, { useEffect, useState, useMemo } from 'react';
import { ReusableTable, type Column } from '../../../../components/table';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { NavigationButton } from '../../../../components/navigation-button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { getInitialAuthData } from '../../../../utils/apiClient';
import { useEnums } from '../../../../hooks/useEnums';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import FilterComponent from '../../../../components/filters';
import { type FilterConfig } from '../../../../components/filters';
import { fetchUsers, deleteUsers } from '../../../../api/userService';
import { type UserModel, type StatusConfig } from '../../../../types/interfaces/i-user';
import PageError from '../../../../components/states/pageError';


const statusConfig: StatusConfig = {
    active: {
        icon: CheckCircleIcon,
        color: 'success',
        textColor: 'green',
    },
    default: {
        icon: CancelIcon,
        color: 'error',
        textColor: 'red',
    },
};


const Index = () => {

    const [data, setData] = useState<UserModel[]>([]);
    const [rawUsers, setRawUsers] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState<string>('username');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [pageError, setPageError] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    const theme = useTheme();
    const { selectedAccount } = getInitialAuthData();
    const { enums, isLoading: isEnumsLoading } = useEnums({ fetchPermissionData: false });

    const [filters, setFilters] = useState({
        search: '',
        role: '',
        teachers: [] as string[],
        createdDate: null as Date | null,
    });

    const roleOptions = useMemo(() => {
        const options =
            enums?.UserRole?.map((item: any) => ({
                value: item.value.toString(),
                label: item.name,
            })) || [
                { value: 'Admin', label: 'Admin' },
                { value: 'Teacher', label: 'Teacher' },
                { value: 'Student', label: 'Student' },
            ];

        return [{ value: '', label: 'All Roles' }, ...options];
    }, [enums]);

    const filterConfigs: FilterConfig[] = [
        {
            type: 'single-select',
            label: 'User Role',
            value: filters.role,
            onChange: (value: string) =>
                setFilters((prev) => ({ ...prev, role: value })),
            options: roleOptions,
        },
    ];


    const userStatusMap = useMemo(() => {
        return (
            enums?.UserStatus?.reduce((acc: any, item: any) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            }, {}) || {}
        );
    }, [enums]);

    const genderMap = useMemo(() => {
        return (
            enums?.Gender?.reduce((acc: any, item: any) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            }, {}) || {}
        );
    }, [enums]);

    const roleMap = useMemo(() => {
        return (
            enums?.UserRole?.reduce((acc: any, item: any) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            }, {}) || {}
        );
    }, [enums]);


    const loadUsers = async () => {

        if (!selectedAccount) {
            setPageError(true);
            return;
        }

        try {

            setLoading(true);
            setPageError(false);

            const { items, itemCount } = await fetchUsers(
                selectedAccount,
                page,
                rowsPerPage,
                filters.role
            );

            setRawUsers(items || []);
            setTotalCount(itemCount || 0);

        } catch (error) {

            console.error('Error fetching users:', error);
            setPageError(true);

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadUsers();
    }, [page, rowsPerPage, sortBy, order, selectedAccount, filters.role]);


    useEffect(() => {

        if (rawUsers.length > 0 && !isEnumsLoading && enums) {

            const mappedData = rawUsers.map((item: any) => {

                const genderValue = item.gender?.toString();
                const roleValue = item.role?.toString();
                const statusValue = item.status?.toString();

                const statusName = userStatusMap[statusValue] || 'Unknown';
                const genderName = genderMap[genderValue] || 'Not available';
                const roleName = roleMap[roleValue] || 'Not available';

                return {
                    id: item.id,
                    firstName: item.firstName || 'Not available',
                    lastName: item.lastName || 'Not available',
                    email: item.email || 'Not available',
                    schoolName: item.schoolName || 'Not available',
                    gender: genderName,
                    role: roleName,
                    status: statusName.toLowerCase(),
                    userId: item.userId || 'pending',
                    rawGender: item.gender,
                    rawStatus: item.status,
                    rawRole: item.role,
                };

            });

            setData(mappedData);

        } else if (rawUsers.length === 0) {

            setData([]);

        }

    }, [rawUsers, isEnumsLoading, enums, userStatusMap, genderMap, roleMap]);


    const retryFetchUsers = () => {
        loadUsers();
    };


    if (pageError) {

        return (
            <PageError
                title="users"
                action="loading"
                ticketUrl="/support"
                onRetry={retryFetchUsers}
            />
        );

    }


    if (loading || isEnumsLoading) {

        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );

    }


    const getStatusConfig = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        return statusConfig[normalizedStatus as keyof StatusConfig] || statusConfig.default;
    };


    const columns: Column[] = [

        {
            id: 'fullName',
            label: 'Full Name',
            minWidth: 150,
            sortable: true,
            format: (value, row: UserModel) => (
                <div>
                    <h4 style={{ display: 'flex', gap: 6 }}>
                        {row.lastName}, {row.firstName}
                    </h4>
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
        },

        {
            id: 'gender',
            label: 'Gender',
            minWidth: 100,
            sortable: true,
        },

        {
            id: 'role',
            label: 'Role',
            minWidth: 100,
            sortable: true,
        },

        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            align: 'center',
            format: (value: string, row: UserModel) => {

                const currentStatus = !isEnumsLoading && enums
                    ? (userStatusMap[row.rawStatus?.toString()] || 'Unknown').toLowerCase()
                    : value;

                const config = getStatusConfig(currentStatus);
                const StatusIcon = config.icon;

                return (
                    <span style={{
                        color: config.textColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <StatusIcon color={config.color as any} />
                        <span style={{ marginLeft: 4 }}>{currentStatus}</span>
                    </span>
                );

            },
        },

        {
            id: 'schoolName',
            label: 'School',
            minWidth: 150,
            sortable: true,
        },

    ];


    const actionColumn = {

        label: 'Actions',
        minWidth: 150,
        align: 'center' as const,

        render: (row: any) => (

            <div>

                <IconButton onClick={() => console.log('Edit', row.id)}>
                    <EditIcon color="primary" />
                </IconButton>

                <IconButton onClick={() => console.log('Delete', row.id)}>
                    <DeleteIcon color="error" />
                </IconButton>

            </div>

        ),

    };


    return (

        <div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginBottom: '8px',
                }}
            >

                <NavigationButton
                    onClick={async () => {

                        if (selectedRows.length === 0) return;

                        setIsDeleting(true);

                        try {

                            await deleteUsers(selectedRows);

                            setData((prev) =>
                                prev.filter((user) => !selectedRows.includes(user.id))
                            );

                            setSelectedRows([]);

                            setSnackbar({
                                open: true,
                                message: `Deleted ${selectedRows.length} users`,
                                severity: 'success',
                            });

                        } catch {

                            setSnackbar({
                                open: true,
                                message: 'Failed to delete users',
                                severity: 'error',
                            });

                        } finally {

                            setIsDeleting(false);

                        }

                    }}

                    disabled={selectedRows.length === 0 || isDeleting}

                >
                    <DeleteIcon /> [{selectedRows.length}]
                </NavigationButton>


                <NavigationButton to="create-user">
                    <AddIcon />
                </NavigationButton>

            </div>


            <FilterComponent filters={filterConfigs} />


            <ReusableTable

                title="Users List"
                columns={columns}
                data={data}

                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}

                showActionColumn
                actionColumn={actionColumn}

                sortBy={sortBy}
                order={order}

                page={page - 1}
                rowsPerPage={rowsPerPage}

                totalCount={totalCount}

                onSortChange={(field, sortOrder) => {
                    setSortBy(field);
                    setOrder(sortOrder);
                }}

                onPageChange={(event, newPage) => {
                    setPage(newPage + 1);
                }}

                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(1);
                }}

                onSelectedRowsChange={(selected) => setSelectedRows(selected)}

                loading={loading || isEnumsLoading}

            />


            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            >
                <Alert
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