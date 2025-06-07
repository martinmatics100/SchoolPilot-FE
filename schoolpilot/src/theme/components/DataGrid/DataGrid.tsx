import { type Theme, alpha } from '@mui/material';
import type { DataGridComponents } from '@mui/x-data-grid/themeAugmentation';

// Helper to safely multiply borderRadius (number or string)
function getBorderRadius(borderRadius: number | string, multiplier: number): string {
  if (typeof borderRadius === 'number') {
    return `${borderRadius * multiplier}px`;
  }
  // If it's a string like "4px" or "0.5rem", try parsing number only
  const num = parseFloat(borderRadius);
  if (isNaN(num)) {
    // fallback to original string if parse fails
    return borderRadius;
  }
  return `${num * multiplier}px`;
}

const DataGrid: DataGridComponents<Omit<Theme, 'components'>>['MuiDataGrid'] = {
  defaultProps: { disableColumnMenu: true, disableRowSelectionOnClick: true },
  styleOverrides: {
    root: ({ theme }) => ({
      borderColor: 'transparent',
      borderRadius: getBorderRadius(theme.shape.borderRadius, 2.5),
      '--DataGrid-rowBorderColor': alpha(theme.palette.common.white, 0.06),
      '&:hover, &:focus': {
        '*::-webkit-scrollbar, *::-webkit-scrollbar-thumb': {
          visibility: 'visible',
        },
        '*::-webkit-scrollbar-thumb': {
          background: theme.palette.info.main,
        },
      },
      '& .MuiDataGrid-container--top [role=row]': {
        background: theme.palette.background.paper,
      },
      '& .MuiDataGrid-scrollbar--vertical': {
        visibility: 'hidden',
      },
      '& .MuiDataGrid-scrollbar--horizontal': {
        scrollbarWidth: 'thin',
      },
      '& .MuiDataGrid-filler': {
        height: '0 !important',
      },
      '& .MuiDataGrid-scrollbarFiller': {
        minWidth: 0,
      },
    }),
    main: ({ theme }) => ({
      borderTopLeftRadius: getBorderRadius(theme.shape.borderRadius, 2.5),
      borderTopRightRadius: getBorderRadius(theme.shape.borderRadius, 2.5),
    }),
    cell: ({ theme }) => ({
      display: 'flex',
      alignItems: 'center',
      color: theme.palette.common.white,
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.body2.fontWeight,
      '&:focus': {
        outline: 'none !important',
      },
      '&:focus-within': {
        outline: 'none !important',
      },
    }),
    overlay: ({ theme }) => ({
      backgroundColor: theme.palette.background.paper,
    }),
    footerContainer: ({ theme }) => ({
      minHeight: theme.spacing(10.5),
      justifyContent: 'normal',
      backgroundColor: theme.palette.background.paper,
      borderBottomLeftRadius: getBorderRadius(theme.shape.borderRadius, 2.5),
      borderBottomRightRadius: getBorderRadius(theme.shape.borderRadius, 2.5),
    }),
    columnHeader: () => ({
      '&:focus': {
        outline: 'none !important',
      },
      '&:focus-within': {
        outline: 'none !important',
      },
    }),
    columnHeaderTitle: ({ theme }) => ({
      color: theme.palette.text.primary,
      fontSize: theme.typography.subtitle2.fontSize,
      fontWeight: theme.typography.subtitle2.fontWeight,
    }),
    columnSeparator: () => ({
      display: 'none',
    }),
    cellEmpty: () => ({
      display: 'none',
    }),
    row: ({ theme }) => ({
      backgroundColor: theme.palette.background.paper,
      '&:hover': {
        backgroundColor: theme.palette.background.paper,
      },
    }),
    withBorderColor: ({ theme }) => ({
      borderColor: alpha(theme.palette.common.white, 0.06),
    }),
    scrollbar: () => ({
      '&.MuiDataGrid-scrollbar--horizontal': {
        scrollbarWidth: 'none',
      },
    }),
    virtualScroller: ({ theme }) => ({
      [theme.breakpoints.up('xs')]: {
        overflowY: 'scroll',
      },
      [theme.breakpoints.up('sm')]: {
        overflowY: 'hidden',
      },
    }),
    selectedRowCount: () => ({
      display: 'none',
    }),
  },
};

export default DataGrid;
