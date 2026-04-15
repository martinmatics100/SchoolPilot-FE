import React from 'react';
import {
    Box,
    MenuItem,
    Select,
    TextField,
    InputLabel,
    FormControl,
    FormHelperText,
    Autocomplete,
    InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getPhoneTypeConfig } from '../../utils/phoneTypeConfig';
import { countries, type ICountry } from 'countries-list';
import ReactCountryFlag from 'react-country-flag';
import { ISO3166Countries } from '../../utils/iso3166Countries';

interface ExtendedCountry extends ICountry {
    emoji: string;
}

interface Country {
    name: string;
    code: string;
    dialCode: string;
    numericCode: string;
    isoNumericCode: string;
    flag: string;
}

interface PhoneNumberInputProps {
    phoneType: string;
    country: string;
    number: string;
    extension: string;
    onChange: (data: {
        phoneType: string;
        country: string;
        number: string;
        extension: string;
    }) => void;
    errors?: {
        phoneType?: string;
        country?: string;
        number?: string;
        extension?: string;
    };
    enums?: {
        PhoneType?: { value: number; name: string; displayName?: string }[];
        Country?: { value: number; name: string; displayName?: string }[];
    };
    readOnly?: boolean;
    readOnlyColor?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
    phoneType,
    country,
    number,
    extension,
    onChange,
    errors = {},
    enums,
    readOnly = false,
    readOnlyColor
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const currentTypeId = parseInt(phoneType);
    const currentConfig = getPhoneTypeConfig(currentTypeId);

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

    const countriesData: Country[] = React.useMemo(() => {
        return ISO3166Countries.map(isoCountry => {
            const countryData = countries[isoCountry.TwoLetterCode as keyof typeof countries] as ExtendedCountry;
            return {
                name: isoCountry.Name,
                code: isoCountry.TwoLetterCode,
                dialCode: countryData ? `+${countryData.phone}` : '',
                numericCode: countryData ? countryData.phone.toString() : '',
                isoNumericCode: isoCountry.NumericCode,
                flag: countryData ? countryData.emoji : ''
            };
        });
    }, []);

    const selectedCountry = countriesData.find(c => c.isoNumericCode === country) || null;

    // Styles for readonly mode
    const readonlyInputStyles = readOnly ? {
        '& .MuiInputBase-input': {
            color: readOnlyColor || theme.palette.text.secondary,
        },
        '& .MuiInputLabel-root': {
            color: readOnlyColor || theme.palette.text.secondary,
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: readOnlyColor || theme.palette.text.secondary,
        },
    } : {};

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
            <FormControl
                size="small"
                error={!!errors.phoneType}
                sx={{
                    minWidth: 120,
                    flex: isMobile ? '1 1 100%' : '1 1 0',
                    ...readonlyInputStyles
                }}
                fullWidth={isMobile}
                disabled={readOnly}
            >
                <InputLabel>Type</InputLabel>
                <Select
                    value={phoneType}
                    label="Type"
                    onChange={(e) => {
                        if (!readOnly) {
                            const newType = e.target.value;
                            const newTypeId = parseInt(newType);
                            const newConfig = getPhoneTypeConfig(newTypeId);

                            onChange({
                                phoneType: newType,
                                country,
                                number,
                                extension: newConfig.requiresExtension ? extension : ''
                            });
                        }
                    }}
                    disabled={readOnly}
                >
                    {phoneTypeOptions.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                            {type.label}
                        </MenuItem>
                    ))}
                </Select>
                {errors.phoneType && <FormHelperText>{errors.phoneType}</FormHelperText>}
            </FormControl>

            <FormControl
                size="small"
                error={!!errors.country}
                sx={{
                    minWidth: 180,
                    flex: isMobile ? '1 1 100%' : '2 1 0',
                    ...readonlyInputStyles
                }}
                fullWidth={isMobile}
                disabled={readOnly}
            >
                <Autocomplete
                    options={countriesData}
                    getOptionLabel={(option) => `${option.name}${option.dialCode ? ` (${option.dialCode}, ${option.isoNumericCode})` : ''}`}
                    renderOption={(props, option) => (
                        <li {...props}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {option.code ? (
                                    <ReactCountryFlag
                                        countryCode={option.code}
                                        svg
                                        style={{
                                            width: '20px',
                                            height: '15px',
                                            marginRight: '8px'
                                        }}
                                    />
                                ) : (
                                    <span style={{ width: '20px', marginRight: '8px' }}>{option.flag || ''}</span>
                                )}
                                {option.name} {option.dialCode ? `(${option.isoNumericCode})` : ''}
                            </div>
                        </li>
                    )}
                    value={selectedCountry}
                    onChange={(event, newValue) => {
                        if (!readOnly) {
                            onChange({
                                phoneType,
                                country: newValue ? newValue.isoNumericCode : '',
                                number,
                                extension
                            });
                        }
                    }}
                    disabled={readOnly}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Country"
                            placeholder="Select a country"
                            size="small"
                            error={!!errors.country}
                            helperText={errors.country}
                            InputProps={{
                                ...params.InputProps,
                                readOnly: readOnly,
                                sx: readonlyInputStyles,
                                startAdornment: selectedCountry?.code ? (
                                    <InputAdornment position="start">
                                        <ReactCountryFlag
                                            countryCode={selectedCountry.code}
                                            svg
                                            style={{
                                                width: '20px',
                                                height: '15px',
                                                marginRight: '4px'
                                            }}
                                        />
                                    </InputAdornment>
                                ) : params.InputProps.startAdornment
                            }}
                        />
                    )}
                    noOptionsText="No countries found"
                />
            </FormControl>

            <TextField
                label="Phone"
                value={number}
                type="tel"
                size="small"
                sx={{
                    minWidth: 180,
                    flex: isMobile ? '1 1 100%' : '2 1 0',
                    ...readonlyInputStyles
                }}
                onChange={(e) => {
                    if (!readOnly) {
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        onChange({
                            phoneType,
                            country,
                            number: numericValue,
                            extension
                        });
                    }
                }}
                inputProps={{
                    pattern: '[0-9]*'
                }}
                error={!!errors.number}
                helperText={errors.number}
                fullWidth={isMobile}
                disabled={readOnly}
                InputProps={{
                    readOnly: readOnly,
                }}
            />

            <FormControl
                size="small"
                error={!!errors.extension}
                sx={{
                    minWidth: 80,
                    flex: isMobile ? '1 1 100%' : '1 1 0',
                    position: 'relative',
                    ...readonlyInputStyles
                }}
            >
                <TextField
                    label="Ext."
                    size="small"
                    disabled={!currentConfig.requiresExtension || readOnly}
                    value={extension}
                    onChange={(e) => {
                        if (!readOnly && currentConfig.requiresExtension) {
                            onChange({
                                phoneType,
                                country,
                                number,
                                extension: e.target.value
                            });
                        }
                    }}
                    sx={{
                        ...readonlyInputStyles,
                        '& .MuiInputBase-root.Mui-disabled': {
                            backgroundColor: theme.palette.action.disabledBackground
                        }
                    }}
                    fullWidth={isMobile}
                    helperText={errors.extension}
                    InputProps={{
                        readOnly: readOnly,
                    }}
                />
            </FormControl>
        </Box>
    );
};

export default React.memo(PhoneNumberInput);