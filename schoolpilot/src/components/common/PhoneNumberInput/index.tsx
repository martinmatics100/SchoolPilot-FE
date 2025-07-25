// src/components/common/PhoneNumberInput.tsx
import React from 'react';
import {
    Box,
    MenuItem,
    Select,
    TextField,
    InputLabel,
    FormControl,
    FormHelperText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getPhoneTypeConfig } from '../../../utils/phoneTypeConfig';

interface Country {
    name: string;
    code: string;
    dialCode: string;
    flag: string;
}

interface PhoneNumberInputProps {
    phoneType: string;
    countryCode: string;
    number: string;
    extension: string;
    onChange: (data: {
        phoneType: string;
        countryCode: string;
        number: string;
        extension: string;
    }) => void;
    errors?: {
        phoneType?: string;
        countryCode?: string;
        number?: string;
        extension?: string;
    };
    enums: {
        PhoneType?: { value: number; name: string; displayName?: string }[];
        Country?: { value: number; name: string; displayName?: string }[];
    };
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
    phoneType,
    countryCode,
    number,
    extension,
    onChange,
    errors = {},
    enums
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Get current phone type configuration
    const currentTypeId = parseInt(phoneType);
    const currentConfig = getPhoneTypeConfig(currentTypeId);

    // Prepare phone type options
    const phoneTypeOptions = React.useMemo(() => {
        return (enums?.PhoneType || []).map(pt => {
            const config = getPhoneTypeConfig(pt.value);
            return {
                value: pt.value.toString(),
                label: pt.displayName || pt.name,
                requiresExtension: config.requiresExtension
            };
        });
    }, [enums?.PhoneType]);

    // Prepare country options
    const countries: Country[] = React.useMemo(() => {
        return (enums?.Country || []).map((c) => {
            const [name, code, dialCode, flag] = (c.displayName || "").split("|");
            return {
                name: name || c.name,
                code: code || c.name,
                dialCode: dialCode || '',
                flag: flag || ''
            };
        });
    }, [enums?.Country]);

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
            {/* Phone Type Selector */}
            <FormControl
                size="small"
                error={!!errors.phoneType}
                sx={{
                    minWidth: 120,
                    flex: isMobile ? '1 1 100%' : '1 1 0'
                }}
                fullWidth={isMobile}
            >
                <InputLabel>Type</InputLabel>
                <Select
                    value={phoneType}
                    label="Type"
                    onChange={(e) => {
                        const newType = e.target.value;
                        const newTypeId = parseInt(newType);
                        const newConfig = getPhoneTypeConfig(newTypeId);

                        onChange({
                            phoneType: newType,
                            countryCode,
                            number,
                            extension: newConfig.requiresExtension ? extension : ''
                        });
                    }}
                >
                    {phoneTypeOptions.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                            {type.label}
                        </MenuItem>
                    ))}
                </Select>
                {errors.phoneType && <FormHelperText>{errors.phoneType}</FormHelperText>}
            </FormControl>

            {/* Country Select */}
            <FormControl
                size="small"
                error={!!errors.countryCode}
                sx={{
                    minWidth: 180,
                    flex: isMobile ? '1 1 100%' : '2 1 0'
                }}
                fullWidth={isMobile}
            >
                <InputLabel>Country</InputLabel>
                <Select
                    value={countryCode}
                    label="Country"
                    onChange={(e) =>
                        onChange({
                            phoneType,
                            countryCode: e.target.value,
                            number,
                            extension
                        })
                    }
                >
                    {countries.map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                            {`${country.flag} ${country.name} (${country.dialCode})`}
                        </MenuItem>
                    ))}
                </Select>
                {errors.countryCode && <FormHelperText>{errors.countryCode}</FormHelperText>}
            </FormControl>

            {/* Phone Number */}
            <TextField
                label="Phone"
                value={number}
                size="small"
                sx={{
                    minWidth: 180,
                    flex: isMobile ? '1 1 100%' : '2 1 0'
                }}
                onChange={(e) =>
                    onChange({
                        phoneType,
                        countryCode,
                        number: e.target.value,
                        extension
                    })
                }
                error={!!errors.number}
                helperText={errors.number}
                fullWidth={isMobile}
            />

            {/* Extension Field */}
            <FormControl
                size="small"
                error={!!errors.extension}
                sx={{
                    minWidth: 80,
                    flex: isMobile ? '1 1 100%' : '1 1 0',
                    position: 'relative'
                }}
            >
                <TextField
                    label="Ext."
                    size="small"
                    disabled={!currentConfig.requiresExtension}
                    value={extension}
                    onChange={(e) => {
                        if (currentConfig.requiresExtension) {
                            onChange({
                                phoneType,
                                countryCode,
                                number,
                                extension: e.target.value
                            });
                        }
                    }}
                    sx={{
                        '& .MuiInputBase-root.Mui-disabled': {
                            backgroundColor: theme.palette.action.disabledBackground
                        }
                    }}
                    fullWidth={isMobile}
                    helperText={errors.extension}
                />
            </FormControl>
        </Box>
    );
};

export default React.memo(PhoneNumberInput);