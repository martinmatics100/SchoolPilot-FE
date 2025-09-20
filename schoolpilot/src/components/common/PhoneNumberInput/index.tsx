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
import { getPhoneTypeConfig } from '../../../utils/phoneTypeConfig';
import { countries, type ICountry } from 'countries-list';
import ReactCountryFlag from 'react-country-flag';
import { ISO3166Countries, findCountryByNumericCode } from '../../../utils/iso3166Countries';

// Extend ICountry to include emoji
interface ExtendedCountry extends ICountry {
    emoji: string; // Add emoji property for runtime data
}

interface Country {
    name: string;
    code: string; // ISO country code (e.g., "US")
    dialCode: string; // Dial code (e.g., "+1")
    numericCode: string; // Phone numeric code (e.g., "1")
    isoNumericCode: string; // ISO 3166-1 numeric code (e.g., "840")
    flag: string; // Emoji fallback, but we use SVG
}

interface PhoneNumberInputProps {
    phoneType: string;
    country: string; // ISO 3166-1 numeric code as string (e.g., "840" for US)
    number: string;
    extension: string;
    onChange: (data: {
        phoneType: string;
        country: string; // ISO 3166-1 numeric code as string
        number: string;
        extension: string;
    }) => void;
    errors?: {
        phoneType?: string;
        country?: string;
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
    country,
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

    // Prepare country options using countries-list and ISO3166 for lookup
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

    // Find the selected country for rendering the flag in the input
    const selectedCountry = countriesData.find(c => c.isoNumericCode === country) || null;

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
                            country,
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

            {/* Country Autocomplete */}
            <FormControl
                size="small"
                error={!!errors.country}
                sx={{
                    minWidth: 180,
                    flex: isMobile ? '1 1 100%' : '2 1 0'
                }}
                fullWidth={isMobile}
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
                        onChange({
                            phoneType,
                            country: newValue ? newValue.isoNumericCode : '', // Send ISO 3166-1 numeric code
                            number,
                            extension
                        });
                    }}
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

            {/* Phone Number */}
            <TextField
                label="Phone"
                value={number}
                type="tel"
                size="small"
                sx={{
                    minWidth: 180,
                    flex: isMobile ? '1 1 100%' : '2 1 0'
                }}
                onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
                    onChange({
                        phoneType,
                        country,
                        number: numericValue,
                        extension
                    });
                }}
                inputProps={{
                    pattern: '[0-9]*' // Enforce numeric input for browsers
                }}
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
                                country,
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