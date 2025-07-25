import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material';

export interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'right' | 'left' | 'center';
    format?: (value: any, row?: any, index?: number) => string | number | React.ReactNode;
    sortable?: boolean;
}

interface ReusableTableProps {
    columns: Column[];
    data: any[];
    defaultRowsPerPage?: number;
    rowsPerPageOptions?: number[];
    onRowClick?: (rowData: any) => void;
    showActionColumn?: boolean;
    actionColumn?: {
        label: string;
        minWidth?: number;
        align?: 'right' | 'left' | 'center';
        render: (rowData: any, index?: number) => React.ReactNode;
    };
    sortBy?: string;
    order?: 'asc' | 'desc';
    onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;
    title?: string;
    onSelectedRowsChange?: (selectedRows: any[]) => void;
}

export const ReusableTable: React.FC<ReusableTableProps> = ({
    columns,
    data,
    defaultRowsPerPage = 10,
    rowsPerPageOptions = [10, 25, 100],
    onRowClick,
    showActionColumn = false,
    actionColumn,
    sortBy,
    order,
    onSortChange,
    title,
    onSelectedRowsChange,
}) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage);
    const [selectedRows, setSelectedRows] = React.useState<any[]>([]);

    const theme = useTheme();

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleSort = (columnId: string) => {
        if (!onSortChange) return;
        const isAsc = sortBy === columnId && order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        onSortChange(columnId, newOrder);
    };

    const pageData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const isRowSelected = (row: any) => selectedRows.some((r) => r.username === row.username);
    const areAllSelected = pageData.every((row) => isRowSelected(row)) && pageData.length > 0;

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newSelection = [...selectedRows];

        if (event.target.checked) {
            const newRows = pageData.filter((row) => !isRowSelected(row));
            newSelection = [...selectedRows, ...newRows];
        } else {
            newSelection = selectedRows.filter(
                (row) => !pageData.some((p) => p.username === row.username)
            );
        }

        setSelectedRows(newSelection);
        onSelectedRowsChange?.(newSelection);
    };

    const handleCheckboxChange = (row: any) => {
        const isSelected = isRowSelected(row);
        const newSelection = isSelected
            ? selectedRows.filter((r) => r.username !== row.username)
            : [...selectedRows, row];

        setSelectedRows(newSelection);
        onSelectedRowsChange?.(newSelection);
    };

    const allColumns = [
        ...columns,
        ...(showActionColumn && actionColumn
            ? [
                {
                    id: 'actions',
                    label: actionColumn.label,
                    minWidth: actionColumn.minWidth || 100,
                    align: actionColumn.align || 'right',
                },
            ]
            : []),
    ];

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: theme.palette.background.default }}>
            {title && (
                <div style={{ padding: '16px 16px 0 16px', fontWeight: 600, fontSize: '30px', color: theme.palette.text.primary }}>
                    {title}
                </div>
            )}
            <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={areAllSelected}
                                    onChange={handleSelectAll}
                                    sx={{
                                        color: 'blue',
                                        '&.Mui-checked': {
                                            color: theme.palette.info.main,
                                        },
                                        transform: 'scale(1.5)',
                                    }}
                                />
                            </TableCell>
                            {allColumns.map((column) => {
                                const isSortable = columns.find(col => col.id === column.id)?.sortable;
                                const isSorted = sortBy === column.id;

                                return (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                        sortDirection={isSorted ? order : false}
                                        sx={{ color: theme.palette.text.primary }}
                                    >
                                        {isSortable ? (
                                            <TableSortLabel
                                                active={true}
                                                direction={isSorted ? order : 'asc'}
                                                onClick={() => handleSort(column.id)}
                                            >
                                                {column.label}
                                            </TableSortLabel>
                                        ) : (
                                            column.label
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pageData.map((row, index) => (
                            <TableRow
                                hover
                                role="checkbox"
                                tabIndex={-1}
                                key={`row-${index}`}
                                onClick={() => onRowClick && onRowClick(row)}
                                selected={isRowSelected(row)}
                                sx={{
                                    cursor: onRowClick ? 'pointer' : 'default',
                                    backgroundColor: isRowSelected(row) ? '#ffe6e6' : 'inherit',
                                    '&:hover': {
                                        backgroundColor: isRowSelected(row) ? '#ffe6e6' : '#f5f5f5', // light grey on hover if not selected
                                    },
                                }}
                            >

                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={isRowSelected(row)}
                                        onChange={() => handleCheckboxChange(row)}
                                        sx={{
                                            color: 'blue',
                                            '&.Mui-checked': {
                                                color: theme.palette.info.main,
                                            },
                                            transform: 'scale(1.5)',
                                        }}
                                    />
                                </TableCell>
                                {columns.map((column) => {
                                    const value = row[column.id];
                                    return (
                                        <TableCell key={`${column.id}-${index}`} align={column.align} sx={{ color: theme.palette.text.secondary }}>
                                            {column.format ? column.format(value, row, index) : value}
                                        </TableCell>
                                    );
                                })}

                                {showActionColumn && actionColumn && (
                                    <TableCell
                                        key={`actions-${index}`}
                                        align={actionColumn.align || 'right'}
                                        sx={{ color: 'red' }}
                                    >
                                        {actionColumn.render(row, index)}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ color: theme.palette.common.white }}
            />
        </Paper>
    );
};
