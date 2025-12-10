import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import { useTheme } from "@mui/material";

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (
    value: any,
    row?: any,
    index?: number
  ) => string | number | React.ReactNode;
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
    align?: "right" | "left" | "center";
    render: (rowData: any, index?: number) => React.ReactNode;
  };
  sortBy?: string;
  order?: "asc" | "desc";
  onSortChange?: (sortBy: string, order: "asc" | "desc") => void;
  title?: string;
  onSelectedRowsChange?: (selectedRows: any[]) => void;
  page?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalCount?: number;
  loading?: boolean;
  showSorting?: boolean; // New: Control sorting visibility
  showCheckboxes?: boolean; // New: Control checkbox visibility
  showRowsPerPage?: boolean; // New: Control rows-per-page dropdown visibility
  showPagination?: boolean; // New: Control pagination visibility
}

export const ReusableTable: React.FC<ReusableTableProps> = ({
  columns,
  data,
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [10, 25, 50],
  onRowClick,
  showActionColumn = false,
  actionColumn,
  sortBy,
  order,
  onSortChange,
  title,
  onSelectedRowsChange,
  page: controlledPage,
  onPageChange,
  rowsPerPage: controlledRowsPerPage,
  onRowsPerPageChange,
  totalCount,
  loading = false,
  showSorting = true, // Default: Show sorting
  showCheckboxes = true, // Default: Show checkboxes
  showRowsPerPage = true, // Default: Show rows-per-page dropdown
  showPagination = true, // Default: Show pagination
}) => {
  const [internalPage, setInternalPage] = React.useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] =
    React.useState(defaultRowsPerPage);
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);

  const theme = useTheme();

  const currentPage =
    controlledPage !== undefined ? controlledPage : internalPage;
  const currentRowsPerPage =
    controlledRowsPerPage !== undefined
      ? controlledRowsPerPage
      : internalRowsPerPage;

  const isServerSide = totalCount !== undefined;

  const handleChangePage = (event: unknown, newPage: number) => {
    if (onPageChange) {
      onPageChange(event, newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = +event.target.value;
    if (onRowsPerPageChange) {
      onRowsPerPageChange(event);
    } else {
      setInternalRowsPerPage(newRowsPerPage);
      setInternalPage(0);
    }
  };

  const handleSort = (columnId: string) => {
    if (!onSortChange || !showSorting) return;
    const isAsc = sortBy === columnId && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    onSortChange(columnId, newOrder);
  };

  const pageData = isServerSide
    ? data
    : data.slice(
      currentPage * currentRowsPerPage,
      currentPage * currentRowsPerPage + currentRowsPerPage
    );

  const isRowSelected = (row: any) => selectedRows.some((r) => r.id === row.id);
  const areAllSelected =
    pageData.every((row) => isRowSelected(row)) && pageData.length > 0;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!showCheckboxes) return;
    let newSelection = [...selectedRows];

    if (event.target.checked) {
      const newRows = pageData.filter((row) => !isRowSelected(row));
      newSelection = [...selectedRows, ...newRows];
    } else {
      newSelection = selectedRows.filter(
        (row) => !pageData.some((p) => p.id === row.id)
      );
    }

    setSelectedRows(newSelection);
    onSelectedRowsChange?.(newSelection);
  };

  const handleCheckboxChange = (row: any) => {
    if (!showCheckboxes) return;
    const isSelected = isRowSelected(row);
    const newSelection = isSelected
      ? selectedRows.filter((r) => r.id !== row.id)
      : [...selectedRows, row];

    setSelectedRows(newSelection);
    onSelectedRowsChange?.(newSelection);
  };

  const allColumns = [
    ...columns,
    ...(showActionColumn && actionColumn
      ? [
        {
          id: "actions",
          label: actionColumn.label,
          minWidth: actionColumn.minWidth || 100,
          align: actionColumn.align || "right",
        },
      ]
      : []),
  ];

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        bgcolor: theme.palette.background.default,
      }}
    >
      {title && (
        <div
          style={{
            padding: "16px 16px 0 16px",
            fontWeight: 600,
            fontSize: "30px",
            color: theme.palette.text.primary,
          }}
        >
          {title}
        </div>
      )}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {showCheckboxes && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={areAllSelected}
                    onChange={handleSelectAll}
                    sx={{
                      color: "blue",
                      "&.Mui-checked": {
                        color: theme.palette.info.main,
                      },
                      transform: "scale(1.5)",
                    }}
                  />
                </TableCell>
              )}
              {allColumns.map((column) => {
                const isSortable =
                  showSorting &&
                  columns.find((col) => col.id === column.id)?.sortable;
                const isSorted = sortBy === column.id;

                return (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={isSorted && showSorting ? order : false}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    {isSortable ? (
                      <TableSortLabel
                        active={isSorted}
                        direction={isSorted ? order : "asc"}
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length + (showCheckboxes ? 1 : 0)}
                  align="center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : pageData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length + (showCheckboxes ? 1 : 0)}
                  align="center"
                  style={{ fontSize: "30px" }}
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((row, index) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={`row-${index}`}
                  onClick={() => onRowClick && onRowClick(row)}
                  selected={isRowSelected(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    backgroundColor: isRowSelected(row) ? "#ffe6e6" : "inherit",
                    "&:hover": {
                      backgroundColor: isRowSelected(row)
                        ? "#ffe6e6"
                        : "#f5f5f5",
                    },
                  }}
                >
                  {showCheckboxes && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isRowSelected(row)}
                        onChange={() => handleCheckboxChange(row)}
                        sx={{
                          color: "blue",
                          "&.Mui-checked": {
                            color: theme.palette.info.main,
                          },
                          transform: "scale(1.5)",
                        }}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={`${column.id}-${index}`}
                        align={column.align}
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {column.format
                          ? column.format(value, row, index)
                          : value}
                      </TableCell>
                    );
                  })}
                  {showActionColumn && actionColumn && (
                    <TableCell
                      key={`actions-${index}`}
                      align={actionColumn.align || "right"}
                      sx={{ color: "red" }}
                    >
                      {actionColumn.render(row, index)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagination && (
        <TablePagination
          rowsPerPageOptions={showRowsPerPage ? rowsPerPageOptions : []}
          component="div"
          count={totalCount ?? data.length}
          rowsPerPage={currentRowsPerPage}
          page={currentPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={
            showRowsPerPage ? handleChangeRowsPerPage : undefined
          }
          sx={{ color: theme.palette.common.white }}
        />
      )}
    </Paper>
  );
};
