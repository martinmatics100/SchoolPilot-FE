import React from "react";
import {
    Box,
    TextField,
    FormControl,
    InputAdornment,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ReactCountryFlag from "react-country-flag";
import { useEnums } from "../../hooks/useEnums";
import { ISO3166Countries, NigerianStates } from "../../utils/iso3166Countries";
import { getLgasForState } from "../../utils/nigeriaLgas";

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
    country: string;
    state: string;
    lga: string;                 // ← NEW
    onChange: (data: {
        addressLine1: string;
        country: string;
        state: string;
        lga: string;             // ← NEW
    }) => void;
    errors?: {
        addressLine1?: string;
        country?: string;
        state?: string;
        lga?: string;            // ← NEW
    };
    readOnly?: boolean;
    readOnlyColor?: string;
}

const AddressInput: React.FC<AddressInputProps> = ({
    addressLine1,
    country,
    state,
    lga,
    onChange,
    errors = {},
    readOnly = false,
    readOnlyColor,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });

    const availableCountries: CountryOption[] = React.useMemo(() => {
        return ISO3166Countries.map((c) => ({
            code: c.TwoLetterCode,
            name: c.Name,
            numericCode: c.NumericCode,
        }));
    }, []);

    const availableStates: StateOption[] = React.useMemo(() => {
        return NigerianStates.map((s) => ({
            value: s.code,
            label: s.name,
        }));
    }, []);

    const selectedCountry = React.useMemo(
        () => availableCountries.find((c) => c.numericCode === country),
        [availableCountries, country]
    );

    const selectedState = React.useMemo(
        () => availableStates.find((s) => s.value === state),
        [availableStates, state]
    );

    const isNigeria = country === "566";

    /* ─────────────────────────────────────────────────────────
       LGAs for the currently selected state.
       Recomputes only when state changes.
       ───────────────────────────────────────────────────────── */
    const availableLgas = React.useMemo(() => {
        if (!selectedState) return [];
        return getLgasForState(selectedState.label).map((name) => ({
            value: name,
            label: name,
        }));
    }, [selectedState]);

    const selectedLga = React.useMemo(
        () => availableLgas.find((l) => l.value === lga),
        [availableLgas, lga]
    );

    /* ─────────────────────────────────────────────────────────
       Utility: emits the full address object with the new field
       ───────────────────────────────────────────────────────── */
    const emitChange = (patch: Partial<{
        addressLine1: string;
        postalCode: string;
        country: string;
        state: string;
        lga: string;
    }>) => {
        if (readOnly) return;
        onChange({
            addressLine1,
            country,
            state,
            lga,
            ...patch,
        });
    };

    const readonlyInputStyles = readOnly
        ? {
            "& .MuiInputBase-input": {
                color: readOnlyColor || theme.palette.text.secondary,
            },
            "& .MuiInputLabel-root": {
                color: readOnlyColor || theme.palette.text.secondary,
            },
            "& .MuiOutlinedInput-notchedOutline": {
                borderColor: readOnlyColor || theme.palette.text.secondary,
            },
        }
        : {};

    if (isLoading) {
        return <Box>Loading address data...</Box>;
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexWrap: "nowrap",
                gap: 1,
                width: "100%",
                overflowX: "auto",
                pb: 1,
                [theme.breakpoints.down("sm")]: {
                    flexDirection: "column",
                    gap: 2,
                },
            }}
        >
            {/* Address Line 1 */}
            <TextField
                label="Address"
                value={addressLine1}
                size="small"
                sx={{
                    minWidth: 200,
                    flex: isMobile ? "1 1 100%" : "2 1 0",
                    ...readonlyInputStyles,
                }}
                onChange={(e) => emitChange({ addressLine1: e.target.value })}
                error={!!errors.addressLine1}
                helperText={errors.addressLine1}
                fullWidth={isMobile}
                disabled={readOnly}
                InputProps={{ readOnly }}
            />

            {/* Country */}
            <FormControl
                size="small"
                error={!!errors.country}
                sx={{
                    minWidth: 150,
                    flex: isMobile ? "1 1 100%" : "1 1 0",
                    ...readonlyInputStyles,
                }}
                fullWidth={isMobile}
                disabled={readOnly}
            >
                <Autocomplete
                    options={availableCountries}
                    getOptionLabel={(option: CountryOption) => option.name}
                    value={selectedCountry || undefined}
                    onChange={(_, newValue: CountryOption | null) => {
                        // When country changes, reset state AND lga
                        emitChange({
                            country: newValue ? newValue.numericCode : "",
                            state: "",
                            lga: "",
                        });
                    }}
                    disabled={readOnly}
                    renderOption={(props, option) => (
                        <li {...props}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                {option.code && (
                                    <ReactCountryFlag
                                        countryCode={option.code}
                                        svg
                                        style={{
                                            width: "20px",
                                            height: "15px",
                                            marginRight: "8px",
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
                                readOnly,
                                sx: readonlyInputStyles,
                                startAdornment: selectedCountry?.code ? (
                                    <InputAdornment position="start">
                                        <ReactCountryFlag
                                            countryCode={selectedCountry.code}
                                            svg
                                            style={{
                                                width: "20px",
                                                height: "15px",
                                                marginRight: "4px",
                                            }}
                                        />
                                    </InputAdornment>
                                ) : (
                                    params.InputProps.startAdornment
                                ),
                            }}
                        />
                    )}
                    disableClearable
                    fullWidth
                />
            </FormControl>

            {/* State (Nigeria only) */}
            <FormControl
                size="small"
                disabled={!isNigeria || readOnly}
                error={!!errors.state}
                sx={{
                    minWidth: 150,
                    flex: isMobile ? "1 1 100%" : "1 1 0",
                    display: isNigeria ? "block" : "none",
                    ...readonlyInputStyles,
                }}
                fullWidth={isMobile}
            >
                <Autocomplete
                    options={availableStates}
                    getOptionLabel={(option: StateOption) => option.label}
                    value={selectedState || undefined}
                    onChange={(_, newValue: StateOption | null) => {
                        // When state changes, reset lga
                        emitChange({
                            state: newValue ? newValue.value : "",
                            lga: "",
                        });
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
                                readOnly,
                                sx: readonlyInputStyles,
                            }}
                        />
                    )}
                    disableClearable
                    fullWidth
                />
            </FormControl>

            {/* LGA (Nigeria only) — NEW */}
            <FormControl
                size="small"
                disabled={!isNigeria || !state || readOnly}
                error={!!errors.lga}
                sx={{
                    minWidth: 180,
                    flex: isMobile ? "1 1 100%" : "1 1 0",
                    display: isNigeria ? "block" : "none",
                    ...readonlyInputStyles,
                }}
                fullWidth={isMobile}
            >
                <Autocomplete
                    options={availableLgas}
                    getOptionLabel={(option) => option.label}
                    value={selectedLga || undefined}
                    onChange={(_, newValue) => {
                        emitChange({ lga: newValue ? newValue.value : "" });
                    }}
                    disabled={readOnly || !state}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="LGA"
                            size="small"
                            placeholder={
                                !state ? "Select a state first" : "Select LGA"
                            }
                            error={!!errors.lga}
                            helperText={errors.lga}
                            InputProps={{
                                ...params.InputProps,
                                readOnly,
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