import React, { useEffect, useState, useMemo } from 'react';
import { ReusableTable, type Column } from '../../../../components/table';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTheme, alpha, Box, Typography, Chip, Avatar, Tooltip, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { NavigationButton } from '../../../../components/navigation-button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { getInitialAuthData } from '../../../../utils/apiClient';
import { useEnums } from '../../../../hooks/useEnums';
import CircularProgress from '@mui/material/CircularProgress';
import FilterComponent from '../../../../components/filters';
import { type FilterConfig } from '../../../../components/filters';
import { fetchUsers, deleteUsers } from '../../../../api/userService';
import { type UserModel, type StatusConfig } from '../../../../types/interfaces/i-user';
import PageError from '../../../../components/states/pageError';
import PeopleIcon from '@mui/icons-material/People';

const statusConfig: StatusConfig = {
    active: {
        icon: CheckCircleIcon,
        color: 'success',
        textColor: '#2e7d32',
        bgColor: '#e8f5e9',
    },
    default: {
        icon: CancelIcon,
        color: 'error',
        textColor: '#c62828',
        bgColor: '#ffebee',
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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" sx={{ bgcolor: 'background.default' }}>
                <CircularProgress size={48} sx={{ color: 'primary.main' }} />
            </Box>
        );
    }

    const getStatusConfig = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        return statusConfig[normalizedStatus as keyof StatusConfig] || statusConfig.default;
    };

    const getRoleColor = (role: string) => {
        const roleColors: Record<string, string> = {
            admin: theme.palette.error.main,
            teacher: theme.palette.primary.main,
            student: theme.palette.success.main,
        };
        return roleColors[role.toLowerCase()] || theme.palette.info.main;
    };

    // Calculate active users count
    const activeUsersCount = data.filter(user => user.status === 'active').length;

    const columns: Column[] = [
        {
            id: 'fullName',
            label: 'User',
            minWidth: 200,
            sortable: true,
            format: (value, row: UserModel) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                        }}
                    >
                        {row.firstName?.charAt(0)}{row.lastName?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {row.lastName}, {row.firstName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            ID: {row.userId}
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        {
            id: 'email',
            label: 'Email',
            minWidth: 180,
            sortable: true,
        },
        {
            id: 'gender',
            label: 'Gender',
            minWidth: 100,
            sortable: true,
            format: (value: string) => (
                <Chip
                    label={value}
                    size="small"
                    sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        fontWeight: 500,
                        borderRadius: 1.5,
                        height: 24,
                        fontSize: '0.75rem',
                    }}
                />
            ),
        },
        {
            id: 'role',
            label: 'Role',
            minWidth: 100,
            sortable: true,
            format: (value: string) => (
                <Chip
                    label={value}
                    size="small"
                    sx={{
                        bgcolor: alpha(getRoleColor(value), 0.1),
                        color: getRoleColor(value),
                        fontWeight: 600,
                        borderRadius: 1.5,
                        height: 24,
                        fontSize: '0.75rem',
                    }}
                />
            ),
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
                    <Chip
                        icon={<StatusIcon sx={{ fontSize: 14 }} />}
                        label={currentStatus}
                        size="small"
                        sx={{
                            bgcolor: config.bgColor,
                            color: config.textColor,
                            fontWeight: 500,
                            borderRadius: 1.5,
                            height: 24,
                            '& .MuiChip-icon': {
                                color: config.textColor,
                            },
                        }}
                    />
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
        minWidth: 100,
        align: 'center' as const,
        render: (row: any) => (
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                <Tooltip title="Edit User" arrow>
                    <IconButton
                        onClick={() => console.log('Edit', row.id)}
                        size="small"
                        sx={{
                            color: theme.palette.info.main,
                            '&:hover': {
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                            },
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete User" arrow>
                    <IconButton
                        onClick={() => console.log('Delete', row.id)}
                        size="small"
                        sx={{
                            color: theme.palette.error.main,
                            '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                            },
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
    };

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                bgcolor: 'background.default',
                minHeight: '100%',
            }}
        >
            {/* Header with Stats */}
            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        mb: 0.5,
                    }}
                >
                    Users Management
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Manage all users across your school
                </Typography>
            </Box>

            {/* Action Buttons - Far Right */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                    flexWrap: 'wrap',
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
                                message: `Deleted ${selectedRows.length} user${selectedRows.length > 1 ? 's' : ''}`,
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
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    sx={{
                        minWidth: 'auto',
                        px: 1.5,
                        '& .MuiButton-startIcon': {
                            marginRight: selectedRows.length > 0 ? 0.5 : 0,
                        },
                    }}
                >
                    {selectedRows.length > 0 && `(${selectedRows.length})`}
                </NavigationButton>

                <NavigationButton
                    size="small"
                    color="info"
                    variant="contained"
                    to="create-user"
                    startIcon={<AddIcon />}
                    sx={{
                        minWidth: 'auto',
                        px: 1.5,
                    }}
                >
                    Add
                </NavigationButton>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 2 }}>
                <FilterComponent filters={filterConfigs} />
            </Box>

            {/* Table */}
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

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Index;