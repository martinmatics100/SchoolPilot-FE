import React, { useEffect, useState, useMemo } from 'react';
import { ReusableTable, type Column } from '../../../components/table';
import { useTheme, alpha, Box, Typography, Paper, Chip, Fade, Grow, IconButton, Tooltip } from '@mui/material';
import { useEnums } from '../../../hooks/useEnums';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconifyIcon from '../../../components/base/iconifyIcon';
import { type ActivityLog as ActivityLogType, type ActivityLogDetail } from '../../../types/interfaces/i-activity-Log';
import { activityLogService } from '../../../api/activityLogService';
import { getInitialAuthData } from '../../../utils/apiClient';

const ViewDetailsLink = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '16px',
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.15),
        transform: 'translateY(-1px)',
    },
}));

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500, md: 600 },
    bgcolor: 'background.default',
    boxShadow: 24,
    p: { xs: 2, sm: 3, md: 4 },
    borderRadius: 3,
    maxHeight: '80vh',
    overflowY: 'auto',
    border: 'none',
};

const DetailItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    padding: '12px 16px',
    marginBottom: '8px',
    backgroundColor: alpha(theme.palette.background.default, 0.6),
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        transform: 'translateX(4px)',
    },
}));

const ActivityLog = () => {
    const [sortBy, setSortBy] = useState<string>('createdOn');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [data, setData] = useState<ActivityLogType[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [rawActivityLogs, setRawActivityLogs] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedActivityLogId, setSelectedActivityLogId] = useState<string | null>(null);
    const [details, setDetails] = useState<ActivityLogDetail[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const theme = useTheme();
    const { selectedAccount } = getInitialAuthData();
    const { enums, isLoading: isEnumsLoading } = useEnums({ fetchPermissionData: false });

    const activityEntityTypeMap = useMemo(() => {
        return (
            enums?.ActivityEntityType?.reduce(
                (acc: Record<string, string>, item: { value: number; displayName: string; name: string }) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                { '1': 'Student', '2': 'Teacher' }
            ) || { '1': 'Student', '2': 'Teacher' }
        );
    }, [enums]);

    const getCategoryColor = (category: string) => {
        const categoryColors: Record<string, string> = {
            create: theme.palette.success.main,
            update: theme.palette.info.main,
            delete: theme.palette.error.main,
            login: theme.palette.primary.main,
            logout: theme.palette.warning.main,
        };
        const lowerCategory = category.toLowerCase();
        for (const [key, color] of Object.entries(categoryColors)) {
            if (lowerCategory.includes(key)) {
                return color;
            }
        }
        return theme.palette.text.secondary;
    };

    useEffect(() => {
        if (selectedAccount) {
            fetchActivityLogs();
        }
    }, [page, rowsPerPage, sortBy, order, selectedAccount]);

    useEffect(() => {
        if (rawActivityLogs.length > 0 && !isEnumsLoading) {
            processActivityLogData();
        }
    }, [rawActivityLogs, isEnumsLoading, activityEntityTypeMap]);

    const fetchActivityLogs = async () => {
        if (!selectedAccount) {
            console.error('No account selected');
            setData([]);
            setTotalCount(0);
            return;
        }

        setLoading(true);
        try {
            const params = {
                page,
                pageLength: rowsPerPage,
                sortBy,
                order
            };

            const response = await activityLogService.getActivityLogs(params);
            setRawActivityLogs(response.items || []);
            setTotalCount(response.itemCount || 0);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            setData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const processActivityLogData = () => {
        const mappedData = rawActivityLogs.map((item: any) => {
            const entityTypeValue = item.entityType?.toString();
            return {
                id: item.id || '',
                userId: item.userId || '',
                userFirstName: item.userFirstName || 'Not available',
                userLastName: item.userLastName || 'Not available',
                category: item.category || 'Unknown',
                summary: item.summary || 'N/A',
                createdOn: item.createdOn || 'Not available',
                entityType: activityEntityTypeMap[entityTypeValue] || item.category || 'Unknown',
                actionId: item.actionId || 0,
            };
        });
        setData(mappedData);
    };

    const handleViewDetails = async (id: string) => {
        setSelectedActivityLogId(id);
        setDetails([]);
        setLoadingDetails(true);
        setOpenModal(true);

        try {
            const detailsData = await activityLogService.getActivityLogDetails(id);
            setDetails(detailsData);
        } catch (error) {
            console.error('Error fetching activity log details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedActivityLogId(null);
        setDetails([]);
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

    const formatDate = (value: string) => {
        if (value === 'Not available') return 'Not available';
        const date = new Date(value);
        return date.toLocaleString('en-NG', {
            timeZone: 'Africa/Lagos',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const columns: Column[] = [
        {
            id: 'createdOn',
            label: 'Date & Time',
            minWidth: 160,
            sortable: false,
            format: (value: string) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconifyIcon icon="mdi:calendar-clock" width={16} color={theme.palette.text.secondary} />
                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.813rem' }}>
                        {formatDate(value)}
                    </Typography>
                </Box>
            ),
        },
        {
            id: 'userFirstName',
            label: 'User',
            minWidth: 160,
            sortable: false,
            format: (value, row: ActivityLogType) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            {row.userFirstName?.charAt(0)}{row.userLastName?.charAt(0)}
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {row.userLastName}, {row.userFirstName}
                    </Typography>
                </Box>
            ),
        },
        {
            id: 'category',
            label: 'Category',
            minWidth: 110,
            sortable: false,
            format: (value: string) => (
                <Chip
                    label={value}
                    size="small"
                    sx={{
                        bgcolor: alpha(getCategoryColor(value), 0.1),
                        color: getCategoryColor(value),
                        fontWeight: 500,
                        borderRadius: 1.5,
                        height: 24,
                        fontSize: '0.7rem',
                    }}
                />
            ),
        },
        {
            id: 'summary',
            label: 'Summary',
            minWidth: 250,
            sortable: false,
            format: (value: string) => (
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        display: 'block',
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        lineHeight: 1.5,
                    }}
                >
                    {value}
                </Typography>
            ),
        },
    ];

    const actionColumn = {
        label: 'Actions',
        minWidth: 110,
        align: 'center' as const,
        render: (row: ActivityLogType) => (
            <Tooltip title="View Details" arrow>
                <ViewDetailsLink onClick={() => handleViewDetails(row.id)}>
                    <IconifyIcon icon="mdi:eye-outline" width={16} />
                    View Details
                </ViewDetailsLink>
            </Tooltip>
        ),
    };

    if (isEnumsLoading || loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
                sx={{ bgcolor: 'background.default' }}
            >
                <CircularProgress size={48} sx={{ color: 'primary.main' }} />
            </Box>
        );
    }

    return (
        <Fade in timeout={400}>
            <Box
                sx={{
                    p: { xs: 2, sm: 3, md: 4 },
                    bgcolor: 'background.default',
                    minHeight: '80%',
                }}
            >
                <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
                    {/* Header Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            Track and monitor all system activities
                        </Typography>
                    </Box>

                    {/* Table */}
                    <ReusableTable
                        title="Activity Logs"
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

                    {/* Details Modal */}
                    <Modal
                        open={openModal}
                        onClose={handleCloseModal}
                        aria-labelledby="activity-log-details-modal"
                        closeAfterTransition
                    >
                        <Fade in={openModal}>
                            <Box sx={modalStyle}>
                                {/* Modal Header */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2,
                                        pb: 2,
                                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 2,
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <IconifyIcon icon="mdi:information-outline" width={22} color={theme.palette.primary.main} />
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: 'text.primary',
                                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                            }}
                                        >
                                            Activity Log Details
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        onClick={handleCloseModal}
                                        size="small"
                                        sx={{
                                            color: 'text.secondary',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                                color: theme.palette.error.main,
                                            },
                                        }}
                                    >
                                        <IconifyIcon icon="ic:round-close" width={20} />
                                    </IconButton>
                                </Box>

                                {/* Modal Content */}
                                {loadingDetails ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                                        <CircularProgress size={40} sx={{ color: 'primary.main' }} />
                                    </Box>
                                ) : details.length === 0 ? (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                py: 6,
                                                gap: 2,
                                            }}
                                        >
                                            <IconifyIcon icon="mdi:clipboard-text-outline" width={48} color={theme.palette.text.disabled} />
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                No details available for this activity.
                                            </Typography>
                                        </Box>
                                    ) : (
                                            <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                                                {details.map((detail, index) => (
                                                    <Grow in timeout={300 + index * 50} key={index}>
                                                        <DetailItem>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: theme.palette.primary.main,
                                                                        fontWeight: 600,
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.5px',
                                                                        display: 'block',
                                                                        mb: 0.5,
                                                                    }}
                                                                >
                                                                    {detail.fieldName}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                                                    {detail.oldValue && (
                                                                        <>
                                                                            <Chip
                                                                                label={detail.oldValue}
                                                                                size="small"
                                                                                sx={{
                                                                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                                                                    color: theme.palette.error.main,
                                                                                    textDecoration: 'line-through',
                                                                                    fontSize: '0.7rem',
                                                                                    height: 24,
                                                                                }}
                                                                            />
                                                                            <IconifyIcon icon="mdi:arrow-right" width={16} color={theme.palette.text.secondary} />
                                                                        </>
                                                                    )}
                                                                    <Chip
                                                                        label={detail.newValue || detail.oldValue}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: alpha(theme.palette.success.main, 0.1),
                                                                            color: theme.palette.success.main,
                                                                            fontWeight: 500,
                                                                            fontSize: '0.7rem',
                                                                            height: 24,
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                        </DetailItem>
                                                    </Grow>
                                                ))}
                                    </Box>
                                )}

                                {/* Modal Footer */}
                                <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleCloseModal}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            px: 3,
                                        }}
                                    >
                                        Close
                                    </Button>
                                </Box>
                            </Box>
                        </Fade>
                    </Modal>
                </Box>
            </Box>
        </Fade>
    );
};

export default ActivityLog;