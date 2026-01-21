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
  Select,
  MenuItem,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material";

export type BulkColumn<T> = {
  key: keyof T;
  label: string;
  type: "text" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  minWidth?: number;
  isVisible?: (row: T) => boolean; // ✅ new property
};

type Props<T> = {
  columns: BulkColumn<T>[];
  rows: T[];
  onChange: (rows: T[]) => void;
  createEmptyRow: () => T;
};

export function BulkEditableTable<T>({ columns, rows, onChange }: Props<T>) {
  const theme = useTheme();

  const updateCell = (rowIndex: number, key: keyof T, value: any) => {
    const updated = [...rows];
    updated[rowIndex] = { ...updated[rowIndex], [key]: value };
    onChange(updated);
  };

  const removeRow = (index: number) =>
    onChange(rows.filter((_, i) => i !== index));

  const isCellInvalid = (row: T, col: BulkColumn<T>) =>
    col.required && !row[col.key];

  return (
    <Box>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          overflowX: "auto",
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 900,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  sx={{ minWidth: col.minWidth ?? 180 }}
                >
                  <Typography fontWeight={600}>
                    {col.label}
                    {col.required && (
                      <Typography component="span" color="error">
                        *
                      </Typography>
                    )}
                  </Typography>
                </TableCell>
              ))}
              <TableCell sx={{ minWidth: 60 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} hover>
                {columns.map((col) => {
                  // ✅ check visibility per row
                  if (col.isVisible && !col.isVisible(row)) {
                    return null;
                  }

                  const invalid = isCellInvalid(row, col);

                  return (
                    <TableCell
                      key={String(col.key)}
                      sx={{ minWidth: col.minWidth ?? 180 }}
                    >
                      {col.type === "text" && (
                        <TextField
                          fullWidth
                          size="small"
                          value={String(row[col.key] ?? "")}
                          error={invalid}
                          helperText={invalid ? "Required" : ""}
                          onChange={(e) =>
                            updateCell(rowIndex, col.key, e.target.value)
                          }
                        />
                      )}

                      {col.type === "select" && (
                        <Select
                          fullWidth
                          size="small"
                          value={String(row[col.key] ?? "")}
                          error={invalid}
                          displayEmpty
                          onChange={(e) =>
                            updateCell(rowIndex, col.key, e.target.value)
                          }
                        >
                          <MenuItem value="">
                            <em style={{ color: theme.palette.grey[600] }}>
                              Select
                            </em>
                          </MenuItem>
                          {col.options?.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    </TableCell>
                  );
                })}

                <TableCell align="center">
                  <IconButton color="error" onClick={() => removeRow(rowIndex)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
