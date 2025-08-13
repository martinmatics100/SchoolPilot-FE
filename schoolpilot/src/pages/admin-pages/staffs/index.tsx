import * as React from 'react';
import { ReusableTable, type Column } from '../../../components/common/table-component';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // New import
import { NavigationButton } from '../../../components/common/NavigationButton';

const Index = () => {
    const [sortBy, setSortBy] = React.useState<string>('username');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');

    const theme = useTheme();

    const columns: Column[] = [
        {
            id: 'username',
            label: 'Username',
            minWidth: 120,
            sortable: true
        },
        {
            id: 'fullName',
            label: 'Staff Name',
            minWidth: 150,
            sortable: true,
            format: (value, row: any) => (
                <div>
                    <h4 style={{ display: 'flex', gap: 6 }}>{row.firstName} {row.lastName}</h4>
                    {/* <h6 style={{ color: theme.palette.text.primary }}><span style={{ color: theme.palette.info.dark }}>STAFF ID:</span> {row.studentId}</h6> */}
                </div >
            )
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            align: 'center',
            format: (value: string) => (
                <span style={{
                    color: value === 'active' ? 'green' : 'red',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {value === 'active' ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                    <span style={{ marginLeft: 4 }}>{value}</span>
                </span>
            )
        },
        {
            id: 'department',
            label: 'Department',
            minWidth: 150,
            sortable: true
        },
    ];

    const userData = [
        { username: 'john_doe', firstName: 'John', lastName: 'Doe', status: 'active', department: 'Engineering', studentId: 'STU001' },
        { username: 'jane_smith', firstName: 'Jane', lastName: 'Smith', status: 'inactive', department: 'Marketing', studentId: 'not available' },

    ];

    const actionColumn = {
        label: 'Actions',
        minWidth: 150,
        align: 'center' as const,
        render: (row: any) => (
            <div>
                <IconButton aria-label="edit" onClick={() => handleEdit(row.username)}>
                    <EditIcon color="primary" />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => handleDelete(row.username)}>
                    <DeleteIcon color="error" />
                </IconButton>
            </div>
        ),
    };

    const handleEdit = (username: string) => {
        console.log('Edit user:', username);
    };

    const handleDelete = (username: string) => {
        console.log('Delete user:', username);
    };

    const handleSortChange = (sortByField: string, sortOrder: 'asc' | 'desc') => {
        setSortBy(sortByField);
        setOrder(sortOrder);

        console.log('Request new data sorted by:', sortByField, 'order:', sortOrder);
        // Here you would fetch new data from the backend with sortBy and order
    };

    return (
        <div>
            <NavigationButton
                to="create-staff"
                startIcon={<AddIcon />}
                sx={{ alignContent: 'flex-end' }}
            >
                Create User
            </NavigationButton>
            <ReusableTable
                title='Users List'
                columns={columns}
                data={userData}
                defaultRowsPerPage={25}
                rowsPerPageOptions={[25, 50, 75, 100]}
                showActionColumn={true}
                actionColumn={actionColumn}
                sortBy={sortBy}
                order={order}
                onSortChange={handleSortChange}
                onSelectedRowsChange={(selected) => console.log('Selected rows:', selected)}
            />
        </div>
    );
};

export default Index;
