import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material";

export interface Column {
  key: string;
  label: string;
  type?: "text" | "number";
  width?: string | number;
  /** When true, the cell is rendered as read-only text instead of an input. */
  readOnly?: boolean;
}

export interface EditableTableProps {
  columns: Column[];
  rows: any[];
  onChange: (updatedRows: any[]) => void;
}

const EditableTable: React.FC<EditableTableProps> = ({
  columns,
  rows,
  onChange,
}) => {
  const theme = useTheme();

  const handleCellChange = (index: number, key: string, value: string) => {
    const updated = rows.map((row, i) =>
      i === index ? { ...row, [key]: value } : row
    );
    onChange(updated);
  };

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <TableContainer
        component={Paper}
        sx={{ bgcolor: theme.palette.background.default }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    width: col.width || "auto",
                    minWidth: col.width || "auto",
                    fontWeight: 700,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id ?? index}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      width: col.width || "auto",
                      minWidth: col.width || "auto",
                    }}
                  >
                    {col.readOnly ? (
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          px: 0.5,
                          py: 0.75,
                        }}
                      >
                        {row[col.key] ?? "—"}
                      </Typography>
                    ) : (
                        <TextField
                          fullWidth
                          type={col.type || "text"}
                          value={row[col.key] ?? ""}
                          onChange={(e) =>
                            handleCellChange(index, col.key, e.target.value)
                          }
                          size="small"
                        />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EditableTable;