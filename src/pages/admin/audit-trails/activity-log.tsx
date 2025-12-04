import React, { useEffect, useState, useMemo } from 'react';
import { ReusableTable, type Column } from '../../../components/table';
import { useTheme } from '@mui/material';
import { useEnums } from '../../../hooks/useEnums';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { type ActivityLog as ActivityLogType, type ActivityLogDetail } from '../../../types/interfaces/i-activity-Log';
import { activityLogService } from '../../../api/activityLogService';
import { getInitialAuthData } from '../../../utils/apiClient';

const ViewDetailsLink = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
        textDecoration: 'underline'
    },
}));

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.default',
    boxShadow: 24,
    color: "text.secondary",
    p: 4,
    borderRadius: '8px',
    borderWidth: 2,
    borderColor: "red",
    maxHeight: '80vh',
    overflowY: 'auto',
};

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
            console.log('API Response:', response);

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
        console.log('Processed Activity Logs:', mappedData);
    };

    const handleViewDetails = async (id: string) => {
        setSelectedActivityLogId(id);
        setDetails([]);
        setLoadingDetails(true);
        setOpenModal(true);
        console.log('View details for activity log:', id);

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

    const columns: Column[] = [
        {
            id: 'createdOn',
            label: 'Date',
            minWidth: 150,
            sortable: false,
            format: (value: string) =>
                value !== 'Not available'
                    ? new Date(value).toLocaleString('en-NG', {
                        timeZone: 'Africa/Lagos',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour12: true,
                        hour: 'numeric',
                        minute: '2-digit',
                    })
                    : 'Not available',
        },
        {
            id: 'userFirstName',
            label: 'User',
            minWidth: 150,
            sortable: false,
            format: (value, row: ActivityLogType) => (
                <div>
                    <h4 style={{ display: 'flex', gap: 6 }}>
                        {row.userLastName}, {row.userFirstName}
                    </h4>
                </div>
            ),
        },
        {
            id: 'category',
            label: 'Category',
            minWidth: 120,
            sortable: false,
            format: (value: string) => <span>{value}</span>,
        },
        {
            id: 'summary',
            label: 'Summary',
            minWidth: 200,
            sortable: false,
            format: (value: string) => (
                <span style={{ display: 'block', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {value}
                </span>
            ),
        },
    ];

    const actionColumn = {
        label: 'Actions',
        minWidth: 150,
        align: 'center' as const,
        render: (row: ActivityLogType) => (
            <div>
                <ViewDetailsLink onClick={() => handleViewDetails(row.id)}>
                    View Details
                </ViewDetailsLink>
            </div>
        ),
    };

    if (isEnumsLoading || loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
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

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="activity-log-details-modal"
                aria-describedby="activity-log-details-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="activity-log-details-modal" variant="h6" component="h2" gutterBottom>
                        Activity Log Details
                    </Typography>
                    {loadingDetails ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                            <CircularProgress />
                        </Box>
                    ) : details.length === 0 ? (
                        <Typography>No details available.</Typography>
                    ) : (
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {details.map((detail, index) => (
                                <li key={index} style={{ marginBottom: '8px' }}>
                                    <strong>{detail.fieldName}:</strong>{' '}
                                    {detail.oldValue
                                        ? `${detail.oldValue} → ${detail.newValue}`
                                        : detail.newValue}
                                </li>
                            ))}
                        </ul>
                    )}
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={handleCloseModal}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default ActivityLog;