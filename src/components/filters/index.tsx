import React from 'react';
import { Box, Stack, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export interface FilterConfig {
    type: 'search' | 'single-select' | 'multi-select' | 'date';
    label: string;
    value: any;
    onChange: (newValue: any) => void;
    options?: { value: string; label: string }[];
}

interface FilterComponentProps {
    filters: FilterConfig[];
}

const FilterComponent: React.FC<FilterComponentProps> = ({ filters }) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
                sx={{
                    overflowX: 'auto', // Enable horizontal scrolling on small screens
                    whiteSpace: 'nowrap', // Prevent wrapping
                    mb: 1, // Reduced margin bottom
                }}
            >
                <Stack
                    direction="row"
                    spacing={1} // Reduced spacing between filters
                    sx={{
                        alignItems: 'center', // Align items at the center for consistent height
                        display: 'inline-flex', // Keep filters in a single row
                        borderRadius: 'none'
                    }}
                >
                    {filters.map((filter, index) => (
                        <Box
                            key={index}
                            sx={{
                                width: 140, // Fixed width for all filters
                                minWidth: 140, // Ensure consistent width
                                maxWidth: 140, // Prevent filters from growing too wide
                            }}
                        >
                            {filter.type === 'search' && (
                                <TextField
                                    label={filter.label}
                                    value={filter.value || ''}
                                    onChange={(e) => filter.onChange(e.target.value)}
                                    variant="outlined"
                                    placeholder='Start typing'
                                    size="small" // Smaller input size
                                    sx={{ '& .MuiInputBase-root': { fontSize: '0.85rem', height: 32, } }} // Smaller font and height
                                />
                            )}

                            {filter.type === 'single-select' && filter.options && (
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ fontSize: '0.85rem' }}>{filter.label}</InputLabel>
                                    <Select
                                        value={filter.value || ''}
                                        onChange={(e) => filter.onChange(e.target.value)}
                                        label={filter.label}
                                        sx={{ fontSize: '0.85rem', height: 32 }}
                                    >
                                        {filter.options.map((option) => (
                                            <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.85rem' }}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {filter.type === 'multi-select' && filter.options && (
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ fontSize: '0.85rem' }}>{filter.label}</InputLabel>
                                    <Select
                                        multiple
                                        value={filter.value || []}
                                        onChange={(e) => filter.onChange(e.target.value)}
                                        label={filter.label}
                                        renderValue={(selected) => (selected as string[]).join(', ')}
                                        sx={{ fontSize: '0.85rem', height: 32 }}
                                    >
                                        {filter.options.map((option) => (
                                            <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.85rem' }}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {filter.type === 'date' && (
                                <DatePicker
                                    label={filter.label}
                                    value={filter.value}
                                    onChange={(newValue) => filter.onChange(newValue)}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            sx: { '& .MuiInputBase-root': { fontSize: '0.85rem', height: 32 } },
                                        },
                                    }}
                                />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Box>
        </LocalizationProvider>
    );
};

export default FilterComponent;