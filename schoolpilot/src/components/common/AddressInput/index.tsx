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
import { useEnums } from '../../../hooks/useEnums';
import { ISO3166Countries, NigerianStates } from '../../../utils/iso3166Countries';

interface CountryOption {
    code: string;
    name: string;
    numericCode: string; // ISO 3166-1 numeric code
}

interface StateOption {
    value: string;
    label: string;
}

interface AddressInputProps {
    addressLine1: string;
    postalCode: string;
    country: string; // ISO 3166-1 numeric code as string
    state: string; // State code as string
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
}

const AddressInput: React.FC<AddressInputProps> = ({
    addressLine1,
    postalCode,
    country,
    state,
    onChange,
    errors = {}
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });

    // Prepare country options from ISO3166Countries
    const availableCountries: CountryOption[] = React.useMemo(() => {
        return ISO3166Countries.map(country => ({
            code: country.TwoLetterCode,
            name: country.Name,
            numericCode: country.NumericCode
        }));
    }, []);

    // Prepare Nigerian states
    const availableStates: StateOption[] = React.useMemo(() => {
        return NigerianStates.map(state => ({
            value: state.code,
            label: state.name
        }));
    }, []);

    // Find the selected country for rendering the flag
    const selectedCountry = React.useMemo(() => {
        return availableCountries.find(c => c.numericCode === country);
    }, [availableCountries, country]);

    // Find the selected state
    const selectedState = React.useMemo(() => {
        return availableStates.find(s => s.value === state);
    }, [availableStates, state]);

    // Check if selected country is Nigeria (numeric code: "566")
    const isNigeria = country === "566";

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
            {/* Address Line */}
            <TextField
                label="Address"
                value={addressLine1}
                size="small"
                sx={{
                    minWidth: 200,
                    flex: isMobile ? '1 1 100%' : '2 1 0'
                }}
                onChange={(e) =>
                    onChange({
                        addressLine1: e.target.value,
                        postalCode,
                        country,
                        state
                    })
                }
                error={!!errors.addressLine1}
                helperText={errors.addressLine1}
                fullWidth={isMobile}
            />

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
                        addressLine1,
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
                <Autocomplete
                    options={availableCountries}
                    getOptionLabel={(option: CountryOption) => option.name}
                    value={selectedCountry || undefined} // FIXED: Use selectedCountry instead of finding by code
                    onChange={(event, newValue: CountryOption | null) =>
                        onChange({
                            addressLine1,
                            postalCode,
                            country: newValue ? newValue.numericCode : '',
                            state: '' // Reset state when country changes
                        })
                    }
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

            {/* State - Only show for Nigeria (numeric code: "566") */}
            <FormControl
                size="small"
                disabled={!isNigeria} // FIXED: Only enable for Nigeria
                error={!!errors.state}
                sx={{
                    minWidth: 150,
                    flex: isMobile ? '1 1 100%' : '1 1 0',
                    display: isNigeria ? 'block' : 'none' // FIXED: Hide when not Nigeria
                }}
                fullWidth={isMobile}
            >
                <Autocomplete
                    options={availableStates}
                    getOptionLabel={(option: StateOption) => option.label}
                    value={selectedState || undefined} // FIXED: Use selectedState
                    onChange={(event, newValue: StateOption | null) =>
                        onChange({
                            addressLine1,
                            postalCode,
                            country,
                            state: newValue ? newValue.value : ''
                        })
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="State"
                            size="small"
                            error={!!errors.state}
                            helperText={errors.state}
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