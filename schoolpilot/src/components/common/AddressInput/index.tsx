import React from 'react';
import {
    Box,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    FormHelperText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

interface AddressInputProps {
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
    state: string;
    onChange: (data: {
        addressLine: string;
        city: string;
        postalCode: string;
        country: string;
        state: string;
    }) => void;
    errors?: {
        addressLine?: string;
        city?: string;
        postalCode?: string;
        country?: string;
        state?: string;
    };
}

const countries = [
    { name: 'United States', code: 'US' },
    { name: 'Nigeria', code: 'NG' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Germany', code: 'DE' }
];

const statesByCountry: Record<string, string[]> = {
    US: ['California', 'New York', 'Texas'],
    NG: ['Lagos', 'Abuja', 'Rivers'],
    GB: ['England', 'Scotland', 'Wales'],
    DE: ['Bavaria', 'Berlin', 'Saxony']
};

const AddressInput: React.FC<AddressInputProps> = ({
    addressLine,
    city,
    postalCode,
    country,
    state,
    onChange,
    errors = {}
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const availableStates = statesByCountry[country] || [];

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: 1,
                width: '100%',
                overflowX: 'auto',
                pb: 1,
                [theme.breakpoints.down('sm')]: {
                    flexDirection: 'column',
                    gap: 2
                }
            }}
        >
            {/* Address Line */}
            <TextField
                label="Address"
                value={addressLine}
                size="small"
                sx={{
                    minWidth: 200,
                    flex: isMobile ? '1 1 100%' : '2 1 0'
                }}
                onChange={(e) =>
                    onChange({
                        addressLine: e.target.value,
                        city,
                        postalCode,
                        country,
                        state
                    })
                }
                error={!!errors.addressLine}
                helperText={errors.addressLine}
                fullWidth={isMobile}
            />

            {/* City */}
            {/* <TextField
                label="City"
                value={city}
                size="small"
                sx={{
                    minWidth: 120,
                    flex: isMobile ? '1 1 100%' : '1 1 0'
                }}
                onChange={(e) =>
                    onChange({
                        addressLine,
                        city: e.target.value,
                        postalCode,
                        country,
                        state
                    })
                }
                error={!!errors.city}
                helperText={errors.city}
                fullWidth={isMobile}
            /> */}

            {/* Postal Code */}
            <TextField
                label="Postal Code"
                value={postalCode}
                size="small"
                sx={{
                    minWidth: 120,
                    flex: isMobile ? '1 1 100%' : '1 1 0'
                }}
                onChange={(e) =>
                    onChange({
                        addressLine,
                        city,
                        postalCode: e.target.value,
                        country,
                        state
                    })
                }
                error={!!errors.postalCode}
                helperText={errors.postalCode}
                fullWidth={isMobile}
            />

            {/* Country */}
            <FormControl
                size="small"
                error={!!errors.country}
                sx={{
                    minWidth: 150,
                    flex: isMobile ? '1 1 100%' : '1 1 0'
                }}
                fullWidth={isMobile}
            >
                <InputLabel>Country</InputLabel>
                <Select
                    value={country}
                    label="Country"
                    onChange={(e) =>
                        onChange({
                            addressLine,
                            city,
                            postalCode,
                            country: e.target.value,
                            state: ''
                        })
                    }
                >
                    {countries.map((c) => (
                        <MenuItem key={c.code} value={c.code}>
                            {c.name}
                        </MenuItem>
                    ))}
                </Select>
                {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
            </FormControl>

            {/* State */}
            <FormControl
                size="small"
                disabled={!country}
                error={!!errors.state}
                sx={{
                    minWidth: 150,
                    flex: isMobile ? '1 1 100%' : '1 1 0'
                }}
                fullWidth={isMobile}
            >
                <InputLabel>State</InputLabel>
                <Select
                    value={state}
                    label="State"
                    onChange={(e) =>
                        onChange({
                            addressLine,
                            city,
                            postalCode,
                            country,
                            state: e.target.value
                        })
                    }
                >
                    {availableStates.map((s) => (
                        <MenuItem key={s} value={s}>
                            {s}
                        </MenuItem>
                    ))}
                </Select>
                {errors.state && <FormHelperText>{errors.state}</FormHelperText>}
            </FormControl>
        </Box>
    );
};

export default AddressInput;