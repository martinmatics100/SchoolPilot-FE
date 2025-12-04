import React, { useEffect, useState, useMemo } from 'react';
import { ReusableTable, type Column } from '../../../../components/table';
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
import { NavigationButton } from '../../../../components/navigation-button';
import { getInitialAuthData } from '../../../../utils/apiClient';
import { useEnums } from '../../../../hooks/useEnums';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { fetchStudents } from '../../../../api/studentService';
import { type Student } from '../../../../types/interfaces/i-student';
import { type StatusConfig } from '../../../../types/interfaces/i-user';



const statusConfig: StatusConfig = {
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
        textColor: '#1976d2'
    },
    withdrawn: {
        icon: ExitToAppIcon,
        color: 'warning',
        textColor: '#ed6c02'
    },
    suspended: {
        icon: DoNotDisturbIcon,
        color: 'warning',
        textColor: '#ed6c02'
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
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

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

    const getStatusConfig = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        return statusConfig[normalizedStatus as keyof StatusConfig] || statusConfig.default;
    };

    useEffect(() => {
        if (selectedAccount) {
            fetchStudents(selectedAccount, page, rowsPerPage)
                .then(({ items, itemCount }) => {
                    setRawStudents(items || []);
                    setTotalCount(itemCount || 0);
                })
                .catch((error) => {
                    console.error('Error fetching students:', error);
                    setData([]);
                    setTotalCount(0);
                })
                .finally(() => setLoading(false));
        } else {
            console.error('No account selected');
            setData([]);
            setTotalCount(0);
        }
    }, [page, rowsPerPage, sortBy, order, selectedAccount]);

    useEffect(() => {
        if (rawStudents.length > 0 && !isEnumsLoading) {
            const mappedData = rawStudents.map((item: any) => {
                const genderValue = item.gender?.toString();
                const statusValue = item.status?.toString();

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
        } else if (rawStudents.length === 0) {
            setData([]);
        }
    }, [rawStudents, isEnumsLoading, studentStatusMap, genderMap]);

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
                const currentStatus = !isEnumsLoading && enums
                    ? (studentStatusMap[row.rawStatus?.toString()] || 'Unknown').toLowerCase()
                    : value;

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
                {/* <IconButton aria-label="delete" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon color="error" />
                </IconButton> */}
            </div>
        ),
    };

    const handleEdit = (id: string) => {
        console.log('Edit student:', id);
    };

    // const handleDelete = async (id: string) => {
    //     try {
    //         await deleteStudent(selectedAccount, id);
    //         await fetchStudents(selectedAccount, page, rowsPerPage)
    //             .then(({ items, itemCount }) => {
    //                 setRawStudents(items || []);
    //                 setTotalCount(itemCount || 0);
    //             });
    //     } catch (error) {
    //         console.error('Error deleting student:', error);
    //     }
    // };

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

    const handleAssignedSelected = async () => {
        if (selectedRows.length === 0) return;

        setIsDeleting(true);
        try {
            const response = await fetch('/api/users/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedRows }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete users');
            }

            setData((prev) => prev.filter((user) => !selectedRows.includes(user.id)));
            setSelectedRows([]);
        } catch (error) {
            console.error('Error deleting users:', error);
        } finally {
            setIsDeleting(false);
        }
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
                    marginBottom: '8px',
                }}
            >
                <NavigationButton
                    onClick={handleAssignedSelected}
                    sx={{
                        alignContent: 'flex-end',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        '&:hover': { backgroundColor: '#1565c0' },
                        '&.Mui-disabled': {
                            backgroundColor: '#64b5f6',
                            color: '#cccccc',
                        },
                    }}
                    disabled={selectedRows.length === 0 || isDeleting}
                >
                    <AssignmentIndIcon />
                </NavigationButton>
                <NavigationButton
                    to="create-student"
                    sx={{ alignContent: 'flex-end' }}
                >
                    <AddIcon />
                </NavigationButton>
            </div>
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
                onSelectedRowsChange={(selected) => setSelectedRows(selected)}
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