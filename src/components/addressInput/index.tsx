import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    FormHelperText,
    InputAdornment
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ReactCountryFlag from 'react-country-flag';
import { useEnums } from '../../hooks/useEnums';
import { ISO3166Countries, NigerianStates } from '../../utils/iso3166Countries';

interface CountryOption {
    code: string;
    name: string;
    numericCode: string;
}

interface StateOption {
    value: string;
    label: string;
}

interface AddressInputProps {
    addressLine1: string;
    postalCode: string;
    country: string;
    state: string;
    onChange: (data: {
        addressLine1: string;
        postalCode: string;
        country: string;
        state: string;
    }) => void;
    errors?: {
        addressLine1?: string;
        postalCode?: string;
        country?: string;
        state?: string;
    };
    readOnly?: boolean;
    readOnlyColor?: string;
}

const AddressInput: React.FC<AddressInputProps> = ({
    addressLine1,
    postalCode,
    country,
    state,
    onChange,
    errors = {},
    readOnly = false,
    readOnlyColor
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });

    const availableCountries: CountryOption[] = React.useMemo(() => {
        return ISO3166Countries.map(country => ({
            code: country.TwoLetterCode,
            name: country.Name,
            numericCode: country.NumericCode
        }));
    }, []);

    const availableStates: StateOption[] = React.useMemo(() => {
        return NigerianStates.map(state => ({
            value: state.code,
            label: state.name
        }));
    }, []);

    const selectedCountry = React.useMemo(() => {
        return availableCountries.find(c => c.numericCode === country);
    }, [availableCountries, country]);

    const selectedState = React.useMemo(() => {
        return availableStates.find(s => s.value === state);
    }, [availableStates, state]);

    const isNigeria = country === "566";

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

    if (isLoading) {
        return <Box>Loading address data...</Box>;
    }

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
            <TextField
                label="Address"
                value={addressLine1}
                size="small"
                sx={{
                    minWidth: 200,
                    flex: isMobile ? '1 1 100%' : '2 1 0',
                    ...readonlyInputStyles
                }}
                onChange={(e) => !readOnly && onChange({
                    addressLine1: e.target.value,
                    postalCode,
                    country,
                    state
                })}
                error={!!errors.addressLine1}
                helperText={errors.addressLine1}
                fullWidth={isMobile}
                disabled={readOnly}
                InputProps={{
                    readOnly: readOnly,
                }}
            />

            <TextField
                label="Postal Code"
                value={postalCode}
                size="small"
                sx={{
                    minWidth: 120,
                    flex: isMobile ? '1 1 100%' : '1 1 0',
                    ...readonlyInputStyles
                }}
                onChange={(e) => !readOnly && onChange({
                    addressLine1,
                    postalCode: e.target.value,
                    country,
                    state
                })}
                error={!!errors.postalCode}
                helperText={errors.postalCode}
                fullWidth={isMobile}
                disabled={readOnly}
                InputProps={{
                    readOnly: readOnly,
                }}
            />

            <FormControl
                size="small"
                error={!!errors.country}
                sx={{
                    minWidth: 150,
                    flex: isMobile ? '1 1 100%' : '1 1 0',
                    ...readonlyInputStyles
                }}
                fullWidth={isMobile}
                disabled={readOnly}
            >
                <Autocomplete
                    options={availableCountries}
                    getOptionLabel={(option: CountryOption) => option.name}
                    value={selectedCountry || undefined}
                    onChange={(event, newValue: CountryOption | null) => {
                        if (!readOnly) {
                            onChange({
                                addressLine1,
                                postalCode,
                                country: newValue ? newValue.numericCode : '',
                                state: ''
                            });
                        }
                    }}
                    disabled={readOnly}
                    renderOption={(props, option) => (
                        <li {...props}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {option.code && (
                                    <ReactCountryFlag
                                        countryCode={option.code}
                                        svg
                                        style={{
                                            width: '20px',
                                            height: '15px',
                                            marginRight: '8px'
                                        }}
                                    />
                                )}
                                {option.name}
                            </div>
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Country"
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
                    disableClearable
                    fullWidth
                />
            </FormControl>

            <FormControl
                size="small"
                disabled={!isNigeria || readOnly}
                error={!!errors.state}
                sx={{
                    minWidth: 150,
                    flex: isMobile ? '1 1 100%' : '1 1 0',
                    display: isNigeria ? 'block' : 'none',
                    ...readonlyInputStyles
                }}
                fullWidth={isMobile}
            >
                <Autocomplete
                    options={availableStates}
                    getOptionLabel={(option: StateOption) => option.label}
                    value={selectedState || undefined}
                    onChange={(event, newValue: StateOption | null) => {
                        if (!readOnly) {
                            onChange({
                                addressLine1,
                                postalCode,
                                country,
                                state: newValue ? newValue.value : ''
                            });
                        }
                    }}
                    disabled={readOnly}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="State"
                            size="small"
                            error={!!errors.state}
                            helperText={errors.state}
                            InputProps={{
                                ...params.InputProps,
                                readOnly: readOnly,
                                sx: readonlyInputStyles,
                            }}
                        />
                    )}
                    disableClearable
                    fullWidth
                />
            </FormControl>
        </Box>
    );
};

export default AddressInput;